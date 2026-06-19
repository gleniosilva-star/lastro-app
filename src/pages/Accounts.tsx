import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const COLORS = {
  navy: "#0A2540",
  emerald: "#10B981",
  emeraldDark: "#059669",
  destructive: "#E11D48",
  muted: "#64748B",
  hint: "#94A3B8",
  border: "#E2E8F0",
  chip: "#F1F5F9",
  bg: "#F8FAFC",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const TIPOS = ["corrente", "poupança", "cartão de crédito", "investimento", "outros"];

export default function Accounts({ user }: { user: any }) {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", bank: "", type: "corrente", initial_balance: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const { data } = await supabase.from("accounts").select("*").eq("is_archived", false).order("created_at");
    setAccounts(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name) { setError("Nome é obrigatório"); return; }
    setSaving(true);
    setError("");
    const balance = parseFloat(form.initial_balance.replace(",", ".")) || 0;
    const { error } = await supabase.from("accounts").insert({
      user_id: user.id,
      name: form.name,
      bank: form.bank,
      type: form.type,
      initial_balance: balance,
      current_balance: balance,
    });
    if (error) setError("Erro ao salvar conta.");
    else {
      setShowModal(false);
      setForm({ name: "", bank: "", type: "corrente", initial_balance: "" });
      load();
    }
    setSaving(false);
  };

  const handleArchive = async (id: string) => {
    await supabase.from("accounts").update({ is_archived: true }).eq("id", id);
    load();
  };

  const totalBalance = accounts.reduce((s, a) => s + Number(a.current_balance), 0);

  return (
    <div style={{ padding: "16px", paddingBottom: 80 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: COLORS.navy }}>Contas</h2>
        <button onClick={() => setShowModal(true)} style={{ background: COLORS.emerald, border: "none", borderRadius: 10, padding: "8px 16px", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
          + Nova
        </button>
      </div>

      {/* Total */}
      <div style={{ background: COLORS.navy, borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: "0 0 4px" }}>Total em contas</p>
        <p style={{ color: "#fff", fontSize: 24, fontWeight: 700, margin: 0, fontVariantNumeric: "tabular-nums" }}>{fmt(totalBalance)}</p>
      </div>

      {loading ? (
        <p style={{ color: COLORS.muted, textAlign: "center" }}>Carregando...</p>
      ) : accounts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ fontSize: 40 }}>🏦</p>
          <p style={{ color: COLORS.muted, fontSize: 15 }}>Nenhuma conta ainda</p>
          <p style={{ color: COLORS.hint, fontSize: 13 }}>Adicione sua primeira conta</p>
        </div>
      ) : accounts.map(a => (
        <div key={a.id} style={{ background: "#fff", borderRadius: 14, padding: 16, border: `0.5px solid ${COLORS.border}`, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>{a.name}</p>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: COLORS.muted }}>{a.bank || "—"} · {a.type}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: Number(a.current_balance) < 0 ? COLORS.destructive : COLORS.navy, fontVariantNumeric: "tabular-nums" }}>
                {fmt(Number(a.current_balance))}
              </p>
              <button onClick={() => handleArchive(a.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.hint, fontSize: 12, marginTop: 4 }}>
                Arquivar
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: 24, width: "100%", maxWidth: 430 }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: COLORS.navy }}>Nova conta</h3>

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Nome da conta *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Conta Nubank" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", marginBottom: 14, outline: "none" }} />

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Banco</label>
            <input value={form.bank} onChange={e => setForm({ ...form, bank: e.target.value })} placeholder="Ex: Nubank, Itaú, Caixa..." style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", marginBottom: 14, outline: "none" }} />

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Tipo</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", marginBottom: 14, outline: "none", background: "#fff" }}>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Saldo inicial (R$)</label>
            <input value={form.initial_balance} onChange={e => setForm({ ...form, initial_balance: e.target.value })} placeholder="0,00" type="number" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", marginBottom: 14, outline: "none" }} />

            {error && <p style={{ color: COLORS.destructive, fontSize: 13, marginBottom: 12 }}>⚠️ {error}</p>}

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => { setShowModal(false); setError(""); }} style={{ flex: 1, padding: 14, borderRadius: 10, border: `0.5px solid ${COLORS.border}`, background: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 15 }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: 14, borderRadius: 10, border: "none", background: COLORS.navy, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 15 }}>
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}