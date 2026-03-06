'use client';

import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface BurnVelocityChartProps {
  burnTrend: number[];
  monthlyData: {
    month: string;
    revenue: number;
    expenses: number;
    netBurn: number;
  }[];
  cashVelocity: number;
}

export default function BurnVelocityChart({ burnTrend, monthlyData, cashVelocity }: BurnVelocityChartProps) {
  const chartData = monthlyData.map((m, i) => ({
    name: m.month,
    burn: m.netBurn,
    revenue: m.revenue,
    expenses: m.expenses,
    velocity: i > 0 ? burnTrend[i] - burnTrend[i - 1] : 0,
  }));

  const avgBurn = burnTrend.length > 0
    ? burnTrend.reduce((a, b) => a + b, 0) / burnTrend.length
    : 0;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-md)',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-xs)' }}>
          {label}
        </p>
        {payload.map((entry, i) => (
          <p key={i} style={{ fontSize: 'var(--text-sm)', color: entry.color, fontWeight: 500 }}>
            {entry.dataKey === 'burn' ? 'Net Burn' :
             entry.dataKey === 'revenue' ? 'Revenue' : 'Expenses'}:
            {' '}{formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <span style={{ fontSize: 'var(--text-xl)' }}>📈</span>
            Burn Velocity
          </h2>
          <p className="section-subtitle">6-month burn rate trend and acceleration</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: 600,
          }}>
            Cash Velocity
          </div>
          <div style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 800,
            color: cashVelocity > 0 ? 'var(--status-critical)' : 'var(--status-safe)',
          }}>
            {cashVelocity > 0 ? '+' : ''}{formatCurrency(cashVelocity)}/mo
          </div>
          <div style={{
            fontSize: 'var(--text-xs)',
            color: cashVelocity > 0 ? 'var(--status-critical)' : 'var(--status-safe)',
          }}>
            {cashVelocity > 0 ? '↑ Accelerating' : cashVelocity < 0 ? '↓ Decelerating' : '→ Stable'}
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 300, marginTop: 'var(--space-md)' }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="burnGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-rose)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent-rose)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-emerald)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent-emerald)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={avgBurn}
              stroke="rgba(255,255,255,0.2)"
              strokeDasharray="5 5"
              label={{
                value: `Avg: ${formatCurrency(avgBurn)}`,
                position: 'right',
                fill: 'var(--text-muted)',
                fontSize: 11,
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="var(--accent-emerald)"
              fill="url(#revenueGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="burn"
              stroke="var(--accent-rose)"
              fill="url(#burnGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
