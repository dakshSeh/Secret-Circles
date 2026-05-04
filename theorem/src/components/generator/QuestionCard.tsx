'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, RotateCcw, ArrowUpCircle, ArrowDownCircle, Shuffle, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import type { Question, MCQOption } from '@/lib/types';

interface Props {
  question: Question;
  index: number;
  showAnswer?: boolean;
  onRegenerate?: (id: string) => void;
}

const TYPE_LABELS: Record<string, string> = {
  mcq: 'MCQ', assertion_reason: 'Assertion-Reason', match_following: 'Match',
  fill_blank: 'Fill in Blank', short_2mark: '2 Mark', short_3mark: '3 Mark',
  long_5mark: '5 Mark', case_based: 'Case Based', hots: 'HOTS',
};

export default function QuestionCard({ question, index, showAnswer = false, onRegenerate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(showAnswer);

  const isMCQ = question.question_type === 'mcq';
  const options = question.options as MCQOption[] | null;

  const handleOptionClick = (label: string) => {
    if (revealed) return;
    setSelectedOption(label);
    setRevealed(true);
  };

  const getOptionStyle = (opt: MCQOption) => {
    if (!revealed) {
      return {
        background: selectedOption === opt.label ? 'var(--ember-subtle)' : 'var(--surface-2)',
        border: `1px solid ${selectedOption === opt.label ? 'var(--ember-border)' : 'var(--border)'}`,
        color: 'var(--text)',
      };
    }
    if (opt.is_correct) return { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80' };
    if (selectedOption === opt.label && !opt.is_correct) return { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' };
    return { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="question-card"
    >
      <div className="question-card-header">
        <span className="question-number">Q{index + 1}</span>
        <div style={{ flex: 1 }}>
          {/* Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem', flexWrap: 'wrap' }}>
            <span className={`badge badge-${question.difficulty}`}>{question.difficulty}</span>
            <span className="badge badge-ember">{TYPE_LABELS[question.question_type] || question.question_type}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>{question.marks} mark{question.marks > 1 ? 's' : ''}</span>
          </div>
          {/* Question text */}
          <p style={{ color: 'var(--text)', fontSize: '0.925rem', lineHeight: 1.65, fontWeight: 400 }}>
            {question.question_text}
          </p>
        </div>
      </div>

      {/* MCQ Options */}
      {isMCQ && options && (
        <div style={{ padding: '0 1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleOptionClick(opt.label)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius)',
                cursor: revealed ? 'default' : 'pointer',
                textAlign: 'left',
                font: 'inherit', fontSize: '0.875rem',
                transition: 'all 0.2s',
                ...getOptionStyle(opt),
              }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
                background: 'rgba(255,255,255,0.05)',
              }}>
                {opt.label}
              </span>
              <span style={{ flex: 1 }}>{opt.text}</span>
              {revealed && opt.is_correct && <CheckCircle size={15} color="var(--success)" />}
              {revealed && selectedOption === opt.label && !opt.is_correct && <XCircle size={15} color="var(--error)" />}
            </button>
          ))}
        </div>
      )}

      {/* Non-MCQ: reveal answer */}
      {!isMCQ && (
        <div style={{ padding: '0 1.5rem 1rem' }}>
          <AnimatePresence>
            {!revealed ? (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setRevealed(true)}
              >
                <BookOpen size={13} /> Show answer
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{
                  background: 'rgba(34,197,94,0.06)',
                  border: '1px solid rgba(34,197,94,0.2)',
                  borderRadius: 'var(--radius)',
                  padding: '0.75rem 1rem',
                }}
              >
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4ade80', marginBottom: '0.3rem' }}>Model Answer</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: 1.6 }}>{question.answer}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Footer: explanation + actions */}
      <div style={{
        borderTop: '1px solid var(--border)', padding: '0.75rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem',
        flexWrap: 'wrap',
      }}>
        {/* Explanation toggle */}
        {question.explanation && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setExpanded(!expanded)}
            style={{ fontSize: '0.78rem' }}
          >
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {expanded ? 'Hide' : 'Show'} explanation
          </button>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.35rem', marginLeft: 'auto' }}>
          {onRegenerate && (
            <button
              className="btn btn-ghost btn-sm btn-icon"
              title="Regenerate question"
              onClick={() => onRegenerate(question.id)}
            >
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Explanation */}
      <AnimatePresence>
        {expanded && question.explanation && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              margin: '0 1.5rem 1.25rem',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '0.875rem 1rem',
            }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--ember)', marginBottom: '0.35rem' }}>
                Explanation
              </p>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.65, color: 'var(--text-muted)' }}>
                {question.explanation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
