import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** GET /api/flashcards?deck_id=... — fetch all cards in a deck */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const deck_id = searchParams.get('deck_id');
    if (!deck_id) return NextResponse.json({ error: 'deck_id required' }, { status: 400 });

    const { data: cards, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('deck_id', deck_id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ cards });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch flashcards';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** POST /api/flashcards — create one or many cards */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as {
      deck_id: string;
      cards: Array<{ front: string; back: string; card_type?: string }>;
    };

    const { deck_id, cards } = body;
    if (!deck_id || !cards?.length) {
      return NextResponse.json({ error: 'deck_id and cards are required.' }, { status: 400 });
    }

    const rows = cards.map(c => ({
      deck_id,
      user_id: user.id,
      front: c.front,
      back: c.back,
      card_type: c.card_type || 'custom',
    }));

    const { data: inserted, error } = await supabase
      .from('flashcards')
      .insert(rows)
      .select();

    if (error) throw error;
    return NextResponse.json({ cards: inserted });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create flashcards';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** DELETE /api/flashcards?id=... — delete a single card */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Card ID required.' }, { status: 400 });

    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete flashcard';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
