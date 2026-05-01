import { Stage, Layer, Line, Circle, Image } from "react-konva";
import { useEffect, useState, useRef } from "react";
import HeatmapLayer from "./HeatmapLayer";

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
      >
        <Layer>

          {image && (
            <Image
              image={image}
              width={stageSize.width}
              height={stageSize.height}
            />
          )}

          {showHeatmap &&
            (heatmapType === "movement" ||
              (heatmapType === "kills" && showKills) ||
              (heatmapType === "deaths" && showDeaths)) && (
              <HeatmapLayer
                players={filteredPlayers}
                progress={progress}
                type={heatmapType}
                showKills={showKills}
                showDeaths={showDeaths}
              />
            )}

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

        </Layer>
      </Stage>
    </div>
  );
}

export default MapView;