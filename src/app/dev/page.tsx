'use client'

import { useState } from 'react'
import { authenticateDev } from '@/app/dev/actions'

export default function DevAuthPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await authenticateDev(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const isAccessDenied = error === 'ACCESS_DENIED'

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md space-y-12 text-center enter">
        <h1 className="heading-lg tracking-widest text-text-primary">IDENTIFY YOURSELF.</h1>
        
        <form action={handleSubmit} className="relative max-w-sm mx-auto">
          <input 
            name="password" 
            type="password" 
            required 
            autoFocus
            placeholder="••••••••"
            className={`w-full text-center border-none border-b !border-white/10 bg-transparent py-4 text-2xl font-ibm text-gold focus:!border-gold outline-none transition-all duration-500 placeholder:text-text-tertiary/20 ${isAccessDenied ? 'animate-shake !border-downvote !text-downvote' : ''}`}
          />
          {isAccessDenied && (
             <p className="label text-downvote mt-6 animate-pulse">ACCESS DENIED.</p>
          )}
          {error && !isAccessDenied && (
            <p className="body-sm text-downvote mt-4">{error}</p>
          )}

          <button type="submit" hidden aria-hidden="true" />
        </form>

        <p className="label !text-text-tertiary/30">RESTRICTED ACCESS · DEV ONLY</p>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
    </main>
  )
}
