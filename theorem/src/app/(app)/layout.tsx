'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, LayoutDashboard, Zap, BarChart2,
  BookMarked, LogOut, User, Menu, X, ChevronRight,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/generate', icon: Zap, label: 'Generate' },
  { href: '/review', icon: BarChart2, label: 'Review' },
  { href: '/saved', icon: BookMarked, label: 'Saved Sets' },
];

function Sidebar({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '1.25rem 1.25rem 0.75rem', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, background: 'var(--ember)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Flame size={15} color="#fff" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>Theorem</span>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.7rem',
                padding: '0.6rem 0.875rem', borderRadius: 'var(--radius)',
                textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
                transition: 'all 0.2s',
                background: active ? 'var(--ember-subtle)' : 'transparent',
                color: active ? 'var(--ember)' : 'var(--text-muted)',
                border: active ? '1px solid var(--ember-border)' : '1px solid transparent',
              }}
            >
              <item.icon size={16} />
              {item.label}
              {active && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          padding: '0.6rem 0.875rem',
          background: 'var(--surface-2)', borderRadius: 'var(--radius)',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--ember-subtle)', border: '1px solid var(--ember-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <User size={14} color="var(--ember)" />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userName || 'Student'}
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', justifyContent: 'flex-start', gap: '0.6rem', color: 'var(--text-muted)' }}
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // We pass user name as prop from server — here we use a placeholder (client comp)
  // The actual name is fetched in the page components
  return (
    <div className="app-layout">
      <Sidebar userName="" />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
