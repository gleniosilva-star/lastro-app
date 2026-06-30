import AnchorMark from "./AnchorMark";

const COLORS = {
  navy: "#0A2540",
  emerald: "#10B981",
  muted: "#64748B",
};

export default function Sidebar({ tab, setTab, user }: { tab: string; setTab: (t: string) => void; user: any }) {
  const tabs = [
    { id: "dashboard", label: "Início", icon: "🏠" },
    { id: "transactions", label: "Transações", icon: "↔️" },
    { id: "accounts", label: "Contas", icon: "🏦" },
    { id: "goals", label: "Metas", icon: "🎯" },
    { id: "profile", label: "Perfil", icon: "👤" },
  ];

  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário";

  return (
    <aside style={{ width: 240, background: COLORS.navy, minHeight: "100vh", padding: "24px 16px", display: "flex", flexDirection: "column", position: "fixed", left: 0, top: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32, padding: "0 8px" }}>
        <AnchorMark size={28} color="#FFFFFF" />
        <span style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>Lastro</span>
      </div>

      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", padding: "0 8px", marginBottom: 8 }}>MENU PRINCIPAL</p>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 12px", borderRadius: 10,
            border: "none", cursor: "pointer", fontSize: 15, textAlign: "left",
            background: tab === t.id ? "rgba(255,255,255,0.1)" : "transparent",
            color: tab === t.id ? "#fff" : "rgba(255,255,255,0.7)",
            fontWeight: tab === t.id ? 600 : 400,
            borderLeft: tab === t.id ? `3px solid ${COLORS.emerald}` : "3px solid transparent",
          }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16, marginTop: 16, padding: "16px 8px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: COLORS.emerald, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
            {name[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p title={name} style={{ margin: 0, color: "#fff", fontSize: 13, fontWeight: 500, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</p>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Conta gratuita</p>
          </div>
        </div>
      </div>
    </aside>
  );
}