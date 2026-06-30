import { useState } from "react";
import { supabase } from "../lib/supabase";
import AnchorMark from "../components/AnchorMark";
import Categories from "./Categories";
import { getInitialTheme, applyTheme } from "../lib/theme";

const COLORS = {
  navy: "var(--navy)",
  emerald: "var(--emerald)",
  emeraldDark: "var(--emerald-dark)",
  warning: "var(--warning)",
  destructive: "var(--destructive)",
  muted: "var(--muted)",
  hint: "var(--hint)",
  border: "var(--border)",
  chip: "var(--chip)",
  bg: "var(--bg)",
  surface: "var(--surface)",
  text: "var(--text)",
};

export default function Profile({ user }: { user: any }) {
  const [exporting, setExporting] = useState(false);
  const [showCats, setShowCats] = useState(false);
  const [dark, setDark] = useState(getInitialTheme() === "dark");

  const toggleTheme = () => {
    const m = dark ? "light" : "dark";
    applyTheme(m);
    setDark(!dark);
  };

  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário";

  const handleExport = async () => {
    setExporting(true);
    const [{ data: accounts }, { data: transactions }, { data: goals }] = await Promise.all([
      supabase.from("accounts").select("*"),
      supabase.from("transactions").select("*"),
      supabase.from("goals").select("*"),
    ]);
    const data = { exported_at: new Date().toISOString(), user: { email: user.email, name }, accounts, transactions, goals };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lastro-dados-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  if (showCats) return <Categories user={user} onBack={() => setShowCats(false)} />;

  return (
    <div style={{ padding: "16px", paddingBottom: 80 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0", marginBottom: 16 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: COLORS.navy, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 700 }}>
          {name[0].toUpperCase()}
        </div>
        <h2 style={{ margin: "12px 0 4px", fontSize: 20, fontWeight: 700 }}>{name}</h2>
        <p style={{ margin: 0, color: COLORS.muted, fontSize: 14 }}>{user.email}</p>
        <span style={{ marginTop: 8, background: "#D1FAE5", color: COLORS.emeraldDark, fontSize: 11, fontWeight: 600, padding: "3px 12px", borderRadius: 99 }}>
          🔒 Dados protegidos pela LGPD
        </span>
      </div>

      <div onClick={handleExport} style={{ background: COLORS.surface, borderRadius: 14, padding: 16, border: `0.5px solid ${COLORS.border}`, marginBottom: 10, cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 22 }}>📤</span>
            <div>
              <p style={{ margin: 0, fontWeight: 500, fontSize: 15 }}>Exportar meus dados</p>
              <p style={{ margin: 0, fontSize: 12, color: COLORS.hint }}>{exporting ? "Exportando..." : "Baixar tudo em JSON"}</p>
            </div>
          </div>
          <span style={{ color: COLORS.hint }}>›</span>
        </div>
      </div>

      <div onClick={() => setShowCats(true)} style={{ background: COLORS.surface, borderRadius: 14, padding: 16, border: `0.5px solid ${COLORS.border}`, marginBottom: 10, cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 22 }}>🏷️</span>
            <div>
              <p style={{ margin: 0, fontWeight: 500, fontSize: 15 }}>Categorias</p>
              <p style={{ margin: 0, fontSize: 12, color: COLORS.hint }}>Crie e edite suas categorias</p>
            </div>
          </div>
          <span style={{ color: COLORS.hint }}>›</span>
        </div>
      </div>

      <div onClick={toggleTheme} style={{ background: COLORS.surface, borderRadius: 14, padding: 16, border: `0.5px solid ${COLORS.border}`, marginBottom: 10, cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 22 }}>{dark ? "🌙" : "☀️"}</span>
            <div>
              <p style={{ margin: 0, fontWeight: 500, fontSize: 15 }}>Modo escuro</p>
              <p style={{ margin: 0, fontSize: 12, color: COLORS.hint }}>{dark ? "Ativado" : "Desativado"}</p>
            </div>
          </div>
          <div style={{ width: 44, height: 26, borderRadius: 99, background: dark ? COLORS.emerald : COLORS.border, position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: dark ? 21 : 3, transition: "left 0.2s" }} />
          </div>
        </div>
      </div>

      {[
        { icon: "🔔", label: "Notificações", sub: "Em breve" },
        { icon: "🔐", label: "Privacidade", sub: "Em breve" },
      ].map(item => (
        <div key={item.label} style={{ background: COLORS.surface, borderRadius: 14, padding: 16, border: `0.5px solid ${COLORS.border}`, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: 15 }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: 12, color: COLORS.hint }}>{item.sub}</p>
              </div>
            </div>
            <span style={{ color: COLORS.hint }}>›</span>
          </div>
        </div>
      ))}

      <div onClick={() => supabase.auth.signOut()} style={{ background: COLORS.surface, borderRadius: 14, padding: 16, border: `0.5px solid ${COLORS.border}`, marginTop: 8, cursor: "pointer" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 22 }}>🚪</span>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: COLORS.destructive }}>Sair da conta</p>
        </div>
      </div>

      <p style={{ textAlign: "center", color: COLORS.hint, fontSize: 12, marginTop: 24 }}>Lastro <span style={{ display: "inline-flex", verticalAlign: "middle" }}><AnchorMark size={13} color={COLORS.hint} /></span> · Sua vida financeira em paz</p>
    </div>
  );
}