import { Circle } from "react-konva";

function HeatmapLayer({ players, progress, type, showKills, showDeaths }) {
  const heatPoints = [];
  console.log("Heatmap mounted");
  players.forEach(([_, player]) => {
    if (!player) return;

    // 🔥 MOVEMENT HEATMAP
    if (type === "movement") {
      const visiblePath = (player.path || []).slice(
        0,
        Math.floor(progress * (player.path?.length || 0))
      );

      visiblePath.forEach((p, idx) => {
        if (idx % 5 === 0 && p) {
          heatPoints.push({ x: p.px, y: p.py });
        }
      });
    }

    const visibleEvents = (player.events || []).slice(
      0,
      Math.floor(progress * (player.events?.length || 0))
    );

    // 🔥 KILL HEATMAP
    if (type === "kills" && showKills) {
      visibleEvents.forEach((e) => {
        if (e?.event?.toLowerCase() === "kill") {
          heatPoints.push({ x: e.px, y: e.py });
        }
      });
    }

    // 🔥 DEATH HEATMAP
    if (type === "deaths" && showDeaths) {
      visibleEvents.forEach((e) => {
        if (e?.event?.toLowerCase() === "death") {
          heatPoints.push({ x: e.px, y: e.py });
        }
      });
    }
  });

  // 🔍 DEBUG
  console.log("Heat points:", heatPoints.length);

  return (
    <>
      {heatPoints.map((p, i) => (
        <Circle
          key={`heat-${i}`}
          x={p.x}
          y={p.y}
          radius={30}
          fill={
            type === "kills"
              ? "#ef4444"
              : type === "deaths"
              ? "#a855f7"
              : "#f97316"
          }
          opacity={0.12}   // ✅ correct
          shadowColor={
            type === "kills"
              ? "#ef4444"
              : type === "deaths"
              ? "#a855f7"
              : "#f97316"
          }
          shadowBlur={80}
        />
      ))}
    </>
  );
}

export default HeatmapLayer;