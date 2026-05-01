function InsightsPanel({ players, onInsightClick }) {
  let totalKills = 0;
  let totalLoot = 0;

  const zoneCount = {
    topLeft: 0,
    topRight: 0,
    bottomLeft: 0,
    bottomRight: 0,
  };

  players.forEach(([_, player]) => {
    player.events.forEach((e) => {
      const type = e.event.toLowerCase();
      if (type === "kill") totalKills++;
      if (type === "loot") totalLoot++;
    });

    player.path.forEach((p) => {
      if (p.px < 512 && p.py < 512) zoneCount.topLeft++;
      else if (p.px >= 512 && p.py < 512) zoneCount.topRight++;
      else if (p.px < 512 && p.py >= 512) zoneCount.bottomLeft++;
      else zoneCount.bottomRight++;
    });
  });

  const zoneLabel = {
    topLeft: "Top Left",
    topRight: "Top Right",
    bottomLeft: "Bottom Left",
    bottomRight: "Bottom Right",
  };

  const totalZonePoints = Object.values(zoneCount).reduce((a, b) => a + b, 0);
  const sortedZones = Object.entries(zoneCount).sort((a, b) => b[1] - a[1]);

  const [topZone, topValue] = sortedZones[0];

  const topZonePercent = totalZonePoints
    ? ((topValue / totalZonePoints) * 100).toFixed(0)
    : 0;

  const mostActiveZone = topZone;

  // 🔥 Kill distribution
  const killZone = {
    topLeft: 0,
    topRight: 0,
    bottomLeft: 0,
    bottomRight: 0,
  };

  // 🔥 Loot distribution (FIXED)
  const lootZone = {
    topLeft: 0,
    topRight: 0,
    bottomLeft: 0,
    bottomRight: 0,
  };

  players.forEach(([_, player]) => {
    player.events.forEach((e) => {
      const type = e.event.toLowerCase();

      if (type === "kill") {
        if (e.px < 512 && e.py < 512) killZone.topLeft++;
        else if (e.px >= 512 && e.py < 512) killZone.topRight++;
        else if (e.px < 512 && e.py >= 512) killZone.bottomLeft++;
        else killZone.bottomRight++;
      }

      if (type === "loot") {
        if (e.px < 512 && e.py < 512) lootZone.topLeft++;
        else if (e.px >= 512 && e.py < 512) lootZone.topRight++;
        else if (e.px < 512 && e.py >= 512) lootZone.bottomLeft++;
        else lootZone.bottomRight++;
      }
    });
  });

  const topKillZone = Object.entries(killZone).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  // 🔥 Loot spread (FIXED)
  const activeLootZones = Object.values(lootZone).filter(v => v > 0).length;

  // 🔥 Edge vs center
  let edgeActivity = 0;
  let centerActivity = 0;

  players.forEach(([_, player]) => {
    player.path.forEach((p) => {
      if (
        p.px < 200 ||
        p.px > 800 ||
        p.py < 200 ||
        p.py > 800
      ) {
        edgeActivity++;
      } else {
        centerActivity++;
      }
    });
  });

  const edgeDominant = edgeActivity > centerActivity;

  return (
    <div className="details-card">
      <h3>📊 Match Intelligence</h3>

      {/* 🔥 METRICS */}
      <div className="bar-item">
        <span>🔥 Kills</span>
        <div className="bar">
          <div
            className="bar-fill red"
            style={{ width: `${totalKills * 10}px` }}
          />
        </div>
        <b>{totalKills}</b>
      </div>

      <div className="bar-item">
        <span>📦 Loot</span>
        <div className="bar">
          <div
            className="bar-fill green"
            style={{ width: `${totalLoot * 10}px` }}
          />
        </div>
        <b>{totalLoot}</b>
      </div>

      {/* ✅ HOT ZONES */}
      <div className="section-block compact">
        <div className="section-title">🧭 Hot Zones</div>

        {sortedZones.slice(0, 3).map(([zone], i) => (
          <div className="zone-line" key={zone}>
            <span className="zone-rank">{i + 1}.</span>
            <span className="zone-name">{zoneLabel[zone]}</span>
          </div>
        ))}
      </div>

      {/* ✅ SMART INSIGHTS (UPGRADED) */}
      <div className="insights-card">
        <div className="section-title">🧠 Smart Insights</div>

        {/* 🔥 MOVEMENT */}
        <div className="insight-block">
          <div className="insight-title">🔥 Movement Concentration</div>
          <div className="insight-desc">
            <b>{topZonePercent}%</b> of player movement is concentrated in{" "}
            <b>{zoneLabel[mostActiveZone]}</b>.
          </div>
          <div className="insight-reason">
            → Indicates a dominant traversal path likely influenced by loot placement or safe zone pressure.
          </div>
          <div className="insight-action">
            💡 Suggestion: Redistribute loot or objectives to underutilized zones to improve map balance.
          </div>
        </div>

        {/* 🎯 COMBAT */}
        <div className="insight-block">
          <div className="insight-title">🎯 Combat Hotspot</div>
          <div className="insight-desc">
            Most kills are occurring in <b>{zoneLabel[topKillZone]}</b>.
          </div>
          <div className="insight-reason">
            → Suggests a choke point or forced engagement area where players converge.
          </div>
          <div className="insight-action">
            💡 Suggestion: Introduce alternate paths or redistribute loot to reduce congestion.
          </div>
        </div>

        {/* 📦 LOOT */}
        <div className="insight-block">
          <div className="insight-title">📦 Loot Distribution</div>
          <div className="insight-desc">
            Loot is spread across <b>{activeLootZones}</b> zones.
          </div>
          <div className="insight-reason">
            → Indicates {activeLootZones < 3 ? "low" : "moderate"} distribution, which may limit exploration.
          </div>
          <div className="insight-action">
            💡 Suggestion: Improve loot diversity across zones to encourage wider map usage.
          </div>
        </div>

        {/* ⚔️ INTENSITY */}
        <div className="insight-block">
          <div className="insight-title">⚔️ Match Intensity</div>
          <div className="insight-desc">
            Kill-to-loot ratio is{" "}
            <b>{totalLoot ? (totalKills / totalLoot).toFixed(2) : 0}</b>.
          </div>
          <div className="insight-reason">
            → Indicates {totalKills > totalLoot ? "combat-heavy" : "exploration-heavy"} gameplay.
          </div>
          <div className="insight-action">
            💡 Suggestion: Adjust loot density or dynamic events to balance engagement.
          </div>
        </div>

        {/* 📍 BEHAVIOR */}
        <div className="insight-block">
          <div className="insight-title">📍 Player Behavior</div>
          <div className="insight-desc">
            Players show <b>{edgeDominant ? "edge-heavy" : "center-dominant"}</b> movement.
          </div>
          <div className="insight-reason">
            → Indicates {edgeDominant ? "risk-averse gameplay and avoidance of combat" : "aggressive engagement patterns"}.
          </div>
          <div className="insight-action">
            💡 Suggestion: Balance risk-reward between center and edges to support diverse playstyles.
          </div>
        </div>
      </div>
      </div>
  );
}

export default InsightsPanel;