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

const PALETTE = ["#10B981", "#E11D48", "#F59E0B", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6", "#64748B"];

export default function Categories({ user, onBack }: { user: any; onBack: () => void }) {
  const isDesktop = useIsDesktop();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({ name: "", type: "despesa", icon: "🏷️", color: PALETTE[0] });

  const load = async () => {
    const { data } = await supabase.from("categories").select("*").order("type").order("name");
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ name: "", type: "despesa", icon: "🏷️", color: PALETTE[0] });
    setEditingId(null);
    setConfirmDelete(false);
    setError("");
    setShowModal(true);
  };

  const openEdit = (c: any) => {
    setForm({ name: c.name ?? "", type: c.type, icon: c.icon || "🏷️", color: c.color || PALETTE[0] });
    setEditingId(c.id);
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
    setSaving(true);
    setError("");
    const payload = { name: form.name.trim(), type: form.type, icon: form.icon.trim() || "🏷️", color: form.color };
    const resp = editingId
      ? await supabase.from("categories").update(payload).eq("id", editingId)
      : await supabase.from("categories").insert({ user_id: user.id, ...payload });
    if (resp.error) setError("Erro ao salvar categoria.");
    else { closeModal(); load(); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!editingId) return;
    setSaving(true);
    setError("");
    const { error } = await supabase.from("categories").delete().eq("id", editingId);
    if (error) {
      if ((error as any).code === "23503") setError("Esta categoria está em uso em transações. Remova ou troque a categoria delas antes de excluir.");
      else setError("Erro ao excluir.");
      setSaving(false);
      return;
    }
    closeModal();
    load();
    setSaving(false);
  };

  const own = categories.filter(c => c.user_id);
  const globals = categories.filter(c => !c.user_id);

  const Row = ({ c, editable }: { c: any; editable: boolean }) => (
    <div onClick={editable ? () => openEdit(c) : undefined} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: COLORS.surface, borderRadius: 12, border: `0.5px solid ${COLORS.border}`, marginBottom: 8, cursor: editable ? "pointer" : "default" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: COLORS.chip, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{c.icon || "🏷️"}</div>
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{c.name}</p>
          <p style={{ margin: 0, fontSize: 12, color: COLORS.muted }}>{c.type === "receita" ? "Entrada" : "Saída"}</p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 14, height: 14, borderRadius: 4, background: c.color || COLORS.hint, display: "inline-block" }} />
        {editable ? <span style={{ color: COLORS.hint, fontSize: 18 }}>›</span> : <span style={{ fontSize: 11, color: COLORS.hint }}>padrão</span>}
      </div>
    </div>
  );

  return (
    <div style={{ padding: "16px", paddingBottom: 80 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: COLORS.text, padding: 0 }}>←</button>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: COLORS.text }}>Categorias</h2>
        </div>
        <button onClick={openCreate} style={{ background: COLORS.emerald, border: "none", borderRadius: 10, padding: "8px 16px", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>+ Nova</button>
      </div>

      {loading ? (
        <p style={{ color: COLORS.muted, textAlign: "center" }}>Carregando...</p>
      ) : (
        <>
          <p style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600, margin: "0 0 8px" }}>MINHAS CATEGORIAS</p>
          {own.length === 0 ? (
            <p style={{ color: COLORS.hint, fontSize: 13, marginBottom: 16 }}>Você ainda não criou categorias. Toque em + Nova.</p>
          ) : own.map(c => <Row key={c.id} c={c} editable />)}

          <p style={{ fontSize: 12, color: COLORS.muted, fontWeight: 600, margin: "20px 0 8px" }}>PADRÃO</p>
          {globals.map(c => <Row key={c.id} c={c} editable={false} />)}
        </>
      )}

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: isDesktop ? "center" : "flex-end", justifyContent: "center", zIndex: 200, padding: isDesktop ? 24 : 0, boxSizing: "border-box" }}>
          <div style={{ background: COLORS.surface, borderRadius: isDesktop ? 20 : "20px 20px 0 0", padding: 24, width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: COLORS.text }}>{editingId ? "Editar categoria" : "Nova categoria"}</h3>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button onClick={() => setForm({ ...form, type: "despesa" })} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, background: form.type === "despesa" ? COLORS.destructive : COLORS.chip, color: form.type === "despesa" ? "#fff" : COLORS.muted }}>Saída</button>
              <button onClick={() => setForm({ ...form, type: "receita" })} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 600, background: form.type === "receita" ? COLORS.emerald : COLORS.chip, color: form.type === "receita" ? "#fff" : COLORS.muted }}>Entrada</button>
            </div>

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Nome *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Mercado" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", marginBottom: 14, outline: "none" }} />

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Ícone (emoji)</label>
            <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} maxLength={2} placeholder="🏷️" style={{ width: 70, padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 20, boxSizing: "border-box", marginBottom: 14, outline: "none", textAlign: "center" }} />

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 8 }}>Cor</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
              {PALETTE.map(c => (
                <button key={c} onClick={() => setForm({ ...form, color: c })} style={{ width: 30, height: 30, borderRadius: 8, background: c, cursor: "pointer", border: form.color === c ? `3px solid ${COLORS.navy}` : "3px solid transparent" }} />
              ))}
            </div>

            {error && <p style={{ color: COLORS.destructive, fontSize: 13, marginBottom: 12 }}>⚠️ {error}</p>}

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={closeModal} style={{ flex: 1, padding: 14, borderRadius: 10, border: `0.5px solid ${COLORS.border}`, background: COLORS.surface, fontWeight: 600, cursor: "pointer", fontSize: 15 }}>Cancelar</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: 14, borderRadius: 10, border: "none", background: COLORS.navy, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 15 }}>{saving ? "Salvando..." : "Salvar"}</button>
            </div>

            {editingId && (confirmDelete ? (
              <div style={{ marginTop: 12, padding: 12, background: "#FEF2F2", borderRadius: 10 }}>
                <p style={{ margin: "0 0 10px", fontSize: 13, color: COLORS.destructive }}>Excluir esta categoria?</p>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: 12, borderRadius: 10, border: `0.5px solid ${COLORS.border}`, background: COLORS.surface, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Não</button>
                  <button onClick={handleDelete} disabled={saving} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: COLORS.destructive, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>{saving ? "Excluindo..." : "Sim, excluir"}</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} style={{ marginTop: 12, width: "100%", padding: 12, borderRadius: 10, border: `0.5px solid ${COLORS.destructive}`, background: COLORS.surface, color: COLORS.destructive, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Excluir categoria</button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
