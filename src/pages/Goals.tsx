import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

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
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", target_amount: "", current_amount: "", target_date: "" });

  const load = async () => {
    const { data } = await supabase.from("goals").select("*").order("created_at", { ascending: false });
    setGoals(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name) { setError("Nome é obrigatório"); return; }
    if (!form.target_amount) { setError("Valor da meta é obrigatório"); return; }
    setSaving(true);
    setError("");
    const { error } = await supabase.from("goals").insert({
      user_id: user.id,
      name: form.name,
      target_amount: parseFloat(form.target_amount.replace(",", ".")),
      current_amount: parseFloat((form.current_amount || "0").replace(",", ".")),
      target_date: form.target_date || null,
    });
    if (error) setError("Erro ao salvar meta.");
    else {
      setShowModal(false);
      setForm({ name: "", target_amount: "", current_amount: "", target_date: "" });
      load();
    }
    setSaving(false);
  };

  const totalSaved = goals.reduce((s, g) => s + Number(g.current_amount), 0);
  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);

  return (
    <div style={{ padding: "16px", paddingBottom: 80 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: COLORS.navy }}>Metas</h2>
        <button onClick={() => setShowModal(true)} style={{ background: COLORS.emerald, border: "none", borderRadius: 10, padding: "8px 16px", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>+ Nova</button>
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
          </div>
        );
      })}

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: 24, width: "100%", maxWidth: 430 }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: COLORS.navy }}>Nova meta</h3>

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
              <button onClick={() => { setShowModal(false); setError(""); }} style={{ flex: 1, padding: 14, borderRadius: 10, border: `0.5px solid ${COLORS.border}`, background: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 15 }}>Cancelar</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: 14, borderRadius: 10, border: "none", background: COLORS.navy, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 15 }}>{saving ? "Salvando..." : "Salvar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}