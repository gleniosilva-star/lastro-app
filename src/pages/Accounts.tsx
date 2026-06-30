import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useIsDesktop } from "../lib/useIsDesktop";

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
  const isDesktop = useIsDesktop();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", bank: "", type: "corrente", initial_balance: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("accounts").select("*").eq("is_archived", false).order("created_at");
    setAccounts(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ name: "", bank: "", type: "corrente", initial_balance: "" });
    setEditingId(null);
    setConfirmDelete(false);
    setError("");
    setShowModal(true);
  };

  const openEdit = (a: any) => {
    setForm({ name: a.name ?? "", bank: a.bank ?? "", type: a.type ?? "corrente", initial_balance: String(a.initial_balance ?? "") });
    setEditingId(a.id);
    setConfirmDelete(false);
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setError("");
    setEditingId(null);
    setConfirmDelete(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Nome é obrigatório"); return; }
    const balance = form.initial_balance.trim() === "" ? 0 : parseFloat(form.initial_balance.replace(",", "."));
    if (!Number.isFinite(balance)) { setError("Saldo inicial inválido."); return; }
    setSaving(true);
    setError("");
    const base = { name: form.name.trim(), bank: form.bank.trim(), type: form.type };
    let resp;
    if (editingId) {
      // Mudar o saldo inicial ajusta o saldo atual na mesma proporção,
      // preservando o que veio das transações.
      const old = accounts.find(a => a.id === editingId);
      const delta = balance - Number(old?.initial_balance ?? 0);
      const newCurrent = Number(old?.current_balance ?? 0) + delta;
      resp = await supabase.from("accounts").update({ ...base, initial_balance: balance, current_balance: newCurrent }).eq("id", editingId);
    } else {
      resp = await supabase.from("accounts").insert({ user_id: user.id, ...base, initial_balance: balance, current_balance: balance });
    }
    if (resp.error) setError("Erro ao salvar conta.");
    else { closeModal(); load(); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!editingId) return;
    setSaving(true);
    setError("");
    const { error } = await supabase.from("accounts").delete().eq("id", editingId);
    if (error) {
      // 23503 = chave estrangeira: a conta tem transações vinculadas.
      if ((error as any).code === "23503") setError("Esta conta tem transações vinculadas. Use 'Arquivar' em vez de excluir.");
      else setError("Erro ao excluir.");
      setSaving(false);
      return;
    }
    closeModal();
    load();
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
        <button onClick={openCreate} style={{ background: COLORS.emerald, border: "none", borderRadius: 10, padding: "8px 16px", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
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
              <div style={{ display: "flex", gap: 14, justifyContent: "flex-end", marginTop: 6 }}>
                <button onClick={() => openEdit(a)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.muted, fontSize: 12, fontWeight: 500 }}>
                  Editar
                </button>
                <button onClick={() => handleArchive(a.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.hint, fontSize: 12 }}>
                  Arquivar
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: isDesktop ? "center" : "flex-end", justifyContent: "center", zIndex: 200, padding: isDesktop ? 24 : 0, boxSizing: "border-box" }}>
          <div style={{ background: "#fff", borderRadius: isDesktop ? 20 : "20px 20px 0 0", padding: 24, width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: COLORS.navy }}>{editingId ? "Editar conta" : "Nova conta"}</h3>

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Nome da conta *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Conta Nubank" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", marginBottom: 14, outline: "none" }} />

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Banco</label>
            <input value={form.bank} onChange={e => setForm({ ...form, bank: e.target.value })} placeholder="Ex: Nubank, Itaú, Caixa..." style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", marginBottom: 14, outline: "none" }} />

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Tipo</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", marginBottom: 14, outline: "none", background: "#fff" }}>
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Saldo inicial (R$)</label>
            <input value={form.initial_balance} onChange={e => setForm({ ...form, initial_balance: e.target.value })} placeholder="0,00" type="number" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", marginBottom: editingId ? 6 : 14, outline: "none" }} />
            {editingId && <p style={{ margin: "0 0 14px", fontSize: 12, color: COLORS.hint }}>Alterar o saldo inicial ajusta o saldo atual na mesma proporção.</p>}

            {error && <p style={{ color: COLORS.destructive, fontSize: 13, marginBottom: 12 }}>⚠️ {error}</p>}

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={closeModal} style={{ flex: 1, padding: 14, borderRadius: 10, border: `0.5px solid ${COLORS.border}`, background: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 15 }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: 14, borderRadius: 10, border: "none", background: COLORS.navy, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 15 }}>
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>

            {editingId && (confirmDelete ? (
              <div style={{ marginTop: 12, padding: 12, background: "#FEF2F2", borderRadius: 10 }}>
                <p style={{ margin: "0 0 10px", fontSize: 13, color: COLORS.destructive }}>Excluir esta conta? Só é possível se ela não tiver transações.</p>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: 12, borderRadius: 10, border: `0.5px solid ${COLORS.border}`, background: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Não</button>
                  <button onClick={handleDelete} disabled={saving} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: COLORS.destructive, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>{saving ? "Excluindo..." : "Sim, excluir"}</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} style={{ marginTop: 12, width: "100%", padding: 12, borderRadius: 10, border: `0.5px solid ${COLORS.destructive}`, background: "#fff", color: COLORS.destructive, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Excluir conta</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}