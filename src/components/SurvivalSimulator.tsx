'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SimulatorParams } from '@/lib/types';

interface SurvivalSimulatorProps {
  currentBurn: number;
  currentRunway: number;
  currentRiskScore: number;
  cashBalance: number;
  avgMonthlyRevenue: number;
}

export default function SurvivalSimulator({
  currentBurn,
  currentRunway,
  currentRiskScore,
  cashBalance,
  avgMonthlyRevenue,
}: SurvivalSimulatorProps) {
  const [params, setParams] = useState<SimulatorParams>({
    hireEmployees: 0,
    marketingBudget: 0,
    revenueGrowthRate: 0,
    fundraiseAmount: 0,
  });

  const avgSalary = 8000; // avg monthly cost per employee

  const computeProjected = useCallback(() => {
    const additionalBurn = params.hireEmployees * avgSalary + params.marketingBudget;
    const projectedBurn = currentBurn + additionalBurn;
    const projectedRevenue = avgMonthlyRevenue * (1 + params.revenueGrowthRate / 100);
    const projectedNetBurn = projectedBurn - projectedRevenue + avgMonthlyRevenue - currentBurn; // net adjustment
    const adjustedNetBurn = Math.max((currentBurn + additionalBurn) - projectedRevenue, 0);
    const adjustedCashBalance = cashBalance + params.fundraiseAmount;

    const projectedRunway = adjustedNetBurn > 0
      ? Math.round((adjustedCashBalance / adjustedNetBurn) * 10) / 10
      : 999;

    // Simplified risk projection
    let projectedRiskScore = currentRiskScore;
    if (projectedRunway > 12) projectedRiskScore = Math.max(projectedRiskScore - 30, 5);
    else if (projectedRunway > 6) projectedRiskScore = Math.max(projectedRiskScore - 15, 10);
    else if (projectedRunway < currentRunway) projectedRiskScore = Math.min(projectedRiskScore + 15, 99);

    if (params.fundraiseAmount > 0) projectedRiskScore = Math.max(projectedRiskScore - 20, 5);
    if (params.revenueGrowthRate > 20) projectedRiskScore = Math.max(projectedRiskScore - 10, 5);

    return {
      burn: Math.round(adjustedNetBurn),
      runway: projectedRunway,
      riskScore: Math.round(Math.max(0, Math.min(100, projectedRiskScore))),
    };
  }, [params, currentBurn, currentRunway, currentRiskScore, cashBalance, avgMonthlyRevenue]);

  const projected = computeProjected();

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const getChangeColor = (current: number, projected: number, inverse: boolean = false) => {
    const better = inverse ? projected < current : projected > current;
    if (projected === current) return 'var(--text-secondary)';
    return better ? 'var(--status-safe)' : 'var(--status-critical)';
  };

  const sliders = [
    {
      label: 'Hire Employees',
      value: params.hireEmployees,
      min: 0,
      max: 20,
      step: 1,
      format: (v: number) => `+${v} people`,
      key: 'hireEmployees' as const,
      description: `$${(avgSalary).toLocaleString()}/mo per employee`,
    },
    {
      label: 'Marketing Budget Increase',
      value: params.marketingBudget,
      min: 0,
      max: 50000,
      step: 1000,
      format: (v: number) => formatCurrency(v),
      key: 'marketingBudget' as const,
      description: 'Additional monthly ad spend',
    },
    {
      label: 'Revenue Growth Rate',
      value: params.revenueGrowthRate,
      min: -50,
      max: 100,
      step: 5,
      format: (v: number) => `${v > 0 ? '+' : ''}${v}%`,
      key: 'revenueGrowthRate' as const,
      description: 'Projected monthly revenue change',
    },
    {
      label: 'Fundraise Amount',
      value: params.fundraiseAmount,
      min: 0,
      max: 5000000,
      step: 50000,
      format: (v: number) => formatCurrency(v),
      key: 'fundraiseAmount' as const,
      description: 'New capital injection',
    },
  ];

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="section-header">
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <span style={{ fontSize: 'var(--text-xl)' }}>🎛️</span>
          Survival Simulator
        </h2>
        <p className="section-subtitle">Model financial scenarios and predict outcomes</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
        {/* Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {sliders.map((slider) => (
            <div key={slider.key} className="slider-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label className="label" style={{ margin: 0 }}>{slider.label}</label>
                <span style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
                  color: 'var(--accent-indigo)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {slider.format(slider.value)}
                </span>
              </div>
              <input
                type="range"
                className="slider"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={slider.value}
                onChange={(e) => setParams(p => ({ ...p, [slider.key]: Number(e.target.value) }))}
              />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                {slider.description}
              </span>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div>
          <table className="table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Current</th>
                <th>Projected</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Net Burn</td>
                <td>{formatCurrency(currentBurn)}</td>
                <td style={{ color: getChangeColor(currentBurn, projected.burn, true), fontWeight: 600 }}>
                  {formatCurrency(projected.burn)}
                </td>
                <td style={{ color: getChangeColor(currentBurn, projected.burn, true) }}>
                  {projected.burn > currentBurn ? '↑' : projected.burn < currentBurn ? '↓' : '→'}
                  {' '}{formatCurrency(Math.abs(projected.burn - currentBurn))}
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Runway</td>
                <td>{currentRunway >= 999 ? '∞' : `${currentRunway}mo`}</td>
                <td style={{ color: getChangeColor(currentRunway, projected.runway), fontWeight: 600 }}>
                  {projected.runway >= 999 ? '∞' : `${projected.runway}mo`}
                </td>
                <td style={{ color: getChangeColor(currentRunway, projected.runway) }}>
                  {projected.runway > currentRunway ? '↑' : projected.runway < currentRunway ? '↓' : '→'}
                  {' '}{projected.runway >= 999 || currentRunway >= 999 ? '—' : `${Math.abs(Math.round((projected.runway - currentRunway) * 10) / 10)}mo`}
                </td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Risk Score</td>
                <td>{currentRiskScore}</td>
                <td style={{ color: getChangeColor(currentRiskScore, projected.riskScore, true), fontWeight: 600 }}>
                  {projected.riskScore}
                </td>
                <td style={{ color: getChangeColor(currentRiskScore, projected.riskScore, true) }}>
                  {projected.riskScore > currentRiskScore ? '↑' : projected.riskScore < currentRiskScore ? '↓' : '→'}
                  {' '}{Math.abs(projected.riskScore - currentRiskScore)} pts
                </td>
              </tr>
            </tbody>
          </table>

          <motion.div
            style={{
              marginTop: 'var(--space-lg)',
              padding: 'var(--space-md)',
              borderRadius: 'var(--radius-md)',
              background: projected.runway > currentRunway ? 'var(--status-safe-bg)' : 'var(--status-critical-bg)',
              border: `1px solid ${projected.runway > currentRunway ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.2)'}`,
              textAlign: 'center',
            }}
            key={`${projected.runway}-${projected.riskScore}`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: projected.runway > currentRunway ? 'var(--status-safe)' : 'var(--status-critical)' }}>
              {projected.runway > currentRunway
                ? `✅ This scenario extends survival by ${Math.round((projected.runway - currentRunway) * 10) / 10} months`
                : projected.runway < currentRunway
                  ? `⚠️ This scenario reduces survival by ${Math.round((currentRunway - projected.runway) * 10) / 10} months`
                  : '→ No change to survival timeline'}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
