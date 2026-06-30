import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useIsDesktop } from "../lib/useIsDesktop";

const COLORS = {
  navy: "#0A2540",
  emerald: "#10B981",
  emeraldDark: "#059669",
  warning: "#F59E0B",
  destructive: "#E11D48",
  muted: "#64748B",
  hint: "#94A3B8",
  border: "#E2E8F0",
  chip: "#F1F5F9",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function Goals({ user }: { user: any }) {
  const isDesktop = useIsDesktop();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [aporteGoal, setAporteGoal] = useState<any | null>(null);
  const [aporteValue, setAporteValue] = useState("");
  const [form, setForm] = useState({ name: "", target_amount: "", current_amount: "", target_date: "" });

  const load = async () => {
    const { data } = await supabase.from("goals").select("*").order("created_at", { ascending: false });
    setGoals(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ name: "", target_amount: "", current_amount: "", target_date: "" });
    setEditingId(null);
    setConfirmDelete(false);
    setError("");
    setShowModal(true);
  };

  const openEdit = (g: any) => {
    setForm({
      name: g.name ?? "",
      target_amount: String(g.target_amount ?? ""),
      current_amount: String(g.current_amount ?? ""),
      target_date: g.target_date ?? "",
    });
    setEditingId(g.id);
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
    const target = parseFloat(form.target_amount.replace(",", "."));
    if (!form.target_amount || !Number.isFinite(target) || target <= 0) { setError("Informe um valor de meta válido maior que zero."); return; }
    const current = form.current_amount.trim() === "" ? 0 : parseFloat(form.current_amount.replace(",", "."));
    if (!Number.isFinite(current) || current < 0) { setError("Valor já guardado inválido."); return; }
    setSaving(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      target_amount: target,
      current_amount: current,
      target_date: form.target_date || null,
    };
    const { error } = editingId
      ? await supabase.from("goals").update(payload).eq("id", editingId)
      : await supabase.from("goals").insert({ user_id: user.id, ...payload });
    if (error) setError("Erro ao salvar meta.");
    else { closeModal(); load(); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!editingId) return;
    setSaving(true);
    setError("");
    const { error } = await supabase.from("goals").delete().eq("id", editingId);
    if (error) { setError("Erro ao excluir."); setSaving(false); return; }
    closeModal();
    load();
    setSaving(false);
  };

  const openAporte = (g: any) => { setAporteGoal(g); setAporteValue(""); setError(""); };
  const closeAporte = () => { setAporteGoal(null); setAporteValue(""); setError(""); };

  const handleAporte = async () => {
    const v = parseFloat(aporteValue.replace(",", "."));
    if (!aporteValue || !Number.isFinite(v) || v <= 0) { setError("Informe um valor válido maior que zero."); return; }
    setSaving(true);
    setError("");
    const novo = Number(aporteGoal.current_amount) + v;
    const { error } = await supabase.from("goals").update({ current_amount: novo }).eq("id", aporteGoal.id);
    if (error) { setError("Erro ao aportar."); setSaving(false); return; }
    closeAporte();
    load();
    setSaving(false);
  };

  const totalSaved = goals.reduce((s, g) => s + Number(g.current_amount), 0);
  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);

  return (
    <div style={{ padding: "16px", paddingBottom: 80 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: COLORS.navy }}>Metas</h2>
        <button onClick={openCreate} style={{ background: COLORS.emerald, border: "none", borderRadius: 10, padding: "8px 16px", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>+ Nova</button>
      </div>

      {/* Hero total */}
      <div style={{ background: COLORS.navy, borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: "0 0 4px" }}>Total guardado</p>
        <p style={{ color: "#fff", fontSize: 26, fontWeight: 700, margin: "0 0 4px", fontVariantNumeric: "tabular-nums" }}>{fmt(totalSaved)}</p>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>de {fmt(totalTarget)} em metas</p>
      </div>

      {loading ? (
        <p style={{ color: COLORS.muted, textAlign: "center" }}>Carregando...</p>
      ) : goals.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ fontSize: 40 }}>🎯</p>
          <p style={{ color: COLORS.muted, fontSize: 15 }}>Nenhuma meta ainda</p>
          <p style={{ color: COLORS.hint, fontSize: 13 }}>Crie sua primeira meta financeira</p>
        </div>
      ) : goals.map(g => {
        const pct = Math.min(100, Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100));
        const done = pct >= 100;
        return (
          <div key={g.id} style={{ background: "#fff", borderRadius: 14, padding: 16, border: `0.5px solid ${COLORS.border}`, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 16 }}>{g.name} {done ? "🏆" : ""}</p>
                {g.target_date && <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.muted }}>Prazo: {new Date(g.target_date + "T00:00:00").toLocaleDateString("pt-BR")}</p>}
              </div>
              <span style={{ background: done ? "#D1FAE5" : COLORS.chip, color: done ? COLORS.emeraldDark : COLORS.muted, fontSize: 13, fontWeight: 600, padding: "3px 10px", borderRadius: 99 }}>{pct}%</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(Number(g.current_amount))}</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(Number(g.target_amount))}</span>
            </div>
            <div style={{ background: COLORS.chip, borderRadius: 99, height: 8 }}>
              <div style={{ background: done ? COLORS.warning : COLORS.emerald, height: "100%", width: `${pct}%`, borderRadius: 99 }} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => openAporte(g)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: COLORS.emerald, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>＋ Aportar</button>
              <button onClick={() => openEdit(g)} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: `0.5px solid ${COLORS.border}`, background: "#fff", color: COLORS.muted, fontWeight: 600, cursor: "pointer", fontSize: 13 }}>Editar</button>
            </div>
          </div>
        );
      })}

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: isDesktop ? "center" : "flex-end", justifyContent: "center", zIndex: 200, padding: isDesktop ? 24 : 0, boxSizing: "border-box" }}>
          <div style={{ background: "#fff", borderRadius: isDesktop ? 20 : "20px 20px 0 0", padding: 24, width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: COLORS.navy }}>{editingId ? "Editar meta" : "Nova meta"}</h3>

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Nome da meta *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ex: Reserva de emergência" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", marginBottom: 14, outline: "none" }} />

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Valor da meta (R$) *</label>
            <input value={form.target_amount} onChange={e => setForm({ ...form, target_amount: e.target.value })} placeholder="0,00" type="number" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", marginBottom: 14, outline: "none" }} />

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Já guardado (R$)</label>
            <input value={form.current_amount} onChange={e => setForm({ ...form, current_amount: e.target.value })} placeholder="0,00" type="number" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", marginBottom: 14, outline: "none" }} />

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Prazo</label>
            <input type="date" value={form.target_date} onChange={e => setForm({ ...form, target_date: e.target.value })} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", marginBottom: 14, outline: "none" }} />

            {error && <p style={{ color: COLORS.destructive, fontSize: 13, marginBottom: 12 }}>⚠️ {error}</p>}

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={closeModal} style={{ flex: 1, padding: 14, borderRadius: 10, border: `0.5px solid ${COLORS.border}`, background: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 15 }}>Cancelar</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: 14, borderRadius: 10, border: "none", background: COLORS.navy, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 15 }}>{saving ? "Salvando..." : "Salvar"}</button>
            </div>

            {editingId && (confirmDelete ? (
              <div style={{ marginTop: 12, padding: 12, background: "#FEF2F2", borderRadius: 10 }}>
                <p style={{ margin: "0 0 10px", fontSize: 13, color: COLORS.destructive }}>Excluir esta meta? Essa ação não pode ser desfeita.</p>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: 12, borderRadius: 10, border: `0.5px solid ${COLORS.border}`, background: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Não</button>
                  <button onClick={handleDelete} disabled={saving} style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: COLORS.destructive, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>{saving ? "Excluindo..." : "Sim, excluir"}</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} style={{ marginTop: 12, width: "100%", padding: 12, borderRadius: 10, border: `0.5px solid ${COLORS.destructive}`, background: "#fff", color: COLORS.destructive, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Excluir meta</button>
            ))}
          </div>
        </div>
      )}

      {aporteGoal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: isDesktop ? "center" : "flex-end", justifyContent: "center", zIndex: 200, padding: isDesktop ? 24 : 0, boxSizing: "border-box" }}>
          <div style={{ background: "#fff", borderRadius: isDesktop ? 20 : "20px 20px 0 0", padding: 24, width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto" }}>
            <h3 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 700, color: COLORS.navy }}>Aportar em "{aporteGoal.name}"</h3>
            <p style={{ margin: "0 0 18px", fontSize: 13, color: COLORS.muted }}>Guardado: {fmt(Number(aporteGoal.current_amount))} de {fmt(Number(aporteGoal.target_amount))}</p>

            <label style={{ fontSize: 13, fontWeight: 500, color: COLORS.muted, display: "block", marginBottom: 6 }}>Valor do aporte (R$) *</label>
            <input value={aporteValue} onChange={e => setAporteValue(e.target.value)} placeholder="0,00" type="number" autoFocus style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `0.5px solid ${COLORS.border}`, fontSize: 15, boxSizing: "border-box", marginBottom: 14, outline: "none" }} />

            {error && <p style={{ color: COLORS.destructive, fontSize: 13, marginBottom: 12 }}>⚠️ {error}</p>}

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={closeAporte} style={{ flex: 1, padding: 14, borderRadius: 10, border: `0.5px solid ${COLORS.border}`, background: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 15 }}>Cancelar</button>
              <button onClick={handleAporte} disabled={saving} style={{ flex: 1, padding: 14, borderRadius: 10, border: "none", background: COLORS.emerald, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 15 }}>{saving ? "Adicionando..." : "Adicionar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}