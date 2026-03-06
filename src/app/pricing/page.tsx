'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, Banknote, ArrowRight, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PricingPage() {
  const plans = [
    { name: 'Free', price: '$0', period: 'forever', desc: 'Essential financial analysis.', features: ['CSV/Excel/JSON upload', 'AI categorization', 'Burn rate & runway', 'Revenue dashboard', 'Basic charts'], cta: 'Start Free', link: '/upload', hl: false },
    { name: 'Pro', price: '$29', period: '/mo', desc: 'Full survival intelligence.', features: ['Everything in Free', 'AI Founder Insights', 'Anomaly Detection', 'Survival Simulator', 'Risk Breakdown', 'Collapse Warnings', 'Cash Velocity', 'Data persistence', 'Priority support'], cta: 'Upgrade to Pro', link: '/auth', hl: true },
  ];

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-emerald-100 bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md shadow-emerald-500/20"><Banknote className="h-3.5 w-3.5 text-white" strokeWidth={2.2} /></div>
            <span className="text-[15px] font-bold text-emerald-950">BurnSight</span>
          </Link>
          <Link href="/auth" className="rounded-lg bg-emerald-900 px-3.5 py-1.5 text-[13px] font-medium text-white hover:bg-emerald-800">Sign In</Link>
        </div>
      </nav>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="mb-12 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-emerald-950">Simple, transparent pricing</h1>
          <p className="mt-1.5 text-sm text-emerald-700/50">Start free. Upgrade for advanced survival intelligence.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {plans.map((p, i) => (
            <motion.div key={p.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={cn('relative rounded-xl border bg-white p-6 shadow-sm',
                p.hl ? 'border-emerald-500 glow-green' : 'border-emerald-200/60')}>
              {p.hl && (
                <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-0.5 text-[11px] font-bold text-amber-900 shadow-sm">
                  <Crown className="h-3 w-3" /> POPULAR
                </div>
              )}
              <div className="mb-6">
                <p className="text-sm font-bold text-emerald-900">{p.name}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-light tracking-tight text-emerald-950">{p.price}</span>
                  <span className="text-sm text-emerald-600/40">{p.period}</span>
                </div>
                <p className="mt-2 text-[13px] text-emerald-700/50">{p.desc}</p>
              </div>
              <ul className="mb-6 space-y-2.5">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-emerald-800/70">
                    <Check className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" /> {f}
                  </li>
                ))}
              </ul>
              <Link href={p.link}>
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  className={cn('flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-bold shadow-sm',
                    p.hl ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-emerald-500/25 hover:from-emerald-400 hover:to-emerald-500'
                      : 'border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50')}>
                  {p.cta} <ArrowRight className="h-3.5 w-3.5" />
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
