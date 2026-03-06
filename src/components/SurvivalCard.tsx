'use client';

import { motion } from 'framer-motion';

interface SurvivalCardProps {
  cashBalance: number;
  monthlyBurn: number;
  runway: number;
  riskScore: number;
  bankruptcyProbability: number;
  riskLevel: 'SAFE' | 'WARNING' | 'CRITICAL';
}

export default function SurvivalCard({
  cashBalance,
  monthlyBurn,
  runway,
  riskScore,
  bankruptcyProbability,
  riskLevel,
}: SurvivalCardProps) {
  const riskColor = {
    SAFE: 'var(--status-safe)',
    WARNING: 'var(--status-warning)',
    CRITICAL: 'var(--status-critical)',
  }[riskLevel];

  const riskBg = {
    SAFE: 'var(--status-safe-bg)',
    WARNING: 'var(--status-warning-bg)',
    CRITICAL: 'var(--status-critical-bg)',
  }[riskLevel];

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // SVG circular progress for risk score
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: `linear-gradient(135deg, ${riskBg}, var(--bg-card))`,
        borderColor: riskColor,
        borderWidth: '1px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-lg)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 'var(--space-xs)' }}>
            Startup Survival Report
          </h2>
          <span
            className={`badge badge-${riskLevel.toLowerCase()}`}
          >
            {riskLevel === 'CRITICAL' ? '🚨' : riskLevel === 'WARNING' ? '⚠️' : '✅'} {riskLevel}
          </span>
        </div>

        {/* Risk Score Circle */}
        <div className="progress-ring" style={{ width: 130, height: 130, flexShrink: 0 }}>
          <svg width="130" height="130" viewBox="0 0 130 130">
            <circle
              cx="65"
              cy="65"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="8"
            />
            <motion.circle
              cx="65"
              cy="65"
              r={radius}
              fill="none"
              stroke={riskColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5 }}
              transform="rotate(-90 65 65)"
              style={{ filter: `drop-shadow(0 0 6px ${riskColor})` }}
            />
          </svg>
          <div className="progress-ring-value" style={{ color: riskColor, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, lineHeight: 1 }}>{riskScore}</span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 500 }}>RISK</span>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 'var(--space-md)' }}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="metric-label">Cash Balance</div>
          <div className="metric-value" style={{ fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>
            {formatCurrency(cashBalance)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="metric-label">Monthly Burn</div>
          <div className="metric-value" style={{ fontSize: 'var(--text-xl)', color: 'var(--accent-rose)' }}>
            {formatCurrency(monthlyBurn)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="metric-label">Survival Horizon</div>
          <div className={`metric-value ${riskLevel.toLowerCase()}`} style={{ fontSize: 'var(--text-xl)' }}>
            {runway >= 999 ? '∞' : `${runway} months`}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="metric-label">Bankruptcy Prob. (90d)</div>
          <div className={`metric-value ${bankruptcyProbability > 0.3 ? 'critical' : bankruptcyProbability > 0.15 ? 'warning' : 'safe'}`} style={{ fontSize: 'var(--text-xl)' }}>
            {Math.round(bankruptcyProbability * 100)}%
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
