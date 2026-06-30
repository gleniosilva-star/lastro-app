import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useIsDesktop } from "../lib/useIsDesktop";

const COLORS = {
  navy: "var(--navy)",
  emerald: "var(--emerald)",
  destructive: "var(--destructive)",
  muted: "var(--muted)",
  hint: "var(--hint)",
  border: "var(--border)",
  chip: "var(--chip)",
  surface: "var(--surface)",
  text: "var(--text)",
};

const today = () => new Date().toISOString().split("T")[0];

// Lançamento rápido global. Padrões inteligentes: despesa, conta pré-selecionada,
// data = hoje. Para uma despesa simples basta valor + descrição + Salvar.
export default function QuickAddTransaction({ user, onClose, onSaved }: { user: any; onClose: () => void; onSaved: () => void }) {
  const isDesktop = useIsDesktop();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ type: "despesa", amount: "", description: "", account_id: "", category_id: "", transaction_date: today() });

  useEffect(() => {
    (async () => {
      const [{ data: acc }, { data: cats }] = await Promise.all([
        supabase.from("accounts").select("id, name").eq("is_archived", false).order("created_at"),
        supabase.from("categories").select("*"),
      ]);
      setAccounts(acc || []);
      setCategories(cats || []);
      setForm(f => ({ ...f, account_id: acc && acc.length ? acc[0].id : "" }));
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    if (!form.description.trim()) { setError("Descrição é obrigatória"); return; }
    const amount = Math.abs(parseFloat(form.amount.replace(",", ".")));
    if (!form.amount || !Number.isFinite(amount) || amount <= 0) { setError("Informe um valor válido maior que zero."); return; }
    if (!form.account_id) { setError("Selecione uma conta"); return; }
    setSaving(true);
    setError("");
    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      account_id: form.account_id,
      category_id: form.category_id || null,
      amount,
      type: form.type,
      description: form.description.trim(),
      transaction_date: form.transaction_date,
    });
    if (error) { setError("Erro ao salvar."); setSaving(false); return; }
    onSaved();
    onClose();
  };

  const filteredCategories = categories.filter(c => c.type === form.type);
  const inputStyle = { width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box" as const, marginBottom: 14, outline: "none", background: COLORS.surface, color: COLORS.text };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: isDesktop ? "center" : "flex-end", justifyContent: "center", zIndex: 250, padding: isDesktop ? 24 : 0, boxSizing: "border-box" }}>
      <div style={{ background: COLORS.surface, borderRadius: isDesktop ? 20 : "20px 20px 0 0", padding: 24, width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto" }}>
        <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: COLORS.text }}>Lançamento rápido</h3>

        {loading ? (
          <p style={{ color: COLORS.muted, textAlign: "center", padding: "20px 0" }}>Carregando...</p>
        ) : accounts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "10px 0 4px" }}>
            <p style={{ fontSize: 36, margin: "0 0 8px" }}>🏦</p>
            <p style={{ color: COLORS.muted, fontSize: 14, margin: "0 0 18px" }}>Crie uma conta antes de lançar uma transação.</p>
            <button onClick={onClose} style={{ width: "100%", padding: 14, borderRadius: 10, border: "none", background: COLORS.navy, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 15 }}>Entendi</button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button onClick={() => setForm({ ...form, type: "despesa", category_id: "" })} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, background: form.type === "despesa" ? COLORS.destructive : COLORS.chip, color: form.type === "despesa" ? "#fff" : COLORS.muted }}>Saída</button>
              <button onClick={() => setForm({ ...form, type: "receita", category_id: "" })} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, background: form.type === "receita" ? COLORS.emerald : COLORS.chip, color: form.type === "receita" ? "#fff" : COLORS.muted }}>Entrada</button>
            </div>

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Valor (R$) *</label>
            <input value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0,00" type="number" autoFocus style={inputStyle} />

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Descrição *</label>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ex: Almoço" style={inputStyle} />

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Conta *</label>
            <select value={form.account_id} onChange={e => setForm({ ...form, account_id: e.target.value })} style={inputStyle}>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Categoria</label>
            <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} style={inputStyle}>
              <option value="">Sem categoria</option>
              {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Data</label>
            <input type="date" value={form.transaction_date} onChange={e => setForm({ ...form, transaction_date: e.target.value })} style={inputStyle} />

            {error && <p style={{ color: COLORS.destructive, fontSize: 13, marginBottom: 12 }}>⚠️ {error}</p>}

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={onClose} style={{ flex: 1, padding: 14, borderRadius: 10, border: `0.5px solid ${COLORS.border}`, background: COLORS.surface, fontWeight: 600, cursor: "pointer", fontSize: 15, color: COLORS.text }}>Cancelar</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: 14, borderRadius: 10, border: "none", background: COLORS.navy, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 15 }}>{saving ? "Salvando..." : "Salvar"}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
