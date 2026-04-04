'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function authenticateDev(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string

  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'UNAUTHORIZED' }

  // 2. Fetch Dev Circle
  const { data: devCircle, error: circleError } = await supabase
    .from('circles')
    .select('id, dev_password')
    .eq('is_dev_circle', true)
    .single()

  if (circleError || !devCircle) {
    console.error('Circle Fetch Error:', circleError)
    return { error: 'SYSTEM_ERROR' }
  }

  // 3. Compare password
  // The env var is the source of truth for the platform admin
  const devPassword = process.env.DEV_CIRCLE_PASSWORD
  
  if (password !== devPassword) {
    return { error: 'ACCESS_DENIED' }
  }

  // 4. Join Dev Circle
  const { error: joinError } = await supabase
    .from('memberships')
    .upsert({
      user_id: user.id,
      circle_id: devCircle.id,
      role: 'dev'
    }, { onConflict: 'user_id, circle_id' })

  if (joinError) {
    console.error('Join Error:', joinError)
    return { error: 'JOIN_FAILED' }
  }

  return redirect('/dev/dashboard')
}
