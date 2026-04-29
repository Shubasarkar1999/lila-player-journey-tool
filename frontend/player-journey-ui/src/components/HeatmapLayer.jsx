import { Circle } from "react-konva";

function HeatmapLayer({ players, progress }) {
  const heatPoints = [];

  players.forEach(([_, player]) => {
    const visiblePath = player.path.slice(
      0,
      Math.floor(progress * player.path.length)
    );

    visiblePath.forEach((p, idx) => {
      if (idx % 4 === 0) { // 🔥 keep sampling
        heatPoints.push({ x: p.px, y: p.py });
      }
    });
  });

  return (
    <>
      {heatPoints.map((p, i) => (
        <Circle
          key={`heat-${i}`}
          x={p.x}
          y={p.y}

          radius={16}
          fill="#ff0000"        // 🔥 brighter red
          opacity={0.2}       // 🔥 visible but controlled
          shadowColor="#ff0000"
          shadowBlur={70}      // 🔥 glow effect
        />
      ))}
    </>
  );
}

export default HeatmapLayer;