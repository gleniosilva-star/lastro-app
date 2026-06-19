import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Auth from "./pages/Auth";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, sans-serif", background: "#F8FAFC" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48 }}>⚓</div>
          <p style={{ color: "#64748B", marginTop: 12 }}>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", fontFamily: "Inter, sans-serif", background: "#F8FAFC" }}>
      <div style={{ background: "#0A2540", padding: "32px 20px 24px" }}>
        <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 700, margin: 0 }}>⚓ Lastro</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", margin: "4px 0 0", fontSize: 14 }}>
          Olá, {session.user.email} 👋
        </p>
      </div>
      <div style={{ padding: 20 }}>
        <p style={{ color: "#64748B", fontSize: 15 }}>Dashboard em construção... 🚧</p>
        <button
          onClick={() => supabase.auth.signOut()}
          style={{ marginTop: 16, padding: "10px 20px", borderRadius: 10, border: "none", background: "#E11D48", color: "#fff", fontWeight: 600, cursor: "pointer" }}
        >
          Sair
        </button>
      </div>
    </div>
  );
}