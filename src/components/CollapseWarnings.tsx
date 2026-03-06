'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AnomalyData } from '@/lib/types';

interface CollapseWarningsProps {
  anomalies: AnomalyData[];
  riskLevel?: 'SAFE' | 'WARNING' | 'CRITICAL';
  runway?: number;
}

export default function CollapseWarnings({ anomalies, riskLevel, runway }: CollapseWarningsProps) {
  const allAlerts: Array<{
    severity: string;
    title: string;
    impact: string;
    icon: string;
  }> = [];

  // Add runway alert if low
  if (runway !== undefined && runway < 6) {
    allAlerts.push({
      severity: 'CRITICAL',
      title: `Runway below ${Math.ceil(runway)} months`,
      impact: 'Immediate fundraising or cost reduction required',
      icon: '🚨',
    });
  } else if (runway !== undefined && runway < 12) {
    allAlerts.push({
      severity: 'WARNING',
      title: `Runway at ${runway} months`,
      impact: 'Begin fundraising preparation',
      icon: '⚠️',
    });
  }

  // Add anomaly alerts
  for (const anomaly of anomalies) {
    allAlerts.push({
      severity: anomaly.severity,
      title: anomaly.title,
      impact: anomaly.impact,
      icon: anomaly.severity === 'CRITICAL' ? '🚨' : anomaly.severity === 'HIGH' ? '🔴' : '⚠️',
    });
  }

  // Add risk level alert
  if (riskLevel === 'CRITICAL') {
    allAlerts.push({
      severity: 'CRITICAL',
      title: 'Overall risk level is CRITICAL',
      impact: 'Multiple financial health indicators are in danger zone',
      icon: '💀',
    });
  }

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="section-header">
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <span style={{ fontSize: 'var(--text-xl)' }}>⚡</span>
          Collapse Warnings
        </h2>
        <p className="section-subtitle">
          {allAlerts.length} active {allAlerts.length === 1 ? 'alert' : 'alerts'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        <AnimatePresence>
          {allAlerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="alert-item safe"
              style={{ justifyContent: 'center' }}
            >
              <span>✅ No active warnings — financials look healthy</span>
            </motion.div>
          ) : (
            allAlerts.map((alert, i) => (
              <motion.div
                key={`${alert.title}-${i}`}
                className={`alert-item ${alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? 'critical' : 'warning'}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <span style={{ fontSize: 'var(--text-lg)', flexShrink: 0, marginTop: 2 }}>{alert.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 2,
                  }}>
                    {alert.title}
                  </div>
                  <div style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-muted)',
                  }}>
                    {alert.impact}
                  </div>
                </div>
                <span
                  className={`badge badge-${alert.severity === 'CRITICAL' || alert.severity === 'HIGH' ? 'critical' : 'warning'}`}
                  style={{ flexShrink: 0 }}
                >
                  {alert.severity}
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
