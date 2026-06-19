import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Transactions from "./pages/Transactions";

const COLORS = {
  navy: "#0A2540",
  emerald: "#10B981",
  muted: "#64748B",
  border: "#E2E8F0",
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
    <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: `1px solid ${COLORS.border}`, display: "flex", height: 64, zIndex: 100, maxWidth: 430, margin: "0 auto" }}>
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
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", background: "#F8FAFC" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48 }}>⚓</div>
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
      case "goals": return (
        <div style={{ padding: 20 }}>
          <h2 style={{ color: COLORS.navy, fontSize: 20, fontWeight: 700 }}>Metas</h2>
          <p style={{ color: COLORS.muted }}>Em breve... 🚧</p>
        </div>
      );
      case "profile": return (
        <div style={{ padding: 20 }}>
          <h2 style={{ color: COLORS.navy, fontSize: 20, fontWeight: 700 }}>Perfil</h2>
          <p style={{ color: COLORS.muted }}>{session.user.email}</p>
          <button onClick={() => supabase.auth.signOut()} style={{ marginTop: 16, padding: "10px 20px", borderRadius: 10, border: "none", background: "#E11D48", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
            Sair
          </button>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", fontFamily: "Inter, sans-serif", background: "#F8FAFC", paddingBottom: 64 }}>
      {renderTab()}
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}