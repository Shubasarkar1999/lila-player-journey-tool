# Architecture — Player Journey Intelligence

---

## 1. What I Built and Why

A browser-based telemetry visualization tool for LILA BLACK's Level Design team. The stack was chosen for speed of delivery over architectural sophistication — this is an internal design tool, not a consumer product, so the right tradeoff is a thin, readable system that a single engineer can maintain.

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
backend/data/
  └── February_10/match_*.parquet
  └── February_11/match_*.parquet
  └── ...
          │
          ▼
  scripts/process_data.py
    - Read all parquet files via PyArrow
    - Normalize event types to lowercase
    - Decode byte-encoded player IDs
    - Apply coordinate transform (world → minimap pixel)
    - Group by match_id → player_id → sorted event list
    - Extract match metadata (map_name, date, duration, player count)
          │
          ▼
  backend/output/processed.json
    {
      "matches": [ { "id": "...", "map": "Lockdown", "date": "2024-02-10", ... } ],
      "match_data": { "<match_id>": { "players": [...], "events": [...] } }
    }
          │
          ▼
  FastAPI  (backend/api/)
    GET /matches           → lightweight metadata list (no path data)
    GET /matches/{id}      → full player paths + event payload for one match
          │
          ▼
  React + Konva  (frontend/)
    1. Fetch /matches → populate sidebar
    2. On match select → fetch /matches/{id}
    3. Render 4 canvas layers (see Section 4)
    4. Timeline scrubber slices path arrays client-side
```

The preprocessing step runs once offline. The backend serves static JSON — no query-time computation. This keeps the API trivially simple and the UI fast.

---

## 3. Coordinate Mapping

This was the most technically precise part of the implementation.

### The Problem

Game telemetry stores positions as 3D world coordinates `(x, y, z)`. The minimap is a 2D raster image. `y` is elevation and is discarded. The challenge is mapping `(x, z)` accurately onto the minimap pixel space so that paths visually align with map geometry.

### The Solution

Each map has two constants defined in the data README: an `origin` point (the world-space coordinate that corresponds to the top-left of the minimap image) and a `scale` value (world units per pixel).

```python
# Normalize world coords to [0, 1] relative to map bounds
u = (x - origin_x) / scale
v = (z - origin_z) / scale

# Convert to pixel space (minimap rendered at 1024 × 1024)
px = u * map_width
py = (1 - v) * map_height   # Y-axis inversion: world +Z = screen up, but canvas +Y = screen down
```

The Y-axis inversion is the critical detail. Game engines typically use a coordinate system where Z increases upward. Canvas/screen space has Y increasing downward. Without the `(1 - v)` flip, all paths appear mirrored vertically.

### Per-Map Constants

| Map | origin_x | origin_z | scale |
|---|---|---|---|
| Lockdown | (from README) | (from README) | (from README) |
| AmbroseValley | (from README) | (from README) | (from README) |
| Map 3 | (from README) | (from README) | (from README) |

These are hardcoded in `process_data.py` as a map config dictionary. Changing them requires a re-run of the processing script, not a backend deploy.

---

## 4. Frontend Rendering Architecture

The canvas is composed of four independent Konva layers, rendered in z-order:

```
┌─────────────────────────────┐
│  Layer 4: Heatmap           │  ← Density overlay (canvas ImageData, toggleable)
│  Layer 3: Events            │  ← Kill / Loot / Death / Storm markers (Circle nodes)
│  Layer 2: Paths             │  ← Player movement lines (Line nodes, timeline-sliced)
│  Layer 1: Base              │  ← Static minimap image (Image node, never re-renders)
└─────────────────────────────┘
```

Each layer is a separate Konva `<Layer>` component. This matters for performance: toggling events doesn't invalidate the path layer, and updating the timeline only re-renders the path layer. The base image layer renders exactly once.


### Timeline Slicing

The timeline is a normalized float `t ∈ [0, 1]`. Player events are sorted by timestamp at processing time. At render time:

```js
const visibleEvents = events.filter(e => e.t_norm <= timeline);
const pathPoints = positions.slice(0, Math.floor(positions.length * timeline));
```

No backend call on scrub — all data for the selected match is in memory.

### Heatmap Generation

Heatmaps are generated client-side using a simple kernel density pass over event coordinates, written to an offscreen `<canvas>` element, and composited onto the Konva layer as an image.

This approach is efficient for the current dataset size but may become expensive at scale, which is why moving computation to a Web Worker is recommended for production.

Three modes are supported: movement density, kill hotspots, and death concentration.

---

## 5. Key Assumptions

| Area | Assumption | Reasoning |
|---|---|---|
| Match dates | Derived from folder names (`February_10`) rather than raw timestamps | Timestamps in the data had timezone inconsistencies; folder names were always correct |
| Bot detection | `is_bot` field taken at face value | No secondary heuristic was needed — the flag was present and consistent |
| Coordinate constants | Origin and scale values taken directly from the data README | No empirical calibration was performed; README values produced accurate visual alignment |
| Event types | Normalized to lowercase during processing | Source data had mixed casing (`Kill`, `kill`, `KILL`) across dates |
| Elevation | `y` coordinate discarded entirely | Extraction shooter — vertical position is not meaningful for 2D map analysis |

---

## 6. Tradeoffs

| Decision | Alternative Considered | Why I Chose This |
|---|---|---|
| Preprocess to JSON offline | Query parquet files at request time | Eliminates runtime dependency on PyArrow in the API; faster response; simpler backend |
| Frontend filtering | Server-side filtering via query params | All match metadata fits in ~50KB; frontend filtering is instant and reduces API surface |
| Canvas (Konva) | SVG | SVG DOM nodes degrade beyond ~500 elements; a single match can have 2000+ path points |
| Folder-based dates | Raw event timestamps | Folder names were the only reliable, consistent date signal across all five days of data |
| Single processed.json | Per-match JSON files | Simpler to generate, simpler to serve; acceptable at this data volume |

---

## 7. What I'd Change at Production Scale

The current architecture breaks down if match volume grows significantly. The specific failure points:

- `processed.json` becomes too large to serve as a single file past ~10,000 matches
- Client-side heatmap generation blocks the main thread on dense datasets
- No caching layer — every backend restart re-reads the JSON from disk

At scale: split to per-match files served from object storage (S3/R2), move heatmap generation to a Web Worker, add a lightweight cache (Redis or even HTTP `Cache-Control` headers on Render).

## 8. Performance Considerations

The system is optimized for smooth interaction despite high-density telemetry data.

### Rendering Strategy

* **Canvas over DOM (React-Konva)**
  Avoids thousands of DOM nodes — a single match can exceed 2000+ path points.

* **Layer Isolation**

  * Base map (static, renders once)
  * Paths (updates on timeline)
  * Events (toggleable)
  * Heatmap (independent overlay)

  → Prevents unnecessary re-renders across layers

### Path Slicing (Key Optimization)

Instead of rendering full paths:

```js
const visiblePath = path.slice(0, Math.floor(path.length * progress));
```

* Only visible portion is drawn
* Reduces draw calls significantly
* Keeps playback smooth even with long paths

### Client-Side Preloading

* Full match data is loaded once
* Timeline scrubbing requires **zero API calls**
* Enables instant UI response

### Tradeoff

* Slightly higher memory usage per match
* Chosen deliberately to eliminate network latency during playback
## 9. Production Considerations & Scalability

While the current system is optimized for rapid analysis of a limited dataset (~5 days), the following changes would be required at scale:

### Data Scaling

* Replace single `processed.json` with:

  * Per-match JSON files
  * Stored in object storage (S3 / Cloudflare R2)
* Load matches on demand instead of preloading all data

### API Improvements

* Introduce pagination for `/matches`
* Add caching layer (Redis or CDN caching)
* Serve compressed responses (gzip/brotli)

### Frontend Optimization

* Move heatmap computation to a **Web Worker**

  * Prevents main thread blocking
* Virtualize match list (React Window) for large datasets
* Lazy-load match data only when selected

### Performance Monitoring

* Add basic telemetry:

  * render time
  * interaction latency
* Helps detect bottlenecks in real usage

### Reliability

* Add fallback UI for API failures
* Retry logic for match fetch
* Graceful handling of missing/corrupt data

### Future Enhancements

* Session comparison (match vs match)
* Multi-match aggregation heatmaps
* Player clustering (behavior segmentation)
