export default function Legend() {
  return (
    <div style={{
      position: "absolute",
      bottom: 20,
      left: 20,
      zIndex: 20,   // 🔥 ADD THIS (CRITICAL)

      background: "rgba(15, 23, 42, 0.75)",
      backdropFilter: "blur(8px)",
      border: "1px solid rgba(255,255,255,0.08)",

      padding: "10px 12px",
      borderRadius: "10px",

      fontSize: "12px",
      color: "#e2e8f0",

      boxShadow: "0 8px 20px rgba(0,0,0,0.6)"
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