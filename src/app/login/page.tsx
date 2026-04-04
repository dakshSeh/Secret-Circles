'use client'

import { useState } from 'react'
import { login } from '@/app/auth/actions'
import Link from 'next/link'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg-primary text-text-primary">
      <div className="w-full max-w-sm space-y-12 enter">
        <div className="space-y-4">
          <p className="label text-gold">WELCOME BACK</p>
          <h1 className="heading-lg uppercase">Sign In</h1>
        </div>

        <form action={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="group">
              <p className="label mb-1">Email</p>
              <input 
                name="email" 
                type="email" 
                required 
                placeholder="handle@school.com"
                className="w-full"
              />
            </div>

            <div className="group">
              <p className="label mb-1">Password</p>
              <input 
                name="password" 
                type="password" 
                required 
                placeholder="••••••••"
                className="w-full"
              />
            </div>
          </div>

          {error && <p className="text-downvote body-sm">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="body-sm text-center">
          NEW VISITOR?{' '}
          <Link href="/signup" className="text-gold hover:underline">
            REQUEST ACCESS
          </Link>
        </p>
      </div>
    </main>
  )
}
