import { useState } from "react";
import { supabase } from "../lib/supabase";

const COLORS = {
  navy: "#0A2540",
  emerald: "#10B981",
  emeraldDark: "#059669",
  destructive: "#E11D48",
  muted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
};

export default function Auth() {
  const [mode, setMode] = useState<"login" | "cadastro" | "recuperar">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError("E-mail ou senha incorretos.");
    } else if (mode === "cadastro") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) setError("Erro ao criar conta. Tente outro e-mail.");
      else setMessage("Conta criada! Verifique seu e-mail para confirmar.");
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) setError("Erro ao enviar e-mail.");
      else setMessage("E-mail de recuperação enviado!");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: COLORS.bg, fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: COLORS.navy, padding: "48px 24px 32px", textAlign: "center" }}>
        <div style={{ fontSize: 48 }}>⚓</div>
        <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 700, margin: "8px 0 4px" }}>Lastro</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", margin: 0, fontSize: 14 }}>Sua vida financeira em paz</p>
      </div>

      {/* Form */}
      <div style={{ padding: 24, flex: 1 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: `0.5px solid ${COLORS.border}` }}>
          <h2 style={{ margin: "0 0 20px", fontSize: 20, fontWeight: 700, color: COLORS.navy }}>
            {mode === "login" ? "Entrar" : mode === "cadastro" ? "Criar conta" : "Recuperar senha"}
          </h2>

          {mode === "cadastro" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Nome completo</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Glenio José"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", outline: "none" }}
              />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>E-mail</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", outline: "none" }}
            />
          </div>

          {mode !== "recuperar" && (
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Senha</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", outline: "none" }}
              />
            </div>
          )}

          {error && <p style={{ color: COLORS.destructive, fontSize: 13, marginBottom: 12 }}>⚠️ {error}</p>}
          {message && <p style={{ color: COLORS.emerald, fontSize: 13, marginBottom: 12 }}>✅ {message}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: "100%", padding: "14px", borderRadius: 10, border: "none", background: loading ? COLORS.muted : COLORS.navy, color: "#fff", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : mode === "cadastro" ? "Criar conta" : "Enviar e-mail"}
          </button>

          {/* Links */}
          <div style={{ marginTop: 20, textAlign: "center", display: "flex", flexDirection: "column", gap: 10 }}>
            {mode === "login" && (
              <>
                <button onClick={() => setMode("cadastro")} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.emerald, fontSize: 14, fontWeight: 500 }}>
                  Não tem conta? Cadastre-se
                </button>
                <button onClick={() => setMode("recuperar")} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.muted, fontSize: 13 }}>
                  Esqueci minha senha
                </button>
              </>
            )}
            {mode !== "login" && (
              <button onClick={() => setMode("login")} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.emerald, fontSize: 14, fontWeight: 500 }}>
                ← Voltar para o login
              </button>
            )}
          </div>
        </div>

        {/* LGPD badge */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <span style={{ background: "#D1FAE5", color: COLORS.emeraldDark, fontSize: 11, fontWeight: 600, padding: "4px 14px", borderRadius: 99 }}>
            🔒 Seus dados protegidos pela LGPD
          </span>
        </div>
      </div>
    </div>
  );
}