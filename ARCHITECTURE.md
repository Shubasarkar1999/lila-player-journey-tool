# Architecture — Player Journey Intelligence

---

## 1. What I Built and Why

A browser-based telemetry visualization tool for LILA BLACK's Level Design team. The stack was chosen for speed of delivery over architectural sophistication — this is an internal design tool, not a consumer product. The right tradeoff is a thin, readable system that a single engineer can maintain and extend.

| Layer | Technology | Reason |
|---|---|---|
| Data processing | Python, Pandas, PyArrow | Native parquet support, fast transformation, readable pipeline code |
| Backend | FastAPI | Minimal boilerplate, auto-generated docs, fast enough for this data size |
| Frontend | React + Vite | Component model suits the layered canvas architecture; Vite cold starts in <500ms |
| Canvas rendering | React-Konva | Outperforms SVG at scale — 1000+ path points per match with zero DOM nodes |
| Deployment | Vercel (frontend) + Render (backend) | Both support push-to-deploy from GitHub with no DevOps overhead |

---

## 2. Data Flow

```
backend/data/player_data/
  └── February_10/match_*.parquet
  └── February_11/match_*.parquet
  └── ...
          │
          ▼
  scripts/process_data.py
    - Read all parquet files via PyArrow
    - Decode byte-encoded event strings
    - Detect bots via user_id heuristic (see Section 3)
    - Normalize event types via EVENT_MAP (see Section 6)
    - Convert timestamps: raw int64 → milliseconds (÷ 10⁶)
    - Deduplicate paths and events
    - Filter noisy path points (distance threshold = 1.5 world units)
    - Apply coordinate transform via map_to_pixel() in mapping.py
    - Group by match_id → user_id → sorted path + event list
    - Parse match date from folder name (e.g. "February_10" → "2024-02-10")
          │
          ▼
  backend/output/processed.json
    {
      "<match_id>": {
        "map": "Lockdown",
        "date": "2024-02-10",
        "players": {
          "<user_id>": {
            "is_bot": false,
            "path":   [{ "x", "z", "px", "py", "ts" }, ...],
            "events": [{ "x", "z", "px", "py", "ts", "event" }, ...]
          }
        }
      }
    }
          │
          ▼
  FastAPI (backend/api/)
    GET /matches           → lightweight metadata list
    GET /matches/{id}      → full player paths + events for one match
          │
          ▼
  React + Konva (frontend/)
    1. Fetch /matches → populate sidebar
    2. On match select → fetch /matches/{id}
    3. Normalize timestamps to t ∈ [0, 1] client-side for timeline slicing
    4. Render 4 canvas layers (see Section 5)
    5. Timeline scrubber slices path arrays client-side
```

The preprocessing step runs once offline. The backend serves static JSON — no query-time computation. This keeps the API trivially simple and the UI consistently fast.

---

## 3. Bot Detection

Bots are identified by a property of their `user_id` field: human players have alphanumeric IDs, while bots have purely numeric IDs. This is implemented as a single heuristic in `process_data.py`:

```python
df['is_bot'] = df['user_id'].apply(lambda x: str(x).isnumeric())
```

This flag was consistent and reliable across all five days of data — no secondary validation was needed. The `is_bot` value is stored per-player in `processed.json` and used by the frontend to color-code paths and markers (humans in blue, bots in orange).

---

## 4. Coordinate Mapping

This was the most technically precise part of the implementation. Coordinate mapping is handled by `map_to_pixel()` in `mapping.py`, called during preprocessing for every path point and event.

### The Problem

Game telemetry stores positions as 3D world coordinates `(x, y, z)`. The minimap is a 2D raster image. `y` is elevation and is discarded entirely — in an extraction shooter, vertical position is not meaningful for 2D map analysis. The challenge is mapping `(x, z)` accurately onto minimap pixel space so that paths visually align with map geometry.

### The Solution

Each map has a fixed `origin` (world-space coordinate at the top-left of the minimap image) and a `scale` (world units per pixel), both sourced from the data README and hardcoded in `mapping.py`.

```python
# Normalize world coords to [0, 1] relative to map bounds
u = (x - origin_x) / scale
v = (z - origin_z) / scale

# Convert to pixel space (minimap rendered at 1024 × 1024)
px = u * map_width
py = (1 - v) * map_height   # Y-axis inversion: world +Z is screen up, canvas +Y is screen down
```

The Y-axis inversion is the critical detail. Game engines use a coordinate system where Z increases upward. Canvas/screen space has Y increasing downward. Without the `(1 - v)` flip, all paths appear mirrored vertically.

Pixel coordinates `(px, py)` are computed at preprocessing time and stored directly in `processed.json` alongside the raw world coordinates. The frontend never performs coordinate math — it reads `px` and `py` directly from the payload.

---

## 5. Frontend Rendering Architecture

The canvas is composed of four independent Konva layers, rendered in z-order:

```
┌─────────────────────────────┐
│  Layer 4: Heatmap           │  ← Density overlay (canvas ImageData, toggleable)
│  Layer 3: Events            │  ← Kill / Loot / Death / Storm markers (Circle nodes)
│  Layer 2: Paths             │  ← Player movement lines (Line nodes, timeline-sliced)
│  Layer 1: Base              │  ← Static minimap image (Image node, never re-renders)
└─────────────────────────────┘
```

Each layer is a separate Konva `<Layer>` component. This isolation is a deliberate performance choice: toggling events doesn't invalidate the path layer, scrubbing the timeline only re-renders the path layer, and the base image renders exactly once.

### Timeline Slicing

Raw millisecond timestamps stored in `processed.json` are normalized to a float `t ∈ [0, 1]` client-side when a match is loaded, based on the match's min/max timestamp range. The scrubber then slices both paths and event markers against this normalized value with no additional API call:

```js
// Normalize on load
const t_norm = (e.ts - minTs) / (maxTs - minTs);

// Slice on scrub
const visibleEvents = events.filter(e => e.t_norm <= timeline);
const pathPoints = positions.slice(0, Math.floor(positions.length * timeline));
```

Full match data is loaded once on match select. All scrubbing after that is zero-latency.

### Heatmap Generation

Heatmaps are generated client-side using a kernel density pass over event coordinates, written to an offscreen `<canvas>` element, and composited onto the Konva layer as an image. Three modes are supported: movement density, kill hotspots, and death concentration.

This approach is efficient at the current data volume. At production scale, this computation should move to a Web Worker to avoid blocking the main thread.

---

## 6. Event Normalization

Raw telemetry event strings were inconsistent across five days of data — mixed casing, and multiple source labels for logically identical events. All normalization is handled at processing time via an explicit mapping:

```python
EVENT_MAP = {
    "Kill":          "kill",
    "Killed":        "death",
    "BotKill":       "kill",
    "BotKilled":     "death",
    "KilledByStorm": "storm_death",
    "Loot":          "loot"
}
```

Any event not in `EVENT_MAP` falls back to `.lower()`. The frontend only ever sees four event types: `kill`, `death`, `storm_death`, and `loot`. Bot kills and human kills are unified into a single `kill` type, with the `is_bot` player flag used to distinguish the source when needed.

---

## 7. Path Cleaning

Two deduplication passes are applied before a path is stored:

**Exact duplicate removal** — consecutive `(x, z)` positions that are identical are dropped. These occur when a player is stationary between telemetry ticks.

**Distance threshold filtering** — points within 1.5 world units of the previous point are also dropped:

```python
def filter_path(df, threshold=1.5):
    coords = df[['x', 'z']].values
    keep = [True]
    for i in range(1, len(coords)):
        dist = np.linalg.norm(coords[i] - coords[i - 1])
        keep.append(dist > threshold)
    return df[keep]
```

This reduces path density without losing meaningful movement, and keeps rendered line counts manageable even for long matches.

---

## 8. Key Assumptions

| Area | Assumption | Reasoning |
|---|---|---|
| Match dates | Derived from folder names (`February_10`), not raw timestamps | Raw timestamps had timezone inconsistencies; folder names were reliable. Year hardcoded to 2024 during parsing. |
| Bot detection | `user_id` purely numeric → bot; alphanumeric → human | Flag was consistent across all five days — no secondary heuristic needed |
| Coordinate constants | Origin and scale sourced directly from data README | README values produced accurate visual alignment with no empirical calibration |
| Event normalization | Explicit `EVENT_MAP` + `.lower()` fallback | Source data had multiple label variants for the same logical event across dates |
| Elevation | `y` coordinate discarded entirely | Extraction shooter — vertical position is not meaningful for 2D map analysis |
| Path noise threshold | 1.5 world units | Chosen to reduce redundant position ticks without losing movement fidelity |

---

## 9. Tradeoffs

| Decision | Alternative Considered | Why I Chose This |
|---|---|---|
| Preprocess to JSON offline | Query parquet files at request time | Eliminates runtime PyArrow dependency in the API; faster response; simpler backend |
| Store `px`/`py` in JSON | Compute pixel coords in the frontend | Zero coordinate math in the browser; predictable rendering regardless of client |
| Normalize timestamps client-side | Store `t_norm` in JSON | Keeps the processing script simple; normalization is trivial and fast at load time |
| Frontend filtering | Server-side filtering via query params | All match metadata fits in ~50KB; frontend filtering is instant and reduces API surface |
| Canvas (Konva) over SVG | SVG with React | SVG DOM nodes degrade beyond ~500 elements; a single match can have 2000+ path points |
| Folder-based dates | Raw event timestamps | Folder names were the only reliable, consistent date signal across all five days |
| Single `processed.json` | Per-match JSON files | Simpler to generate and serve; acceptable at this data volume |

---

## 10. What I'd Change at Production Scale

The current architecture has three specific failure points as match volume grows.

`processed.json` becomes too large to serve as a single file past ~10,000 matches. Fix: split to per-match files served from object storage (S3 or Cloudflare R2), loaded on demand.

Client-side heatmap generation blocks the main thread on dense datasets. Fix: move computation to a Web Worker.

No caching layer — every backend restart re-reads JSON from disk. Fix: add HTTP `Cache-Control` headers on Render, or a lightweight Redis cache for the `/matches` list endpoint.

The match list would also need server-side pagination on `/matches`, and the frontend list would need virtualization (e.g. `react-window`) to remain performant at thousands of entries.