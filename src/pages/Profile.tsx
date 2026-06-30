import { useState } from "react";
import { supabase } from "../lib/supabase";
import AnchorMark from "../components/AnchorMark";
import Categories from "./Categories";
import { getInitialTheme, applyTheme } from "../lib/theme";
import { useIsDesktop } from "../lib/useIsDesktop";

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
  const isDesktop = useIsDesktop();
  const [exporting, setExporting] = useState(false);
  const [showCats, setShowCats] = useState(false);
  const [dark, setDark] = useState(getInitialTheme() === "dark");
  const [showPw, setShowPw] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwDone, setPwDone] = useState(false);

  const toggleTheme = () => {
    const m = dark ? "light" : "dark";
    applyTheme(m);
    setDark(!dark);
  };

  const closePw = () => { setShowPw(false); setNewPw(""); setConfirmPw(""); setPwError(""); setPwDone(false); };

  const handleChangePassword = async () => {
    if (newPw.length < 6) { setPwError("A senha deve ter ao menos 6 caracteres."); return; }
    if (newPw !== confirmPw) { setPwError("As senhas não conferem."); return; }
    setPwSaving(true);
    setPwError("");
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) { setPwError("Não foi possível alterar a senha."); setPwSaving(false); return; }
    setPwDone(true);
    setPwSaving(false);
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

      <div onClick={() => setShowPw(true)} style={{ background: COLORS.surface, borderRadius: 14, padding: 16, border: `0.5px solid ${COLORS.border}`, marginBottom: 10, cursor: "pointer" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 22 }}>🔑</span>
            <div>
              <p style={{ margin: 0, fontWeight: 500, fontSize: 15 }}>Alterar senha</p>
              <p style={{ margin: 0, fontSize: 12, color: COLORS.hint }}>Defina uma nova senha de acesso</p>
            </div>
          </div>
          <span style={{ color: COLORS.hint }}>›</span>
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

      {showPw && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: isDesktop ? "center" : "flex-end", justifyContent: "center", zIndex: 200, padding: isDesktop ? 24 : 0, boxSizing: "border-box" }}>
          <div style={{ background: COLORS.surface, borderRadius: isDesktop ? 20 : "20px 20px 0 0", padding: 24, width: "100%", maxWidth: 440 }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: COLORS.text }}>Alterar senha</h3>
            {pwDone ? (
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 40, margin: "0 0 8px" }}>✅</p>
                <p style={{ fontSize: 14, color: COLORS.muted, margin: "0 0 20px" }}>Senha alterada com sucesso.</p>
                <button onClick={closePw} style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", background: COLORS.navy, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 15 }}>Fechar</button>
              </div>
            ) : (
              <>
                <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Nova senha</label>
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="••••••••" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", marginBottom: 14, outline: "none" }} />
                <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Confirmar nova senha</label>
                <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", marginBottom: 18, outline: "none" }} />
                {pwError && <p style={{ color: COLORS.destructive, fontSize: 13, marginBottom: 12 }}>⚠️ {pwError}</p>}
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={closePw} style={{ flex: 1, padding: 14, borderRadius: 10, border: `0.5px solid ${COLORS.border}`, background: COLORS.surface, fontWeight: 600, cursor: "pointer", fontSize: 15, color: COLORS.text }}>Cancelar</button>
                  <button onClick={handleChangePassword} disabled={pwSaving} style={{ flex: 1, padding: 14, borderRadius: 10, border: "none", background: COLORS.navy, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 15 }}>{pwSaving ? "Salvando..." : "Salvar"}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}