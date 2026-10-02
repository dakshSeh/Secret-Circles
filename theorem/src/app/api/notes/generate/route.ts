import { NextResponse, type NextRequest } from 'next/server';
import { generateNotesWithAI } from '@/lib/ai/groq';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as {
      topic: string;
      subject: string;
      classLevel: string;
      noteType: 'normal' | 'exam_ready';
    };

    const { topic, subject, classLevel, noteType } = body;

    if (!topic || topic.trim().length < 3) {
      return NextResponse.json({ error: 'Please enter a valid topic.' }, { status: 400 });
    }
    if (!subject) {
      return NextResponse.json({ error: 'Please select a subject.' }, { status: 400 });
    }
    if (!classLevel) {
      return NextResponse.json({ error: 'Please select a class.' }, { status: 400 });
    }
    if (!noteType) {
      return NextResponse.json({ error: 'Please select a note type.' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

    const content = await generateNotesWithAI(topic, subject, classLevel, noteType, apiKey);

    return NextResponse.json({ content });
  } catch (err: unknown) {
    console.error('[notes/generate]', err);
    const message = err instanceof Error ? err.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
