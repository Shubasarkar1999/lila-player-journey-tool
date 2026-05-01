import { useEffect, useState } from "react";
import axios from "axios";
import MapView from "./components/MapView";
import "./App.css";
import ControlsPanel from "./components/ControlsPanel";
import InsightsPanel from "./components/InsightsPanel";

function App() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [entered, setEntered] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showKills, setShowKills] = useState(true);
  const [showLoot, setShowLoot] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showBots, setShowBots] = useState(true);
  const [showHumans, setShowHumans] = useState(true);
  const [progress, setProgress] = useState(0);  
  const [showDeaths, setShowDeaths] = useState(true);
  const [showStorm, setShowStorm] = useState(true);
  const [heatmapType, setHeatmapType] = useState("movement");
  const [isPlaying, setIsPlaying] = useState(true);

  // 🔥 NEW STATE
  const [selectedMap, setSelectedMap] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/matches")
      .then(res => setMatches(res.data));
  }, []);

  const loadMatch = (id) => {
    setSelectedMatch(id);
    axios.get(`http://127.0.0.1:8000/matches/${encodeURIComponent(id)}`)
      .then(res => setMatchData(res.data));
  };

  useEffect(() => {
    setProgress(0);
  }, [matchData]);

  useEffect(() => {
    let interval;

    if (isPlaying && progress < 1) {
      interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 0.01, 1));
      }, 50);
    }

    return () => clearInterval(interval);
  }, [progress, isPlaying]);

  // 🔥 FILTER LOGIC (CORRECT PLACE)
  const uniqueMaps = [...new Set(matches.map(m => m.map))];
  const uniqueDates = [...new Set(matches.map(m => m.date))];

  const filteredMatches = matches.filter((m) => {
    const mapOk = selectedMap === "all" || m.map === selectedMap;
    const dateOk = selectedDate === "all" || m.date === selectedDate;
    const searchOk = m.id.toLowerCase().includes(searchText.toLowerCase());

    return mapOk && dateOk && searchOk;
  });

  // 🚀 LANDING PAGE
  if (!entered) {
    return (
      <div className="landing">
        <div className="hero">
          <h1 className="title">🎮 Player Journey Intelligence</h1>
          <p className="subtitle">
            Visualize movement, behavior, and combat patterns  
            across maps in real-time
          </p>
          <button
            className="enter-btn"
            onClick={() => setEntered(true)}
          >
            Enter Dashboard →
          </button>
        </div>
      </div>
    );
  }

  // 🧭 MAIN APP
  return (
    <div className="container">

      {/* SIDEBAR */}
      <div className="sidebar">
        <h3>🎮 Matches</h3>

        {/* 🔥 MAP FILTER */}
        <select
          className="dropdown"
          value={selectedMap}
          onChange={(e) => setSelectedMap(e.target.value)}
        >
          <option value="all">All Maps</option>
          {uniqueMaps.map((map) => (
            <option key={map} value={map}>{map}</option>
          ))}
        </select>

        <select
          className="dropdown"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          <option value="all">All Dates</option>
          {uniqueDates.map((date) => (
            <option key={date} value={date}>{date}</option>
          ))}
        </select>

        <input
          className="search-box"
          placeholder="Search match..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        {/* 🔥 USE FILTERED MATCHES */}
        {filteredMatches.slice(0, 100).map((m, i) => (
          <div
            key={i}
            onClick={() => loadMatch(m.id)}
            className={`match-card ${selectedMatch === m.id ? "active" : ""}`}
          >
            {m.id.slice(0, 25)}...
            <div style={{ fontSize: "10px", opacity: 0.7 }}>
              {m.map} | {m.date}
            </div>
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div className="main">
        {!matchData && <h2>Select a match</h2>}
        {matchData && (
          <>
            <div className="main">

              {/* LEFT */}
              <div className="left-panel">
                <div className="details-card">
                  <h3>📄 Match Details</h3>

                  <div className="detail-item">
                    <span>ID</span>
                    <b>{selectedMatch}</b>
                  </div>

                  <div className="detail-item">
                    <span>Map</span>
                    <b>{matchData.map}</b>
                  </div>
                </div>

                <ControlsPanel
                  showKills={showKills} setShowKills={setShowKills}
                  showLoot={showLoot} setShowLoot={setShowLoot}
                  showHeatmap={showHeatmap} setShowHeatmap={setShowHeatmap}
                  showHumans={showHumans} setShowHumans={setShowHumans}
                  showDeaths={showDeaths} setShowDeaths={setShowDeaths}
                  showStorm={showStorm} setShowStorm={setShowStorm}
                  showBots={showBots} setShowBots={setShowBots}
                  heatmapType={heatmapType} setHeatmapType={setHeatmapType}
                />
              </div>

              {/* CENTER MAP */}
              <div className="map-container">
                <MapView
                  matchData={matchData}
                  selectedPlayer={selectedPlayer}
                  showKills={showKills}
                  showLoot={showLoot}
                  showHeatmap={showHeatmap}
                  showBots={showBots}
                  showHumans={showHumans}
                  showDeaths={showDeaths}        // 🔥 ADD THIS
                  heatmapType={heatmapType}      // 🔥 ADD THIS
                  progress={progress}
                  setProgress={setProgress}
                  setIsPlaying={setIsPlaying}
                />
              </div>

              {/* RIGHT INSIGHTS */}
              <div className="insights-container">
                <InsightsPanel players={Object.entries(matchData.players)} />
              </div>

            </div>
          </>
        )}
      </div>

    </div>
  );
}

export default App;