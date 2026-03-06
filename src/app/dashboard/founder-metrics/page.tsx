'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Target, TrendingUp, Scissors, Calendar, AlertTriangle,
    ArrowDownRight, DollarSign, Users, BarChart3, ShieldCheck,
    ShieldAlert, Timer, Rocket,
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { getAnalysis } from '@/lib/sessionStore';
import { AnalysisResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.92 }, show: { opacity: 1, scale: 1, transition: { duration: 0.5 } } };

/* ─── Skeleton ─── */
function MetricsSkeleton() {
    return (
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            <div className="mb-6 h-8 w-64 animate-pulse rounded-md bg-emerald-100 sm:mb-8" />
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-32 animate-pulse rounded-xl bg-emerald-50" />)}
            </div>
            <div className="h-80 animate-pulse rounded-xl bg-emerald-50" />
        </div>
    );
}

/* ─── KPI Tile ─── */
function KPITile({ label, value, subtitle, icon: Icon, color, badge }: {
    label: string; value: string; subtitle?: string;
    icon: React.ElementType; color: string; badge?: { text: string; variant: string };
}) {
    return (
        <motion.div variants={fadeUp}
            whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(16,185,129,0.12)' }}
            className="rounded-xl border border-emerald-200/60 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between">
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg shadow-md', color)}>
                    <Icon className="h-4 w-4 text-white" strokeWidth={2} />
                </div>
                {badge && (
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold', badge.variant)}>
                        {badge.text}
                    </span>
                )}
            </div>
            <p className="mt-3 text-[10px] font-bold uppercase tracking-wider text-emerald-600/50 sm:text-[11px]">{label}</p>
            <p className="mt-1 text-xl font-light tabular-nums text-emerald-950 sm:text-2xl">{value}</p>
            {subtitle && <p className="mt-0.5 text-[10px] text-emerald-600/40 sm:text-[11px]">{subtitle}</p>}
        </motion.div>
    );
}

/* ─── Custom Tooltip ─── */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
    if (!active || !payload) return null;
    const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
    return (
        <div className="rounded-lg border border-emerald-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm">
            <p className="mb-1 text-[11px] font-bold text-emerald-800">{label}</p>
            {payload.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-emerald-600">{p.name}:</span>
                    <span className={cn('font-semibold', p.value < 0 ? 'text-rose-500' : 'text-emerald-700')}>{fmt(p.value)}</span>
                </div>
            ))}
        </div>
    );
}

/* ─── Page ─── */
export default function FounderMetricsPage() {
    const [data, setData] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const analysis = getAnalysis();
        if (!analysis) {
            router.push('/upload');
        } else {
            setData(analysis);
            setLoading(false);
        }
    }, [router]);

    if (loading || !data) return <MetricsSkeleton />;

    const fm = data.founderMetrics;
    const cf = data.cashFlowForecast;
    const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

    // Build chart data
    const chartData = cf?.months?.map((month, i) => ({
        month,
        best: cf.bestCase[i],
        base: cf.baseCase[i],
        worst: cf.worstCase[i],
    })) || [];

    // Default safe values if founder metrics don't exist yet
    const grossMargin = fm?.grossMargin ?? 0;
    const opExRatio = fm?.opExRatio ?? 0;
    const revenuePerEmployee = fm?.revenuePerEmployee ?? 0;
    const estimatedHeadcount = fm?.estimatedHeadcount ?? 1;
    const payrollToRevenueRatio = fm?.payrollToRevenueRatio ?? 0;
    const isDefaultAlive = fm?.isDefaultAlive ?? false;
    const defaultAliveVerdict = fm?.defaultAliveVerdict ?? 'Insufficient data';
    const costCuttingOpportunities = fm?.costCuttingOpportunities ?? [];
    const cashZeroDate = cf?.cashZeroDate ?? null;
    const fundraisingDeadline = cf?.fundraisingDeadline ?? null;
    const monthsToProfitability = cf?.monthsToProfitability ?? null;
    const revenueGrowthRate = data.revenueGrowthRate ?? 0;

    const grossMarginColor = grossMargin >= 70 ? 'emerald' : grossMargin >= 40 ? 'amber' : 'rose';
    const opExColor = opExRatio <= 120 ? 'emerald' : opExRatio <= 200 ? 'amber' : 'rose';

    return (
        <motion.div variants={container} initial="hidden" animate="show"
            className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

            {/* ── Header ── */}
            <motion.div variants={fadeUp} className="mb-6 sm:mb-8">
                <div className="flex items-center gap-2">
                    <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}>
                        <Target className="h-5 w-5 text-emerald-600" />
                    </motion.div>
                    <h1 className="text-lg font-bold tracking-tight text-emerald-950 sm:text-xl">Founder Metrics</h1>
                </div>
                <p className="mt-0.5 text-[13px] text-emerald-700/40">
                    The metrics that decide if your startup survives. No vanity — pure signal.
                </p>
            </motion.div>

            {/* ── KPI Row ── */}
            <motion.div variants={container} className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                <KPITile
                    label="Gross Margin"
                    value={`${grossMargin}%`}
                    subtitle={grossMargin >= 70 ? 'SaaS-grade margin' : grossMargin >= 40 ? 'Below SaaS benchmark (70%)' : 'Dangerously low margin'}
                    icon={BarChart3}
                    color={`bg-gradient-to-br from-${grossMarginColor}-400 to-${grossMarginColor}-600`}
                    badge={{ text: grossMargin >= 70 ? 'HEALTHY' : grossMargin >= 40 ? 'WATCH' : 'CRITICAL', variant: grossMargin >= 70 ? 'bg-emerald-50 text-emerald-600' : grossMargin >= 40 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600' }}
                />
                <KPITile
                    label="Default Alive"
                    value={isDefaultAlive ? 'YES' : 'NO'}
                    subtitle="Paul Graham's survival test"
                    icon={isDefaultAlive ? ShieldCheck : ShieldAlert}
                    color={isDefaultAlive ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-rose-400 to-rose-600'}
                    badge={{ text: isDefaultAlive ? 'ALIVE' : 'AT RISK', variant: isDefaultAlive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600' }}
                />
                <KPITile
                    label="OpEx Ratio"
                    value={`${opExRatio > 999 ? '∞' : opExRatio}%`}
                    subtitle={opExRatio <= 100 ? 'Spending less than revenue' : 'Spending exceeds revenue'}
                    icon={DollarSign}
                    color={`bg-gradient-to-br from-${opExColor}-400 to-${opExColor}-600`}
                />
                <KPITile
                    label="Revenue / Employee"
                    value={fmt(revenuePerEmployee)}
                    subtitle={`~${estimatedHeadcount} employees estimated`}
                    icon={Users}
                    color="bg-gradient-to-br from-teal-400 to-teal-600"
                />
                <KPITile
                    label="Revenue Growth"
                    value={`${revenueGrowthRate > 0 ? '+' : ''}${revenueGrowthRate}%`}
                    subtitle="Month-over-month"
                    icon={TrendingUp}
                    color={revenueGrowthRate > 0 ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-rose-400 to-rose-600'}
                    badge={revenueGrowthRate >= 15 ? { text: 'STRONG', variant: 'bg-emerald-50 text-emerald-600' } : undefined}
                />
            </motion.div>

            {/* ── Default Alive Explanation ── */}
            <motion.div variants={fadeUp}
                className={cn(
                    'mb-4 rounded-xl border p-4 shadow-sm sm:p-5',
                    isDefaultAlive
                        ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-white'
                        : 'border-rose-200 bg-gradient-to-r from-rose-50 to-white'
                )}>
                <div className="flex items-start gap-3">
                    <div className={cn('mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg', isDefaultAlive ? 'bg-emerald-100' : 'bg-rose-100')}>
                        {isDefaultAlive ? <Rocket className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-rose-500" />}
                    </div>
                    <div>
                        <p className={cn('text-[11px] font-bold uppercase tracking-widest', isDefaultAlive ? 'text-emerald-600' : 'text-rose-600')}>
                            Default Alive Analysis
                        </p>
                        <p className="mt-1 text-[13px] font-medium leading-relaxed text-emerald-900">{defaultAliveVerdict}</p>
                    </div>
                </div>
            </motion.div>

            {/* ── Two Column: Cash Flow Chart + Fundraising Timeline ── */}
            <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Cash Flow Projection Chart */}
                <motion.div variants={scaleIn}
                    className="rounded-xl border border-emerald-200/60 bg-white p-4 shadow-sm sm:p-5 lg:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-emerald-950">12-Month Cash Flow Projection</p>
                            <p className="mt-0.5 text-[11px] text-emerald-600/40">Three scenarios based on your historical trends</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-[10px] text-emerald-500"><span className="inline-block h-2 w-2 rounded-full bg-emerald-400" /> Best</span>
                            <span className="flex items-center gap-1 text-[10px] text-amber-500"><span className="inline-block h-2 w-2 rounded-full bg-amber-400" /> Base</span>
                            <span className="flex items-center gap-1 text-[10px] text-rose-400"><span className="inline-block h-2 w-2 rounded-full bg-rose-400" /> Worst</span>
                        </div>
                    </div>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="bestGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="worstGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f87171" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false}
                                    tickFormatter={(v) => v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} />
                                <Tooltip content={<ChartTooltip />} />
                                <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="6 4" strokeWidth={2} label={{ value: 'CASH ZERO', fill: '#ef4444', fontSize: 10, fontWeight: 700, position: 'right' }} />
                                <Area type="monotone" dataKey="best" name="Best Case" stroke="#34d399" fill="url(#bestGrad)" strokeWidth={2} dot={false} />
                                <Area type="monotone" dataKey="base" name="Base Case" stroke="#fbbf24" fill="url(#baseGrad)" strokeWidth={2.5} dot={false} />
                                <Area type="monotone" dataKey="worst" name="Worst Case" stroke="#f87171" fill="url(#worstGrad)" strokeWidth={2} dot={false} strokeDasharray="4 2" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-64 items-center justify-center text-[13px] text-emerald-600/40">
                            Not enough monthly data for projection
                        </div>
                    )}
                </motion.div>

                {/* Fundraising & Timeline Card */}
                <motion.div variants={scaleIn}
                    className="flex flex-col gap-3 sm:gap-4">

                    {/* Cash Zero */}
                    <div className={cn(
                        'rounded-xl border p-4 shadow-sm sm:p-5',
                        cashZeroDate ? 'border-rose-200 bg-gradient-to-br from-rose-50 to-white' : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white'
                    )}>
                        <div className="flex items-center gap-2">
                            <Timer className={cn('h-4 w-4', cashZeroDate ? 'text-rose-500' : 'text-emerald-500')} />
                            <span className={cn('text-[12px] font-bold', cashZeroDate ? 'text-rose-700' : 'text-emerald-700')}>Cash-Zero Date</span>
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.p key={cashZeroDate || 'none'} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className={cn('mt-2 text-2xl font-light sm:text-3xl', cashZeroDate ? 'text-rose-600' : 'text-emerald-600')}>
                                {cashZeroDate || 'Not in sight'}
                            </motion.p>
                        </AnimatePresence>
                        <p className="mt-1 text-[10px] text-emerald-600/40">Based on base-case projection</p>
                    </div>

                    {/* Fundraise Deadline */}
                    <div className={cn(
                        'rounded-xl border p-4 shadow-sm sm:p-5',
                        fundraisingDeadline ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-white' : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white'
                    )}>
                        <div className="flex items-center gap-2">
                            <Calendar className={cn('h-4 w-4', fundraisingDeadline ? 'text-amber-500' : 'text-emerald-500')} />
                            <span className={cn('text-[12px] font-bold', fundraisingDeadline ? 'text-amber-700' : 'text-emerald-700')}>Fundraising Deadline</span>
                        </div>
                        <p className={cn('mt-2 text-lg font-medium sm:text-xl', fundraisingDeadline ? 'text-amber-600' : 'text-emerald-600')}>
                            {fundraisingDeadline || 'No urgency'}
                        </p>
                        <p className="mt-1 text-[10px] text-emerald-600/40">Start raising 6 months before cash-zero</p>
                    </div>

                    {/* Profitability */}
                    <div className="rounded-xl border border-emerald-200/60 bg-gradient-to-br from-teal-50 to-white p-4 shadow-sm sm:p-5">
                        <div className="flex items-center gap-2">
                            <Rocket className="h-4 w-4 text-teal-500" />
                            <span className="text-[12px] font-bold text-teal-700">Months to Profitability</span>
                        </div>
                        <p className="mt-2 text-2xl font-light tabular-nums text-teal-600 sm:text-3xl">
                            {monthsToProfitability ? `${monthsToProfitability} mo` : 'N/A'}
                        </p>
                        <p className="mt-1 text-[10px] text-emerald-600/40">At current growth trajectory</p>
                    </div>
                </motion.div>
            </div>

            {/* ── Cost Optimization Table ── */}
            {costCuttingOpportunities.length > 0 && (
                <motion.div variants={fadeUp}
                    className="rounded-xl border border-emerald-200/60 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-emerald-100 px-4 py-3 sm:px-5 sm:py-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <Scissors className="h-4 w-4 text-emerald-500" />
                                <h2 className="text-sm font-bold text-emerald-950">Cost Optimization Opportunities</h2>
                            </div>
                            <p className="mt-0.5 text-[11px] text-emerald-600/40">What happens if you cut each category by 20%</p>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                            Ranked by runway impact
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[500px]">
                            <thead>
                                <tr className="border-b border-emerald-100 bg-emerald-50/30">
                                    <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest text-emerald-600/50 sm:px-5 sm:text-[11px]">Category</th>
                                    <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest text-emerald-600/50 sm:px-5 sm:text-[11px]">Monthly Spend</th>
                                    <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest text-emerald-600/50 sm:px-5 sm:text-[11px]">20% Saving</th>
                                    <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-widest text-emerald-600/50 sm:px-5 sm:text-[11px]">Runway Gained</th>
                                    <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-widest text-emerald-600/50 sm:px-5 sm:text-[11px]">Priority</th>
                                </tr>
                            </thead>
                            <tbody>
                                {costCuttingOpportunities.map((opp, i) => (
                                    <motion.tr key={opp.category}
                                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + i * 0.06 }}
                                        whileHover={{ backgroundColor: 'rgba(16,185,129,0.03)' }}
                                        className="border-b border-emerald-50 last:border-0">
                                        <td className="px-4 py-3 sm:px-5">
                                            <div className="flex items-center gap-2">
                                                <ArrowDownRight className={cn('h-3.5 w-3.5',
                                                    opp.priority === 'HIGH' ? 'text-rose-400' : opp.priority === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400')} />
                                                <span className="text-[12px] font-medium text-emerald-900 sm:text-[13px]">{opp.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right text-[12px] tabular-nums text-emerald-800/60 sm:px-5 sm:text-[13px]">
                                            {fmt(opp.currentMonthly)}/mo
                                        </td>
                                        <td className="px-4 py-3 text-right text-[12px] font-medium tabular-nums text-emerald-600 sm:px-5 sm:text-[13px]">
                                            {fmt(opp.potentialSaving)}/mo
                                        </td>
                                        <td className="px-4 py-3 text-right text-[12px] font-semibold tabular-nums sm:px-5 sm:text-[13px]">
                                            <span className={cn(
                                                opp.runwayImpactMonths >= 1 ? 'text-emerald-600' : opp.runwayImpactMonths >= 0.3 ? 'text-amber-600' : 'text-emerald-500'
                                            )}>
                                                +{opp.runwayImpactMonths} mo
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center sm:px-5">
                                            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold',
                                                opp.priority === 'HIGH' ? 'bg-rose-50 text-rose-600' :
                                                    opp.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600' :
                                                        'bg-emerald-50 text-emerald-600')}>
                                                {opp.priority}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* ── Payroll Health Bar ── */}
            <motion.div variants={fadeUp} className="mt-4 rounded-xl border border-emerald-200/60 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-bold text-emerald-950">Payroll Health</span>
                    </div>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold',
                        payrollToRevenueRatio <= 50 ? 'bg-emerald-50 text-emerald-600' :
                            payrollToRevenueRatio <= 70 ? 'bg-amber-50 text-amber-600' :
                                'bg-rose-50 text-rose-600')}>
                        {payrollToRevenueRatio <= 50 ? 'HEALTHY' : payrollToRevenueRatio <= 70 ? 'HIGH' : 'CRITICAL'}
                    </span>
                </div>
                <div className="mt-3 flex items-end gap-3">
                    <span className="text-3xl font-light tabular-nums text-emerald-950">{payrollToRevenueRatio}%</span>
                    <span className="mb-1 text-[12px] text-emerald-600/40">of revenue goes to payroll</span>
                </div>
                <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-emerald-100">
                    <motion.div
                        className={cn('h-full rounded-full',
                            payrollToRevenueRatio <= 50 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                                payrollToRevenueRatio <= 70 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                                    'bg-gradient-to-r from-rose-400 to-rose-500')}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, payrollToRevenueRatio)}%` }}
                        transition={{ duration: 1.2, delay: 0.5 }}
                    />
                </div>
                <div className="mt-1 flex justify-between text-[10px] font-medium text-emerald-600/40">
                    <span>0% (no payroll)</span>
                    <span>50% (healthy)</span>
                    <span>100%</span>
                </div>
            </motion.div>
        </motion.div>
    );
}
