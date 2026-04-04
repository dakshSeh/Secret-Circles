'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function voteDrop(dropId: string, direction: 'up' | 'down') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'UNAUTHORIZED' }

  // 1. Fetch current vote
  const { data: existingVote } = await supabase
    .from('drop_votes')
    .select('*')
    .eq('drop_id', dropId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingVote) {
    if (existingVote.direction === direction) {
      // Remove vote if clicking the same direction
      await supabase.from('drop_votes').delete().eq('id', existingVote.id)
    } else {
      // switch direction
      await supabase.from('drop_votes').update({ direction }).eq('id', existingVote.id)
    }
  } else {
    // New vote
    const { error: insertError } = await supabase.from('drop_votes').insert({
      drop_id: dropId,
      user_id: user.id,
      direction
    })
    
    if (insertError) return { error: 'VOTE_FAILED' }
  }

  // The database trigger 'calculate_drop_score' and 'calculate_user_rep' will handle the scoring logic.
  revalidatePath('/feed')
  return { success: true }
}
