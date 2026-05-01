export default function Legend() {
  return (
    <div style={{
      position: "absolute",
      bottom: 20,
      left: 20,
      background: "rgba(0,0,0,0.6)",
      padding: "8px",
      borderRadius: "8px",
      fontSize: "12px"
    }}>
      <div>🟦 Human</div>
      <div>🟧 Bot</div>
      <div>🔴 Kill</div>
      <div>🟢 Loot</div>
      <div>🟣 Death</div>
      <div>🔵 Storm</div>
    </div>
  );
}