'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingDown, TrendingUp, Clock, DollarSign, Landmark,
  ArrowUpRight, ArrowDownRight, ShieldCheck, Activity, Banknote, Sparkles, Loader2, AlertTriangle,
  Target, BarChart3, Timer, Rocket,
} from 'lucide-react';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { getAnalysis } from '@/lib/sessionStore';
import { AnalysisResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

/* ─── Animation Variants ─── */
const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const fadeRight = { hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0, transition: { duration: 0.45 } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.92 }, show: { opacity: 1, scale: 1, transition: { duration: 0.5 } } };

/* ─── Metric Card ─── */
function MetricCard({ label, value, subtitle, trend, icon: Icon, gradient, delay = 0, isCurrency = false }: {
  label: string; value: number; subtitle?: string;
  trend?: string; icon: React.ElementType; gradient: string; delay?: number; isCurrency?: boolean;
}) {
  const displayValue = useAnimatedCounter({ end: value, decimals: isCurrency ? 0 : 1, prefix: isCurrency ? '$' : '', duration: 1500 });
  const positive = trend === 'decreasing';

  return (
    <motion.div variants={fadeUp} custom={delay}
      whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(16,185,129,0.12)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group cursor-default rounded-xl border border-emerald-200/60 bg-white p-5 shadow-sm transition-shadow sm:p-6">
      <div className="flex items-start justify-between">
        <motion.div whileHover={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.5 }}
          className={cn('flex h-10 w-10 items-center justify-center rounded-xl shadow-md sm:h-11 sm:w-11', gradient)}>
          <Icon className="h-4.5 w-4.5 text-white sm:h-5 sm:w-5" strokeWidth={2} />
        </motion.div>
        {trend && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: 'spring' }}
            className={cn('flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold',
              positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500')}>
            {positive ? <ArrowDownRight className="h-3 w-3" /> : trend === 'increasing' ? <ArrowUpRight className="h-3 w-3" /> : ''}
            {trend}
          </motion.div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700/50 sm:text-[13px]">{label}</p>
        <p className="mt-1 animate-count text-2xl font-light tracking-tight text-emerald-950 sm:text-3xl lg:text-4xl">
          {displayValue}{!isCurrency && ' mo'}
        </p>
        {subtitle && <p className="mt-1 text-[11px] text-emerald-600/40 sm:text-[12px]">{subtitle}</p>}
      </div>
    </motion.div>
  );
}

/* ─── Loading Skeleton ─── */
function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-8 w-48 animate-pulse rounded-md bg-emerald-100" />
        <div className="h-6 w-24 animate-pulse rounded-full bg-emerald-100" />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {[1, 2, 3].map(i => <div key={i} className="h-40 animate-pulse rounded-xl bg-emerald-50" />)}
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-4 sm:gap-4 md:grid-cols-3">
        {[1, 2, 3].map(i => <div key={i} className="h-48 animate-pulse rounded-xl bg-emerald-50" />)}
      </div>
      <div className="mt-3 h-64 animate-pulse rounded-xl bg-emerald-50 sm:mt-4" />
    </div>
  );
}

/* ─── Page ─── */
export default function OverviewPage() {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Client-side hydration of real data
    const analysis = getAnalysis();
    if (!analysis) {
      router.push('/upload');
    } else {
      setData(analysis);
      setLoading(false);
    }
  }, [router]);

  if (loading || !data) return <DashboardSkeleton />;

  const maxBurn = Math.max(...data.monthlyBreakdown.map(d => d.netBurn));

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

      {/* ── Header ── */}
      <motion.div variants={fadeUp} className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}>
              <Banknote className="h-5 w-5 text-emerald-600" />
            </motion.div>
            <h1 className="text-lg font-bold tracking-tight text-emerald-950 sm:text-xl">Financial Overview</h1>
          </div>
          <p className="mt-0.5 text-[13px] text-emerald-700/40">Powered by OpenAI Structured Intelligence.</p>
        </div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="inline-flex cursor-default items-center gap-1.5 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
          <Sparkles className="h-3 w-3" /> Live Data
        </motion.div>
      </motion.div>

      {/* ── OMTM Cards ── */}
      <motion.div variants={container} className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        <MetricCard label="Runway" value={data.currentRunwayMonths} subtitle="At current burn rate"
          icon={Clock}
          gradient="bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30" />
        <MetricCard label="Monthly Burn" value={data.monthlyBurnRate} subtitle="Net cash outflow" isCurrency
          trend={data.monthlyBurnRate > 0 ? 'increasing' : 'stable'} icon={TrendingDown}
          gradient="bg-gradient-to-br from-rose-400 to-rose-500 shadow-rose-500/30" />
        <MetricCard label="Cash in Bank" value={data.cashBalance} subtitle="Current balance estimated" isCurrency
          icon={Landmark}
          gradient="bg-gradient-to-br from-amber-400 to-amber-500 shadow-amber-500/30" />
      </motion.div>

      {/* ── Founder KPIs Row ── */}
      <motion.div variants={container} className="mt-3 grid grid-cols-2 gap-3 sm:mt-4 sm:grid-cols-4 sm:gap-4">
        {/* Gross Margin */}
        <motion.div variants={fadeUp}
          whileHover={{ y: -3, boxShadow: '0 8px 25px rgba(16,185,129,0.1)' }}
          className="rounded-xl border border-emerald-200/60 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-start justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 shadow-md">
              <BarChart3 className="h-4 w-4 text-white" strokeWidth={2} />
            </div>
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold',
              (data.founderMetrics?.grossMargin ?? 0) >= 70 ? 'bg-emerald-50 text-emerald-600' :
                (data.founderMetrics?.grossMargin ?? 0) >= 40 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600')}>
              {(data.founderMetrics?.grossMargin ?? 0) >= 70 ? 'HEALTHY' : (data.founderMetrics?.grossMargin ?? 0) >= 40 ? 'WATCH' : 'LOW'}
            </span>
          </div>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-emerald-600/50 sm:text-[11px]">Gross Margin</p>
          <p className="mt-1 text-2xl font-light tabular-nums text-emerald-950 sm:text-3xl">{data.founderMetrics?.grossMargin ?? 0}%</p>
        </motion.div>

        {/* Revenue Growth */}
        <motion.div variants={fadeUp}
          whileHover={{ y: -3, boxShadow: '0 8px 25px rgba(16,185,129,0.1)' }}
          className="rounded-xl border border-emerald-200/60 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md">
            <TrendingUp className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-emerald-600/50 sm:text-[11px]">Revenue Growth</p>
          <p className={cn('mt-1 text-2xl font-light tabular-nums sm:text-3xl',
            (data.revenueGrowthRate ?? 0) > 0 ? 'text-emerald-600' : 'text-rose-500')}>
            {(data.revenueGrowthRate ?? 0) > 0 ? '+' : ''}{data.revenueGrowthRate ?? 0}%
            <span className="ml-1 text-sm text-emerald-600/40">MoM</span>
          </p>
        </motion.div>

        {/* Default Alive */}
        <motion.div variants={fadeUp}
          whileHover={{ y: -3, boxShadow: '0 8px 25px rgba(16,185,129,0.1)' }}
          className={cn('rounded-xl border p-4 shadow-sm sm:p-5',
            data.founderMetrics?.isDefaultAlive ? 'border-emerald-200/60 bg-white' : 'border-rose-200 bg-gradient-to-br from-rose-50/50 to-white')}>
          <div className="flex items-start justify-between">
            <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg shadow-md',
              data.founderMetrics?.isDefaultAlive ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-rose-400 to-rose-600')}>
              {data.founderMetrics?.isDefaultAlive ? <Rocket className="h-4 w-4 text-white" /> : <Target className="h-4 w-4 text-white" />}
            </div>
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold',
              data.founderMetrics?.isDefaultAlive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600')}>
              {data.founderMetrics?.isDefaultAlive ? 'ALIVE' : 'AT RISK'}
            </span>
          </div>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-emerald-600/50 sm:text-[11px]">Default Alive</p>
          <p className={cn('mt-1 text-2xl font-light sm:text-3xl',
            data.founderMetrics?.isDefaultAlive ? 'text-emerald-600' : 'text-rose-500')}>
            {data.founderMetrics?.isDefaultAlive ? 'YES' : 'NO'}
          </p>
        </motion.div>

        {/* Cash-Zero Date */}
        <motion.div variants={fadeUp}
          whileHover={{ y: -3, boxShadow: '0 8px 25px rgba(16,185,129,0.1)' }}
          className={cn('rounded-xl border p-4 shadow-sm sm:p-5',
            data.cashFlowForecast?.cashZeroDate ? 'border-rose-200 bg-gradient-to-br from-rose-50/50 to-white' : 'border-emerald-200/60 bg-white')}>
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg shadow-md',
            data.cashFlowForecast?.cashZeroDate ? 'bg-gradient-to-br from-rose-400 to-rose-600' : 'bg-gradient-to-br from-emerald-400 to-emerald-600')}>
            <Timer className="h-4 w-4 text-white" strokeWidth={2} />
          </div>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-emerald-600/50 sm:text-[11px]">Cash-Zero Date</p>
          <p className={cn('mt-1 text-xl font-light sm:text-2xl',
            data.cashFlowForecast?.cashZeroDate ? 'text-rose-500' : 'text-emerald-600')}>
            {data.cashFlowForecast?.cashZeroDate || '∞ No risk'}
          </p>
        </motion.div>
      </motion.div>

      {/* ── Risk + AI Insights + Signals ── */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-4 sm:gap-4 md:grid-cols-3">

        {/* Risk Score */}
        <motion.div variants={scaleIn}
          whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(16,185,129,0.12)' }}
          className="rounded-xl border border-emerald-200/60 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-emerald-950">Risk Score</p>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8, type: 'spring' }}
              className={cn('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold',
                data.riskLevel === 'SAFE' ? 'bg-emerald-50 text-emerald-600' :
                  data.riskLevel === 'WARNING' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600')}>
              <ShieldCheck className="h-3.5 w-3.5" /> {data.riskLevel}
            </motion.div>
          </div>
          <div className="mt-3 flex items-end gap-2 sm:mt-4">
            <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              className="text-4xl font-light tabular-nums text-emerald-950 sm:text-5xl">
              {data.riskScore}
            </motion.span>
            <span className="mb-1 text-sm text-emerald-600/40">/ 100</span>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-emerald-100 sm:mt-4">
            <motion.div className={cn("h-full rounded-full transition-all",
              data.riskLevel === 'SAFE' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                data.riskLevel === 'WARNING' ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-rose-400 to-rose-500')}
              initial={{ width: 0 }} animate={{ width: `${data.riskScore}%` }}
              transition={{ duration: 1.4, delay: 0.5 }} />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] font-medium sm:text-[11px]">
            <span className="text-emerald-500">Low risk</span><span className="text-rose-400">High risk</span>
          </div>
        </motion.div>

        {/* AI Insight Highlight */}
        <motion.div variants={scaleIn}
          whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(16,185,129,0.12)' }}
          className="rounded-xl border border-emerald-200/60 bg-gradient-to-b from-emerald-50/50 to-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <p className="text-sm font-bold text-emerald-950">AI CFO Insight</p>
          </div>
          {data.aiInsights[0] && (
            <div className="mt-4">
              <p className="font-bold text-emerald-900 text-[13px]">{data.aiInsights[0].title}</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-emerald-800/70">{data.aiInsights[0].explanation}</p>
              <div className="mt-3 border-l-2 border-emerald-400 pl-3">
                <p className="text-[11px] font-semibold uppercase text-emerald-600">Recommendation</p>
                <p className="mt-0.5 text-[12px] text-emerald-900">{data.aiInsights[0].recommendation}</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Signals */}
        <motion.div variants={scaleIn}
          whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(16,185,129,0.12)' }}
          className="rounded-xl border border-emerald-200/60 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-emerald-950">Signals</p>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
              <Activity className="h-4 w-4 text-emerald-400" strokeWidth={2} />
            </motion.div>
          </div>
          <div className="mt-3 flex flex-col gap-2.5 sm:mt-4">
            {data.signals.slice(0, 4).map((a, i) => (
              <motion.div key={i} variants={fadeRight} custom={i}
                whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 300 }}
                className="flex items-start gap-2.5">
                <div className={cn('mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full',
                  a.type === 'positive' ? 'bg-emerald-50' : a.type === 'warning' ? 'bg-amber-50' : 'bg-zinc-50')}>
                  {a.type === 'positive' ? <TrendingUp className="h-3 w-3 text-emerald-500" /> :
                    a.type === 'warning' ? <AlertTriangle className="h-3 w-3 text-amber-500" /> :
                      <DollarSign className="h-3 w-3 text-zinc-400" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] leading-snug text-emerald-800/70 sm:text-[13px]">{a.text}</p>
                  <p className="text-[10px] text-emerald-500/40">{a.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Monthly Ledger ── */}
      <motion.div variants={fadeUp}
        whileHover={{ boxShadow: '0 8px 30px rgba(16,185,129,0.08)' }}
        className="mt-3 rounded-xl border border-emerald-200/60 bg-white shadow-sm sm:mt-4">
        <div className="flex items-center justify-between px-5 py-4 sm:px-6">
          <div>
            <p className="text-sm font-bold text-emerald-950">Monthly Ledger</p>
            <p className="mt-0.5 text-[11px] text-emerald-600/40">Revenue vs expenses breakdown</p>
          </div>
          <DollarSign className="h-4 w-4 text-emerald-300" strokeWidth={1.8} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-y border-emerald-100 bg-emerald-50/30">
                <th className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-emerald-600/50 sm:px-6 sm:text-[11px]">Month</th>
                <th className="px-5 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest text-emerald-600/50 sm:px-6 sm:text-[11px]">Revenue</th>
                <th className="px-5 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest text-emerald-600/50 sm:px-6 sm:text-[11px]">Expenses</th>
                <th className="px-5 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest text-emerald-600/50 sm:px-6 sm:text-[11px]">Net Burn</th>
                <th className="hidden px-5 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest text-emerald-600/50 sm:table-cell sm:px-6 sm:text-[11px]">Trend</th>
              </tr>
            </thead>
            <tbody>
              {data.monthlyBreakdown.map((row, i) => (
                <motion.tr key={row.month}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(16,185,129,0.03)' }}
                  className="border-b border-emerald-50 last:border-0">
                  <td className="px-5 py-3 text-[12px] font-medium text-emerald-900 sm:px-6 sm:text-[13px]">{row.month}</td>
                  <td className="px-5 py-3 text-right text-[12px] font-medium tabular-nums text-emerald-600 sm:px-6 sm:text-[13px]">+${row.revenue.toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-[12px] tabular-nums text-emerald-800/60 sm:px-6 sm:text-[13px]">${row.expenses.toLocaleString()}</td>
                  <td className={cn('px-5 py-3 text-right text-[12px] font-semibold tabular-nums sm:px-6 sm:text-[13px]',
                    row.netBurn < 0 ? 'text-emerald-500' : row.netBurn < (data.monthlyBurnRate) ? 'text-amber-500' : 'text-rose-500')}>
                    {row.netBurn > 0 ? '-' : '+'}${Math.abs(row.netBurn).toLocaleString()}
                  </td>
                  <td className="hidden px-5 py-3 sm:table-cell sm:px-6">
                    <div className="flex justify-end">
                      <div className="h-1.5 rounded-full bg-emerald-100" style={{ width: '60px' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (Math.max(0, row.netBurn) / (maxBurn || 1)) * 100)}%` }}
                          transition={{ duration: 0.6, delay: 1 + i * 0.08 }}
                          className={cn('h-full rounded-full', row.netBurn < 0 ? 'bg-emerald-400' : row.netBurn < data.monthlyBurnRate ? 'bg-amber-400' : 'bg-rose-400')} />
                      </div>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
