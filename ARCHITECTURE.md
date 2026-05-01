# Player Journey Visualization System

## Architecture Overview

---

## 1. Tech Stack & Rationale

| Layer           | Technology               | Why                                                  |
| --------------- | ------------------------ | ---------------------------------------------------- |
| Data Processing | Python (Pandas, PyArrow) | Efficient handling of large parquet datasets         |
| Backend API     | FastAPI                  | Fast, lightweight, easy REST APIs                    |
| Frontend        | React (Vite)             | Fast development + component-based UI                |
| Visualization   | React-Konva              | High-performance canvas rendering for large datasets |
| Deployment      | Vercel (FE), Render (BE) | Simple, reliable hosting                             |

---

## 2. End-to-End Data Flow

### Pipeline:

**Parquet Files → Processing Script → JSON → FastAPI → React UI**

1. Raw telemetry data is stored as parquet files organized by date folders (e.g., `February_10`).
2. A Python script:

   * Loads and merges data
   * Normalizes events (kill, loot, death, storm)
   * Converts coordinates
   * Groups data by match and player
   * Extracts match date from folder name
3. Output is stored as `processed.json`
4. FastAPI serves this data via endpoints:

   * `/matches` → metadata (id, map, date)
   * `/matches/{id}` → full match data
5. React frontend fetches and renders data interactively

---

## 3. Coordinate Mapping (Key Challenge)

Game coordinates are provided in world space `(x, z)` and must be mapped to a 2D minimap.

### Approach:

```
u = (x - origin_x) / scale
v = (z - origin_z) / scale

px = u * 1024
py = (1 - v) * 1024
```

### Explanation:

* Each map has unique origin and scale values
* Coordinates are normalized into [0,1]
* Converted into pixel space (1024x1024)
* Y-axis is inverted to match screen coordinate system

### Why this works:

* Ensures consistent rendering across maps
* Aligns world coordinates with minimap visuals

---

## 4. Frontend Rendering Architecture

Rendering is done using **React-Konva canvas layers**:

1. **Base Layer**

   * Static map image

2. **Player Path Layer**

   * Rendered using `Line`
   * Controlled via timeline playback

3. **Event Layer**

   * Rendered using `Circle`
   * Events include:

     * Kill (red)
     * Loot (green)
     * Death (purple)
     * Storm (blue)

4. **Heatmap Layer**

   * Supports:

     * Movement density
     * Kill hotspots
     * Death hotspots

---

## 5. Timeline & Playback System

* Playback is controlled by a progress value (0 → 1)
* Player paths are sliced based on progress
* Auto-play implemented using intervals
* Manual slider override:

  * User can drag timeline
  * Playback resumes from selected point

---

## 6. Filtering System

Supports:

* Map filter
* Date filter (derived from folder names)
* Match search

Filtering is applied on frontend using metadata from backend.

---

## 7. Assumptions

| Area              | Assumption                                                            |
| ----------------- | --------------------------------------------------------------------- |
| Timestamp         | Raw timestamps were unreliable → used folder names as source of truth |
| Map bounds        | Fixed scale and origin per map                                        |
| Player behavior   | Bots identified via `is_bot` flag                                     |
| Event consistency | Events normalized to lowercase                                        |

---

## 8. Tradeoffs

| Decision           | Alternative           | Why chosen                        |
| ------------------ | --------------------- | --------------------------------- |
| Preprocessed JSON  | Query raw data live   | Faster UI, simpler architecture   |
| Canvas rendering   | SVG rendering         | Better performance for large data |
| Folder-based dates | Timestamp-based dates | More reliable data source         |
| Frontend filtering | Backend filtering     | Reduced API complexity            |

---

## 9. Performance Optimizations

* Path slicing reduces rendering load
* Limited match list (top 100)
* Preprocessing avoids heavy runtime computation
* Layered rendering improves efficiency

---

## 10. Conclusion

The system transforms raw gameplay telemetry into an interactive visualization tool by combining data processing, efficient APIs, and optimized rendering. It enables exploration of player behavior, movement patterns, and combat dynamics in real time.

---
