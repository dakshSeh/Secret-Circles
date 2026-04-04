'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  handle: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Handle must only contain letters, numbers, and underscores'),
  realName: z.string().optional(),
})

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    handle: formData.get('handle') as string,
    realName: formData.get('realName') as string,
  }

  const result = signupSchema.safeParse(rawData)

  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const { data } = result

  // 1. Sign up user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Signup failed. Please try again.' }
  }

  // 2. Insert into users table
  const { error: dbError } = await supabase.from('users').insert({
    id: authData.user.id,
    handle: data.handle.toLowerCase(),
    real_name: data.realName || null,
    email: data.email,
  })

  if (dbError) {
    // If handle is taken or other error
    console.error('DB Error:', dbError)
    return { error: 'Handle already taken or system error.' }
  }

  return redirect('/feed')
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  return redirect('/feed')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/login')
}
