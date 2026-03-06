'use client';

import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface RevenueExpenseChartProps {
  monthlyData: {
    month: string;
    revenue: number;
    expenses: number;
    netBurn: number;
  }[];
}

export default function RevenueExpenseChart({ monthlyData }: RevenueExpenseChartProps) {
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
            {entry.dataKey === 'revenue' ? 'Revenue' : 'Expenses'}:
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
      transition={{ duration: 0.5, delay: 0.25 }}
    >
      <div className="section-header">
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <span style={{ fontSize: 'var(--text-xl)' }}>📊</span>
          Revenue vs Expenses
        </h2>
        <p className="section-subtitle">Monthly financial overview</p>
      </div>

      <div style={{ width: '100%', height: 300, marginTop: 'var(--space-md)' }}>
        <ResponsiveContainer>
          <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="month"
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
            <Legend
              wrapperStyle={{ fontSize: '12px', color: 'var(--text-muted)' }}
            />
            <Bar
              dataKey="revenue"
              fill="var(--accent-emerald)"
              radius={[4, 4, 0, 0]}
              opacity={0.85}
            />
            <Bar
              dataKey="expenses"
              fill="var(--accent-rose)"
              radius={[4, 4, 0, 0]}
              opacity={0.85}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
