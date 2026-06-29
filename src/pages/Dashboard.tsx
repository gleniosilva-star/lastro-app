import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const COLORS = {
  navy: "#0A2540",
  emerald: "#10B981",
  emeraldDark: "#059669",
  destructive: "#E11D48",
  warning: "#F59E0B",
  muted: "#64748B",
  hint: "#94A3B8",
  border: "#E2E8F0",
  chip: "#F1F5F9",
  bg: "#F8FAFC",
};

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const saudacao = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia,";
  if (h < 18) return "Boa tarde,";
  return "Boa noite,";
};

export default function Dashboard({ user }: { user: any }) {
  const [hideBalance, setHideBalance] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const now = new Date();
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      const [{ data: acc }, { data: txs }, { data: gls }, { data: monthTxs }] = await Promise.all([
        supabase.from("accounts").select("*").eq("is_archived", false),
        supabase.from("transactions").select("*, categories(name, icon, color)").order("transaction_date", { ascending: false }).limit(5),
        supabase.from("goals").select("*").limit(1),
        supabase.from("transactions").select("type, amount").gte("transaction_date", monthStart),
      ]);
      setAccounts(acc || []);
      setTransactions(txs || []);
      setGoals(gls || []);
      setIncome((monthTxs || []).filter(t => t.type === "receita").reduce((s, t) => s + Number(t.amount), 0));
      setExpense((monthTxs || []).filter(t => t.type === "despesa").reduce((s, t) => s + Number(t.amount), 0));
      setLoading(false);
    };
    load();
  }, []);

  const totalBalance = accounts.reduce((s, a) => s + Number(a.current_balance), 0);
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "você";
  const featuredGoal = goals[0];
  const goalPct = featuredGoal ? Math.min(100, Math.round((featuredGoal.current_amount / featuredGoal.target_amount) * 100)) : 0;

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
      <p style={{ color: COLORS.muted }}>Carregando...</p>
    </div>
  );

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Header */}
      <div style={{ background: COLORS.navy, padding: "24px 16px 32px", borderRadius: "0 0 24px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: 0 }}>{saudacao()}</p>
            <p style={{ color: "#fff", fontSize: 18, fontWeight: 600, margin: 0 }}>{firstName} 👋</p>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: COLORS.emerald, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 16 }}>
            {firstName[0].toUpperCase()}
          </div>
        </div>

        {/* Saldo */}
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 14, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, margin: 0 }}>Saldo consolidado</p>
            <button onClick={() => setHideBalance(!hideBalance)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", fontSize: 18 }}>
              {hideBalance ? "👁️" : "🙈"}
            </button>
          </div>
          <p style={{ color: "#fff", fontSize: 28, fontWeight: 700, margin: "4px 0 0", fontVariantNumeric: "tabular-nums" }}>
            {hideBalance ? "R$ ••••••" : accounts.length === 0 ? "R$ 0,00" : fmt(totalBalance)}
          </p>
          {accounts.length === 0 && (
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: "4px 0 0" }}>Adicione uma conta para começar</p>
          )}
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        {/* Receitas vs Despesas */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: `0.5px solid ${COLORS.border}` }}>
            <p style={{ color: COLORS.muted, fontSize: 12, margin: "0 0 4px" }}>Entradas no mês</p>
            <p style={{ color: COLORS.emerald, fontSize: 16, fontWeight: 700, margin: 0, fontVariantNumeric: "tabular-nums" }}>
              +{fmt(income)}
            </p>
          </div>
          <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: `0.5px solid ${COLORS.border}` }}>
            <p style={{ color: COLORS.muted, fontSize: 12, margin: "0 0 4px" }}>Saídas no mês</p>
            <p style={{ color: COLORS.destructive, fontSize: 16, fontWeight: 700, margin: 0, fontVariantNumeric: "tabular-nums" }}>
              -{fmt(expense)}
            </p>
          </div>
        </div>

        {/* Meta em destaque */}
        {featuredGoal && (
          <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: `0.5px solid ${COLORS.border}`, marginBottom: 16 }}>
            <p style={{ fontWeight: 600, fontSize: 15, margin: "0 0 8px" }}>🎯 Meta em destaque</p>
            <p style={{ margin: "0 0 4px", fontWeight: 500 }}>{featuredGoal.name}</p>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>
              <span>{fmt(featuredGoal.current_amount)}</span>
              <span>{goalPct}% de {fmt(featuredGoal.target_amount)}</span>
            </div>
            <div style={{ background: COLORS.chip, borderRadius: 99, height: 8 }}>
              <div style={{ background: goalPct >= 100 ? COLORS.warning : COLORS.emerald, height: "100%", width: `${goalPct}%`, borderRadius: 99 }} />
            </div>
          </div>
        )}

        {/* Últimas transações */}
        <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: `0.5px solid ${COLORS.border}` }}>
          <p style={{ fontWeight: 600, fontSize: 15, margin: "0 0 12px" }}>Últimas transações</p>
          {transactions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <p style={{ fontSize: 32 }}>💸</p>
              <p style={{ color: COLORS.muted, fontSize: 14, margin: 0 }}>Nenhuma transação ainda</p>
              <p style={{ color: COLORS.hint, fontSize: 13, margin: "4px 0 0" }}>Adicione sua primeira transação</p>
            </div>
          ) : transactions.map((t, i) => (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < transactions.length - 1 ? `0.5px solid ${COLORS.border}` : "none" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: COLORS.chip, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                  {t.categories?.icon || "📌"}
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{t.description}</p>
                  <p style={{ margin: 0, fontSize: 12, color: COLORS.muted }}>{t.categories?.name || "Sem categoria"}</p>
                </div>
              </div>
              <span style={{ color: t.type === "receita" ? COLORS.emerald : COLORS.destructive, fontWeight: 700, fontSize: 14, fontVariantNumeric: "tabular-nums" }}>
                {t.type === "receita" ? "+" : "-"}{fmt(Math.abs(Number(t.amount)))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}