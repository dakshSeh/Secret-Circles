'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, CheckCircle, XCircle, ChevronRight, Award } from 'lucide-react';
import type { Question, QuizMode, MCQOption } from '@/lib/types';

interface Props {
  questions: Question[];
  mode: QuizMode;
  timeLimitMinutes?: number;
  onComplete: (results: SessionResult[]) => void;
}

export interface SessionResult {
  questionId: string;
  userAnswer: string | null;
  isCorrect: boolean;
  timeTakenSecs: number;
}

export default function QuizRunner({ questions, mode, timeLimitMinutes = 30, onComplete }: Props) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<SessionResult[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimitMinutes * 60);
  const startTime = useRef(Date.now());
  const questionStart = useRef(Date.now());

  // Exam mode timer
  useEffect(() => {
    if (mode !== 'exam') return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(interval); handleFinish(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const q = questions[current];
  const isMCQ = q?.question_type === 'mcq';
  const options = q?.options as MCQOption[] | null;

  const handleSelect = (answer: string) => {
    if (revealed) return;
    setSelected(answer);
    if (mode === 'practice') setRevealed(true);
  };

  const handleNext = () => {
    const timeTaken = Math.round((Date.now() - questionStart.current) / 1000);
    const correctAnswer = isMCQ
      ? options?.find(o => o.is_correct)?.label || ''
      : q.answer || '';
    const isCorrect = selected !== null && selected === correctAnswer;

    const result: SessionResult = {
      questionId: q.id,
      userAnswer: selected,
      isCorrect,
      timeTakenSecs: timeTaken,
    };

    const newAnswers = [...answers, result];
    setAnswers(newAnswers);

    if (current + 1 >= questions.length) {
      handleFinish(newAnswers);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setRevealed(false);
      questionStart.current = Date.now();
    }
  };

  const handleFinish = (finalAnswers = answers) => {
    setFinished(true);
    onComplete(finalAnswers);
  };

  const getOptionStyle = (opt: MCQOption) => {
    if (!revealed) return {
      background: selected === opt.label ? 'var(--ember-subtle)' : 'var(--surface-2)',
      border: `1px solid ${selected === opt.label ? 'var(--ember-border)' : 'var(--border)'}`,
      color: 'var(--text)',
    };
    if (opt.is_correct) return { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' };
    if (selected === opt.label && !opt.is_correct) return { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' };
    return { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' };
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const accuracy = answers.length > 0
    ? Math.round((answers.filter(a => a.isCorrect).length / answers.length) * 100)
    : 0;

  if (finished) {
    const correct = answers.filter(a => a.isCorrect).length;
    const totalTime = Math.round((Date.now() - startTime.current) / 1000);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: 'center', padding: '3rem 2rem' }}
      >
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--ember-subtle)', border: '2px solid var(--ember-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <Award size={32} color="var(--ember)" />
        </div>
        <h2 style={{ marginBottom: '0.5rem' }}>Session Complete</h2>
        <p style={{ marginBottom: '2rem' }}>Here&apos;s how you performed.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', maxWidth: 400, margin: '0 auto 2rem' }}>
          {[
            { label: 'Accuracy', value: `${accuracy}%` },
            { label: 'Correct', value: `${correct}/${answers.length}` },
            { label: 'Time', value: formatTime(totalTime) },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--ember)', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (!q) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Question <span style={{ color: 'var(--text)', fontWeight: 700 }}>{current + 1}</span> of {questions.length}
          </span>
          {/* Progress bar */}
          <div style={{ width: 100, height: 4, background: 'var(--surface-3)', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--ember)', borderRadius: 100, width: `${((current + 1) / questions.length) * 100}%`, transition: 'width 0.4s' }} />
          </div>
        </div>
        {mode === 'exam' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: timeLeft < 120 ? 'var(--error)' : 'var(--text-muted)', fontSize: '0.875rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            <Timer size={14} />
            {formatTime(timeLeft)}
          </div>
        )}
        {mode === 'practice' && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Score: <span style={{ color: 'var(--ember)', fontWeight: 700 }}>{accuracy}%</span>
          </div>
        )}
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="card"
          style={{ borderColor: 'var(--border-2)' }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <span className="question-number">Q{current + 1}</span>
            <p style={{ color: 'var(--text)', fontSize: '1rem', lineHeight: 1.65, fontWeight: 400 }}>
              {q.question_text}
            </p>
          </div>

          {isMCQ && options && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {options.map(opt => (
                <button
                  key={opt.label}
                  onClick={() => handleSelect(opt.label)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.75rem 1rem', borderRadius: 'var(--radius)',
                    cursor: revealed ? 'default' : 'pointer',
                    textAlign: 'left', font: 'inherit', fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    ...getOptionStyle(opt),
                  }}
                >
                  <span style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.05)' }}>
                    {opt.label}
                  </span>
                  <span style={{ flex: 1 }}>{opt.text}</span>
                  {revealed && opt.is_correct && <CheckCircle size={16} color="var(--success)" />}
                  {revealed && selected === opt.label && !opt.is_correct && <XCircle size={16} color="var(--error)" />}
                </button>
              ))}
            </div>
          )}

          {!isMCQ && (
            <div>
              <textarea
                placeholder="Type your answer here…"
                value={selected || ''}
                onChange={e => setSelected(e.target.value)}
                rows={4}
                className="input"
                style={{ resize: 'vertical', fontFamily: 'var(--font-sans)' }}
                disabled={revealed}
              />
              {revealed && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: '0.75rem', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius)', padding: '0.75rem 1rem' }}
                >
                  <p style={{ fontSize: '0.78rem', fontWeight: 600, color: '#4ade80', marginBottom: '0.3rem' }}>Model Answer</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.65 }}>{q.answer}</p>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        {!isMCQ && !revealed && (
          <button className="btn btn-ghost" onClick={() => setRevealed(true)}>
            Show Answer
          </button>
        )}
        {(revealed || mode === 'exam') && (
          <button className="btn btn-primary" onClick={handleNext}>
            {current + 1 >= questions.length ? 'Finish' : 'Next'}
            <ChevronRight size={15} />
          </button>
        )}
      </div>

      {/* Practice feedback */}
      {mode === 'practice' && revealed && isMCQ && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius)',
              background: answers.length > 0 && answers[answers.length - 1]?.isCorrect
                ? 'rgba(34,197,94,0.08)'
                : 'rgba(239,68,68,0.08)',
              border: `1px solid ${answers.length > 0 && answers[answers.length - 1]?.isCorrect
                ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}
          >
            {q.explanation && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.65 }}>
                <span style={{ fontWeight: 600, color: 'var(--ember)' }}>Explanation: </span>
                {q.explanation}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
