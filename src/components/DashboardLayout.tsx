'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, SlidersHorizontal, FileBarChart2, Settings,
  Upload, Menu, X, Banknote, Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/founder-metrics', label: 'Founder Metrics', icon: Target },
  { href: '/dashboard/runway-simulator', label: 'Runway Simulator', icon: SlidersHorizontal },
  { href: '/dashboard/investor-report', label: 'Investor Report', icon: FileBarChart2 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

function SidebarContent({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserEmail(data.user.email ?? null);
    });
  }, []);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' || pathname === '/dashboard/overview' : pathname === href;

  return (
    <>
      {/* Logo */}
      <div className="flex h-14 items-center justify-between border-b border-emerald-900/20 px-5">
        <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md shadow-emerald-900/30">
            <Banknote className="h-4 w-4 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <span className="text-[15px] font-bold tracking-tight text-white">BurnSight</span>
            <p className="text-[10px] font-medium text-emerald-400/70">Survival Intelligence</p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="rounded-md p-1 text-emerald-500/60 hover:bg-emerald-900/30 hover:text-emerald-300 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-500/50">Analytics</p>
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} onClick={onClose}
            className={cn(
              'group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150',
              isActive(item.href)
                ? 'bg-emerald-500/15 text-emerald-300 shadow-sm shadow-emerald-900/20'
                : 'text-emerald-100/50 hover:bg-emerald-900/20 hover:text-emerald-200'
            )}>
            <item.icon className={cn('h-4 w-4 transition-colors duration-150',
              isActive(item.href) ? 'text-emerald-400' : 'text-emerald-600/50 group-hover:text-emerald-400/70'
            )} strokeWidth={1.8} />
            {item.label}
            {isActive(item.href) && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-emerald-900/20 px-3 py-3">
        <Link href="/upload" onClick={onClose}
          className="flex items-center gap-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-3 py-2.5 text-[13px] font-semibold text-white shadow-md shadow-emerald-900/40 transition-all hover:from-emerald-400 hover:to-emerald-500">
          <Upload className="h-4 w-4" strokeWidth={2} /> Upload Data
        </Link>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-800/30 bg-emerald-900/20 px-3 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-[11px] font-bold uppercase text-amber-900 shadow-sm">
            {userEmail ? userEmail.charAt(0) : '$'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium text-emerald-200/80">{userEmail || 'BurnSight'}</p>
            <p className="text-[11px] text-emerald-500/50">Free Plan</p>
          </div>
          {userEmail && (
            <button onClick={() => createClient().auth.signOut().then(() => window.location.href = '/')} className="text-[10px] text-emerald-400/60 transition-colors hover:text-rose-400">
              Logout
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#0a1a14] lg:flex">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0a1a14] shadow-2xl lg:hidden">
              <SidebarContent pathname={pathname} onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-[#f6faf7] lg:ml-64">
        {/* Mobile bar */}
        <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-emerald-100 bg-white/80 px-4 backdrop-blur-md lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="rounded-md p-1.5 text-emerald-800 hover:bg-emerald-50">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600">
              <Banknote className="h-3 w-3 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[14px] font-semibold text-emerald-900">BurnSight</span>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
