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

      <select
        value={heatmapType}
        onChange={(e) => setHeatmapType(e.target.value)}
      >
        <option value="movement">Movement</option>
        <option value="kills">Kills</option>
        <option value="deaths">Deaths</option>
      </select>

      <br />

      <label>
        <input
          type="checkbox"
          checked={showKills}
          onChange={() => setShowKills(!showKills)}
        /> Kill
      </label><br />

      <label>
        <input
          type="checkbox"
          checked={showLoot}
          onChange={() => setShowLoot(!showLoot)}
        /> Loot
      </label><br />

      <label>
        <input
          type="checkbox"
          checked={showHeatmap}
          onChange={() => setShowHeatmap(!showHeatmap)}
        /> Heatmap
      </label><br />

      <label>
        <input
          type="checkbox"
          checked={showHumans}
          onChange={() => setShowHumans(!showHumans)}
        /> Humans
      </label><br />

      <label>
        <input
          type="checkbox"
          checked={showDeaths}
          onChange={() => setShowDeaths(!showDeaths)}
        /> Death
      </label><br />

      <label>
        <input
          type="checkbox"
          checked={showStorm}
          onChange={() => setShowStorm(!showStorm)}
        /> Storm
      </label><br />

      <label>
        <input
          type="checkbox"
          checked={showBots}
          onChange={() => setShowBots(!showBots)}
        /> Bots
      </label>
    </div>
  );
}

export default ControlsPanel;