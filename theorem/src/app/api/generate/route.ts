import { NextResponse, type NextRequest } from 'next/server';
import { generateQuestionsWithAI } from '@/lib/ai/groq';
import { createClient } from '@/lib/supabase/server';
import type { GenerationOptions } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as {
      mode?: 'pdf' | 'topic';
      text?: string;
      topic?: string;
      classLevel?: string;
      options: GenerationOptions;
      uploadId?: string;
      title: string;
      subject?: string;
      chapter?: string;
    };

    const { mode = 'pdf', text, topic, classLevel, options, uploadId, title, subject, chapter } = body;

    if (mode === 'pdf') {
      if (!text || text.trim().length < 100) {
        return NextResponse.json({ error: 'Text too short — need at least 100 characters.' }, { status: 400 });
      }
    } else {
      if (!topic || topic.trim().length < 3) {
        return NextResponse.json({ error: 'Please enter a valid topic (at least 3 characters).' }, { status: 400 });
      }
      if (!classLevel) {
        return NextResponse.json({ error: 'Please select a target class.' }, { status: 400 });
      }
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

    // Generate with AI
    const generatedQuestions = await generateQuestionsWithAI(
      text || '',
      options,
      apiKey,
      mode === 'topic' ? { topic: topic!, subject: subject || 'General', classLevel: classLevel! } : undefined
    );

    // Create quiz set in DB
    const { data: quizSet, error: qsErr } = await supabase
      .from('quiz_sets')
      .insert({
        user_id: user.id,
        upload_id: uploadId || null,
        title,
        subject: subject || null,
        chapter: chapter || null,
        difficulty: options.difficulty,
        question_count: generatedQuestions.length,
      })
      .select()
      .single();

    if (qsErr) throw qsErr;

    // Insert questions
    const questionsToInsert = generatedQuestions.map((q, i) => ({
      quiz_set_id: quizSet.id,
      user_id: user.id,
      question_text: q.question_text,
      question_type: q.question_type,
      difficulty: q.difficulty,
      options: q.options || null,
      answer: q.answer,
      explanation: q.explanation,
      marks: q.marks,
      order_index: i,
    }));

    const { data: questions, error: qErr } = await supabase
      .from('questions')
      .insert(questionsToInsert)
      .select();

    if (qErr) throw qErr;

    return NextResponse.json({ quizSet, questions });
  } catch (err: unknown) {
    console.error('[generate]', err);
    const message = err instanceof Error ? err.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
