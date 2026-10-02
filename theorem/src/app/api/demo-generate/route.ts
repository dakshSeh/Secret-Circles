import { NextResponse, type NextRequest } from 'next/server';
import { generateQuestionsWithAI } from '@/lib/ai/groq';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json() as { text: string };

    if (!text || text.trim().length < 50) {
      return NextResponse.json({ error: 'Please provide at least a short paragraph (50+ chars) to extract from.' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Generate exactly 2 MCQs from the provided text for the demo.
    // We slice the text to 2500 chars to prevent abuse/large context on the free demo.
    const generatedQuestions = await generateQuestionsWithAI(
      text.slice(0, 2500), 
      {
        questionCount: 2,
        difficulty: 'mixed',
        typeMix: { mcq: 100 },
      },
      apiKey
    );

    return NextResponse.json({ questions: generatedQuestions });
  } catch (err: unknown) {
    console.error('[demo-generate]', err);
    const message = err instanceof Error ? err.message : 'Generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
