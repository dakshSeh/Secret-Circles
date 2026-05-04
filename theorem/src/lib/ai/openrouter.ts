import type { GeneratedQuestion, GenerationOptions, QuestionType, Difficulty } from '@/lib/types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.0-flash-001';

function buildCBSEPrompt(text: string, options: GenerationOptions): string {
  const { difficulty, questionCount, typeMix } = options;

  const typeBreakdown = Object.entries(typeMix)
    .filter(([, pct]) => pct && pct > 0)
    .map(([type, pct]) => `  - ${type}: ${pct}%`)
    .join('\n');

  const difficultyInstruction = difficulty === 'mixed'
    ? 'Mix difficulty levels: approximately 30% easy, 40% moderate, 30% hard.'
    : `All questions should be ${difficulty} difficulty.`;

  return `You are an expert CBSE exam question paper setter with 20+ years of experience.
Your task is to generate exactly ${questionCount} high-quality, exam-ready questions from the provided study material.

CRITICAL RULES:
1. Questions must be strictly based on the provided text. No hallucinated facts.
2. Use authentic CBSE board exam wording and style.
3. ${difficultyInstruction}
4. Questions must be syllabus-relevant and academically accurate.
5. Each MCQ must have exactly 4 options (A, B, C, D) with exactly one correct answer.
6. Explanations must be concise and educational (2-3 sentences).

QUESTION TYPE DISTRIBUTION (approximate percentages):
${typeBreakdown || '  - Mix of MCQ and short answer questions'}

QUESTION TYPE DEFINITIONS:
- mcq: Multiple choice with 4 options, 1 mark
- assertion_reason: Assertion-Reason format (A: ..., R: ...), 1 mark
- fill_blank: Fill in the blank, 1 mark
- short_2mark: Short answer, 2 marks (3-4 sentences expected)
- short_3mark: Short answer, 3 marks (5-6 sentences expected)
- long_5mark: Long answer/essay, 5 marks (detailed explanation)
- case_based: Passage-based comprehension question, 4 marks
- hots: Higher order thinking, application/analysis, 3 marks
- match_following: Match column A with column B, 1 mark

OUTPUT FORMAT: Respond ONLY with a valid JSON array. No markdown, no explanation outside JSON.

[
  {
    "question_text": "...",
    "question_type": "mcq",
    "difficulty": "easy",
    "options": [
      {"label": "A", "text": "...", "is_correct": false},
      {"label": "B", "text": "...", "is_correct": true},
      {"label": "C", "text": "...", "is_correct": false},
      {"label": "D", "text": "...", "is_correct": false}
    ],
    "answer": "B",
    "explanation": "...",
    "marks": 1
  }
]

For non-MCQ questions, omit the "options" field and set "answer" to the model answer text.

STUDY MATERIAL:
---
${text.slice(0, 12000)}
---

Generate exactly ${questionCount} questions now:`;
}

export async function generateQuestionsWithAI(
  text: string,
  options: GenerationOptions,
  apiKey: string
): Promise<GeneratedQuestion[]> {
  const prompt = buildCBSEPrompt(text, options);

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Theorem - CBSE Assessment Platform',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 8000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} — ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) throw new Error('No content returned from AI');

  // Strip markdown code fences if present
  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  const questions = JSON.parse(cleaned) as GeneratedQuestion[];

  // Normalize and validate
  return questions.map((q, i) => ({
    question_text: q.question_text || `Question ${i + 1}`,
    question_type: (q.question_type || 'mcq') as QuestionType,
    difficulty: (q.difficulty || 'moderate') as Difficulty,
    options: q.options || undefined,
    answer: q.answer || '',
    explanation: q.explanation || '',
    marks: q.marks || 1,
  }));
}
