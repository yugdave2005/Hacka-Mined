'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote, Loader2 } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true); setError('');
    try {
      const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
      const body = mode === 'signup' ? { email, password, name } : { email, password };
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Auth failed');
      localStorage.setItem('burnsight_token', data.token); window.location.href = '/dashboard';
    } catch (err) { setError(err instanceof Error ? err.message : 'Error'); } finally { setIsLoading(false); }
  };

  const inputCls = 'w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-950 outline-none placeholder:text-emerald-400/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100';

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6faf7] px-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="glow-green w-full max-w-sm rounded-xl border border-emerald-200/60 bg-white p-7 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25">
            <Banknote className="h-6 w-6 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-lg font-bold text-emerald-950">{mode === 'signup' ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="mt-0.5 text-[13px] text-emerald-700/50">{mode === 'signup' ? 'Save analysis & unlock Pro' : 'Sign in to BurnSight'}</p>
        </div>
        <div className="mb-6 flex rounded-lg border border-emerald-200 bg-emerald-50/50 p-0.5">
          {(['signup', 'login'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 rounded-md py-1.5 text-[13px] font-semibold transition-colors ${mode === m ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-500 hover:text-emerald-700'}`}>
              {m === 'signup' ? 'Sign Up' : 'Log In'}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <AnimatePresence>
            {mode === 'signup' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                <label className="mb-1 block text-[13px] font-medium text-emerald-800">Full Name</label>
                <input type="text" placeholder="Jane Founder" value={name} onChange={e => setName(e.target.value)} required className={inputCls} />
              </motion.div>
            )}
          </AnimatePresence>
          <div><label className="mb-1 block text-[13px] font-medium text-emerald-800">Email</label>
            <input type="email" placeholder="you@startup.com" value={email} onChange={e => setEmail(e.target.value)} required className={inputCls} /></div>
          <div><label className="mb-1 block text-[13px] font-medium text-emerald-800">Password</label>
            <input type="password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} minLength={8} required className={inputCls} /></div>
          {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[13px] text-rose-600">{error}</motion.div>}
          <motion.button type="submit" disabled={isLoading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
