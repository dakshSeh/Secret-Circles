import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * PATCH /api/flashcards/review
 * SM-2 spaced repetition algorithm update.
 * rating: 0=Again, 1=Hard, 2=Good, 3=Easy
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as { card_id: string; rating: 0 | 1 | 2 | 3 };
    const { card_id, rating } = body;

    if (!card_id || rating === undefined) {
      return NextResponse.json({ error: 'card_id and rating are required.' }, { status: 400 });
    }

    // Fetch current card state
    const { data: card, error: fetchErr } = await supabase
      .from('flashcards')
      .select('ease_factor, interval_days, repetitions')
      .eq('id', card_id)
      .eq('user_id', user.id)
      .single();

    if (fetchErr || !card) return NextResponse.json({ error: 'Card not found.' }, { status: 404 });

    // SM-2 Algorithm
    let { ease_factor, interval_days, repetitions } = card;

    if (rating < 2) {
      // Again / Hard — reset
      repetitions = 0;
      interval_days = 1;
    } else {
      // Good / Easy
      if (repetitions === 0) {
        interval_days = 1;
      } else if (repetitions === 1) {
        interval_days = 3;
      } else {
        interval_days = Math.round(interval_days * ease_factor);
      }
      repetitions += 1;
    }

    // Update ease factor based on rating (SM-2 formula)
    ease_factor = Math.max(1.3, ease_factor + 0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02));

    const due_date = new Date();
    due_date.setDate(due_date.getDate() + interval_days);

    const { error: updateErr } = await supabase
      .from('flashcards')
      .update({
        ease_factor,
        interval_days,
        repetitions,
        due_date: due_date.toISOString().split('T')[0],
        last_reviewed_at: new Date().toISOString(),
      })
      .eq('id', card_id)
      .eq('user_id', user.id);

    if (updateErr) throw updateErr;
    return NextResponse.json({ success: true, next_interval: interval_days });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update review';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
