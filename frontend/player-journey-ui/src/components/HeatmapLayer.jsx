import { Circle } from "react-konva";

function HeatmapLayer({ players, progress, type, showKills, showDeaths }) {
  const heatPoints = [];

  players.forEach(([_, player]) => {
    if (!player) return;

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

    if (type === "kills" && showKills) {
      visibleEvents.forEach((e) => {
        if (e?.event?.toLowerCase() === "kill") {
          heatPoints.push({ x: e.px, y: e.py });
        }
      });
    }

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
          radius={30}
          fill={
            type === "kills"
              ? "#ef4444"
              : type === "deaths"
              ? "#a855f7"
              : "#f97316"
          }
          opacity={0.12}
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