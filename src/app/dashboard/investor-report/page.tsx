'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FileBarChart2, Download, Clock, DollarSign, TrendingDown, TrendingUp,
  ShieldCheck, BarChart3, PieChart, Banknote, Printer, Target, Rocket,
  Timer, Activity, Users, AlertTriangle, CheckCircle,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell,
} from 'recharts';
import { getAnalysis } from '@/lib/sessionStore';
import { AnalysisResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

function ReportSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 h-8 w-48 animate-pulse rounded-md bg-emerald-100 sm:mb-8" />
      <div className="h-96 animate-pulse rounded-xl bg-emerald-50" />
    </div>
  );
}

/* Custom Tooltip */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-emerald-200 bg-white p-2.5 shadow-lg">
      <p className="text-[11px] font-bold text-emerald-900">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-[10px]">
          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-emerald-700">{p.name}:</span>
          <span className="font-bold" style={{ color: p.color }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function InvestorReportPage() {
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const analysis = getAnalysis();
    if (!analysis) router.push('/upload');
    else setData(analysis);
  }, [router]);

  /* ─── NATIVE PDF Export (Matching Corporate Format) ─── */
  const exportPDF = useCallback(async () => {
    if (!data) return;
    setExporting(true);
    try {
      const [{ jsPDF }, autoTableModule] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable')
      ]);
      const autoTable = autoTableModule.default;

      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      
      // Top Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(33, 37, 41);
      doc.text('Investment Performance Report', 14, 20);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), 14, 26);
      
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('Best Dynamic PDF Generation', pageWidth - 14, 20, { align: 'right' });
      
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 30, pageWidth - 14, 30);

      const leftColWidth = 125;
      const rightColX = 148;
      
      // --- Right Column: Summary Panel ---
      doc.setFillColor(248, 250, 248);
      doc.rect(rightColX - 5, 30, pageWidth - rightColX + 5, pageHeight - 30, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(33, 37, 41);
      doc.text('Summary', rightColX, 42);
      
      let summaryY = 52;
      const summaryMetrics = [
        { label: 'Company', value: 'Generated via BurnSight' },
        { label: 'Sponsor', value: 'BurnSight Auto-Analytics' },
        { label: 'Cash in Bank', value: fmt(data.cashBalance) },
        { label: 'Monthly Burn', value: fmt(data.monthlyBurnRate) },
        { label: 'Monthly Revenue', value: fmt(data.monthlyRevenue) },
        { label: 'Runway', value: data.currentRunwayMonths >= 999 ? 'Infinite' : `${data.currentRunwayMonths.toFixed(1)} months` },
        { label: 'Gross Margin', value: `${data.founderMetrics?.grossMargin ?? 0}%` },
        { label: 'Default Alive', value: data.founderMetrics?.isDefaultAlive ? 'Yes' : 'No' },
        { label: 'OpEx Ratio', value: `${data.founderMetrics?.opExRatio ?? 0}%` },
      ];

      summaryMetrics.forEach(item => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(120, 120, 120);
        doc.text(item.label, rightColX, summaryY);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(33, 37, 41);
        doc.text(String(item.value), rightColX, summaryY + 5);
        summaryY += 12;
      });

      // --- Left Column ---
      
      // Description
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(33, 37, 41);
      doc.text('Description', 14, 42);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const desc = `The company currently holds ${fmt(data.cashBalance)} in cash with a monthly net burn rate of ${fmt(data.monthlyBurnRate)}, providing an estimated runway of ${data.currentRunwayMonths >= 999 ? 'infinite' : data.currentRunwayMonths.toFixed(1) + ' months'}. Monthly recurring revenue stands at ${fmt(data.monthlyRevenue)} with a ${data.revenueGrowthRate > 0 ? '+' : ''}${data.revenueGrowthRate}% month-over-month growth rate.\n\nRisk assessment: ${data.riskLevel} (score: ${data.riskScore}/100). The company is currently ${data.founderMetrics?.isDefaultAlive ? 'Default Alive' : 'Default Dead'} — ${data.founderMetrics?.defaultAliveVerdict || 'based on current trajectory.'} Gross margin is ${data.founderMetrics?.grossMargin ?? 0}%.`;
      const splitDesc = doc.splitTextToSize(desc, leftColWidth);
      doc.text(splitDesc, 14, 48);
      
      let cursorY = 48 + (splitDesc.length * 4) + 12;
      
      // Breakdown data avg logic
      const breakdown = data.monthlyBreakdown || [];
      const last3 = breakdown.slice(-3);
      const last6 = breakdown.slice(-6);
      const avgOf = (arr: any[], key: string) => arr.length ? Math.round(arr.reduce((s, r) => s + r[key], 0) / arr.length) : 0;
      const pRows = [
        { period: 'Last 3 Months', revenue: avgOf(last3, 'revenue'), expenses: avgOf(last3, 'expenses'), netBurn: avgOf(last3, 'netBurn') },
        { period: 'Last 6 Months', revenue: avgOf(last6, 'revenue'), expenses: avgOf(last6, 'expenses'), netBurn: avgOf(last6, 'netBurn') },
        { period: 'All Time Avg', revenue: avgOf(breakdown, 'revenue'), expenses: avgOf(breakdown, 'expenses'), netBurn: avgOf(breakdown, 'netBurn') },
      ];

      // Performance Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(33, 37, 41);
      doc.text('Performance Table', 14, cursorY);
      
      autoTable(doc, {
        startY: cursorY + 4,
        margin: { left: 14, right: pageWidth - leftColWidth - 14 },
        tableWidth: leftColWidth,
        head: [['Period', 'Revenue', 'Expenses', 'Net Burn']],
        body: pRows.map(r => [r.period, fmt(r.revenue), fmt(r.expenses), fmt(r.netBurn)]),
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 8 },
      });
      // @ts-ignore
      cursorY = doc.lastAutoTable.finalY + 12;

      // Risk Table
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(33, 37, 41);
      doc.text('Risk Table', 14, cursorY);
      
      autoTable(doc, {
        startY: cursorY + 4,
        margin: { left: 14, right: pageWidth - leftColWidth - 14 },
        tableWidth: leftColWidth,
        head: [['Metric', 'Value']],
        body: [
          ['Overall Risk', `${data.riskScore}/100`],
          ['Bankruptcy Prob (90d)', `${(data.founderMetrics?.opExRatio ?? 0) > 100 ? 'High' : 'Low'}`],
          ['Burn Trend', data.monthlyBurnRate > data.monthlyRevenue ? 'Negative' : 'Positive'],
          ['Revenue Coverage', `${data.monthlyRevenue > 0 ? Math.round((data.monthlyRevenue / (data.monthlyBurnRate + data.monthlyRevenue)) * 100) : 0}%`],
        ],
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 8 },
      });
      // @ts-ignore
      cursorY = doc.lastAutoTable.finalY + 12;
      
      // Top Holding (Top Expenses)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(33, 37, 41);
      doc.text('Top Holdings (Expenses)', 14, cursorY);
      
      autoTable(doc, {
        startY: cursorY + 4,
        margin: { left: 14, right: pageWidth - leftColWidth - 14 },
        tableWidth: leftColWidth,
        head: [['Name', 'Type', 'Weight']],
        body: (data.topExpenseCategories || []).map(e => [
          e.category, fmt(e.amount) + '/mo', `${e.percentOfTotal}%`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 8 },
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('Legal notice goes here and other fun things / BurnSight PDF', 14, pageHeight - 10);

      doc.save(`Investment_Performance_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  }, [data]);

  if (!data) return <ReportSkeleton />;

  const reportDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const barColors = ['#10b981', '#14b8a6', '#f59e0b', '#34d399', '#f87171', '#06b6d4', '#a78bfa'];

  /* Summary items for left panel */
  const summaryItems = [
    { label: 'Report Period', value: reportDate },
    { label: 'Cash in Bank', value: fmt(data.cashBalance) },
    { label: 'Monthly Burn', value: fmt(data.monthlyBurnRate) },
    { label: 'Monthly Revenue', value: fmt(data.monthlyRevenue) },
    { label: 'Runway', value: data.currentRunwayMonths >= 999 ? '∞ months' : `${data.currentRunwayMonths.toFixed(1)} months` },
    { label: 'Risk Level', value: data.riskLevel },
    { label: 'Gross Margin', value: `${data.founderMetrics?.grossMargin ?? 0}%` },
    { label: 'Revenue Growth', value: `${data.revenueGrowthRate > 0 ? '+' : ''}${data.revenueGrowthRate}% MoM` },
    { label: 'Default Alive', value: data.founderMetrics?.isDefaultAlive ? 'Yes' : 'No' },
    { label: 'Cash-Zero Date', value: data.cashFlowForecast?.cashZeroDate || 'N/A' },
    { label: 'Est. Headcount', value: `${data.founderMetrics?.estimatedHeadcount ?? 'N/A'}` },
    { label: 'OpEx Ratio', value: `${data.founderMetrics?.opExRatio ?? 0}%` },
  ];

  /* Performance table data */
  const breakdown = data.monthlyBreakdown || [];
  const last3 = breakdown.slice(-3);
  const last6 = breakdown.slice(-6);
  const allData = breakdown;

  const avgOf = (arr: typeof breakdown, key: 'revenue' | 'expenses' | 'netBurn') =>
    arr.length ? Math.round(arr.reduce((s, r) => s + r[key], 0) / arr.length) : 0;

  const perfRows = [
    { period: 'Last 3 Months', revenue: avgOf(last3, 'revenue'), expenses: avgOf(last3, 'expenses'), netBurn: avgOf(last3, 'netBurn') },
    { period: 'Last 6 Months', revenue: avgOf(last6, 'revenue'), expenses: avgOf(last6, 'expenses'), netBurn: avgOf(last6, 'netBurn') },
    { period: 'All Time Avg', revenue: avgOf(allData, 'revenue'), expenses: avgOf(allData, 'expenses'), netBurn: avgOf(allData, 'netBurn') },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 print:p-0 print:m-0 print:max-w-none">

      {/* ── Action Bar ── */}
      <motion.div variants={fadeUp} className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
              <FileBarChart2 className="h-5 w-5 text-emerald-600" />
            </motion.div>
            <h1 className="text-lg font-bold tracking-tight text-emerald-950 sm:text-xl">Investor Report</h1>
          </div>
          <p className="mt-0.5 text-[13px] text-emerald-700/40">VC-ready financial summary from real transaction data.</p>
        </div>
        <div className="flex gap-2 self-start">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-[12px] font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50 sm:text-[13px]">
            <Printer className="h-3.5 w-3.5" /> Print
          </motion.button>
          <motion.button whileHover={{ scale: 1.03, boxShadow: '0 8px 25px rgba(16,185,129,0.25)' }} whileTap={{ scale: 0.97 }}
            onClick={exportPDF}
            disabled={exporting}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-2 text-[12px] font-bold text-white shadow-md shadow-emerald-500/25 sm:text-[13px] disabled:opacity-60 print:hidden">
            <Download className={cn("h-3.5 w-3.5", exporting && "animate-bounce")} />
            {exporting ? 'Generating...' : 'Save as PDF'}
          </motion.button>
        </div>
      </motion.div>

      {/* ━━━ REPORT BODY (captured for PDF) ━━━ */}
      <div ref={reportRef} className="bg-white print:w-[210mm] print:h-[297mm] print:overflow-hidden print:[&_*]:!leading-tight print:text-[8px] print:mx-auto">

        {/* ── Green Header Banner ── */}
        <div className="rounded-t-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-6 py-5 sm:px-8 sm:py-6 print:py-3 print:px-5 print:rounded-none" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white sm:text-2xl">Investor Performance Report</h2>
              <p className="mt-1 text-[13px] text-emerald-100">{reportDate}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
                <Banknote className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold text-white">BurnSight</p>
                <p className="text-[10px] text-emerald-200">Automated Analysis</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Content: Sidebar + Right Panel ── */}
        <div className="flex flex-col border border-t-0 border-emerald-200/60 lg:flex-row">

          {/* LEFT SIDEBAR - Summary */}
          <div className="w-full border-b border-emerald-100 bg-emerald-50/30 lg:w-72 lg:border-b-0 lg:border-r xl:w-80 print:w-1/3 print:border-b-0 print:border-r">
            <div className="border-b border-emerald-100 px-5 py-3 print:py-1.5 print:px-3">
              <h3 className="text-[13px] font-bold text-emerald-900 print:text-[11px]">Summary</h3>
            </div>
            <div className="divide-y divide-emerald-100">
              {summaryItems.map((item) => (
                <div key={item.label} className="flex items-start justify-between gap-2 px-5 py-2.5 print:py-1 print:px-3">
                  <span className="text-[11px] font-bold text-emerald-700/60 print:text-[8px]">{item.label}</span>
                  <span className={cn('text-right text-[11px] font-semibold print:text-[8px]',
                    item.label === 'Risk Level'
                      ? item.value === 'SAFE' ? 'text-emerald-600' : item.value === 'WARNING' ? 'text-amber-600' : 'text-rose-600'
                      : item.label === 'Default Alive'
                        ? item.value === 'Yes' ? 'text-emerald-600' : 'text-rose-600'
                        : 'text-emerald-900'
                  )}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Fundraising Deadline */}
            {data.cashFlowForecast?.fundraisingDeadline && (
              <div className="border-t border-emerald-100 px-5 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">⚠️ Fundraising Deadline</p>
                <p className="mt-1 text-[12px] font-semibold text-amber-700">{data.cashFlowForecast.fundraisingDeadline}</p>
                <p className="mt-0.5 text-[10px] text-emerald-600/40">Must raise by this date to maintain 6mo runway</p>
              </div>
            )}
          </div>

          {/* RIGHT CONTENT */}
          <div className="flex-1 divide-y divide-emerald-100">

            {/* Executive Summary */}
            <div className="px-5 py-5 sm:px-7 print:py-2 print:px-4">
              <h3 className="mb-3 flex items-center gap-2 text-[14px] font-bold text-emerald-950 print:mb-1 print:text-[11px]">
                <Activity className="h-4 w-4 text-emerald-500 print:h-3 print:w-3" /> Executive Summary
              </h3>
              <div className="space-y-2 text-[12px] leading-relaxed text-emerald-800/70 print:text-[8px] print:leading-snug print:space-y-1">
                <p>
                  The company currently holds <strong className="text-emerald-900">{fmt(data.cashBalance)}</strong> in cash with
                  a monthly net burn rate of <strong className="text-emerald-900">{fmt(data.monthlyBurnRate)}</strong>,
                  providing an estimated runway of <strong className="text-emerald-900">{data.currentRunwayMonths >= 999 ? 'infinite' : `${data.currentRunwayMonths.toFixed(1)} months`}</strong>.
                  Monthly recurring revenue stands at <strong className="text-emerald-900">{fmt(data.monthlyRevenue)}</strong> with
                  a <strong className="text-emerald-900">{data.revenueGrowthRate > 0 ? '+' : ''}{data.revenueGrowthRate}%</strong> month-over-month growth rate.
                </p>
                <p>
                  Risk assessment: <strong className={cn(
                    data.riskLevel === 'SAFE' ? 'text-emerald-600' : data.riskLevel === 'WARNING' ? 'text-amber-600' : 'text-rose-600'
                  )}>{data.riskLevel}</strong> (score: {data.riskScore}/100).
                  The company is currently <strong className={cn(
                    data.founderMetrics?.isDefaultAlive ? 'text-emerald-600' : 'text-rose-600'
                  )}>
                    {data.founderMetrics?.isDefaultAlive ? 'Default Alive' : 'Default Dead'}
                  </strong> — {data.founderMetrics?.defaultAliveVerdict || 'based on current growth and burn trajectory.'}.
                  Gross margin is <strong className="text-emerald-900">{data.founderMetrics?.grossMargin ?? 0}%</strong>.
                </p>
              </div>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-2 gap-px bg-emerald-100 sm:grid-cols-4">
              {[
                { l: 'Cash Balance', v: fmt(data.cashBalance), icon: DollarSign, c: 'text-emerald-600' },
                { l: 'Monthly Burn', v: fmt(data.monthlyBurnRate), icon: TrendingDown, c: data.monthlyBurnRate > 0 ? 'text-rose-500' : 'text-emerald-500' },
                { l: 'Runway', v: data.currentRunwayMonths >= 999 ? '∞ mo' : `${data.currentRunwayMonths.toFixed(1)} mo`, icon: Clock, c: 'text-emerald-600' },
                { l: 'Risk Score', v: `${data.riskScore}/100`, icon: ShieldCheck, c: data.riskLevel === 'SAFE' ? 'text-emerald-600' : data.riskLevel === 'WARNING' ? 'text-amber-500' : 'text-rose-500' },
              ].map((k) => (
                <div key={k.l} className="bg-white p-3 sm:p-4">
                  <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-emerald-600/50 sm:text-[10px]">
                    <k.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {k.l}
                  </div>
                  <p className={cn('mt-1 text-xl font-light tabular-nums sm:text-2xl', k.c)}>{k.v}</p>
                </div>
              ))}
            </div>

            {/* Revenue vs Expenses Chart */}
            <div className="px-5 py-5 sm:px-7 print:py-2 print:px-4">
              <h3 className="mb-4 flex items-center gap-2 text-[13px] font-bold text-emerald-950 print:mb-1 print:text-[10px]">
                <BarChart3 className="h-4 w-4 text-emerald-500 print:h-3 print:w-3" /> Revenue vs Expenses Trend
              </h3>
              <div className="h-52 sm:h-60 print:h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={breakdown} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6ee7b7' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#6ee7b7' }} tickLine={false} axisLine={false}
                      tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} width={50} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#f87171" strokeWidth={2} dot={{ r: 2.5 }} strokeDasharray="4 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance + Risk Tables (side by side) */}
            <div className="grid grid-cols-1 gap-px bg-emerald-100 md:grid-cols-2 print:grid-cols-2 lg:bg-transparent">
              {/* Performance Table */}
              <div className="bg-white px-5 py-4 sm:px-7 print:py-2 print:px-4 print:border-r print:border-emerald-100">
                <h3 className="mb-3 text-[13px] font-bold text-emerald-950 print:mb-1 print:text-[10px]">Performance Table</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-emerald-100">
                      <th className="pb-2 text-left text-[10px] font-bold uppercase tracking-wider text-emerald-600/50">Period</th>
                      <th className="pb-2 text-right text-[10px] font-bold uppercase tracking-wider text-emerald-500">Revenue</th>
                      <th className="pb-2 text-right text-[10px] font-bold uppercase tracking-wider text-rose-400">Expenses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {perfRows.map(r => (
                      <tr key={r.period} className="border-b border-emerald-50 last:border-0">
                        <td className="py-2 text-[11px] font-medium text-emerald-800">{r.period}</td>
                        <td className="py-2 text-right text-[11px] font-semibold tabular-nums text-emerald-600">{fmt(r.revenue)}</td>
                        <td className="py-2 text-right text-[11px] tabular-nums text-rose-400">{fmt(r.expenses)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Risk Table */}
              <div className="bg-white px-5 py-4 sm:px-7 print:py-2 print:px-4">
                <h3 className="mb-3 text-[13px] font-bold text-emerald-950 print:mb-1 print:text-[10px]">Risk Assessment</h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-emerald-100">
                      <th className="pb-2 text-left text-[10px] font-bold uppercase tracking-wider text-emerald-600/50">Metric</th>
                      <th className="pb-2 text-right text-[10px] font-bold uppercase tracking-wider text-emerald-500">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { m: 'Overall Risk', v: `${data.riskScore}/100` },
                      { m: 'Bankruptcy Prob (90d)', v: `${(data.founderMetrics?.opExRatio ?? 0) > 100 ? 'High' : 'Low'}` },
                      { m: 'Burn Trend', v: data.monthlyBurnRate > data.monthlyRevenue ? 'Negative' : 'Positive' },
                      { m: 'Revenue Coverage', v: `${data.monthlyRevenue > 0 ? Math.round((data.monthlyRevenue / (data.monthlyBurnRate + data.monthlyRevenue)) * 100) : 0}%` },
                      { m: 'Payroll/Revenue', v: `${data.founderMetrics?.payrollToRevenueRatio ?? 0}%` },
                    ].map(r => (
                      <tr key={r.m} className="border-b border-emerald-50 last:border-0">
                        <td className="py-2 text-[11px] font-medium text-emerald-800">{r.m}</td>
                        <td className="py-2 text-right text-[11px] font-semibold tabular-nums text-emerald-600">{r.v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Monthly Cash Flow Bar Chart */}
            <div className="px-5 py-5 sm:px-7 print:hidden">
              <h3 className="mb-4 flex items-center gap-2 text-[13px] font-bold text-emerald-950">
                <PieChart className="h-4 w-4 text-teal-500" /> Monthly Cash Flow
              </h3>
              <div className="h-48 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={breakdown} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6ee7b7' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#6ee7b7' }} tickLine={false} axisLine={false}
                      tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} width={50} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="netBurn" name="Net Burn" radius={[4, 4, 0, 0]}>
                      {breakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.netBurn > 0 ? '#fca5a5' : '#6ee7b7'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Expense Categories */}
            <div className="px-5 py-5 sm:px-7 print:py-2 print:px-4">
              <h3 className="mb-3 flex items-center gap-2 text-[13px] font-bold text-emerald-950 print:mb-1 print:text-[10px]">
                <PieChart className="h-4 w-4 text-teal-500 print:h-3 print:w-3" /> Top Expense Categories
              </h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-emerald-100">
                    <th className="pb-2 text-left text-[10px] font-bold uppercase tracking-wider text-emerald-500">Category</th>
                    <th className="pb-2 text-left text-[10px] font-bold uppercase tracking-wider text-emerald-500">Trend</th>
                    <th className="pb-2 text-right text-[10px] font-bold uppercase tracking-wider text-emerald-500">Amount</th>
                    <th className="pb-2 text-right text-[10px] font-bold uppercase tracking-wider text-emerald-500">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topExpenseCategories?.map((e, i) => (
                    <tr key={e.category} className="border-b border-emerald-50 last:border-0">
                      <td className="py-2 text-[11px] font-semibold text-emerald-900">{e.category}</td>
                      <td className="py-2">
                        <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-bold',
                          e.trend === 'increasing' ? 'bg-amber-50 text-amber-600' :
                            e.trend === 'decreasing' ? 'bg-emerald-50 text-emerald-600' :
                              'bg-zinc-50 text-zinc-500')}>
                          {e.trend.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 text-right text-[11px] font-semibold tabular-nums text-emerald-600">{fmt(e.amount)}/mo</td>
                      <td className="py-2 text-right text-[11px] font-bold tabular-nums text-emerald-800">{e.percentOfTotal}%</td>
                    </tr>
                  ))}
                  {data.topExpenseCategories && (
                    <tr className="border-t border-emerald-200">
                      <td className="py-2 text-[11px] font-bold text-emerald-900" colSpan={2}>Total Tracked</td>
                      <td className="py-2 text-right text-[11px] font-bold tabular-nums text-emerald-800">
                        {fmt(data.topExpenseCategories.reduce((s, e) => s + e.amount, 0))}/mo
                      </td>
                      <td className="py-2 text-right text-[11px] font-bold tabular-nums text-emerald-800">
                        {data.topExpenseCategories.reduce((s, e) => s + e.percentOfTotal, 0).toFixed(1)}%
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* AI Board Highlights */}
            {data.aiInsights?.length > 0 && (
              <div className="px-5 py-5 sm:px-7 print:py-2 print:px-4">
                <h3 className="mb-3 flex items-center gap-2 text-[13px] font-bold text-emerald-950 print:mb-1 print:text-[10px]">
                  <BarChart3 className="h-4 w-4 text-emerald-500 print:h-3 print:w-3" /> AI Strategic Insights
                </h3>
                <div className="space-y-3 print:space-y-1">
                  {data.aiInsights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 print:gap-1.5">
                      <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 print:mt-0.5 print:h-1.5 print:w-1.5" />
                      <div>
                        <p className="text-[12px] font-bold text-emerald-900 print:text-[9px]">{h.title}</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-emerald-800/70 print:text-[7px] print:leading-tight">{h.explanation}</p>
                        <div className="mt-1.5 flex flex-wrap gap-2 print:mt-0.5 print:gap-1">
                          <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-600 print:text-[6px] print:px-1 print:py-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                            REC: {h.recommendation}
                          </span>
                          <span className="rounded border border-teal-200 bg-teal-50 px-2 py-0.5 text-[9px] font-bold text-teal-600 print:text-[6px] print:px-1 print:py-0" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
                            IMPACT: {h.impactEstimate}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cost-Cutting Opportunities */}
            {data.founderMetrics?.costCuttingOpportunities?.length > 0 && (
              <div className="px-5 py-5 sm:px-7">
                <h3 className="mb-3 flex items-center gap-2 text-[13px] font-bold text-emerald-950">
                  <Target className="h-4 w-4 text-amber-500" /> Cost Optimization Opportunities
                </h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-emerald-100">
                      <th className="pb-2 text-left text-[10px] font-bold uppercase tracking-wider text-emerald-500">Category</th>
                      <th className="pb-2 text-right text-[10px] font-bold uppercase tracking-wider text-emerald-500">Current</th>
                      <th className="pb-2 text-right text-[10px] font-bold uppercase tracking-wider text-emerald-500">Potential Saving</th>
                      <th className="pb-2 text-right text-[10px] font-bold uppercase tracking-wider text-emerald-500">Runway Impact</th>
                      <th className="pb-2 text-right text-[10px] font-bold uppercase tracking-wider text-emerald-500">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.founderMetrics.costCuttingOpportunities.map((c) => (
                      <tr key={c.category} className="border-b border-emerald-50 last:border-0">
                        <td className="py-2 text-[11px] font-semibold text-emerald-900">{c.category}</td>
                        <td className="py-2 text-right text-[11px] tabular-nums text-emerald-600">{fmt(c.currentMonthly)}/mo</td>
                        <td className="py-2 text-right text-[11px] font-semibold tabular-nums text-emerald-500">{fmt(c.potentialSaving)}/mo</td>
                        <td className="py-2 text-right text-[11px] tabular-nums text-emerald-600">+{c.runwayImpactMonths.toFixed(1)} mo</td>
                        <td className="py-2 text-right">
                          <span className={cn('rounded-full px-2 py-0.5 text-[9px] font-bold',
                            c.priority === 'HIGH' ? 'bg-rose-50 text-rose-600' :
                              c.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600' :
                                'bg-emerald-50 text-emerald-600')}>
                            {c.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer */}
            <div className="rounded-b-xl bg-emerald-50/50 px-5 py-3 sm:px-7 print:mt-auto print:py-1 print:px-4" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
              <p className="text-[10px] text-emerald-600/40 print:text-[6px]">
                This report was auto-generated by BurnSight based on real transaction data. For investment decisions,
                please conduct your own due diligence. Report generated on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
