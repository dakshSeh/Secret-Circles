'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Layers, RotateCcw, Plus, Trash2,
  CheckCircle, XCircle, Clock, AlertCircle, ChevronRight,
  Zap, Award
} from 'lucide-react';
import { useSound } from '@/lib/hooks/useSound';
import Link from 'next/link';
import type { Flashcard, FlashcardDeck } from '@/lib/types';

type Tab = 'study' | 'manage';
type ReviewRating = 0 | 1 | 2 | 3;

const RATING_LABELS: Record<ReviewRating, { label: string; color: string; next: string }> = {
  0: { label: 'Again', color: '#C77C7C', next: '<1m' },
  1: { label: 'Hard',  color: '#D6B98C', next: '~1d' },
  2: { label: 'Good',  color: '#7C9D96', next: '~3d' },
  3: { label: 'Easy',  color: '#6B9E6B', next: '~7d' },
};

export default function DeckStudyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) || 'study';
  const { playPop, playThunk } = useSound();

  const [tab, setTab] = useState<Tab>(initialTab);
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Study mode state
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [sessionStats, setSessionStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [isRating, setIsRating] = useState(false);

  // Manage mode state
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [adding, setAdding] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [decksRes, cardsRes] = await Promise.all([
        fetch('/api/flashcards/decks'),
        fetch(`/api/flashcards?deck_id=${id}`),
      ]);
      const decksData = await decksRes.json();
      const cardsData = await cardsRes.json();
      if (!decksRes.ok) throw new Error(decksData.error);
      if (!cardsRes.ok) throw new Error(cardsData.error);

      const foundDeck = (decksData.decks || []).find((d: FlashcardDeck) => d.id === id);
      setDeck(foundDeck || null);
      const fetchedCards: Flashcard[] = cardsData.cards || [];
      setCards(fetchedCards);
      // Build study queue (due today or never reviewed first)
      const today = new Date().toISOString().split('T')[0];
      const due = fetchedCards.filter(c => c.due_date <= today);
      const notDue = fetchedCards.filter(c => c.due_date > today);
      setQueue([...due, ...notDue]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load deck');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const t = setTimeout(() => fetchData(), 0);
    return () => clearTimeout(t);
  }, [fetchData]);

  const currentCard = queue[currentIndex] ?? null;

  const handleRate = async (rating: ReviewRating) => {
    if (!currentCard || isRating) return;
    setIsRating(true);

    // Update stats
    setSessionStats(prev => ({
      ...prev,
      again: rating === 0 ? prev.again + 1 : prev.again,
      hard:  rating === 1 ? prev.hard  + 1 : prev.hard,
      good:  rating === 2 ? prev.good  + 1 : prev.good,
      easy:  rating === 3 ? prev.easy  + 1 : prev.easy,
    }));

    try {
      await fetch('/api/flashcards/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ card_id: currentCard.id, rating }),
      });
    } catch { /* silent fail for UX */ }

    setFlipped(false);
    setTimeout(() => {
      if (currentIndex + 1 >= queue.length) {
        setSessionDone(true);
      } else {
        setCurrentIndex(i => i + 1);
      }
      setIsRating(false);
    }, 200);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setSessionDone(false);
    setSessionStats({ again: 0, hard: 0, good: 0, easy: 0 });
    // Shuffle
    setQueue(q => [...q].sort(() => Math.random() - 0.5));
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deck_id: id, cards: [{ front: newFront, back: newBack, card_type: 'custom' }] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCards(prev => [...prev, ...(data.cards || [])]);
      setNewFront(''); setNewBack('');
      setShowAddForm(false);
      fetchData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add card');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await fetch(`/api/flashcards?id=${cardId}`, { method: 'DELETE' });
      setCards(prev => prev.filter(c => c.id !== cardId));
    } catch { setError('Failed to delete card'); }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
        <div className="card shimmer" style={{ height: 60, marginBottom: '1.5rem' }} />
        <div className="card shimmer" style={{ height: 400 }} />
      </div>
    );
  }

  if (!deck) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Deck not found.</p>
        <Link href="/flashcards" className="btn btn-ghost" style={{ marginTop: '1rem' }}>
          <ArrowLeft size={14} /> Back to Decks
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.5rem' }}>
          <button className="btn btn-ghost btn-icon" onClick={() => router.push('/flashcards')}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{deck.title}</h1>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
              {deck.subject && <span className="tag">{deck.subject}</span>}
              {deck.class_level && <span className="tag">{deck.class_level}</span>}
              <span className="tag"><Layers size={11} style={{ marginRight: 3 }} />{deck.card_count} cards</span>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', background: 'var(--surface-2)', padding: '0.35rem', borderRadius: 'var(--radius)', width: 'fit-content' }}>
          {(['study', 'manage'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                padding: '0.45rem 1.25rem', borderRadius: 'calc(var(--radius) - 2px)',
                border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
                background: tab === t ? 'var(--surface)' : 'transparent',
                color: tab === t ? 'var(--ember)' : 'var(--text-muted)',
                boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
                transition: 'all 0.2s',
              }}>
              {t === 'study' ? '⚡ Study' : '✏️ Manage'}
            </button>
          ))}
        </div>
      </motion.div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(199,124,124,0.1)', border: '1px solid rgba(199,124,124,0.3)', borderRadius: 'var(--radius)', padding: '0.875rem 1rem', marginBottom: '1.5rem' }}>
          <AlertCircle size={16} color="var(--error)" />
          <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--error)' }}>{error}</span>
        </div>
      )}

      {/* ==================== STUDY TAB ==================== */}
      {tab === 'study' && (
        <AnimatePresence mode="wait">
          {cards.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: 'center', padding: '5rem 2rem' }}>
              <Layers size={40} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
              <h3>No cards in this deck</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Switch to Manage to add cards manually.</p>
              <button className="btn btn-primary" onClick={() => setTab('manage')}><Plus size={14} /> Add Cards</button>
            </motion.div>
          ) : sessionDone ? (
            /* ===== Session Complete ===== */
            <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
              <div style={{ width: 64, height: 64, background: 'var(--ember-subtle)', border: '1px solid var(--ember-border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                <Award size={28} color="var(--ember)" />
              </div>
              <h2 style={{ margin: '0 0 0.5rem' }}>Session Complete!</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                You reviewed all {queue.length} cards. Keep it up!
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', maxWidth: 480, margin: '0 auto 2.5rem' }}>
                {(Object.entries(RATING_LABELS) as [string, typeof RATING_LABELS[0]][]).map(([r, meta]) => (
                  <div key={r} style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: '0.875rem 0.5rem', border: `1px solid var(--border)` }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: meta.color }}>
                      {sessionStats[r === '0' ? 'again' : r === '1' ? 'hard' : r === '2' ? 'good' : 'easy']}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{meta.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={handleRestart}><RotateCcw size={14} /> Study Again</button>
                <Link href="/flashcards" className="btn btn-ghost"><ArrowLeft size={14} /> All Decks</Link>
              </div>
            </motion.div>
          ) : (
            /* ===== Active Study ===== */
            <motion.div key="study" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Progress bar */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  <span>Card {currentIndex + 1} of {queue.length}</span>
                  <span>{Math.round(((currentIndex) / queue.length) * 100)}% complete</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(currentIndex / queue.length) * 100}%` }} />
                </div>
              </div>

              {/* Flashcard with 3D flip */}
              {currentCard && (
                <div style={{ perspective: '1200px', marginBottom: '1.75rem' }}>
                  <motion.div
                    key={currentCard.id}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    <div
                      onClick={() => {
                        setFlipped(f => !f);
                        if (!flipped) playThunk(); // Only play thunk when flipping to the back
                      }}
                      style={{
                        position: 'relative',
                        minHeight: 280,
                        cursor: 'pointer',
                        transformStyle: 'preserve-3d',
                        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      {/* Front */}
                      <div style={{
                        position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)', padding: '3rem 2.5rem',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'var(--shadow)',
                      }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '1.5rem' }}>
                          {currentCard.card_type.toUpperCase()} · Tap to reveal
                        </div>
                        <p style={{ fontSize: '1.35rem', fontFamily: 'var(--font-serif)', fontWeight: 600, color: 'var(--text)', textAlign: 'center', lineHeight: 1.45, margin: 0 }}>
                          {currentCard.front}
                        </p>
                      </div>
                      {/* Back */}
                      <div style={{
                        position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
                        background: 'var(--surface)', border: '1px solid var(--ember-border)',
                        borderRadius: 'var(--radius-lg)', padding: '2.5rem',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'var(--glow-sm)',
                      }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ember)', marginBottom: '1.25rem' }}>
                          Answer
                        </div>
                        <p style={{ fontSize: '1.05rem', color: 'var(--text)', textAlign: 'center', lineHeight: 1.7, margin: 0 }}>
                          {currentCard.back}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Rating buttons — only shown after flip */}
              <AnimatePresence>
                {flipped && (
                  <motion.div key="ratings"
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                  >
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                      How well did you know this? (Schedules your next review)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.65rem' }}>
                      {(Object.entries(RATING_LABELS) as [string, typeof RATING_LABELS[0]][]).map(([r, meta]) => (
                        <button key={r}
                          onClick={() => {
                            playPop();
                            handleRate(Number(r) as ReviewRating);
                          }}
                          disabled={isRating}
                          style={{
                            padding: '0.875rem 0.5rem', borderRadius: 'var(--radius)', border: `1px solid ${meta.color}30`,
                            background: `${meta.color}10`, cursor: 'pointer', transition: 'all 0.15s',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${meta.color}20`; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${meta.color}10`; }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: meta.color }}>{meta.label}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{meta.next}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!flipped && (
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>Click the card to reveal the answer</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ==================== MANAGE TAB ==================== */}
      {tab === 'manage' && (
        <motion.div key="manage" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>{cards.length} cards in this deck</p>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(v => !v)}>
              <Plus size={13} /> Add Card
            </button>
          </div>

          {/* Add card form */}
          {showAddForm && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              className="card" style={{ marginBottom: '1.25rem', border: '1px solid var(--ember-border)', boxShadow: 'var(--glow-sm)' }}>
              <form onSubmit={handleAddCard} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Front (Term / Question)
                  </label>
                  <textarea className="input" rows={2}
                    placeholder="e.g. What is Newton's Second Law?"
                    value={newFront} onChange={e => setNewFront(e.target.value)} required
                    style={{ resize: 'vertical', minHeight: 64 }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Back (Definition / Answer)
                  </label>
                  <textarea className="input" rows={3}
                    placeholder="e.g. F = ma — Force equals mass times acceleration"
                    value={newBack} onChange={e => setNewBack(e.target.value)} required
                    style={{ resize: 'vertical', minHeight: 80 }} />
                </div>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={adding}>
                    {adding ? 'Adding…' : 'Add Card'}
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAddForm(false)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Cards list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {cards.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                No cards yet. Add one above!
              </div>
            ) : cards.map((card, i) => (
              <motion.div key={card.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '0.3rem' }}>
                    {card.card_type}
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '0.35rem', fontSize: '0.9rem' }}>{card.front}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5 }}>{card.back}</div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={11} /> Due {card.due_date}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <RotateCcw size={11} /> {card.repetitions} reviews
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      {card.repetitions > 0 ? <CheckCircle size={11} color="#7C9D96" /> : <XCircle size={11} color="var(--text-dim)" />}
                      {card.repetitions > 0 ? 'Learning' : 'New'}
                    </span>
                  </div>
                </div>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDeleteCard(card.id)}>
                  <Trash2 size={13} color="var(--text-dim)" />
                </button>
              </motion.div>
            ))}
          </div>

          {cards.length > 0 && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button className="btn btn-primary" onClick={() => setTab('study')}>
                <Zap size={14} /> Start Studying <ChevronRight size={14} />
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
