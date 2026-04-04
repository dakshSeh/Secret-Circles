'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const dropSchema = z.object({
  circleId: z.string().uuid(),
  type: z.enum(['Meme', 'Thought', 'Question', 'Challenge', 'Video']),
  content: z.string().optional(),
  mediaUrl: z.string().optional(),
  isAnonymous: z.boolean().default(false),
})

export async function postDrop(formData: FormData) {
  const supabase = await createClient()

  // 1. Auth & Circle Membership Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'UNAUTHORIZED' }

  const circleId = formData.get('circleId') as string
  const { data: membership } = await supabase
    .from('memberships')
    .select('id')
    .eq('circle_id', circleId)
    .eq('user_id', user.id)
    .single()

  if (!membership) return { error: 'NOT_A_MEMBER' }

  // 2. Anonymity Weekly Limit Check
  const isAnonymous = formData.get('isAnonymous') === 'on' || formData.get('isAnonymous') === 'true'
  if (isAnonymous) {
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    
    const { count: anonCount } = await supabase
      .from('drops')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', user.id)
      .eq('is_anonymous', true)
      .gt('created_at', lastWeek.toISOString())

    if ((anonCount || 0) >= 3) {
      return { error: 'WEEKLY_ANON_LIMIT_REACHED' }
    }
  }

  // 3. Handle Media Upload (already done on client)
  const mediaUrl = formData.get('mediaUrl') as string

  // 4. Create Drop
  const { data: drop, error: dropError } = await supabase
    .from('drops')
    .insert({
      circle_id: circleId,
      author_id: user.id,
      type: formData.get('type') as string,
      content: formData.get('content') as string,
      media_url: mediaUrl || null,
      is_anonymous: isAnonymous,
    })
    .select()
    .single()

  if (dropError) {
    console.error('Drop Error:', dropError)
    return { error: 'DROP_FAILED' }
  }

  // 5. Recalculate Circle Rep
  await supabase.rpc('recalculate_circle_rep', { circle_id_input: circleId })

  revalidatePath(`/circles/${circleId}`)
  return { success: true }
}

export async function castArenaVote(dropId: string) {
  const supabase = await createClient()

  // 1. Auth & Check Membership of the drop's circle
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'UNAUTHORIZED' }

  const { data: drop } = await supabase
    .from('drops')
    .select('circle_id')
    .eq('id', dropId)
    .single()

  if (!drop) return { error: 'DROP_NOT_FOUND' }

  const { data: membership } = await supabase
    .from('memberships')
    .select('id')
    .eq('circle_id', drop.circle_id)
    .eq('user_id', user.id)
    .single()

  if (!membership) return { error: 'NOT_A_MEMBER' }

  // 2. Cast Vote
  const { error: voteError } = await supabase
    .from('arena_publish_votes')
    .insert({
      drop_id: dropId,
      voter_id: user.id
    })

  if (voteError) {
    if (voteError.code === '23505') return { error: 'ALREADY_VOTED' }
    return { error: 'VOTE_FAILED' }
  }

  revalidatePath(`/circles/${drop.circle_id}`)
  return { success: true }
}
