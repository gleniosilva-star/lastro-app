import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";
import Goals from "./pages/Goals";
import Profile from "./pages/Profile";
import Sidebar from "./components/Sidebar";
import AnchorMark from "./components/AnchorMark";

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

function BottomNav({ tab, setTab }: { tab: string; setTab: (t: string) => void }) {
  const tabs = [
    { id: "dashboard", label: "Início", icon: "🏠" },
    { id: "transactions", label: "Transações", icon: "↔️" },
    { id: "accounts", label: "Contas", icon: "🏦" },
    { id: "goals", label: "Metas", icon: "🎯" },
    { id: "profile", label: "Perfil", icon: "👤" },
  ];
  return (
    <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: COLORS.surface, borderTop: `1px solid ${COLORS.border}`, display: "flex", height: 64, zIndex: 100, maxWidth: 430, margin: "0 auto" }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, border: "none", background: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, color: tab === t.id ? COLORS.emerald : COLORS.muted, fontWeight: tab === t.id ? 600 : 400 }}>
          <span style={{ fontSize: 20 }}>{t.icon}</span>
          <span style={{ fontSize: 10 }}>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", background: COLORS.bg }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center" }}><AnchorMark size={48} color={COLORS.navy} /></div>
        <p style={{ color: COLORS.muted, marginTop: 12 }}>Carregando...</p>
      </div>
    </div>
  );

  if (!session) return <Auth />;

  const renderTab = () => {
    switch (tab) {
      case "dashboard": return <Dashboard user={session.user} />;
      case "transactions": return <Transactions user={session.user} />;
      case "accounts": return <Accounts user={session.user} />;
      case "goals": return <Goals user={session.user} />;
      case "profile": return <Profile user={session.user} />;
      default: return null;
    }
  };

// DESKTOP: menu lateral + conteúdo
  if (isDesktop) {
    return (
      <div style={{ fontFamily: "Inter, sans-serif", background: COLORS.bg, minHeight: "100vh" }}>
        <Sidebar tab={tab} setTab={setTab} user={session.user} />
        <main style={{ marginLeft: 240, minHeight: "100vh", display: "flex", justifyContent: "center" }}>
          <div style={{ width: "100%", maxWidth: 960, padding: "32px 24px", boxSizing: "border-box" }}>
            {renderTab()}
          </div>
        </main>
      </div>
    );
  }

  // MOBILE: barra inferior
  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", fontFamily: "Inter, sans-serif", background: COLORS.bg, paddingBottom: 64 }}>
      {renderTab()}
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}