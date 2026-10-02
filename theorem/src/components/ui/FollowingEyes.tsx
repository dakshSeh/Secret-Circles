'use client';

import { useEffect, useRef, useState } from 'react';

export default function FollowingEyes() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Only run on desktop/devices with fine pointers
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;
      
      const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
      // Max displacement is 4px
      const distance = Math.min(3.5, Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) / 15);
      
      setPupilPos({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="hidden md:flex items-center gap-1.5"
      style={{
        padding: '0.4rem 0.5rem',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)'
      }}
    >
      {[0, 1].map((i) => (
        <div 
          key={i}
          style={{
            width: '16px', height: '16px',
            borderRadius: '50%',
            background: '#fff',
            border: '1px solid var(--border-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
          }}
        >
          <div 
            style={{
              width: '7px', height: '7px',
              borderRadius: '50%',
              background: 'var(--ember)',
              transform: `translate(${pupilPos.x}px, ${pupilPos.y}px)`,
              // A slight spring/easing makes it feel alive
              transition: 'transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)'
            }}
          />
        </div>
      ))}
    </div>
  );
}
