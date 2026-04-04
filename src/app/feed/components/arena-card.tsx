'use client'

import { voteDrop } from '../actions'
import Link from 'next/link'

export function ArenaCard({ drop, currentUserId }: { drop: any; currentUserId: string }) {
  const votes = (drop.votes as any[]) || []
  const userVote = votes.find(v => v.user_id === currentUserId)
  
  const handleVote = async (direction: 'up' | 'down') => {
    const result = await voteDrop(drop.id, direction)
    if (result.success) {
      // Logic handled by server action revalidation
    } else {
      alert(result.error)
    }
  }

  const genreColor = `var(--${drop.circle?.genre.toLowerCase()})`

  return (
    <div className="group relative">
       {/* Card Background Glow */}
       <div 
        className="absolute -inset-1 rounded-sm opacity-0 group-hover:opacity-5 transition duration-1000 group-hover:duration-500" 
        style={{ backgroundColor: genreColor }}
       ></div>

       <div className="relative card !bg-bg-primary p-8 md:p-12 space-y-12 border-border-custom hover:border-gold/20 transition-all duration-700 enter">
          <header className="flex justify-between items-start">
             <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <div className="badge !px-3 !py-1 text-[9px]" style={{ color: genreColor, borderColor: genreColor }}>{drop.circle?.genre}</div>
                   <Link href={`/circles/${drop.circle_id}`} className="label text-text-tertiary hover:text-gold transition-colors !text-[9px] tracking-[0.2em]">{drop.circle?.name}</Link>
                </div>
                {drop.is_anonymous ? (
                   <h2 className="label tracking-[0.4em] !text-[11px] opacity-30">ANONYMOUS TRANSMISSION</h2>
                ) : (
                   <div className="flex items-center gap-3">
                      <h2 className="label tracking-[0.2em] !text-[11px] text-[#F0EDE8]">SOURCE: @{drop.author?.handle}</h2>
                      <span className="text-[10px] label opacity-20 bg-bg-surface px-2 py-0.5 border border-border-custom">REP {drop.author?.rep_score}</span>
                   </div>
                )}
             </div>
             <div className="text-right flex flex-col items-end">
                <p className="label !text-[9px] opacity-30 tracking-[0.3em]">SIGNAL</p>
                <p className="text-4xl font-ibm !text-gold mt-1">{drop.score || 0}</p>
             </div>
          </header>

          {drop.media_url && (
            <div className="aspect-video bg-bg-surface border border-border-custom bg-black/50 overflow-hidden group/media">
               <img 
                src={drop.media_url} 
                alt="Arena Drop Content" 
                className="w-full h-full object-contain grayscale group-hover/media:grayscale-0 transition-all duration-1000 scale-[1.01]" 
               />
            </div>
          )}

          <div className="space-y-6">
             <p className="text-xl md:text-2xl font-inter leading-relaxed text-[#F0EDE8]/90 tracking-tight">
                {drop.content}
             </p>
          </div>

          <footer className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 pt-12 border-t border-border-custom/20">
             <div className="flex items-center gap-10">
                <div className="flex items-center bg-bg-surface border border-border-custom gap-px p-px">
                   <button 
                    onClick={() => handleVote('up')}
                    className={`px-8 py-3 text-[10px] tracking-widest font-ibm transition-all duration-300 ${userVote?.direction === 'up' ? 'bg-upvote text-bg-primary' : 'hover:bg-upvote/10 text-upvote'}`}
                   >
                    UPVOTE
                   </button>
                   <div className="w-px h-6 bg-border-custom mx-px"></div>
                   <button 
                    onClick={() => handleVote('down')}
                    className={`px-8 py-3 text-[10px] tracking-widest font-ibm transition-all duration-300 ${userVote?.direction === 'down' ? 'bg-downvote text-bg-primary' : 'hover:bg-downvote/10 text-downvote'}`}
                   >
                    DOWNVOTE
                   </button>
                </div>
                <div className="hidden md:block">
                   <p className="label !text-[8px] opacity-20 tracking-widest uppercase">Transmitted</p>
                   <p className="text-[10px] label text-text-tertiary">{new Date(drop.created_at).toLocaleDateString()} {new Date(drop.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
             </div>

             <div className="flex gap-6 w-full sm:w-auto justify-end">
                <button className="label !text-text-tertiary hover:text-gold transition-colors !text-[9px] tracking-widest uppercase">Share</button>
                <button className="label !text-downvote/40 hover:text-downvote transition-colors !text-[9px] tracking-widest uppercase">Report</button>
             </div>
          </footer>
       </div>
    </div>
  )
}
