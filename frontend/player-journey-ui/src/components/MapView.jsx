import { Stage, Layer, Line, Circle, Image } from "react-konva";
import { useEffect, useState, useRef } from "react";
import HeatmapLayer from "./HeatmapLayer";
import Legend from "./Legend";

function MapView({
  matchData,
  showKills,
  showLoot,
  showDeaths,
  showStorm,
  showHeatmap,
  showBots,
  showHumans,
  heatmapType,
  progress,
  setProgress,
  setIsPlaying      
}) {
  const [image, setImage] = useState(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 800 });

  const containerRef = useRef(null);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [zoneStats, setZoneStats] = useState(null);

  if (!matchData || !matchData.players) return null;

  const mapName = matchData.map;
  const players = Object.entries(matchData.players);

  const mapPath =
    mapName === "Lockdown"
      ? `/maps/${mapName}_Minimap.jpg`
      : `/maps/${mapName}_Minimap.png`;

  const handleWheel = (e) => {
    e.evt.preventDefault();

    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = scale;

    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    const newScale =
      e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    setScale(newScale);

    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  useEffect(() => {
    const img = new window.Image();
    img.src = mapPath;
    img.onload = () => setImage(img);
  }, [mapPath]);

  useEffect(() => {
    const resize = () => {
      if (!containerRef.current) return;

      const width = containerRef.current.offsetWidth;
      const height = containerRef.current.offsetHeight;
      const size = Math.min(width, height);

      if (size > 0) {
        setStageSize({ width: size, height: size });
      }
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const filteredPlayers = players.filter(([id, player]) => {
    const isBot = player?.is_bot;
    if (!showBots && isBot) return false;
    if (!showHumans && !isBot) return false;
    return true;
  });

  return (
    <div className="map-wrapper" ref={containerRef}>
      <Legend />
      <div style={{ marginTop: "10px" }}>
        <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={progress}

        onMouseDown={() => setIsPlaying(false)}   // ⏸ pause while dragging
        onMouseUp={() => setIsPlaying(true)}      // ▶️ resume after release

        onChange={(e) => {
            setProgress(parseFloat(e.target.value));
        }}

        style={{ width: "100%" }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
          zIndex: 10,
          background: "rgba(15,23,42,0.7)",
          padding: "8px 12px",
          borderRadius: "8px",
          fontSize: "12px"
        }}
      >
        🖱 Scroll to zoom • Drag to pan
      </div>

      <Stage
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable
        onWheel={handleWheel}
        

        onMouseMove={(e) => {
          const stage = e.target.getStage();
          const pointer = stage.getPointerPosition();

          if (!pointer) return;

          const pos = {
            x: (pointer.x - position.x) / scale,
            y: (pointer.y - position.y) / scale,
          };

          let kills = 0;
          let loot = 0;
          let deaths = 0;
          let storms = 0;

          const radius = 100 / scale;
          filteredPlayers.forEach(([_, player]) => {
            const visibleEvents = (player.events || []).slice(
              0,
              Math.floor(progress * (player.events?.length || 0))
            );

            visibleEvents.forEach((ev) => {

            const type = ev.event?.toLowerCase();

            // ❌ FILTER OUT HIDDEN TYPES FIRST
            if (type === "kill" && !showKills) return;
            if (type === "loot" && !showLoot) return;
            if (type === "death" && !showDeaths) return;
            if (type === "storm" && !showStorm) return;

            // ✅ VISIBILITY CHECK (SCREEN SPACE)
            const screenX = ev.px * scale + position.x;
            const screenY = ev.py * scale + position.y;

            const isVisible =
              screenX >= 0 &&
              screenX <= stageSize.width &&
              screenY >= 0 &&
              screenY <= stageSize.height;

            if (!isVisible) return;

            // ✅ DISTANCE CHECK
            const dx = ev.px - pos.x;
            const dy = ev.py - pos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < radius) {
              const weight = 1 - dist / radius;

              if (type === "kill") kills += weight;
              if (type === "loot") loot += weight;
              if (type === "death") deaths += weight;
              if (type === "storm") {
                const stormWeight = 0.5 * (1 - dist / radius);
                storms += stormWeight;
              }            
            }
          });
          });

          // ✅ ONLY SHOW POPUP IF DATA EXISTS
          if (kills > 0.2 || loot > 0.2 || deaths > 0.2 || storms > 0.2) {
            setSelectedPoint(pointer);
            setZoneStats({
              kills: Math.round(kills),
              loot: Math.round(loot),
              deaths: Math.round(deaths),
              storms: Math.round(storms),
            });       } else {
            setSelectedPoint(null);
            setZoneStats(null);
          }
        }}
        onMouseLeave={() => {
          setSelectedPoint(null);
          setZoneStats(null);
        }}
        
      >
        <Layer>

          {image && (
            <Image
              image={image}
              width={stageSize.width}
              height={stageSize.height}
            />
          )}

          {/* 🔥 PLAYER PATHS */}
          {filteredPlayers.map(([id, player]) => (
            <Line
              key={id}
              points={(player.path || [])
                .slice(0, Math.floor(progress * (player.path?.length || 0)))
                .flatMap((p) => [p.px, p.py])}
              stroke={player.is_bot ? "#f97316" : "#38bdf8"}
              strokeWidth={2}
              opacity={0.9}
            />
          ))}

          {/* 🔥 EVENTS */}
          {filteredPlayers.map(([id, player]) =>
            (player.events || [])
              .slice(0, Math.floor(progress * (player.events?.length || 0)))
              .map((e, i) => {
                const type = e.event?.toLowerCase();

                if (type === "kill" && !showKills) return null;
                if (type === "loot" && !showLoot) return null;
                if (type === "death" && !showDeaths) return null;
                if (type === "storm" && !showStorm) return null;

                return (
                  <Circle
                    key={`${id}-${i}`}
                    x={e.px}
                    y={e.py}
                    radius={4}
                    fill={
                      type === "kill"
                        ? player.is_bot ? "#f97316" : "#ef4444"
                        : type === "loot"
                        ? "#22c55e"
                        : type === "death"
                        ? "#a855f7"
                        : type === "storm"
                        ? "#0ea5e9"
                        : "#facc15"
                    }
                  />
                );
              })
          )}

          {/* 🔥 HEATMAP (DEBUG - FORCE RENDER) */}
          {showHeatmap && (
            <HeatmapLayer
              players={filteredPlayers}
              progress={progress}
              type={heatmapType}
              showKills={showKills}
              showDeaths={showDeaths}
            />
          )}

          {selectedPoint && (
            <Circle
              x={(selectedPoint.x - position.x) / scale}
              y={(selectedPoint.y - position.y) / scale}
              radius={6}
              fill="#facc15"
            />
          )}
        </Layer>
      </Stage>
      {selectedPoint && zoneStats && (
          <div
          style={{
            position: "absolute",
            left: selectedPoint.x + 10,
            top: selectedPoint.y + 10,
            zIndex: 20,
            background: "rgba(15,23,42,0.9)",
            padding: "10px",
            borderRadius: "8px",
            fontSize: "12px",
            color: "#e2e8f0",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(6px)"
          }}
        >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
          <span style={{ fontWeight: "bold" }}>📍 Zone Analysis</span>

          <span
            style={{ cursor: "pointer" }}
            onClick={() => {
              setSelectedPoint(null);
              setZoneStats(null);
            }}
          >
            ❌
          </span>
        </div>
          <div>🔥 Kills: {zoneStats.kills}</div>
          <div>📦 Loot: {zoneStats.loot}</div>
          <div>💀 Deaths: {zoneStats.deaths}</div>
          <div>🌪 Storm: {zoneStats.storms}</div>
        </div>
      )}
    </div>
  );
}

export default MapView;