'use client'

import { useState } from 'react'
import { applyToCircle } from '../actions'

export function ApplyModal({ circleId, circleName }: { circleId: string; circleName: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleApply() {
    if (!message) return
    setLoading(true)
    const result = await applyToCircle(circleId, message)
    if (result.success) {
      setOpen(false)
      window.location.reload()
    } else {
      setLoading(false)
      alert(result.error)
    }
  }

  if (!open) {
    return (
      <button 
        onClick={() => setOpen(true)}
        className="btn-primary w-full py-4 tracking-[0.2em] uppercase"
      >
        Request Access
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-bg-primary/95 backdrop-blur-sm selection:bg-gold selection:text-bg-primary">
      <div className="w-full max-w-md bg-bg-surface border border-border-custom p-10 space-y-10 animate-fade-in enter">
        <div className="space-y-2">
          <p className="label text-gold">APPLICATION PROTOCOL</p>
          <h2 className="heading-md uppercase text-text-primary">{circleName}</h2>
        </div>

        <div className="space-y-4">
          <p className="label !text-[9px] text-text-tertiary">Why should you be in this circle?</p>
          <textarea 
            className="w-full h-32 bg-transparent border-none border-b border-border-custom text-text-primary text-sm outline-none focus:border-gold transition-colors resize-none !p-0"
            maxLength={150}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="State your intent..."
          />
          <div className="flex justify-between items-center text-[10px] label opacity-40">
             <span>{message.length} / 150</span>
             <span>MAX 150 CHARS</span>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
           <button 
             onClick={() => setOpen(false)}
             className="btn-primary !border-white/5 text-text-tertiary flex-1"
           >
             Cancel
           </button>
           <button 
             onClick={handleApply}
             disabled={loading || !message}
             className="btn-primary flex-1"
           >
             {loading ? 'Submitting...' : 'Submit'}
           </button>
        </div>
      </div>
    </div>
  )
}
