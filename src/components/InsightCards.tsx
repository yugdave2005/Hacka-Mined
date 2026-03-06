'use client';

import { motion } from 'framer-motion';
import { InsightData } from '@/lib/types';

interface InsightCardsProps {
  insights: InsightData[];
}

export default function InsightCards({ insights }: InsightCardsProps) {
  const icons = ['💡', '🔍', '⚡', '🎯', '📊'];

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <div className="section-header">
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <span style={{ fontSize: 'var(--text-xl)' }}>🧠</span>
          AI Founder Insights
        </h2>
        <p className="section-subtitle">Powered by financial intelligence engine</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.15 }}
            style={{
              padding: 'var(--space-lg)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              transition: 'all var(--transition-base)',
              cursor: 'default',
            }}
            whileHover={{
              borderColor: 'rgba(99, 102, 241, 0.3)',
              background: 'rgba(255,255,255,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
              <span style={{
                fontSize: 'var(--text-2xl)',
                flexShrink: 0,
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-indigo-glow)',
              }}>
                {icons[i % icons.length]}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: 'var(--space-xs)',
                }}>
                  {insight.title}
                </h3>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-secondary)',
                  marginBottom: 'var(--space-sm)',
                  lineHeight: 1.6,
                }}>
                  {insight.explanation}
                </p>

                <div style={{
                  display: 'flex',
                  gap: 'var(--space-md)',
                  flexWrap: 'wrap',
                }}>
                  <div style={{
                    flex: 1,
                    minWidth: 200,
                    padding: 'var(--space-sm) var(--space-md)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.15)',
                  }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
                      Recommendation
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--accent-indigo)' }}>
                      {insight.recommendation}
                    </div>
                  </div>
                  <div style={{
                    padding: 'var(--space-sm) var(--space-md)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--status-safe-bg)',
                    border: '1px solid rgba(52, 211, 153, 0.15)',
                    minWidth: 150,
                  }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>
                      Impact
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--status-safe)', fontWeight: 600 }}>
                      {insight.impactEstimate}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
