'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const createCircleSchema = z.object({
  name: z.string().min(3).max(30),
  description: z.string().max(200),
  genre: z.enum(['Meme', 'Chaos', 'Debate', 'Aesthetic', 'Hype', 'Niche']),
  memberLimit: z.number().min(5).max(10),
})

export async function createCircle(formData: FormData) {
  const supabase = await createClient()

  // 1. Auth & Eligibility Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'UNAUTHORIZED' }

  const { data: profile } = await supabase
    .from('users')
    .select('rep_score, created_at, invite_quota')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'PROFILE_NOT_FOUND' }

  const { count: userCircles } = await supabase
    .from('memberships')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { data: settings } = await supabase
    .from('admin_settings')
    .select('max_circles, allow_circle_create')
    .single()

  const { count: totalPlatformCircles } = await supabase
    .from('circles')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false)
    .eq('is_dev_circle', false)

  // Check Platform Limits
  if (!settings?.allow_circle_create) return { error: 'CIRCLE_CREATION_PAUSED' }
  if ((totalPlatformCircles || 0) >= (settings?.max_circles || 4)) return { error: 'PLATFORM_LIMIT_REACHED' }

  // Check User Eligibility (Simplified check for demo: first 20 users or 10+ rep)
  const isEligible = (profile.rep_score || 0) >= 10 || true // Simplified for seed phase
  
  if (!isEligible) return { error: 'INSUFFICIENT_REPUTATION' }
  if ((userCircles || 0) >= 4) return { error: 'USER_LIMIT_REACHED' }

  // 2. Validate Data
  const rawData = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    genre: formData.get('genre') as string,
    memberLimit: Number(formData.get('memberLimit')),
  }

  const result = createCircleSchema.safeParse(rawData)
  if (!result.success) return { error: result.error.issues[0].message }

  const { data } = result

  // 3. Create Circle
  const { data: circle, error: circleError } = await supabase
    .from('circles')
    .insert({
      name: data.name,
      description: data.description,
      genre: data.genre,
      founder_id: user.id,
      member_limit: data.memberLimit,
    })
    .select()
    .single()

  if (circleError) {
    if (circleError.code === '23505') return { error: 'NAME_ALREADY_TAKEN' }
    return { error: 'SYSTEM_ERROR' }
  }

  // 4. Create Founder Membership
  await supabase.from('memberships').insert({
    user_id: user.id,
    circle_id: circle.id,
    role: 'founder'
  })

  // 5. Boost Invite Quota
  await supabase
    .from('users')
    .update({ invite_quota: (profile.invite_quota || 0) + 2 })
    .eq('id', user.id)

  return redirect(`/circles/${circle.id}`)
}
