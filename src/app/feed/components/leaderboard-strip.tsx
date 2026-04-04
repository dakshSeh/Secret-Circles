'use client'

import Link from 'next/link'

export function LeaderboardStrip({ circles }: { circles: any[] }) {
  if (!circles || circles.length === 0) return null

  return (
    <div className="w-full bg-bg-surface border-b border-border-custom overflow-hidden sticky top-0 z-40 backdrop-blur-sm">
      <div className="flex animate-marquee whitespace-nowrap py-3">
        {[...circles, ...circles, ...circles].map((circle, idx) => (
          <Link 
            key={idx} 
            href={`/circles/${circle.id}`}
            className="flex items-center gap-8 px-12 border-r border-border-custom/30 group grow-0 shrink-0 hover:bg-gold/5 transition-colors"
          >
             <span className="label !text-gold opacity-40 group-hover:opacity-100 transition-opacity">#{idx % circles.length + 1}</span>
             <span className="font-ibm text-[11px] uppercase tracking-[0.2em] text-[#F0EDE8]/90">{circle.name}</span>
             <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rotate-45 border-0.5 border-white/20 shadow-[0_0_10px_currentColor]" style={{ backgroundColor: `var(--${circle.genre.toLowerCase()})`, color: `var(--${circle.genre.toLowerCase()})` }}></div>
                <span className="label !text-text-primary font-bold">{circle.rep_score}</span>
             </div>
          </Link>
        ))}
      </div>
      
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
