import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: decks, error } = await supabase
      .from('flashcard_decks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ decks });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch decks';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as {
      title: string;
      subject: string;
      class_level: string;
      note_id?: string;
    };

    const { title, subject, class_level, note_id } = body;
    if (!title) return NextResponse.json({ error: 'Title is required.' }, { status: 400 });

    const { data: deck, error } = await supabase
      .from('flashcard_decks')
      .insert({ user_id: user.id, title, subject, class_level, note_id: note_id || null })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ deck });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create deck';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Deck ID required.' }, { status: 400 });

    const { error } = await supabase
      .from('flashcard_decks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete deck';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
