'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, BookOpen, Clock, X } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import QuizRunner, { type SessionResult } from '@/components/quiz/QuizRunner';
import type { QuizSet, Question, QuizMode } from '@/lib/types';

export default function PracticePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [quizSet, setQuizSet] = useState<QuizSet | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizMode, setQuizMode] = useState<QuizMode | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const [setRes, qRes] = await Promise.all([
        supabase.from('quiz_sets').select('*').eq('id', id).single(),
        supabase.from('questions').select('*').eq('quiz_set_id', id).order('order_index', { ascending: true }),
      ]);

      if (setRes.error || !setRes.data) {
        router.push('/saved');
        return;
      }

      setQuizSet(setRes.data);
      setQuestions(qRes.data || []);
      setLoading(false);
    }
    load();
  }, [id, router]);

  const handleSessionComplete = async (results: SessionResult[]) => {
    if (!quizSet || !quizMode) return;
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const correct = results.filter(r => r.isCorrect).length;
    const accuracy = results.length > 0 ? (correct / results.length) * 100 : 0;
    const duration = results.reduce((s, r) => s + r.timeTakenSecs, 0);

    const { data: session } = await supabase.from('quiz_sessions').insert({
      user_id: user.id,
      quiz_set_id: quizSet.id,
      mode: quizMode,
      score: correct,
      accuracy,
      duration_secs: duration,
      completed: true,
      completed_at: new Date().toISOString(),
    }).select().single();

    if (session) {
      const answers = results.map(r => ({
        session_id: session.id,
        question_id: r.questionId,
        user_id: user.id,
        user_answer: r.userAnswer,
        is_correct: r.isCorrect,
        time_taken_secs: r.timeTakenSecs,
      }));
      await supabase.from('session_answers').insert(answers);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <div className="shimmer" style={{ height: 200, borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  if (!quizSet || questions.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Quiz set not found or empty</h2>
        <Link href="/saved" className="btn btn-ghost" style={{ marginTop: '1rem' }}>Return to Saved</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
      <Link href="/saved" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none', marginBottom: '2rem', transition: 'color 0.2s' }}>
        <ArrowLeft size={14} /> Back to Saved
      </Link>

      {!sessionStarted ? (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card card-ember">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {quizSet.subject && <span className="tag">{quizSet.subject}</span>}
            {quizSet.chapter && <span className="tag">{quizSet.chapter}</span>}
            <span className="tag" style={{ textTransform: 'capitalize' }}>{quizSet.difficulty} Difficulty</span>
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', lineHeight: 1.2 }}>{quizSet.title}</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
            This set contains {questions.length} questions forged by Theorem. Choose your practice mode below to begin.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <button
              onClick={() => { setQuizMode('practice'); setSessionStarted(true); }}
              className="card"
              style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface-2)', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--ember)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Play size={18} color="var(--ember)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Practice Mode</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                Untimed session. Get immediate feedback, correct answers, and AI explanations after every question.
              </p>
            </button>

            <button
              onClick={() => { setQuizMode('exam'); setSessionStarted(true); }}
              className="card"
              style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--surface-2)', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--ember)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Clock size={18} color="var(--ember)" />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Exam Mode</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                Simulated test environment with a ticking clock. Results and explanations are only shown at the end.
              </p>
            </button>
          </div>
        </motion.div>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{quizSet.title}</h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {quizMode === 'practice' ? 'Practice Session' : 'Exam Simulation'}
              </span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setSessionStarted(false)}>
              <X size={14} /> Exit
            </button>
          </div>
          <QuizRunner
            questions={questions}
            mode={quizMode || 'practice'}
            timeLimitMinutes={Math.max(10, questions.length * 1.5)} // 1.5 mins per question roughly
            onComplete={handleSessionComplete}
          />
        </div>
      )}
    </div>
  );
}
