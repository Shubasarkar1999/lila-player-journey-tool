import { Stage, Layer, Line, Circle, Image } from "react-konva";
import { useEffect, useState, useRef } from "react";
import HeatmapLayer from "./HeatmapLayer";
import ControlsPanel from "./ControlsPanel";

function MapView({ matchData }) {
  const [image, setImage] = useState(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 800 });

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showKills, setShowKills] = useState(true);
  const [showLoot, setShowLoot] = useState(true);

  const containerRef = useRef(null);
  const [progress, setProgress] = useState(0); // 0 → 1

  const mapName = matchData.map;

  const mapPath =
    mapName === "Lockdown"
      ? `/maps/${mapName}_Minimap.jpg`
      : `/maps/${mapName}_Minimap.png`;
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showBots, setShowBots] = useState(true);
  const [showHumans, setShowHumans] = useState(true);
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

    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;

    setScale(newScale);

    setPosition({
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
    });
    };
  
  
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


    // 🔥 RESET TIMELINE WHEN MATCH CHANGES
    useEffect(() => {
    setProgress(0);
    }, [matchData]);


    // 🔥 AUTOPLAY TIMELINE (CLEAN VERSION)
    useEffect(() => {
    let interval;

    if (progress < 1) {
        interval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 0.01, 1));
        }, 50);
    }

    return () => clearInterval(interval);
    }, [progress]);


    // 👇 KEEP THIS EXACTLY BELOW4
    const players = Object.entries(matchData.players);
    const filteredPlayers = players.filter(([id, player]) => {
    if (selectedPlayer && id !== selectedPlayer) return false;

    const isBot = player.is_bot; // ✅ FROM BACKEND

    if (!showBots && isBot) return false;
    if (!showHumans && !isBot) return false;

    return true;
    });
    return (
    <div className="map-wrapper" ref={containerRef}>

      {/* 🎛️ CONTROLS */}
        <ControlsPanel
            players={players}
            selectedPlayer={selectedPlayer}
            setSelectedPlayer={setSelectedPlayer}
            showKills={showKills}
            setShowKills={setShowKills}
            showLoot={showLoot}
            setShowLoot={setShowLoot}
            showHeatmap={showHeatmap}
            setShowHeatmap={setShowHeatmap}
            showHumans={showHumans}
            setShowHumans={setShowHumans}
            showBots={showBots}
            setShowBots={setShowBots}
            progress={progress}
            setProgress={setProgress}
            />

          <div
            style={{
                position: "absolute",
                bottom: 20,
                right: 20,
                zIndex: 10,
                background: "rgba(15,23,42,0.7)",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                opacity: 0.8,
                backdropFilter: "blur(6px)",
                border: "1px solid rgba(255,255,255,0.1)"
            }}
            >
            🖱 Scroll to zoom • Drag to pan
            </div>
      {/* 🗺️ MAP */}
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
          {/* 🔥 HEATMAP LAYER */}
          {showHeatmap && (
          <HeatmapLayer
          players={filteredPlayers}
          progress={progress}
          />
          )}
          {/* PATH */}
          {filteredPlayers.map(([id, player]) => (
            <Line
              key={id}
              points={player.path
              .slice(0, Math.floor(progress * player.path.length))
              .flatMap((p) => [p.px, p.py])
              }             
              stroke={player.is_bot ? "#f97316" : "#38bdf8"}
              strokeWidth={2}
              opacity={0.9}
            />
          ))}


          {/* EVENTS */}
          {filteredPlayers.map(([id, player]) =>
            player.events
            .slice(0, Math.floor(progress * player.events.length))
            .map((e, i) => {              const type = e.event.toLowerCase();

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
                        ? player.is_bot
                        ? "#f97316"   // bot kills
                        : "#ef4444"   // human kills
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