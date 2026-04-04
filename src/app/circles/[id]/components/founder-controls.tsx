'use client'

import { useState } from 'react'
import { handleApplication } from '../actions'

export function FounderControls({ applications: initialApplications }: { applications: any[] }) {
  const [apps, setApps] = useState(initialApplications)

  async function respond(id: string, status: 'accepted' | 'rejected') {
    const result = await handleApplication(id, status)
    if (result.success) {
      setApps(prev => prev.filter(a => a.id !== id))
    } else {
      alert(result.error)
    }
  }

  if (apps.length === 0) return null

  return (
    <section className="bg-bg-surface/20 border border-border-custom p-8 space-y-10 animate-fade-in enter">
      <div className="flex items-center gap-4">
        <div className="w-2 h-2 bg-gold animate-pulse"></div>
        <p className="label text-gold tracking-[0.2em]">PENDING ADMISSIONS ({apps.length})</p>
      </div>

      <div className="space-y-6">
        {apps.map(app => (
          <div 
            key={app.id} 
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 p-8 border border-border-custom bg-bg-primary hover:border-gold/30 transition-all duration-500"
          >
            <div className="space-y-3 max-w-xl">
              <div className="flex items-center gap-3">
                 <p className="label !text-text-primary text-sm uppercase tracking-widest">@{app.user?.handle}</p>
                 <span className="text-[10px] text-text-tertiary">SIGNAL: {app.user?.rep_score || 0}</span>
              </div>
              <p className="body text-[#F0EDE8]/70 italic leading-relaxed">"{app.message}"</p>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
               <button 
                onClick={() => respond(app.id, 'rejected')} 
                className="btn-primary !border-downvote/20 text-downvote hover:!bg-downvote hover:!text-bg-primary text-[10px] px-8"
               >
                Reject
               </button>
               <button 
                onClick={() => respond(app.id, 'accepted')} 
                className="btn-primary !bg-gold !text-bg-primary px-8"
               >
                Accept
               </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
