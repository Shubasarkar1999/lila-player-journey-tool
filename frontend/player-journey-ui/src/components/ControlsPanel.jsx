import { useState } from "react";

function ControlsPanel({
  showKills, setShowKills,
  showLoot, setShowLoot,
  showHeatmap, setShowHeatmap,
  showHumans, setShowHumans,
  showDeaths, setShowDeaths,
  showStorm, setShowStorm,
  showBots, setShowBots,
  heatmapType, setHeatmapType
}) {
  return (
    <div className="details-card">
      <h3>🎮 Controls</h3>

      {/* 📊 VISUALIZATION */}
      <div className="controls-section">
        <div className="section-title">📊 Visualization</div>

        <select
          value={heatmapType}
          onChange={(e) => setHeatmapType(e.target.value)}
          className="controls-select"
        >
          <option value="movement">Movement</option>
          <option value="kills">Kills</option>
          <option value="deaths">Deaths</option>
        </select>

        <label className="control-item">
          <input
            type="checkbox"
            checked={showHeatmap}
            onChange={() => setShowHeatmap(!showHeatmap)}
          />
          <span className="custom-checkbox"></span>
          Heatmap
        </label>
      </div>

      {/* 🎯 EVENTS */}
      <div className="controls-section">
        <div className="section-title">🎯 Events</div>

        <label className="control-item">
          <input
            type="checkbox"
            checked={showKills}
            onChange={() => setShowKills(!showKills)}
          />
          <span className="custom-checkbox"></span>
          Kill
        </label>

        <label className="control-item">
          <input
            type="checkbox"
            checked={showLoot}
            onChange={() => setShowLoot(!showLoot)}
          />
          <span className="custom-checkbox"></span>
          Loot
        </label>

        <label className="control-item">
          <input
            type="checkbox"
            checked={showDeaths}
            onChange={() => setShowDeaths(!showDeaths)}
          />
          <span className="custom-checkbox"></span> 
          Death
        </label>

        <label className="control-item">
          <input
            type="checkbox"
            checked={showStorm}
            onChange={() => setShowStorm(!showStorm)}
          />
          <span className="custom-checkbox"></span>
          Storm
        </label>
      </div>

      {/* 👤 PLAYERS */}
      <div className="controls-section">
        <div className="section-title">👤 Players</div>

        <label className="control-item">
          <input
            type="checkbox"
            checked={showHumans}
            onChange={() => setShowHumans(!showHumans)}
          />
          <span className="custom-checkbox"></span>
          Humans
        </label>

        <label className="control-item">
          <input
            type="checkbox"
            checked={showBots}
            onChange={() => setShowBots(!showBots)}
          />
          <span className="custom-checkbox"></span>
          Bots
        </label>
      </div>
    </div>
  );
}

export default ControlsPanel;