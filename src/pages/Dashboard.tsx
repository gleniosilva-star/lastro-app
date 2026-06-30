import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { savingsRate } from "../lib/finance";

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
  const [catData, setCatData] = useState<any[]>([]);
  const [monthData, setMonthData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const now = new Date();
      const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      // buckets dos últimos 6 meses
      const months: { key: string; label: string; receita: number; despesa: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""), receita: 0, despesa: 0 });
      }
      const sixStart = `${months[0].key}-01`;

      const [{ data: acc }, { data: txs }, { data: gls }, { data: monthTxs }, { data: sixTxs }] = await Promise.all([
        supabase.from("accounts").select("*").eq("is_archived", false),
        supabase.from("transactions").select("*, categories(name, icon, color)").order("transaction_date", { ascending: false }).limit(5),
        supabase.from("goals").select("*").limit(1),
        supabase.from("transactions").select("type, amount, categories(name, color)").gte("transaction_date", monthStart),
        supabase.from("transactions").select("type, amount, transaction_date").gte("transaction_date", sixStart),
      ]);
      setAccounts(acc || []);
      setTransactions(txs || []);
      setGoals(gls || []);

      const mtx = monthTxs || [];
      setIncome(mtx.filter(t => t.type === "receita").reduce((s, t) => s + Number(t.amount), 0));
      setExpense(mtx.filter(t => t.type === "despesa").reduce((s, t) => s + Number(t.amount), 0));

      // gastos por categoria (despesas do mês)
      const catMap: Record<string, any> = {};
      mtx.filter((t: any) => t.type === "despesa").forEach((t: any) => {
        const name = t.categories?.name || "Sem categoria";
        const color = t.categories?.color || COLORS.hint;
        if (!catMap[name]) catMap[name] = { name, color, value: 0 };
        catMap[name].value += Number(t.amount);
      });
      setCatData(Object.values(catMap).sort((a: any, b: any) => b.value - a.value));

      // evolução mensal (entradas x saídas)
      (sixTxs || []).forEach((t: any) => {
        const m = months.find(x => x.key === String(t.transaction_date).slice(0, 7));
        if (m) { if (t.type === "receita") m.receita += Number(t.amount); else m.despesa += Number(t.amount); }
      });
      setMonthData(months);

      setLoading(false);
    };
    load();
  }, []);

  const totalBalance = accounts.reduce((s, a) => s + Number(a.current_balance), 0);
  const rate = savingsRate(income, expense);
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
          <div style={{ background: COLORS.surface, borderRadius: 14, padding: 16, border: `0.5px solid ${COLORS.border}` }}>
            <p style={{ color: COLORS.muted, fontSize: 12, margin: "0 0 4px" }}>Entradas no mês</p>
            <p style={{ color: COLORS.emerald, fontSize: 16, fontWeight: 700, margin: 0, fontVariantNumeric: "tabular-nums" }}>
              +{fmt(income)}
            </p>
          </div>
          <div style={{ background: COLORS.surface, borderRadius: 14, padding: 16, border: `0.5px solid ${COLORS.border}` }}>
            <p style={{ color: COLORS.muted, fontSize: 12, margin: "0 0 4px" }}>Saídas no mês</p>
            <p style={{ color: COLORS.destructive, fontSize: 16, fontWeight: 700, margin: 0, fontVariantNumeric: "tabular-nums" }}>
              -{fmt(expense)}
            </p>
          </div>
        </div>

        {/* Taxa de poupança */}
        <div style={{ background: COLORS.surface, borderRadius: 14, padding: 16, border: `0.5px solid ${COLORS.border}`, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ color: COLORS.muted, fontSize: 12, margin: "0 0 4px" }}>Taxa de poupança · mês</p>
              <p style={{ color: rate == null ? COLORS.muted : rate >= 0 ? COLORS.emerald : COLORS.destructive, fontSize: 22, fontWeight: 700, margin: 0, fontVariantNumeric: "tabular-nums" }}>
                {rate == null ? "—" : `${Math.round(rate)}%`}
              </p>
            </div>
            <span style={{ fontSize: 26 }}>{rate == null ? "💡" : rate >= 0 ? "🌱" : "⚠️"}</span>
          </div>
          <p style={{ color: COLORS.hint, fontSize: 12, margin: "8px 0 0" }}>
            {rate == null
              ? "Registre entradas no mês para calcular."
              : rate >= 0
              ? "do que entrou neste mês ficou guardado."
              : "você gastou mais do que entrou neste mês."}
          </p>
        </div>

        {/* Evolução mensal */}
        <div style={{ background: COLORS.surface, borderRadius: 14, padding: 16, border: `0.5px solid ${COLORS.border}`, marginBottom: 16 }}>
          <p style={{ fontWeight: 600, fontSize: 15, margin: "0 0 12px" }}>Entradas e saídas · 6 meses</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: COLORS.muted }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip formatter={(v: any) => fmt(Number(v))} cursor={{ fill: COLORS.chip }} />
              <Bar dataKey="receita" name="Entradas" fill={COLORS.emerald} radius={[4, 4, 0, 0]} />
              <Bar dataKey="despesa" name="Saídas" fill={COLORS.destructive} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gastos por categoria */}
        {catData.length > 0 && (
          <div style={{ background: COLORS.surface, borderRadius: 14, padding: 16, border: `0.5px solid ${COLORS.border}`, marginBottom: 16 }}>
            <p style={{ fontWeight: 600, fontSize: 15, margin: "0 0 12px" }}>Gastos por categoria · mês</p>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={catData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {catData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v: any) => fmt(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ marginTop: 8 }}>
              {catData.map((d, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, display: "inline-block" }} />
                    <span style={{ fontSize: 13, color: COLORS.muted }}>{d.name}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmt(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meta em destaque */}
        {featuredGoal && (
          <div style={{ background: COLORS.surface, borderRadius: 14, padding: 16, border: `0.5px solid ${COLORS.border}`, marginBottom: 16 }}>
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
        <div style={{ background: COLORS.surface, borderRadius: 14, padding: 16, border: `0.5px solid ${COLORS.border}` }}>
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