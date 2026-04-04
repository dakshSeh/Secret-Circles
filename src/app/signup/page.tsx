'use client'

import { useState } from 'react'
import { signup } from '@/app/auth/actions'
import Link from 'next/link'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await signup(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg-primary text-text-primary">
      <div className="w-full max-w-sm space-y-12 enter">
        <div className="space-y-4">
          <p className="label text-gold">IDENTIFICATION REQUIRED</p>
          <h1 className="heading-lg uppercase">Join the Circles</h1>
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
              <p className="label mb-1">Handle</p>
              <input 
                name="handle" 
                type="text" 
                required 
                placeholder="unique_identity"
                className="w-full"
              />
            </div>

            <div className="group">
              <p className="label mb-1">Real Name (Optional)</p>
              <input 
                name="realName" 
                type="text" 
                placeholder="First Last"
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
            {loading ? 'Processing...' : 'Request Access'}
          </button>
        </form>

        <p className="body-sm text-center">
          ALREADY AUTHORIZED?{' '}
          <Link href="/login" className="text-gold hover:underline">
            SIGN IN
          </Link>
        </p>
      </div>
    </main>
  )
}
