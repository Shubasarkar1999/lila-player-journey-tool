# 🎮 Player Journey Visualization Tool

An interactive analytics tool to visualize player movement, combat patterns, and behavior across game maps using real gameplay telemetry data.

---

## 🚀 Live Demo

🔗 Frontend: *[Add your Vercel/Netlify URL here]*
🔗 Backend API: *[Add your Render/Railway URL here]*

---

## 🧠 What This Tool Does

* Visualizes player movement paths on a minimap
* Highlights combat events (kills, deaths, loot, storm)
* Supports playback of match progression (timeline)
* Displays heatmaps for:

  * Movement density
  * Kill hotspots
  * Death zones
* Differentiates **humans vs bots**
* Provides **insight-driven analytics panel**
* Supports filtering by:

  * Map
  * Date
  * Match ID

---

## 🛠 Tech Stack

### Frontend

* React (Vite)
* React-Konva (canvas rendering)
* Axios

### Backend

* FastAPI
* Python

### Data Processing

* Pandas
* PyArrow

---

## 📊 Features

* 🎯 **Interactive Minimap Rendering**
* ⏱ **Timeline Playback (Auto + Manual Control)**
* 🔍 **Filtering (Map / Date / Match)**
* 🔥 **Heatmaps (Movement / Kill / Death)**
* 🤖 **Bot vs Human Differentiation**
* 📈 **Insights Panel (analytics-driven observations)**

---

## 📁 Project Structure

```
lila-player-journey-tool/
│
├── backend/
│   ├── main.py
│   ├── scripts/
│   │   └── process_data.py
│   └── output/
│       └── processed.json
│
├── frontend/
│   └── player-journey-ui/
│       ├── src/
│       └── components/
│
├── ARCHITECTURE.md
├── INSIGHTS.md
└── README.md
```

---

## ⚙️ Setup Instructions

### 1. Clone the repo

```
git clone https://github.com/your-username/your-repo.git
cd lila-player-journey-tool
```

---

### 2. Backend Setup

```
cd backend
python -m venv venv
venv\Scripts\activate   # Windows

pip install -r requirements.txt
```

Run backend:

```
uvicorn main:app --reload
```

---

### 3. Data Processing

Run once to generate processed data:

```
cd backend/scripts
python process_data.py
```

---

### 4. Frontend Setup

```
cd frontend/player-journey-ui
npm install
npm run dev
```

---

## 🌐 Environment Variables

No environment variables required for local setup.

For deployment:

* Update API URL in frontend:

```js
axios.get("https://your-backend-url/matches")
```

---

## 🧩 Key Implementation Details

### Coordinate Mapping

Game world coordinates `(x, z)` are converted into screen space:

```
u = (x - origin_x) / scale
v = (z - origin_z) / scale

px = u * 1024
py = (1 - v) * 1024
```

This ensures accurate mapping across different maps.

---

### Date Handling

* Raw timestamps were unreliable
* Match date is derived from **folder names (e.g., February_10)**
* Converted into standard format (`YYYY-MM-DD`)

---

## 📌 Assumptions

* Folder names represent correct match dates
* Map scale and origin are predefined
* Events are consistent after normalization

---

## 📈 Insights

See [`INSIGHTS.md`](./INSIGHTS.md) for detailed gameplay insights including:

* Movement concentration
* Combat hotspots
* Risk behavior patterns

---

## 🏗 Architecture

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for:

* Data flow
* Coordinate mapping
* Tradeoffs
* System design

---

## 🎥 Walkthrough

*[Add your video link here]*

Recommended: 2–3 minute walkthrough explaining features and insights.

---

## ✅ Submission Checklist

* [x] Player paths render correctly
* [x] Humans vs bots visually distinct
* [x] Kill, loot, death, storm events shown
* [x] Filtering (map / date / match) works
* [x] Timeline playback implemented
* [x] Heatmaps available
* [x] Insights panel with meaningful observations
* [x] Architecture doc included
* [x] Insights doc included
* [ ] Deployed frontend + backend
* [ ] Walkthrough video

---

## 🙌 Conclusion

This tool demonstrates how raw gameplay telemetry can be transformed into meaningful visual insights using a combination of data processing, backend APIs, and interactive frontend rendering.

---
