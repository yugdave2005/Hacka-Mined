'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Navigation() {
  const pathname = usePathname();
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

  const isActive = (path: string) => pathname === path;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10, 14, 23, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 var(--space-lg)',
      }}
    >
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', textDecoration: 'none' }}>
          <span style={{ fontSize: 24 }}>🔥</span>
          <span style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--accent-indigo), var(--accent-violet))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}>
            BurnSight
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
          {[
            { path: '/dashboard', label: 'Financial Cockpit', icon: '📊' },
            { path: '/upload', label: 'Upload', icon: '📁' },
          ].map((link) => (
            <Link
              key={link.path}
              href={link.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)',
                fontWeight: 500,
                color: isActive(link.path) ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive(link.path) ? 'var(--bg-glass-hover)' : 'transparent',
                border: isActive(link.path) ? '1px solid var(--border-default)' : '1px solid transparent',
                textDecoration: 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              <span style={{ fontSize: 14 }}>{link.icon}</span>
              {link.label}
            </Link>
          ))}

          <div style={{ width: 1, height: 24, background: 'var(--border-subtle)', margin: '0 var(--space-sm)' }} />

          {user ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Link href="/dashboard" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
                Dashboard
              </Link>
              <button 
                onClick={handleSignOut} 
                disabled={isSignOutLoading}
                style={{ 
                  background: 'transparent', border: 'none', color: 'var(--text-secondary)', 
                  cursor: 'pointer', fontSize: '13px', fontWeight: 500 
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link href="/auth" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
