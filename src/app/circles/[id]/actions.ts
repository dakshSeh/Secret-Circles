'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function applyToCircle(circleId: string, message: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'UNAUTHORIZED' }

  const { error } = await supabase.from('applications').insert({
    circle_id: circleId,
    user_id: user.id,
    message,
    status: 'pending'
  })

  if (error) {
    if (error.code === '23505') return { error: 'APPLICATION_ALREADY_EXISTS' }
    return { error: 'SYSTEM_ERROR' }
  }

  revalidatePath(`/circles/${circleId}`)
  return { success: true }
}

export async function handleApplication(applicationId: string, status: 'accepted' | 'rejected') {
  const supabase = await createClient()

  // 1. Get Application Details
  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('*')
    .eq('id', applicationId)
    .single()

  if (appError || !application) return { error: 'APPLICATION_NOT_FOUND' }

  // 2. Auth & Founder Check
  const { data: { user } } = await supabase.auth.getUser()
  const { data: circle } = await supabase
    .from('circles')
    .select('founder_id')
    .eq('id', application.circle_id)
    .single()

  if (circle?.founder_id !== user?.id) return { error: 'UNAUTHORIZED' }

  // 3. Update Application Status
  const { error: updateError } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId)

  if (updateError) return { error: 'UPDATE_FAILED' }

  // 4. Create Membership if accepted
  if (status === 'accepted') {
    const { error: joinError } = await supabase.from('memberships').insert({
      user_id: application.user_id,
      circle_id: application.circle_id,
      role: 'member'
    })

    if (joinError) return { error: 'MEMBERSHIP_CREATION_FAILED' }
  }

  revalidatePath(`/circles/${application.circle_id}`)
  return { success: true }
}
