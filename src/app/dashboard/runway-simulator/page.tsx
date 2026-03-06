'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Banknote, Gauge, TrendingUp, TrendingDown, Target, Zap,
  RotateCcw, Users, Megaphone, DollarSign, UserMinus, Tag, Landmark,
  AlertTriangle, CheckCircle, ArrowRight, Calendar,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Legend,
} from 'recharts';
import { getAnalysis } from '@/lib/sessionStore';
import { AnalysisResult } from '@/lib/types';
import { cn } from '@/lib/utils';

/* ─── Animation ─── */
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

/* ─── Scenario Presets ─── */
interface ScenarioValues {
  hiring: number;
  avgSalary: number;
  marketing: number;
  revenueGrowth: number;
  churnRate: number;
  priceChange: number;
  fundraise: number;
}

const SCENARIOS: Record<string, { label: string; emoji: string; desc: string; color: string; values: ScenarioValues }> = {
  conservative: {
    label: 'Conservative', emoji: '🛡️', desc: 'Cut costs, survive longer',
    color: 'emerald',
    values: { hiring: 0, avgSalary: 8000, marketing: 0, revenueGrowth: 2, churnRate: 5, priceChange: 0, fundraise: 0 },
  },
  base: {
    label: 'Base Case', emoji: '📊', desc: 'Continue current trajectory',
    color: 'amber',
    values: { hiring: 1, avgSalary: 8000, marketing: 2000, revenueGrowth: 5, churnRate: 3, priceChange: 0, fundraise: 0 },
  },
  aggressive: {
    label: 'Aggressive', emoji: '🚀', desc: 'Scale fast, raise capital',
    color: 'rose',
    values: { hiring: 5, avgSalary: 8000, marketing: 15000, revenueGrowth: 15, churnRate: 2, priceChange: 10, fundraise: 500000 },
  },
  custom: {
    label: 'Custom', emoji: '🎛️', desc: 'Build your own scenario',
    color: 'indigo',
    values: { hiring: 0, avgSalary: 8000, marketing: 0, revenueGrowth: 0, churnRate: 0, priceChange: 0, fundraise: 0 },
  },
};

/* ─── Currency Formatter ─── */
const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const fmtCompact = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return fmt(n);
};

/* ─── Skeleton ─── */
function SimulatorSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 h-8 w-48 animate-pulse rounded-md bg-emerald-100 sm:mb-8" />
      <div className="h-96 animate-pulse rounded-xl bg-emerald-50" />
    </div>
  );
}

/* ─── Custom Tooltip ─── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-emerald-200 bg-white p-3 shadow-lg">
      <p className="text-[12px] font-bold text-emerald-900">{label}</p>
      <div className="mt-1 space-y-1">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2 text-[11px]">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-emerald-700">{p.name}:</span>
            <span className="font-bold" style={{ color: p.color }}>{fmt(p.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function RunwaySimulatorPage() {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [activeScenario, setActiveScenario] = useState<string>('base');
  const [values, setValues] = useState<ScenarioValues>(SCENARIOS.base.values);

  useEffect(() => { setData(getAnalysis()); }, []);

  const applyScenario = useCallback((key: string) => {
    setActiveScenario(key);
    if (key !== 'custom') setValues({ ...SCENARIOS[key].values });
  }, []);

  const updateValue = useCallback((key: keyof ScenarioValues, val: number) => {
    setActiveScenario('custom');
    setValues(prev => ({ ...prev, [key]: val }));
  }, []);

  /* ─── Month-by-Month Projection Engine ─── */
  const projection = useMemo(() => {
    if (!data) return null;

    const months = 24;
    const baseExpenses = data.monthlyBurnRate + data.monthlyRevenue; // gross expenses
    const baseRevenue = data.monthlyRevenue;
    let cash = data.cashBalance + values.fundraise;

    const timeline: { month: string; cash: number; revenue: number; expenses: number; netBurn: number }[] = [];
    let cashZeroMonth: number | null = null;
    let breakEvenMonth: number | null = null;

    const now = new Date();

    for (let i = 0; i < months; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
      const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      // Revenue compounds monthly
      const growthMultiplier = Math.pow(1 + (values.revenueGrowth - values.churnRate) / 100, i + 1);
      const priceMultiplier = 1 + values.priceChange / 100;
      const projectedRevenue = baseRevenue * growthMultiplier * priceMultiplier;

      // Expenses grow with hiring & marketing
      const hiringCost = values.hiring * values.avgSalary;
      const projectedExpenses = baseExpenses + hiringCost + values.marketing;

      const netBurn = projectedExpenses - projectedRevenue;
      cash -= netBurn;

      if (cashZeroMonth === null && cash <= 0) cashZeroMonth = i + 1;
      if (breakEvenMonth === null && netBurn <= 0) breakEvenMonth = i + 1;

      timeline.push({
        month: monthLabel,
        cash: Math.max(cash, -cash * 0.1), // allow slightly negative for vis
        revenue: Math.round(projectedRevenue),
        expenses: Math.round(projectedExpenses),
        netBurn: Math.round(netBurn),
      });
    }

    const month1 = timeline[0];
    const currentNetBurn = baseExpenses - baseRevenue;
    const projectedNetBurn = month1?.netBurn ?? currentNetBurn;
    const projectedRunway = projectedNetBurn > 0
      ? (data.cashBalance + values.fundraise) / projectedNetBurn
      : 999;

    // Risk score
    let risk = 50;
    if (projectedRunway >= 18) risk = 10;
    else if (projectedRunway >= 12) risk = 25;
    else if (projectedRunway >= 6) risk = 55;
    else if (projectedRunway >= 3) risk = 80;
    else risk = 95;
    if (values.fundraise > 0) risk = Math.max(risk - 15, 5);
    if (breakEvenMonth !== null && breakEvenMonth <= 12) risk = Math.max(risk - 10, 5);

    const cashZeroDate = cashZeroMonth
      ? new Date(now.getFullYear(), now.getMonth() + cashZeroMonth + 1, 1)
        .toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      : null;

    return {
      timeline,
      cashZeroMonth,
      cashZeroDate,
      breakEvenMonth,
      projectedRunway: Math.min(projectedRunway, 999),
      projectedNetBurn,
      currentNetBurn,
      totalCash: data.cashBalance + values.fundraise,
      riskScore: Math.round(Math.max(0, Math.min(100, risk))),
      cash12: timeline[11]?.cash ?? 0,
      cash18: timeline[17]?.cash ?? 0,
      cash24: timeline[23]?.cash ?? 0,
    };
  }, [data, values]);

  if (!data || !projection) return <SimulatorSkeleton />;

  const runwayColor = projection.projectedRunway < 6 ? 'rose' : projection.projectedRunway < 12 ? 'amber' : 'emerald';

  const sliders = [
    { key: 'hiring' as const, label: 'New Hires', icon: Users, value: values.hiring, min: 0, max: 20, step: 1, format: (v: number) => `${v} people`, desc: `${fmt(values.avgSalary)}/mo each` },
    { key: 'avgSalary' as const, label: 'Avg Salary', icon: DollarSign, value: values.avgSalary, min: 3000, max: 20000, step: 500, format: (v: number) => fmt(v), desc: 'Monthly cost per hire' },
    { key: 'marketing' as const, label: 'Marketing Budget', icon: Megaphone, value: values.marketing, min: 0, max: 50000, step: 1000, format: (v: number) => fmt(v), desc: 'Additional monthly spend' },
    { key: 'revenueGrowth' as const, label: 'Revenue Growth', icon: TrendingUp, value: values.revenueGrowth, min: -20, max: 50, step: 1, format: (v: number) => `${v > 0 ? '+' : ''}${v}%`, desc: 'Monthly growth rate' },
    { key: 'churnRate' as const, label: 'Customer Churn', icon: UserMinus, value: values.churnRate, min: 0, max: 20, step: 0.5, format: (v: number) => `${v}%`, desc: 'Monthly churn offset' },
    { key: 'priceChange' as const, label: 'Price Change', icon: Tag, value: values.priceChange, min: -30, max: 50, step: 1, format: (v: number) => `${v > 0 ? '+' : ''}${v}%`, desc: 'One-time pricing adjustment' },
    { key: 'fundraise' as const, label: 'Fundraise', icon: Landmark, value: values.fundraise, min: 0, max: 5000000, step: 50000, format: (v: number) => fmtCompact(v), desc: 'Capital injection' },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

      {/* ── Header ── */}
      <motion.div variants={fadeUp} className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2">
          <motion.div animate={{ rotate: [0, 180, 360] }} transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}>
            <Gauge className="h-5 w-5 text-emerald-600" />
          </motion.div>
          <h1 className="text-lg font-bold tracking-tight text-emerald-950 sm:text-xl">Runway Simulator</h1>
        </div>
        <p className="mt-0.5 text-[13px] text-emerald-700/40">Model financial scenarios with month-by-month projections powered by your real data.</p>
      </motion.div>

      {/* ── Scenario Presets ── */}
      <motion.div variants={fadeUp} className="mb-4 flex flex-wrap gap-2 sm:mb-5">
        {Object.entries(SCENARIOS).map(([key, s]) => (
          <motion.button key={key}
            whileHover={{ y: -2, boxShadow: '0 4px 15px rgba(16,185,129,0.12)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => applyScenario(key)}
            className={cn(
              'flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[12px] font-bold transition-all sm:text-[13px]',
              activeScenario === key
                ? 'border-emerald-400 bg-emerald-50 text-emerald-800 shadow-sm shadow-emerald-200'
                : 'border-emerald-200/60 bg-white text-emerald-700/60 hover:border-emerald-300 hover:bg-emerald-50/50'
            )}>
            <span className="text-base">{s.emoji}</span>
            <div className="text-left">
              <div>{s.label}</div>
              <div className="text-[10px] font-medium opacity-60">{s.desc}</div>
            </div>
          </motion.button>
        ))}
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => { setValues(SCENARIOS.base.values); setActiveScenario('base'); }}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-50">
          <RotateCcw className="h-3 w-3" /> Reset
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12 xl:gap-6">

        {/* ━━ LEFT: Sliders ━━ */}
        <motion.div variants={container} className="space-y-2.5 xl:col-span-3">
          {sliders.map((s) => (
            <motion.div key={s.key} variants={fadeUp}
              className="rounded-xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50/30 to-white p-3 shadow-sm sm:p-3.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 sm:text-[12px]">
                  <s.icon className="h-3.5 w-3.5 text-emerald-500" strokeWidth={2} /> {s.label}
                </span>
                <AnimatePresence mode="wait">
                  <motion.span key={s.value} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 6, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold tabular-nums text-emerald-700 shadow-sm">
                    {s.format(s.value)}
                  </motion.span>
                </AnimatePresence>
              </div>
              <input type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                onChange={e => updateValue(s.key, Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer rounded-full accent-emerald-500" />
              <p className="mt-0.5 text-[9px] text-emerald-600/40 sm:text-[10px]">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ━━ CENTER: Chart + Tables ━━ */}
        <div className="space-y-4 xl:col-span-6">

          {/* Projection Chart */}
          <motion.div variants={fadeUp}
            className="rounded-xl border border-emerald-200/60 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-[13px] font-bold text-emerald-950 sm:text-sm">24-Month Cash Projection</h3>
                <p className="text-[10px] text-emerald-600/40">Month-by-month cash balance forecast</p>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-400" /> Cash</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-teal-400" /> Revenue</span>
                <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-rose-300" /> Expenses</span>
              </div>
            </div>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projection.timeline} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6ee7b7' }} tickLine={false} axisLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 10, fill: '#6ee7b7' }} tickLine={false} axisLine={false} tickFormatter={(v: number) => fmtCompact(v)} width={55} />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine y={0} stroke="#fca5a5" strokeDasharray="6 3" strokeWidth={2} label={{ value: 'ZERO', position: 'right', fill: '#f87171', fontSize: 10, fontWeight: 700 }} />
                  <Area type="monotone" dataKey="cash" name="Cash Balance" stroke="#10b981" strokeWidth={2.5} fill="url(#cashGrad)" dot={false} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#14b8a6" strokeWidth={1.5} fill="url(#revGrad)" dot={false} />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#fca5a5" strokeWidth={1.5} fill="none" dot={false} strokeDasharray="4 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Comparison Table */}
          <motion.div variants={fadeUp} className="rounded-xl border border-emerald-200/60 bg-white shadow-sm">
            <div className="border-b border-emerald-100 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-950">
                <Banknote className="h-4 w-4 text-emerald-500" /> Current vs Projected Comparison
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[400px]">
                <thead>
                  <tr className="border-b border-emerald-50 bg-emerald-50/30">
                    <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-emerald-600/50 sm:px-5">Metric</th>
                    <th className="px-4 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-emerald-600/50 sm:px-5">Current</th>
                    <th className="px-4 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-emerald-500 sm:px-5">Projected</th>
                    <th className="px-4 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-emerald-500 sm:px-5">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { m: 'Net Burn', c: fmt(projection.currentNetBurn), p: fmt(projection.projectedNetBurn), delta: projection.projectedNetBurn - projection.currentNetBurn, inv: true },
                    { m: 'Runway', c: `${data.currentRunwayMonths >= 999 ? '∞' : data.currentRunwayMonths.toFixed(1)} mo`, p: `${projection.projectedRunway >= 999 ? '∞' : projection.projectedRunway.toFixed(1)} mo`, delta: projection.projectedRunway - data.currentRunwayMonths, inv: false },
                    { m: 'Cash Balance', c: fmt(data.cashBalance), p: fmt(projection.totalCash), delta: projection.totalCash - data.cashBalance, inv: false },
                    { m: 'Cash @ 12mo', c: '—', p: fmt(projection.cash12), delta: 0, inv: false },
                    { m: 'Cash @ 24mo', c: '—', p: fmt(projection.cash24), delta: 0, inv: false },
                  ].map(r => {
                    const isPositive = r.inv ? r.delta < 0 : r.delta > 0;
                    return (
                      <motion.tr key={r.m} whileHover={{ backgroundColor: 'rgba(16,185,129, 0.03)' }}
                        className="border-b border-emerald-50 last:border-0">
                        <td className="px-4 py-2.5 text-[12px] font-medium text-emerald-800 sm:px-5">{r.m}</td>
                        <td className="px-4 py-2.5 text-right text-[12px] tabular-nums text-emerald-600/50 sm:px-5">{r.c}</td>
                        <td className="px-4 py-2.5 text-right text-[12px] font-semibold tabular-nums text-emerald-600 sm:px-5">{r.p}</td>
                        <td className={cn('px-4 py-2.5 text-right text-[11px] font-bold tabular-nums sm:px-5',
                          r.delta === 0 ? 'text-emerald-400' : isPositive ? 'text-emerald-500' : 'text-rose-500')}>
                          {r.delta === 0 ? '—' : `${isPositive ? '▲' : '▼'} ${r.m.includes('Runway') ? `${Math.abs(r.delta).toFixed(1)} mo` : fmtCompact(Math.abs(r.delta))}`}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* ━━ RIGHT: Key Metrics ━━ */}
        <div className="space-y-3 xl:col-span-3">

          {/* Projected Runway */}
          <motion.div variants={fadeUp}
            className={cn('rounded-xl border bg-gradient-to-br to-white p-4 shadow-sm sm:p-5',
              runwayColor === 'rose' ? 'border-rose-200 from-rose-50' :
                runwayColor === 'amber' ? 'border-amber-200 from-amber-50' :
                  'border-emerald-200 from-emerald-50')}>
            <div className="flex items-center gap-2">
              <Clock className={cn('h-4 w-4', runwayColor === 'rose' ? 'text-rose-600' : runwayColor === 'amber' ? 'text-amber-600' : 'text-emerald-600')} />
              <span className={cn('text-[12px] font-bold', runwayColor === 'rose' ? 'text-rose-700' : runwayColor === 'amber' ? 'text-amber-700' : 'text-emerald-700')}>
                Projected Runway
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.p key={projection.projectedRunway.toFixed(1)}
                initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }}
                className={cn('mt-2 text-4xl font-light tabular-nums',
                  runwayColor === 'rose' ? 'text-rose-600' : runwayColor === 'amber' ? 'text-amber-600' : 'text-emerald-600')}>
                {projection.projectedRunway >= 999 ? '∞' : projection.projectedRunway.toFixed(1)}
                <span className="ml-1 text-sm">months</span>
              </motion.p>
            </AnimatePresence>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/60">
              <motion.div animate={{ width: `${Math.min(100, (projection.projectedRunway / 24) * 100)}%` }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
                className={cn('h-full rounded-full',
                  runwayColor === 'rose' ? 'bg-gradient-to-r from-rose-400 to-rose-500' :
                    runwayColor === 'amber' ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                      'bg-gradient-to-r from-emerald-400 to-emerald-500')} />
            </div>
            <div className="mt-1 flex justify-between text-[9px] font-medium text-emerald-700/30">
              <span>0</span><span>12</span><span>24 mo</span>
            </div>
          </motion.div>

          {/* Risk Score */}
          <motion.div variants={fadeUp}
            className="rounded-xl border border-emerald-200/60 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-emerald-800">🛡️ Risk Score</span>
              <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-bold',
                projection.riskScore <= 25 ? 'bg-emerald-50 text-emerald-600' :
                  projection.riskScore <= 55 ? 'bg-amber-50 text-amber-600' :
                    'bg-rose-50 text-rose-600')}>
                {projection.riskScore <= 25 ? 'LOW' : projection.riskScore <= 55 ? 'MEDIUM' : 'HIGH'}
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.p key={projection.riskScore}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mt-2 text-3xl font-light tabular-nums text-emerald-950">
                {projection.riskScore}<span className="ml-1 text-sm text-emerald-500/40">/100</span>
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* Break-Even */}
          <motion.div variants={fadeUp}
            className={cn('rounded-xl border p-4 shadow-sm sm:p-5',
              projection.breakEvenMonth ? 'border-emerald-200 bg-emerald-50/50' : 'border-amber-200 bg-amber-50/50')}>
            <div className="flex items-center gap-2">
              {projection.breakEvenMonth
                ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                : <AlertTriangle className="h-4 w-4 text-amber-500" />}
              <span className="text-[12px] font-bold text-emerald-800">Break-Even Point</span>
            </div>
            <p className={cn('mt-2 text-2xl font-light',
              projection.breakEvenMonth ? 'text-emerald-600' : 'text-amber-600')}>
              {projection.breakEvenMonth ? `Month ${projection.breakEvenMonth}` : 'Not in 24mo'}
            </p>
            <p className="mt-1 text-[10px] text-emerald-600/40">
              {projection.breakEvenMonth
                ? `Profitability expected in ${projection.breakEvenMonth} months`
                : 'Revenue doesn\'t cover expenses in forecast window'}
            </p>
          </motion.div>

          {/* Cash-Zero Date */}
          <motion.div variants={fadeUp}
            className={cn('rounded-xl border p-4 shadow-sm sm:p-5',
              projection.cashZeroDate ? 'border-rose-200 bg-rose-50/50' : 'border-emerald-200 bg-emerald-50/50')}>
            <div className="flex items-center gap-2">
              <Calendar className={cn('h-4 w-4', projection.cashZeroDate ? 'text-rose-500' : 'text-emerald-500')} />
              <span className="text-[12px] font-bold text-emerald-800">Cash-Zero Date</span>
            </div>
            <p className={cn('mt-2 text-xl font-light',
              projection.cashZeroDate ? 'text-rose-600' : 'text-emerald-600')}>
              {projection.cashZeroDate || '∞ No risk'}
            </p>
            <p className="mt-1 text-[10px] text-emerald-600/40">
              {projection.cashZeroDate
                ? `Cash runs out in ~${projection.cashZeroMonth} months`
                : 'Cash remains positive through 24-month forecast'}
            </p>
          </motion.div>

          {/* Scenario Impact */}
          <motion.div variants={fadeUp}
            key={`impact-${projection.projectedRunway.toFixed(1)}`}
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className={cn('rounded-xl border p-4 text-center shadow-sm',
              projection.projectedRunway > data.currentRunwayMonths
                ? 'border-emerald-200 bg-emerald-50'
                : projection.projectedRunway < data.currentRunwayMonths
                  ? 'border-rose-200 bg-rose-50'
                  : 'border-amber-200 bg-amber-50')}>
            <div className={cn('text-[12px] font-bold',
              projection.projectedRunway > data.currentRunwayMonths ? 'text-emerald-700' :
                projection.projectedRunway < data.currentRunwayMonths ? 'text-rose-700' : 'text-amber-700')}>
              {projection.projectedRunway > data.currentRunwayMonths
                ? `✅ +${(projection.projectedRunway - data.currentRunwayMonths).toFixed(1)} months runway`
                : projection.projectedRunway < data.currentRunwayMonths
                  ? `⚠️ ${(data.currentRunwayMonths - projection.projectedRunway).toFixed(1)} months shorter`
                  : '→ No change'}
            </div>
            <p className="mt-1 text-[10px] text-emerald-600/40">vs current trajectory</p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
