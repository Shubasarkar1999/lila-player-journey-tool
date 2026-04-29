function InsightsPanel({ players }) {
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

  const mostActiveZone = Object.entries(zoneCount).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  const zoneLabel = {
    topLeft: "Top Left",
    topRight: "Top Right",
    bottomLeft: "Bottom Left",
    bottomRight: "Bottom Right",
  };

  // 🔥 SMART INSIGHTS LOGIC (IMPROVED)

  const totalZonePoints = Object.values(zoneCount).reduce((a, b) => a + b, 0);
  const sortedZones = Object.entries(zoneCount).sort((a, b) => b[1] - a[1]);

  const [topZone, topValue] = sortedZones[0];

  const topZonePercent = totalZonePoints
    ? ((topValue / totalZonePoints) * 100).toFixed(0)
    : 0;

  // 🔥 Kill distribution
  const killZone = {
    topLeft: 0,
    topRight: 0,
    bottomLeft: 0,
    bottomRight: 0,
  };

  players.forEach(([_, player]) => {
    player.events.forEach((e) => {
      if (e.event.toLowerCase() === "kill") {
        if (e.px < 512 && e.py < 512) killZone.topLeft++;
        else if (e.px >= 512 && e.py < 512) killZone.topRight++;
        else if (e.px < 512 && e.py >= 512) killZone.bottomLeft++;
        else killZone.bottomRight++;
      }
    });
  });

  const topKillZone = Object.entries(killZone).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  // 🔥 Loot spread
  const activeLootZones = Object.values(killZone).filter(v => v > 0).length;

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
        <h3>📊 Insights</h3>

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

        {/* ✅ HOT ZONES — NOW DIRECTLY BELOW */}
        <div className="section-block compact">
        <div className="section-title">🧭 Hot Zones</div>

        {Object.entries(zoneCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([zone], i) => (
            <div className="zone-line">
            <span className="zone-rank">{i + 1}.</span>
            <span className="zone-name">{zoneLabel[zone]}</span>
            </div>
            ))}
</div>
        {/* ✅ SMART INSIGHTS */}
        <div className="section-block">
        <div className="section-title">🧠 Smart Insights</div>

        <div className="insight-text">
            🔥 {topZonePercent}% movement in {zoneLabel[mostActiveZone]}
        </div>

        <div className="insight-text">
            🎯 Kills concentrated in {zoneLabel[topKillZone]}
        </div>

        <div className="insight-text">
            📦 Loot spread across {activeLootZones} zones
        </div>

        <div className="insight-text">
            {edgeDominant
            ? "📍 Players favor edges"
            : "🎯 Players favor central zones"}
        </div>
        </div>
    </div>
    );
}
export default InsightsPanel;