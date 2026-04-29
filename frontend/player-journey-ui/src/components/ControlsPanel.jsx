function ControlsPanel({
  players,
  selectedPlayer,
  setSelectedPlayer,
  showKills,
  setShowKills,
  showLoot,
  setShowLoot,
  showHeatmap,
  setShowHeatmap,
  showHumans,
  setShowHumans,
  showBots,
  setShowBots,
  progress,
  setProgress
}) {
  return (
    <>
      <div className="controls-card">

        <div className="controls-title">🎮 Controls</div>

        <select
          value={selectedPlayer || ""}
          onChange={(e) => setSelectedPlayer(e.target.value)}
          className="controls-select"
        >
          <option value="">All Players</option>
          {players.map(([id]) => (
            <option key={id} value={id}>
              {id.slice(0, 8)}
            </option>
          ))}
        </select>

        <div className="controls-group">

          <label>
            <input
              type="checkbox"
              checked={showKills}
              onChange={() => setShowKills(!showKills)}
            />
            Kill
          </label>

          <label>
            <input
              type="checkbox"
              checked={showLoot}
              onChange={() => setShowLoot(!showLoot)}
            />
            Loot
          </label>

          <label>
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={() => setShowHeatmap(!showHeatmap)}
            />
            Heatmap
          </label>

          <label>
            <input
              type="checkbox"
              checked={showHumans}
              onChange={() => setShowHumans(!showHumans)}
            />
            Humans
          </label>

          <label>
            <input
              type="checkbox"
              checked={showBots}
              onChange={() => setShowBots(!showBots)}
            />
            Bots
          </label>

        </div>
      </div>

      {/* 🎯 TIMELINE */}
      <div style={{ marginTop: "10px" }}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={progress}
          onChange={(e) => setProgress(parseFloat(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>
    </>
  );
}

export default ControlsPanel;