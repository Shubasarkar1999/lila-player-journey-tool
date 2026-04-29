import { Stage, Layer, Line, Circle, Image } from "react-konva";
import { useEffect, useState, useRef } from "react";

function MapView({ matchData }) {
  const [image, setImage] = useState(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 800 });

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showKills, setShowKills] = useState(true);
  const [showLoot, setShowLoot] = useState(true);

  const containerRef = useRef(null);

  const mapName = matchData.map;

  const mapPath =
    mapName === "Lockdown"
      ? `/maps/${mapName}_Minimap.jpg`
      : `/maps/${mapName}_Minimap.png`;

  // 🖼️ Load map
  useEffect(() => {
    const img = new window.Image();
    img.src = mapPath;
    img.onload = () => setImage(img);
  }, [mapPath]);

  // 📏 Responsive canvas (FIXES YOUR ISSUE)
  useEffect(() => {
    const resize = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;

      const size = Math.min(width, height); // keep square

      if (size > 0) {
        setStageSize({ width: size, height: size });
      }
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const players = Object.entries(matchData.players);

  const filteredPlayers = players.filter(([id]) => {
    if (selectedPlayer && id !== selectedPlayer) return false;
    return true;
  });

  return (
    <div className="map-wrapper" ref={containerRef}>

      {/* 🎛️ CONTROLS */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          zIndex: 10,
          background: "rgba(15,23,42,0.8)",
          padding: "12px",
          borderRadius: "10px",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)"
        }}
      >
        <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
          🎮 Controls
        </div>

        <select
          onChange={(e) => setSelectedPlayer(e.target.value)}
          style={{
            width: "100%",
            padding: "6px",
            marginBottom: "8px",
            background: "#020617",
            color: "white",
            border: "1px solid #334155",
            borderRadius: "6px"
          }}
        >
          <option value="">All Players</option>
          {players.map(([id]) => (
            <option key={id} value={id}>
              {id.slice(0, 8)}
            </option>
          ))}
        </select>

        <label>
          <input
            type="checkbox"
            checked={showKills}
            onChange={() => setShowKills(!showKills)}
          /> Kill
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={showLoot}
            onChange={() => setShowLoot(!showLoot)}
          /> Loot
        </label>
      </div>

      {/* 🗺️ MAP */}
      <Stage width={stageSize.width} height={stageSize.height}>
        <Layer>

          {image && (
            <Image
              image={image}
              width={stageSize.width}
              height={stageSize.height}
            />
          )}

          {/* PATH */}
          {filteredPlayers.map(([id, player]) => (
            <Line
              key={id}
              points={player.path.flatMap((p) => [p.px, p.py])}
              stroke="#38bdf8"
              strokeWidth={2}
              opacity={0.9}
            />
          ))}

          {/* EVENTS */}
          {filteredPlayers.map(([id, player]) =>
            player.events.map((e, i) => {
              const type = e.event.toLowerCase();

              if (type === "kill" && !showKills) return null;
              if (type === "loot" && !showLoot) return null;

              return (
                <Circle
                  key={`${id}-${i}`}
                  x={e.px}
                  y={e.py}
                  radius={4}
                  fill={
                    type === "kill"
                      ? "#ef4444"
                      : type === "loot"
                      ? "#22c55e"
                      : "#facc15"
                  }
                />
              );
            })
          )}

        </Layer>
      </Stage>
    </div>
  );
}

export default MapView;