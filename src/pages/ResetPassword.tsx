import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useIsDesktop } from "../lib/useIsDesktop";
import AnchorMark from "../components/AnchorMark";

const COLORS = {
  navy: "var(--navy)",
  emerald: "var(--emerald)",
  emeraldDark: "var(--emerald-dark)",
  destructive: "var(--destructive)",
  muted: "var(--muted)",
  hint: "var(--hint)",
  border: "var(--border)",
  bg: "var(--bg)",
  surface: "var(--surface)",
  text: "var(--text)",
};

export default function ResetPassword({ onDone }: { onDone: () => void }) {
  const isDesktop = useIsDesktop();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSave = async () => {
    if (password.length < 6) { setError("A senha deve ter ao menos 6 caracteres."); return; }
    if (password !== confirm) { setError("As senhas não conferem."); return; }
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) { setError("Não foi possível alterar a senha. Tente novamente."); setLoading(false); return; }
    setDone(true);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: isDesktop ? "center" : "flex-start", padding: isDesktop ? 24 : 0, boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: 430, display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: isDesktop ? 24 : 0, boxShadow: isDesktop ? "0 10px 40px rgba(10,37,64,0.12)" : "none" }}>
        <div style={{ background: COLORS.navy, padding: "48px 24px 32px", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center" }}><AnchorMark size={52} color="#FFFFFF" /></div>
          <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 700, margin: "8px 0 4px" }}>Definir nova senha</h1>
          <p style={{ color: "rgba(255,255,255,0.6)", margin: 0, fontSize: 14 }}>Escolha uma senha para sua conta</p>
        </div>

        <div style={{ padding: 24, flex: 1 }}>
          <div style={{ background: COLORS.surface, borderRadius: 16, padding: 24, border: `0.5px solid ${COLORS.border}` }}>
            {done ? (
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 40, margin: "0 0 8px" }}>✅</p>
                <p style={{ fontWeight: 600, fontSize: 16, margin: "0 0 4px", color: COLORS.text }}>Senha alterada!</p>
                <p style={{ fontSize: 13, color: COLORS.muted, margin: "0 0 20px" }}>Já pode usar sua nova senha.</p>
                <button onClick={onDone} style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", background: COLORS.navy, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Entrar no app</button>
              </div>
            ) : (
              <>
                <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Nova senha</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", marginBottom: 14, outline: "none" }} />

                <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Confirmar nova senha</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", marginBottom: 18, outline: "none" }} />

                {error && <p style={{ color: COLORS.destructive, fontSize: 13, marginBottom: 12 }}>⚠️ {error}</p>}

                <button onClick={handleSave} disabled={loading} style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", background: loading ? COLORS.muted : COLORS.navy, color: "#fff", fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>{loading ? "Salvando..." : "Salvar nova senha"}</button>
                <button onClick={onDone} style={{ marginTop: 16, background: "none", border: "none", cursor: "pointer", color: COLORS.muted, fontSize: 13, width: "100%" }}>Voltar ao app</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
