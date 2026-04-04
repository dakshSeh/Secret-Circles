'use client'

import { useState } from 'react'
import { createCircle } from '@/app/circles/actions'
import { useRouter } from 'next/navigation'

const GENRES = ['Meme', 'Chaos', 'Debate', 'Aesthetic', 'Hype', 'Niche']

export default function CreateCirclePage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [memberLimit, setMemberLimit] = useState(10)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await createCircle(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary p-6 md:p-24 flex items-center justify-center selection:bg-gold selection:text-bg-primary">
      <div className="w-full max-w-2xl space-y-16 enter">
        <header className="space-y-4">
          <p className="label text-gold">INITIALIZATION PROTOCOL</p>
          <h1 className="heading-lg uppercase">Create Circle</h1>
        </header>

        <form action={handleSubmit} className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             <div className="space-y-8">
                <div className="group space-y-2">
                  <p className="label !text-text-tertiary">Circle Name</p>
                  <input 
                    name="name" 
                    type="text" 
                    required 
                    maxLength={30}
                    placeholder="e.g. Chaos Theory"
                    className="w-full !text-xl !font-ibm uppercase tracking-widest !border-white/10 focus:!border-gold"
                  />
                </div>

                <div className="group space-y-2">
                  <p className="label !text-text-tertiary">Genre</p>
                  <select 
                    name="genre" 
                    required
                    className="w-full bg-transparent border-none border-b border-border-custom py-3 text-sm font-ibm uppercase tracking-widest outline-none focus:border-gold transition-colors appearance-none cursor-pointer"
                  >
                    {GENRES.map(g => (
                      <option key={g} value={g} className="bg-bg-surface text-text-primary">{g}</option>
                    ))}
                  </select>
                </div>
             </div>

             <div className="space-y-8">
                <div className="group space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="label !text-text-tertiary">Member Limit</p>
                    <p className="text-xl font-ibm text-gold">{memberLimit}</p>
                  </div>
                  <input 
                    name="memberLimit" 
                    type="range" 
                    min={5} 
                    max={10} 
                    value={memberLimit}
                    onChange={(e) => setMemberLimit(parseInt(e.target.value))}
                    className="w-full h-1 bg-bg-surface appearance-none cursor-pointer accent-gold border-none"
                  />
                  <div className="flex justify-between text-[8px] label opacity-20">
                    <span>5 MIN</span>
                    <span>10 MAX</span>
                  </div>
                </div>

                <div className="group space-y-2">
                  <p className="label !text-text-tertiary">Purpose / Description</p>
                  <textarea 
                    name="description" 
                    required 
                    maxLength={200}
                    rows={3}
                    placeholder="Briefly define the purpose of this collective..."
                    className="w-full !border-white/10 focus:!border-gold"
                  />
                </div>
             </div>
          </div>

          {error && (
             <div className="bg-downvote/5 border border-downvote/20 p-4">
               <p className="body-sm text-downvote uppercase tracking-widest text-[10px]">{error.replace(/_/g, ' ')}</p>
             </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-border-custom/30">
             <p className="body-sm max-w-[240px] opacity-40 text-[10px] leading-relaxed uppercase">
               INITIALIZING A CIRCLE REQUIRES CLEAR INTENT. YOU WILL BE DESIGNATED AS FOUNDER AND ASSIGNED MODERATION PRIVILEGES.
             </p>
             <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary px-12 py-4 w-full md:w-auto"
             >
               {loading ? 'INITIALIZING...' : 'Establish Circle'}
             </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        select {
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(201,169,110,0.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 0px center;
          background-size: 16px;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 12px;
          width: 12px;
          border-radius: 0;
          background: #C9A96E;
          cursor: pointer;
        }
      `}</style>
    </main>
  )
}
