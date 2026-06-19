import { useState } from "react";

const COLORS = {
  navy: "#0A2540",
  emerald: "#10B981",
  emeraldDark: "#059669",
  destructive: "#E11D48",
  warning: "#F59E0B",
  muted: "#64748B",
  hint: "#94A3B8",
  border: "#E2E8F0",
  chip: "#F1F5F9",
  bg: "#F8FAFC",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function App() {
  const [tab, setTab] = useState("dashboard");

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", background: COLORS.bg, minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <div style={{ background: COLORS.navy, padding: "32px 20px 24px" }}>
        <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 700, margin: 0 }}>⚓ Lastro</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", margin: "4px 0 0", fontSize: 14 }}>Sua vida financeira em paz</p>
      </div>
      <div style={{ padding: 20 }}>
        <p style={{ color: COLORS.muted, fontSize: 15 }}>App carregado com sucesso! ✅</p>
        <p style={{ color: COLORS.muted, fontSize: 14 }}>Supabase conectado em sa-east-1 (São Paulo)</p>
      </div>
    </div>
  );
}