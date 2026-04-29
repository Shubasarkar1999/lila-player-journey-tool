import { useEffect, useState } from "react";
import axios from "axios";
import MapView from "./components/MapView";
import "./App.css";
import InsightsPanel from "./components/InsightsPanel";
function App() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/matches")
      .then(res => setMatches(res.data));
  }, []);

  const loadMatch = (id) => {
    setSelectedMatch(id);
    axios.get(`http://127.0.0.1:8000/matches/${encodeURIComponent(id)}`)
      .then(res => setMatchData(res.data));
  };

  // 🚀 LANDING PAGE
  if (!entered) {
    return (
      <div className="landing">

        <div className="hero">
          <h1 className="title">
            🎮 Player Journey Intelligence
          </h1>

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

        {matches.slice(0, 100).map((m, i) => (
          <div
            key={i}
            onClick={() => loadMatch(m)}
            className={`match-card ${selectedMatch === m ? "active" : ""}`}
          >
            {m.slice(0, 25)}...
          </div>
        ))}
      </div>

      {/* MAIN */}
      <div className="main">
        {!matchData && <h2>Select a match</h2>}
        {matchData && (
          <>
            {/* 🔥 LEFT COLUMN */}
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

              {/* Controls are already inside MapView → keep as-is */}

              <InsightsPanel players={Object.entries(matchData.players)} />

            </div>

            {/* 🔥 RIGHT → MAP */}
            <div className="card">
              <MapView matchData={matchData} />
            </div>
          </>
        )}
      </div>

    </div>
  );
}

export default App;