'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowRight, FileText, CheckCircle, XCircle } from 'lucide-react';
import type { Question, MCQOption } from '@/lib/types';

export default function InteractiveDemo() {
  const [text, setText] = useState("Photosynthesis is a process used by plants and other organisms to convert light energy into chemical energy that, through cellular respiration, can later be released to fuel the organism's activities. Some of this chemical energy is stored in carbohydrate molecules, such as sugars and starches, which are synthesized from carbon dioxide and water.");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Quiz states
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleExtract = async () => {
    if (text.trim().length < 50) {
      setError('Please provide a bit more text (at least 50 characters).');
      return;
    }
    
    setError(null);
    setLoading(true);
    setQuestions([]);
    setCurrent(0);
    setSelected(null);
    setRevealed(false);

    try {
      const res = await fetch('/api/demo-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');
      
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (answer: string) => {
    if (revealed) return;
    setSelected(answer);
    setRevealed(true);
  };

  const nextQuestion = () => {
    if (current + 1 < questions.length) {
      setCurrent(c => c + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      // Loop back to edit mode or reset
      setQuestions([]);
      setCurrent(0);
      setSelected(null);
      setRevealed(false);
    }
  };

  const q = questions[current];
  const options = q?.options as MCQOption[] | undefined;

  return (
    <div style={{ margin: '0 auto', maxWidth: 800, width: '100%', padding: '0 1rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontFamily: 'var(--font-serif)', marginBottom: '0.5rem' }}>Experience the Forge</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.85rem, 2.5vw, 1rem)' }}>Paste any text below and watch the AI extract exam-ready questions instantly.</p>
      </div>

      <div className="card" style={{ padding: '2px', background: 'linear-gradient(135deg, var(--border), var(--surface))', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'calc(var(--radius-lg) - 2px)' }}>
          <AnimatePresence mode="wait">
            {questions.length === 0 ? (
              <motion.div
                key="input-mode"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                <div style={{ position: 'relative' }}>
                  <FileText size={18} style={{ position: 'absolute', top: '1rem', left: '1rem', color: 'var(--text-muted)' }} />
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Paste a paragraph from your notes or textbook here..."
                    style={{ 
                      width: '100%', 
                      height: 180, 
                      padding: '1rem 1rem 1rem 3rem',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      color: 'var(--text)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
                      resize: 'none',
                      lineHeight: 1.6,
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--ember)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                  />
                </div>
                {error && <div style={{ color: 'var(--error)', fontSize: '0.85rem' }}>{error}</div>}
                <button 
                  onClick={handleExtract} 
                  disabled={loading}
                  className="btn btn-primary" 
                  style={{ alignSelf: 'flex-end', minWidth: 160 }}
                >
                  {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin-slow 0.8s linear infinite' }} />
                      Extracting...
                    </div>
                  ) : (
                    <>Extract Questions <Zap size={16} /></>
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="quiz-mode"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--ember)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    AI Generated • Question {current + 1} of {questions.length}
                  </span>
                  <button onClick={() => setQuestions([])} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    Reset
                  </button>
                </div>
                
                <h3 style={{ fontSize: '1.1rem', lineHeight: 1.6, fontWeight: 500, marginBottom: '1.5rem' }}>{q.question_text}</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  {options?.map((opt, i) => {
                    const isSelected = selected === opt.label;
                    let bg = 'var(--surface-2)';
                    let border = 'var(--border)';
                    let color = 'var(--text)';
                    
                    if (revealed) {
                      if (opt.is_correct) {
                        bg = 'rgba(34,197,94,0.1)';
                        border = 'rgba(34,197,94,0.3)';
                        color = '#4ade80';
                      } else if (isSelected && !opt.is_correct) {
                        bg = 'rgba(239,68,68,0.1)';
                        border = 'rgba(239,68,68,0.3)';
                        color = '#f87171';
                      }
                    } else if (isSelected) {
                      bg = 'var(--ember-subtle)';
                      border = 'var(--ember-border)';
                    }

                    return (
                      <motion.button
                        key={i}
                        onClick={() => handleSelect(opt.label)}
                        whileHover={!revealed ? { scale: 1.01 } : {}}
                        whileTap={!revealed ? { scale: 0.98 } : {}}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.875rem 1rem', borderRadius: 'var(--radius)',
                          cursor: revealed ? 'default' : 'pointer',
                          textAlign: 'left', background: bg, border: `1px solid ${border}`, color: color,
                          transition: 'all 0.2s', fontSize: '0.95rem'
                        }}
                      >
                        <span style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.05)' }}>
                          {opt.label}
                        </span>
                        <span style={{ flex: 1, color: revealed ? color : 'var(--text)' }}>{opt.text}</span>
                        {revealed && opt.is_correct && <CheckCircle size={18} color="var(--success)" />}
                        {revealed && isSelected && !opt.is_correct && <XCircle size={18} color="var(--error)" />}
                      </motion.button>
                    )
                  })}
                </div>

                {revealed && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.5 }}><span style={{ color: 'var(--ember)', fontWeight: 600 }}>Explanation: </span>{q.explanation}</p>
                    </div>
                    <button onClick={nextQuestion} className="btn btn-primary btn-sm" style={{ flexShrink: 0, marginLeft: '1rem' }}>
                      {current + 1 < questions.length ? 'Next' : 'Try Again'} <ArrowRight size={14} />
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
