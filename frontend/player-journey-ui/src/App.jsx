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
  const [selectedInsight, setSelectedInsight] = useState(null);

  // 🔥 NEW STATE
  const [selectedMap, setSelectedMap] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");
  const [searchText, setSearchText] = useState("");

  // ✅ OPTIMIZED INITIAL LOAD
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const matchesRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/matches`
        );

        const matchesData = matchesRes.data;
        setMatches(matchesData);

        if (matchesData.length > 0) {
          const firstId = matchesData[0].id;

          const matchRes = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/matches/${encodeURIComponent(firstId)}`
          );

          setSelectedMatch(firstId);
          setMatchData(matchRes.data);
        }
      } catch (err) {
        console.error("Initial load failed", err);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    setSelectedInsight(null);
  }, [matchData]);

  // ✅ ASYNC VERSION
  const loadMatch = async (id) => {
    setSelectedMatch(id);

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/matches/${encodeURIComponent(id)}`
      );

      setMatchData(res.data);
    } catch (err) {
      console.error("Match load failed", err);
    }
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
            Understand player movement, combat, and behavior across maps in real-time
          </p>

          <div className="hero-features">
            <div>🔥 Heatmaps</div>
            <div>🎯 Combat Insights</div>
            <div>⏱ Timeline Playback</div>
            <div>🤖 Bot vs Human</div>
          </div>

          <button
            className="enter-btn"
            onClick={() => setEntered(true)}
          >
            Enter Dashboard →
          </button>

          <div className="hero-preview">
            <img src="/preview.png" alt="dashboard preview" />
          </div>

        </div>
      </div>
    );
  }

  // 🧭 MAIN APP
  return (
    <div className="container">

      {/* SIDEBAR */}
      <div className="sidebar">

        <div className="sidebar-header">
          <h3>🎮 Matches</h3>

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

          <div className="search-container">
            <input
              className="search-input"
              placeholder="Search matches..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <div className="matches-list">
          {filteredMatches.slice(0, 100).map((m, i) => {
            const isActive = selectedMatch === m.id;

            return (
              <div
                key={i}
                onClick={() => loadMatch(m.id)}
                className={`match-card ${isActive ? "active" : ""}`}
              >
                <img
                  src={`/maps/${m.map}_Minimap.png`}
                  className="match-thumb"
                />

                <div className="match-content">
                  <div className="match-id">
                    {m.id.slice(0, 20)}...
                  </div>

                  <div className="match-map">
                    {m.map}
                  </div>

                  <div className="match-meta">
                    {m.date} • {m.duration || "10:00"}
                  </div>
                </div>

                <div className="match-status" />
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN */}
      <div className="main">
        {!matchData && <h2>Select a match</h2>}

        {matchData && (
          <>
            <div className="left-panel">
              <div className="details-card">
                <h3>📄 Match Details</h3>

                <div className="detail-item column">
                  <span>Match ID</span>
                  <div className="id-row">
                    <b>{selectedMatch}</b>
                    <span className="copy-icon">📋</span>
                  </div>
                </div>

                <div className="detail-item">
                  <span>Map</span>
                  <b>{matchData.map}</b>
                </div>

                <div className="detail-item">
                  <span>Date</span>
                  <b>{matchData.date || "2024-02-10 12:44:09"}</b>
                </div>

                <div className="details-footer">
                  <div className="footer-item">
                    <span>⏱ Duration</span>
                    <b>{matchData.duration || "10:00"}</b>
                  </div>

                  <div className="footer-item">
                    <span>👥 Players</span>
                    <b>{Object.keys(matchData.players || {}).length}</b>
                  </div>
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

            <div className="map-container">
              <MapView
                matchData={matchData}
                selectedInsight={selectedInsight}
                selectedPlayer={selectedPlayer}
                showKills={showKills}
                showLoot={showLoot}
                showHeatmap={showHeatmap}
                showBots={showBots}
                showHumans={showHumans}
                showDeaths={showDeaths}
                heatmapType={heatmapType}
                progress={progress}
                setProgress={setProgress}
                setIsPlaying={setIsPlaying}
                isPlaying={isPlaying}
              />
            </div>

            <div className="insights-container">
              <InsightsPanel
                players={Object.entries(matchData.players)}
                onInsightClick={setSelectedInsight}
              />
            </div>
          </>
        )}
      </div>

    </div>
  );
}

export default App;