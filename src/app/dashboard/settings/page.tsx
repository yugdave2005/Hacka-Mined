'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, User, Bell, CreditCard, Shield, Palette, Crown, Check, Banknote } from 'lucide-react';
import { cn } from '@/lib/utils';

const fadeIn = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.3 } };

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [toggles, setToggles] = useState({ runway: true, anomaly: true, weekly: false, risk: true });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, color: 'text-emerald-500' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-amber-500' },
    { id: 'security', label: 'Security', icon: Shield, color: 'text-rose-500' },
  ];

  const inputCls = 'w-full rounded-lg border border-emerald-200 bg-white px-3.5 py-2.5 text-sm text-emerald-950 outline-none placeholder:text-emerald-400/50 transition-all focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2">
          <motion.div animate={{ rotate: [0, 90, 180, 270, 360] }} transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}>
            <Settings className="h-5 w-5 text-emerald-600" />
          </motion.div>
          <h1 className="text-lg font-bold tracking-tight text-emerald-950 sm:text-xl">Settings</h1>
        </div>
        <p className="mt-0.5 text-[13px] text-emerald-700/40">Manage your account and preferences.</p>
      </motion.div>

      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-emerald-200/60 bg-white p-1.5 shadow-sm lg:w-56 lg:flex-col lg:overflow-x-visible">
          {tabs.map((t) => (
            <motion.button key={t.id} onClick={() => setActiveTab(t.id)}
              whileHover={{ x: activeTab === t.id ? 0 : 2 }}
              whileTap={{ scale: 0.98 }}
              className={cn('flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-[12px] font-medium transition-all sm:text-[13px]',
                activeTab === t.id ? 'bg-emerald-50 text-emerald-800 shadow-sm' : 'text-emerald-600/50 hover:bg-emerald-50/50 hover:text-emerald-700')}>
              <t.icon className={cn('h-4 w-4', activeTab === t.id ? t.color : 'text-emerald-400/50')} strokeWidth={1.8} />
              {t.label}
              {activeTab === t.id && <motion.div layoutId="activeTab" className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <div className="glow-green flex-1 rounded-xl border border-emerald-200/60 bg-white p-5 shadow-sm sm:p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div key="profile" {...fadeIn} className="space-y-4 sm:space-y-5">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-950"><User className="h-4 w-4 text-emerald-500" /> Profile Settings</div>
                <div className="flex items-center gap-4">
                  <motion.div whileHover={{ scale: 1.1 }}
                    className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-xl font-bold text-white shadow-lg shadow-emerald-500/20">B</motion.div>
                  <div><p className="text-[13px] font-semibold text-emerald-900">BurnSight Inc.</p><p className="text-[11px] text-emerald-600/40">CEO / Founder</p></div>
                </div>
                {[{ l: 'Company Name', p: 'BurnSight Inc.', t: 'text' }, { l: 'Email', p: 'founder@startup.com', t: 'email' }, { l: 'Role', p: 'CEO / Founder', t: 'text' }].map(f => (
                  <div key={f.l}><label className="mb-1.5 block text-[12px] font-semibold text-emerald-800 sm:text-[13px]">{f.l}</label>
                    <input type={f.t} placeholder={f.p} className={inputCls} /></div>
                ))}
                <motion.button whileHover={{ scale: 1.02, boxShadow: '0 8px 25px rgba(16,185,129,0.2)' }} whileTap={{ scale: 0.98 }}
                  className="rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 text-[12px] font-bold text-white shadow-md shadow-emerald-500/25 sm:text-[13px]">Save Changes</motion.button>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div key="notifs" {...fadeIn} className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-950"><Bell className="h-4 w-4 text-amber-500" /> Notifications</div>
                {[
                  { key: 'runway' as const, l: 'Runway below 6 months', d: 'Critical alert when runway is dangerously low' },
                  { key: 'anomaly' as const, l: 'Anomaly detected', d: 'Unusual spending patterns flagged' },
                  { key: 'weekly' as const, l: 'Weekly digest', d: 'Key metrics every Monday' },
                  { key: 'risk' as const, l: 'Risk score changes', d: 'Alert when risk crosses thresholds' },
                ].map(n => (
                  <motion.div key={n.key} whileHover={{ x: 2 }}
                    className="flex items-start justify-between rounded-lg border border-emerald-100 bg-emerald-50/30 p-3 sm:p-4">
                    <div><p className="text-[12px] font-semibold text-emerald-800 sm:text-[13px]">{n.l}</p><p className="mt-0.5 text-[10px] text-emerald-600/40 sm:text-[11px]">{n.d}</p></div>
                    <motion.button whileTap={{ scale: 0.9 }}
                      onClick={() => setToggles(s => ({ ...s, [n.key]: !s[n.key] }))}
                      className={cn('relative h-5 w-9 rounded-full transition-colors', toggles[n.key] ? 'bg-emerald-500' : 'bg-emerald-200')}>
                      <motion.div animate={{ x: toggles[n.key] ? 16 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm" />
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div key="security" {...fadeIn} className="space-y-4 sm:space-y-5">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-950"><Shield className="h-4 w-4 text-rose-500" /> Security</div>
                <div><label className="mb-1.5 block text-[12px] font-semibold text-emerald-800 sm:text-[13px]">Current Password</label><input type="password" placeholder="••••••••" className={inputCls} /></div>
                <div><label className="mb-1.5 block text-[12px] font-semibold text-emerald-800 sm:text-[13px]">New Password</label><input type="password" placeholder="Min. 8 characters" className={inputCls} /></div>
                <div><label className="mb-1.5 block text-[12px] font-semibold text-emerald-800 sm:text-[13px]">Confirm Password</label><input type="password" placeholder="Repeat new password" className={inputCls} /></div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="rounded-lg bg-emerald-900 px-4 py-2.5 text-[12px] font-bold text-white shadow-sm hover:bg-emerald-800 sm:text-[13px]">Update Password</motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
