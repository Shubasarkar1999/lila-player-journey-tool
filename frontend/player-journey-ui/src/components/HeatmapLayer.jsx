import { Circle } from "react-konva";

function HeatmapLayer({ players, progress, type, showKills, showDeaths }) {
  const heatPoints = [];

  players.forEach(([_, player]) => {
    if (!player) return;

    // 🔥 MOVEMENT HEATMAP
    if (type === "movement") {
      const visiblePath = (player.path || []).slice(
        0,
        Math.floor(progress * (player.path?.length || 0))
      );

      visiblePath.forEach((p, idx) => {
        if (idx % 4 === 0 && p) {
          heatPoints.push({ x: p.px, y: p.py });
        }
      });
    }

    // 🔥 EVENTS (timeline synced)
    const visibleEvents = (player.events || []).slice(
      0,
      Math.floor(progress * (player.events?.length || 0))
    );

    // 🔥 KILL HEATMAP (respect toggle)
    if (type === "kills" && showKills) {
      visibleEvents.forEach((e) => {
        if (e?.event?.toLowerCase() === "kill") {
          heatPoints.push({ x: e.px, y: e.py });
        }
      });
    }

    // 🔥 DEATH HEATMAP (respect toggle)
    if (type === "deaths" && showDeaths) {
      visibleEvents.forEach((e) => {
        if (e?.event?.toLowerCase() === "death") {
          heatPoints.push({ x: e.px, y: e.py });
        }
      });
    }
  });

  return (
    <>
      {heatPoints.map((p, i) => (
        <Circle
          key={`heat-${i}`}
          x={p.x}
          y={p.y}
          radius={12}              // ✅ reduced (cleaner)
          fill={
            type === "kills"
              ? "#ef4444"          // 🔴 kills
              : type === "deaths"
              ? "#a855f7"          // 🟣 deaths
              : "#f97316"          // 🟠 movement
          }
          opacity={0.15}           // ✅ less noisy
          shadowColor="#ff0000"
          shadowBlur={40}          // ✅ softer glow
        />
      ))}
    </>
  );
}

export default HeatmapLayer;