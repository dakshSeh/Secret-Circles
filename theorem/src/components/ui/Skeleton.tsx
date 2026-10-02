import React from 'react';

export function Skeleton({ className = '', style }: { className?: string, style?: React.CSSProperties }) {
  return <div className={`shimmer ${className}`} style={{ borderRadius: 'var(--radius)', ...style }} />;
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', minHeight: 140 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)' }} />
        <Skeleton style={{ width: 24, height: 24, borderRadius: 'var(--radius-sm)' }} />
      </div>
      <Skeleton style={{ width: '80%', height: 18 }} />
      <Skeleton style={{ width: '60%', height: 14 }} />
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
        <Skeleton style={{ width: 60, height: 20, borderRadius: 100 }} />
        <Skeleton style={{ width: 40, height: 20, borderRadius: 100 }} />
      </div>
    </div>
  );
}

export function SkeletonList() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--surface-2)' }}>
           <Skeleton style={{ width: 24, height: 24, borderRadius: 'var(--radius-sm)' }} />
           <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Skeleton style={{ width: '70%', height: 14 }} />
              <Skeleton style={{ width: '40%', height: 12 }} />
           </div>
        </div>
      ))}
    </div>
  );
}
