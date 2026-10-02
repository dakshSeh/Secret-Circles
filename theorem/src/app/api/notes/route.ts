import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ notes });
  } catch (err: unknown) {
    console.error('[notes/get]', err);
    const message = err instanceof Error ? err.message : 'Failed to fetch notes';
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
      note_type: 'normal' | 'exam_ready';
      content: string;
    };

    const { title, subject, class_level, note_type, content } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required.' }, { status: 400 });
    }

    const { data: note, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title,
        subject,
        class_level,
        note_type,
        content,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ note });
  } catch (err: unknown) {
    console.error('[notes/post]', err);
    const message = err instanceof Error ? err.message : 'Failed to save note';
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

    if (!id) return NextResponse.json({ error: 'Note ID is required.' }, { status: 400 });

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[notes/delete]', err);
    const message = err instanceof Error ? err.message : 'Failed to delete note';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
