import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
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

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function Transactions({ user }: { user: any }) {
  const isDesktop = useIsDesktop();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    type: "despesa",
    account_id: "",
    category_id: "",
    transaction_date: new Date().toISOString().split("T")[0],
    repeat: "",
  });

  const load = async () => {
    const [{ data: txs }, { data: acc }, { data: cats }] = await Promise.all([
      supabase.from("transactions").select("*, categories(name, icon, color), accounts(name)").order("transaction_date", { ascending: false }),
      supabase.from("accounts").select("*").eq("is_archived", false),
      supabase.from("categories").select("*"),
    ]);
    setTransactions(txs || []);
    setAccounts(acc || []);
    setCategories(cats || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const emptyForm = () => ({ description: "", amount: "", type: "despesa", account_id: "", category_id: "", transaction_date: new Date().toISOString().split("T")[0], repeat: "" });

  const openCreate = () => {
    setForm(emptyForm());
    setEditingId(null);
    setConfirmDelete(false);
    setError("");
    setShowModal(true);
  };

  const openEdit = (t: any) => {
    setForm({
      description: t.description ?? "",
      amount: String(t.amount ?? ""),
      type: t.type,
      account_id: t.account_id ?? "",
      category_id: t.category_id ?? "",
      transaction_date: t.transaction_date,
      repeat: t.is_recurring ? (t.recurring_frequency || "") : "",
    });
    setEditingId(t.id);
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
    if (!form.description.trim()) { setError("Descrição é obrigatória"); return; }
    const amount = Math.abs(parseFloat(form.amount.replace(",", ".")));
    if (!form.amount || !Number.isFinite(amount) || amount <= 0) { setError("Informe um valor válido maior que zero."); return; }
    if (!form.account_id) { setError("Selecione uma conta"); return; }
    if (!form.transaction_date) { setError("Selecione a data."); return; }
    setSaving(true);
    setError("");
    const payload = {
      account_id: form.account_id,
      category_id: form.category_id || null,
      amount,
      type: form.type,
      description: form.description.trim(),
      transaction_date: form.transaction_date,
      is_recurring: !!form.repeat,
      recurring_frequency: form.repeat || null,
    };
    const { error } = editingId
      ? await supabase.from("transactions").update(payload).eq("id", editingId)
      : await supabase.from("transactions").insert({ user_id: user.id, ...payload });
    if (error) setError("Erro ao salvar.");
    else { closeModal(); load(); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!editingId) return;
    setSaving(true);
    setError("");
    const { error } = await supabase.from("transactions").delete().eq("id", editingId);
    if (error) { setError("Erro ao excluir."); setSaving(false); return; }
    closeModal();
    load();
    setSaving(false);
  };

  const filtered = transactions.filter(t => {
    if (filter === "receita" && t.type !== "receita") return false;
    if (filter === "despesa" && t.type !== "despesa") return false;
    if (search && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filteredCategories = categories.filter(c => c.type === form.type);

  const fmtDate = (d: string) => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    if (d === today) return "Hoje";
    if (d === yesterday) return "Ontem";
    return new Date(d + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
  };

  const grouped: Record<string, any[]> = {};
  filtered.forEach(t => {
    const key = fmtDate(t.transaction_date);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(t);
  });

  return (
    <div style={{ padding: "16px", paddingBottom: 80 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: COLORS.text }}>Transações</h2>
        <button onClick={openCreate} style={{ background: COLORS.emerald, border: "none", borderRadius: 10, padding: "8px 16px", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>+ Nova</button>
      </div>

      <input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 14, marginBottom: 12, boxSizing: "border-box", outline: "none" }} />

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["all", "Tudo"], ["receita", "Entradas"], ["despesa", "Saídas"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{ padding: "6px 14px", borderRadius: 99, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, background: filter === v ? COLORS.navy : COLORS.chip, color: filter === v ? "#fff" : COLORS.muted }}>{l}</button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: COLORS.muted, textAlign: "center" }}>Carregando...</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ fontSize: 40 }}>💸</p>
          <p style={{ color: COLORS.muted, fontSize: 15 }}>Nenhuma transação ainda</p>
          <p style={{ color: COLORS.hint, fontSize: 13 }}>Toque em + Nova para começar</p>
        </div>
      ) : (
        Object.entries(grouped).map(([day, txs]) => (
          <div key={day}>
            <p style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600, marginBottom: 8 }}>{day}</p>
            <div style={{ background: COLORS.surface, borderRadius: 14, padding: 16, border: `0.5px solid ${COLORS.border}`, marginBottom: 12 }}>
              {txs.map((t, i) => (
                <div key={t.id} onClick={() => openEdit(t)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < txs.length - 1 ? `0.5px solid ${COLORS.border}` : "none", cursor: "pointer" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: COLORS.chip, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                      {t.categories?.icon || "📌"}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{t.description}{t.is_recurring ? " 🔁" : ""}</p>
                      <p style={{ margin: 0, fontSize: 12, color: COLORS.muted }}>{t.accounts?.name || "—"} · {t.categories?.name || "Sem categoria"}</p>
                    </div>
                  </div>
                  <span style={{ color: t.type === "receita" ? COLORS.emerald : COLORS.destructive, fontWeight: 700, fontSize: 15, fontVariantNumeric: "tabular-nums" }}>
                    {t.type === "receita" ? "+" : "-"}{fmt(Math.abs(Number(t.amount)))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: isDesktop ? "center" : "flex-end", justifyContent: "center", zIndex: 200, padding: isDesktop ? 24 : 0, boxSizing: "border-box" }}>
          <div style={{ background: COLORS.surface, borderRadius: isDesktop ? 20 : "20px 20px 0 0", padding: 24, width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: COLORS.text }}>{editingId ? "Editar transação" : "Nova transação"}</h3>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button onClick={() => setForm({ ...form, type: "despesa", category_id: "" })} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, background: form.type === "despesa" ? COLORS.destructive : COLORS.chip, color: form.type === "despesa" ? "#fff" : COLORS.muted }}>Saída</button>
              <button onClick={() => setForm({ ...form, type: "receita", category_id: "" })} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, background: form.type === "receita" ? COLORS.emerald : COLORS.chip, color: form.type === "receita" ? "#fff" : COLORS.muted }}>Entrada</button>
            </div>

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Descrição *</label>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Ex: Supermercado" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", marginBottom: 14, outline: "none" }} />

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Valor (R$) *</label>
            <input value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0,00" type="number" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", marginBottom: 14, outline: "none" }} />

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Conta *</label>
            <select value={form.account_id} onChange={e => setForm({ ...form, account_id: e.target.value })} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", marginBottom: 14, outline: "none", background: COLORS.surface }}>
              <option value="">Selecione...</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Categoria</label>
            <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", marginBottom: 14, outline: "none", background: COLORS.surface }}>
              <option value="">Sem categoria</option>
              {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Data</label>
            <input type="date" value={form.transaction_date} onChange={e => setForm({ ...form, transaction_date: e.target.value })} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", marginBottom: 14, outline: "none" }} />

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Repetir</label>
            <select value={form.repeat} onChange={e => setForm({ ...form, repeat: e.target.value })} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", marginBottom: form.repeat ? 6 : 14, outline: "none", background: COLORS.surface }}>
              <option value="">Não repetir</option>
              <option value="diário">Diariamente</option>
              <option value="semanal">Semanalmente</option>
              <option value="mensal">Mensalmente</option>
              <option value="anual">Anualmente</option>
            </select>
            {form.repeat && <p style={{ margin: "0 0 14px", fontSize: 12, color: COLORS.hint }}>Os próximos lançamentos serão criados automaticamente.</p>}

            {error && <p style={{ color: COLORS.destructive, fontSize: 13, marginBottom: 12 }}>⚠️ {error}</p>}

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={closeModal} style={{ flex: 1, padding: 14, borderRadius: 10, border: `0.5px solid ${COLORS.border}`, background: COLORS.surface, fontWeight: 600, cursor: "pointer", fontSize: 15 }}>Cancelar</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: 14, borderRadius: 10, border: "none", background: COLORS.navy, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 15 }}>{saving ? "Salvando..." : "Salvar"}</button>
            </div>

            {editingId && (confirmDelete ? (
              <div style={{ marginTop: 12, padding: 12, background: "#FEF2F2", borderRadius: 10 }}>
                <p style={{ margin: "0 0 10px", fontSize: 13, color: COLORS.destructive }}>Excluir esta transação? O saldo da conta será ajustado automaticamente.</p>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: 12, borderRadius: 10, border: `0.5px solid ${COLORS.border}`, background: COLORS.surface, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Não</button>
                  <button onClick={handleDelete} disabled={saving} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: COLORS.destructive, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>{saving ? "Excluindo..." : "Sim, excluir"}</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} style={{ marginTop: 12, width: "100%", padding: 12, borderRadius: 10, border: `0.5px solid ${COLORS.destructive}`, background: COLORS.surface, color: COLORS.destructive, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Excluir transação</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}