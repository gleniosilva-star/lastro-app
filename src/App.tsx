const COLORS = {
  navy: "#0A2540",
  emerald: "#10B981",
  bg: "#F8FAFC",
  muted: "#64748B",
};

export default function App() {
  return (
    <div style={{ maxWidth: 430, margin: "0 auto", background: COLORS.bg, minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <div style={{ background: COLORS.navy, padding: "32px 20px 24px" }}>
        <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 700, margin: 0 }}>⚓ Lastro</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", margin: "4px 0 0", fontSize: 14 }}>Sua vida financeira em paz</p>
      </div>
      <div style={{ padding: 20 }}>
        <p style={{ color: COLORS.muted, fontSize: 15 }}>App carregado com sucesso! ✅</p>
        <p style={{ color: COLORS.muted, fontSize: 14 }}>Supabase conectado em sa-east-1 (São Paulo)</p>
        <p style={{ color: COLORS.emerald, fontSize: 14, marginTop: 16, fontWeight: 600 }}>Em desenvolvimento — em breve todas as telas!</p>
      </div>
    </div>
  );
}