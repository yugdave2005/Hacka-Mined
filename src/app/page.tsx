'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Banknote, ArrowRight, Target, Search, Brain,
  TrendingUp, SlidersHorizontal, Zap, DollarSign, Shield, BarChart3, CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

const features = [
  { icon: Target, title: 'Burn Rate Risk Engine', desc: 'Composite risk scoring — runway, trend, volatility, stability.', color: 'from-emerald-500 to-emerald-600' },
  { icon: Search, title: 'Anomaly Detection', desc: 'Statistical analysis flags unusual spending spikes instantly.', color: 'from-amber-400 to-amber-500' },
  { icon: Brain, title: 'AI Founder Insights', desc: 'GPT-4o-mini delivers actionable recommendations.', color: 'from-teal-400 to-teal-500' },
  { icon: TrendingUp, title: 'Cash Velocity', desc: 'Track burn acceleration month-over-month.', color: 'from-emerald-400 to-emerald-500' },
  { icon: SlidersHorizontal, title: 'Survival Simulator', desc: 'Model hiring, fundraising, and revenue scenarios.', color: 'from-emerald-600 to-emerald-700' },
  { icon: Zap, title: 'Instant Analysis', desc: 'Upload CSV, Excel, or JSON — no signup needed.', color: 'from-amber-500 to-orange-500' },
];

const stats = [
  { value: '18.5', label: 'Avg Runway (months)', icon: BarChart3 },
  { value: '94%', label: 'Accuracy', icon: CheckCircle2 },
  { value: '<3s', label: 'Analysis Time', icon: Zap },
  { value: '100+', label: 'Startups', icon: Shield },
];

export default function LandingPage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [user, setUser] = useState<any>(null);
  const [isSignOutLoading, setIsSignOutLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data?.user));
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    setIsSignOutLoading(true);
    await createClient().auth.signOut();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── Nav ── */}
      <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 border-b border-emerald-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-7xl w-full items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <motion.div whileHover={{ rotate: 12 }} transition={{ type: 'spring' }}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md shadow-emerald-500/20">
              <Banknote className="h-3.5 w-3.5 text-white" strokeWidth={2.2} />
            </motion.div>
            <span className="text-[15px] font-bold tracking-tight text-emerald-950">BurnSight</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/dashboard" className="hidden px-3 py-1.5 text-[13px] font-medium text-emerald-700/60 transition-colors hover:text-emerald-900 sm:block">Demo</Link>
            {user ? (
               <div className="flex items-center gap-1 sm:gap-2">
                 <Link href="/dashboard">
                   <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                     className="rounded-lg bg-emerald-100 px-3.5 py-1.5 text-[13px] font-medium text-emerald-900 transition-colors hover:bg-emerald-200">
                     Dashboard
                   </motion.button>
                 </Link>
                 <motion.button 
                   onClick={handleSignOut}
                   disabled={isSignOutLoading}
                   whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                   className="rounded-lg bg-emerald-900 px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed">
                   {isSignOutLoading ? 'Signing out...' : 'Sign Out'}
                 </motion.button>
               </div>
            ) : (
                <Link href="/auth">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="rounded-lg bg-emerald-900 px-3.5 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-emerald-800">
                    Sign In
                </motion.button>
                </Link>
            )}
            
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section ref={heroRef} className="relative overflow-hidden py-20 lg:py-32">
        {/* Background glow */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }}
          className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-100/50 to-transparent blur-3xl" />
        <motion.div animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="pointer-events-none absolute right-[10%] top-20 h-24 w-24 rounded-full bg-amber-200/30 blur-2xl" />

        <motion.div variants={container} initial="hidden" animate="show" 
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center text-center space-y-8">
          
          <motion.div variants={fadeUp}
            className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 sm:text-[12px]">
            <DollarSign className="h-3.5 w-3.5" /> Startup Survival Intelligence
          </motion.div>

          <motion.h1 variants={fadeUp}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-zinc-900">
            Know exactly when your
            <br />
            <motion.span animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
              className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 bg-[length:200%_auto] bg-clip-text text-transparent">
              startup runs out of money
            </motion.span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg md:text-xl lg:text-2xl text-zinc-500 max-w-3xl mx-auto mt-6">
            Upload your bank statement. Get AI&#8209;powered burn rate analysis,
            risk scoring, and survival predictions — no signup.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/upload">
              <motion.button whileHover={{ scale: 1.03, boxShadow: '0 12px 40px rgba(16,185,129,0.3)' }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-[13px] font-bold text-white shadow-lg shadow-emerald-500/25 sm:w-auto sm:text-[14px]">
                Analyze Your Finances <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
            <Link href="/dashboard">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-6 py-3 text-[13px] font-bold text-emerald-700 shadow-sm hover:bg-emerald-50 sm:w-auto sm:text-[14px]">
                View Demo
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }}
          className="mt-20 border border-zinc-200 rounded-2xl bg-white shadow-sm py-8 px-4 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} variants={fadeUp}
              className="flex flex-col items-center text-center">
              <s.icon className="mb-3 h-6 w-6 text-emerald-500" strokeWidth={1.8} />
              <motion.p initial={{ scale: 0.5 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1, type: 'spring' }}
                className="text-4xl md:text-5xl font-bold text-zinc-900">{s.value}</motion.p>
              <p className="mt-2 text-sm font-medium text-zinc-500">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 text-center sm:mb-12">
            <h2 className="text-lg font-bold tracking-tight text-emerald-950 sm:text-xl">Financial intelligence, not just charts</h2>
            <p className="mt-1.5 text-[13px] text-emerald-700/50 sm:text-sm">AI engines protecting your runway behind the scenes.</p>
          </motion.div>
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div key={f.title} variants={fadeUp}
                whileHover={{ y: -6, boxShadow: '0 12px 40px rgba(16,185,129,0.1)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="group cursor-default rounded-xl border border-emerald-200/60 bg-white p-5 shadow-sm sm:p-6">
                <motion.div whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }} transition={{ duration: 0.4 }}
                  className={cn('mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-md transition-shadow group-hover:shadow-lg', f.color)}>
                  <f.icon className="h-4.5 w-4.5 text-white" strokeWidth={1.8} />
                </motion.div>
                <h3 className="text-[13px] font-bold text-emerald-950 sm:text-sm">{f.title}</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-emerald-800/50 sm:text-[13px]">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Pipeline ── */}
      <section className="border-t border-emerald-100 bg-[#f6faf7] px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 text-center">
            <h2 className="text-lg font-bold tracking-tight text-emerald-950 sm:text-xl">How it works</h2>
            <p className="mt-1 text-[13px] text-emerald-700/50">Four steps to financial clarity.</p>
          </motion.div>
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {[
              { step: '01', label: 'Upload Data', sub: 'CSV, Excel, JSON' },
              { step: '02', label: 'AI Categorization', sub: 'GPT-4o-mini' },
              { step: '03', label: 'Risk Analysis', sub: '4-factor scoring' },
              { step: '04', label: 'Dashboard', sub: 'Real-time insights' },
            ].map((item, i) => (
              <motion.div key={item.step} variants={fadeUp}
                whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(16,185,129,0.1)' }}
                className="relative rounded-xl border border-emerald-200/60 bg-white p-4 text-center shadow-sm sm:p-5">
                <motion.span initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, type: 'spring' }}
                  className="mb-2 block text-2xl font-bold text-emerald-500 sm:text-3xl">{item.step}</motion.span>
                <p className="text-[12px] font-bold text-emerald-900 sm:text-[13px]">{item.label}</p>
                <p className="mt-0.5 text-[10px] text-emerald-600/40 sm:text-[11px]">{item.sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-emerald-100 px-4 py-16 sm:px-6 sm:py-20">
        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mx-auto max-w-xl text-center">
          <h2 className="text-lg font-bold tracking-tight text-emerald-950 sm:text-xl">Ready to see your survival odds?</h2>
          <p className="mt-2 text-[13px] text-emerald-700/50 sm:text-sm">Free analysis. No signup required.</p>
          <Link href="/upload">
            <motion.button whileHover={{ scale: 1.03, boxShadow: '0 12px 40px rgba(16,185,129,0.3)' }} whileTap={{ scale: 0.97 }}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-[13px] font-bold text-white shadow-lg shadow-emerald-500/25 sm:text-[14px]">
              Start Free Analysis <ArrowRight className="h-4 w-4" />
            </motion.button>
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-emerald-100 py-6 text-center">
        <p className="text-[11px] text-emerald-600/40">© 2026 BurnSight. Startup Survival Intelligence Engine.</p>
      </footer>
    </div>
  );
}
