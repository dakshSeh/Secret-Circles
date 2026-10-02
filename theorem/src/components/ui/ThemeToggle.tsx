/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Only show the toggle after mount to avoid hydration mismatch
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div style={{ width: 36, height: 36 }} />;

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="btn btn-ghost btn-icon"
      style={{
        padding: '0.4rem',
        borderRadius: '50%',
        color: 'var(--text-muted)',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        flexShrink: 0,
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
