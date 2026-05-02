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
  setIsPlaying,
  isPlaying
}) {
  const [image, setImage] = useState(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 800 });

  const containerRef = useRef(null);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const [tooltip, setTooltip] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [zoneStats, setZoneStats] = useState(null);

  if (!matchData || !matchData.players) return null;

  const players = Object.entries(matchData.players);

  const mapPath = `/maps/${matchData.map}_Minimap.png`;

  // 🔥 SCALING FIX
  const baseSize = 1024;
  const scaleFactor = stageSize.width / baseSize;

  // 🔥 SMOOTH ZOOM
  const handleWheel = (e) => {
    e.evt.preventDefault();

    const scaleBy = 1.08;
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();

    const oldScale = scale;

    const mousePointTo = {
      x: (pointer.x - position.x) / oldScale,
      y: (pointer.y - position.y) / oldScale,
    };

    let newScale =
      e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    newScale = Math.max(0.6, Math.min(2.5, newScale));

    setScale(newScale);

    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  // LOAD MAP IMAGE
  useEffect(() => {
    const img = new window.Image();
    img.src = mapPath;
    img.onload = () => setImage(img);
  }, [mapPath]);

  // RESPONSIVE STAGE
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

  const filteredPlayers = players.filter(([_, player]) => {
    const isBot = player?.is_bot;
    if (!showBots && isBot) return false;
    if (!showHumans && !isBot) return false;
    return true;
  });

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="map-wrapper" ref={containerRef}>
      <Legend />

      {/* 🎬 TIMELINE */}
      <div className="timeline-wrapper">
        <div className="timeline-bar">

          <div
            className="play-btn"
            onClick={() => {
              if (progress >= 1) setProgress(0);
              setIsPlaying(prev => !prev);
            }}
          >
            {progress === 1 ? "🔁" : isPlaying ? "⏸" : "▶"}
          </div>

          <div className="time-label">
            {formatTime(progress * (matchData.duration || 600))}
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={progress}
            onMouseDown={() => setIsPlaying(false)}
            onMouseUp={() => setIsPlaying(true)}
            onChange={(e) => setProgress(parseFloat(e.target.value))}
            className="timeline-slider"
          />

          <div className="time-label right">
            {formatTime(matchData.duration || 600)}
          </div>

          <div className="expand-btn">⛶</div>
        </div>
      </div>

      {/* 🗺️ STAGE */}
      <Stage
        width={stageSize.width}
        height={stageSize.height}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        draggable
        onWheel={handleWheel}
        listening={true}
      >
        <Layer>

          {/* MAP IMAGE */}
          {image && (
            <Image
              image={image}
              width={stageSize.width}
              height={stageSize.height}
            />
          )}

          {/* 🔥 PLAYER PATHS */}
          {filteredPlayers.map(([id, player]) => {
            const visibleLength = Math.floor(
              progress * (player.path?.length || 0)
            );

            return (
              <Line
                key={id}
                points={(player.path || [])
                  .slice(0, visibleLength)
                  .flatMap((p) => [
                    p.px * scaleFactor,
                    p.py * scaleFactor
                  ])}
                stroke={player.is_bot ? "#f97316" : "#38bdf8"}
                strokeWidth={2.25}
                opacity={0.8}
                lineCap="round"
                lineJoin="round"
                perfectDrawEnabled={false}
              />
            );
          })}

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
                    x={e.px * scaleFactor}
                    y={e.py * scaleFactor}
                    radius={2}
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
                    onMouseEnter={(evt) => {
                      const pointer = {
                        x: evt.evt.clientX,
                        y: evt.evt.clientY
                      };

                      setTooltip({
                        x: pointer.x,
                        y: pointer.y,
                        type,
                        isBot: player.is_bot,
                        time: Math.floor(progress * (matchData.duration || 600))
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })
          )}

          {/* HEATMAP */}
          {showHeatmap && (
            <HeatmapLayer
              players={filteredPlayers}
              progress={progress}
              type={heatmapType}
              showKills={showKills}
              showDeaths={showDeaths}
            />
          )}

        </Layer>
      </Stage>

      {/* TOOLTIP */}
      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: Math.min(tooltip.x + 10, window.innerWidth - 150),
            top: Math.min(tooltip.y + 10, window.innerHeight - 80),
            zIndex: 30,
            background: "rgba(15,23,42,0.9)",
            padding: "6px 10px",
            borderRadius: "6px",
            fontSize: "11px",
            color: "#e2e8f0",
            pointerEvents: "none",
            border: "1px solid rgba(255,255,255,0.08)"
          }}
        >
          <div style={{ fontWeight: "bold" }}>
            {tooltip.type.toUpperCase()}
          </div>

          <div style={{ fontSize: "10px", color: "#94a3b8" }}>
            {tooltip.isBot ? "Bot" : "Human"} • {formatTime(tooltip.time)}
          </div>
        </div>
      )}
    </div>
  );
}

export default MapView;