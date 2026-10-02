'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Layers, Plus, Trash2, BookOpen, ChevronRight, Zap, Calendar, AlertCircle, X } from 'lucide-react';
import { SkeletonCard } from '@/components/ui/Skeleton';
import type { FlashcardDeck } from '@/lib/types';

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newClass, setNewClass] = useState('');
  const [creating, setCreating] = useState(false);

  const SUBJECTS = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Economics', 'History', 'Geography', 'Political Science', 'English', 'Business Studies', 'Other'];
  const CLASSES = ['Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Above / Advanced'];

  const fetchDecks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/flashcards/decks');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDecks(data.decks || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load decks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchDecks(), 0);
    return () => clearTimeout(t);
  }, [fetchDecks]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/flashcards/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, subject: newSubject, class_level: newClass }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDecks(prev => [data.deck, ...prev]);
      setNewTitle(''); setNewSubject(''); setNewClass('');
      setShowCreate(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create deck');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this deck and all its cards?')) return;
    try {
      await fetch(`/api/flashcards/decks?id=${id}`, { method: 'DELETE' });
      setDecks(prev => prev.filter(d => d.id !== id));
    } catch { setError('Failed to delete'); }
  };

  const totalCards = decks.reduce((s, d) => s + d.card_count, 0);

  return (
    <div style={{ padding: '2rem', maxWidth: 1100 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <div style={{ width: 36, height: 36, background: 'var(--ember-subtle)', border: '1px solid var(--ember-border)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={18} color="var(--ember)" />
              </div>
              <h1 style={{ fontSize: '1.75rem', margin: 0 }}>Memory Forge</h1>
            </div>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Spaced repetition flashcards for long-term retention.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> New Deck
          </button>
        </div>

        {/* Stats */}
        {decks.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginTop: '1.75rem' }}>
            {[
              { label: 'Total Decks', value: decks.length },
              { label: 'Total Cards', value: totalCards },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '1rem 1.25rem' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--ember)', fontFamily: 'var(--font-serif)' }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Error */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(199,124,124,0.1)', border: '1px solid rgba(199,124,124,0.3)', borderRadius: 'var(--radius)', padding: '0.875rem 1rem', marginBottom: '1.5rem' }}>
          <AlertCircle size={16} color="var(--error)" />
          <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--error)' }}>{error}</span>
          <button onClick={() => setError('')}><X size={14} /></button>
        </div>
      )}

      {/* Create Deck Modal */}
      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="card" style={{ marginBottom: '2rem', border: '1px solid var(--ember-border)', boxShadow: 'var(--glow-sm)' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontFamily: 'var(--font-serif)' }}>Create New Deck</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <input className="input" placeholder="Deck title (e.g. Thermodynamics)" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <select value={newSubject} onChange={e => setNewSubject(e.target.value)} style={{ width: '100%' }}>
                <option value="">Subject (optional)</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={newClass} onChange={e => setNewClass(e.target.value)} style={{ width: '100%' }}>
                <option value="">Class (optional)</option>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? 'Creating…' : 'Create Deck'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Deck List */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {[1,2,3].map(i => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : decks.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '5rem 2rem' }}>
          <div style={{ width: 64, height: 64, background: 'var(--surface-2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <Layers size={28} color="var(--text-dim)" />
          </div>
          <h3 style={{ margin: '0 0 0.5rem' }}>No decks yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: 380, margin: '0 auto 1.5rem' }}>
            Create a deck manually or go to Study Notes and click &ldquo;Generate Flashcards&rdquo; on any note.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={15} /> Create Deck</button>
            <Link href="/notes" className="btn btn-ghost"><BookOpen size={15} /> Open Notes</Link>
          </div>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {decks.map((deck, i) => (
            <motion.div key={deck.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="card card-ember"
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', cursor: 'default' }}>
              {/* Deck Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.3rem' }}>
                    {deck.title}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {deck.subject && <span className="tag">{deck.subject}</span>}
                    {deck.class_level && <span className="tag">{deck.class_level}</span>}
                  </div>
                </div>
                <button className="btn btn-ghost btn-icon" style={{ flexShrink: 0, marginLeft: '0.5rem' }}
                  onClick={() => handleDelete(deck.id)}>
                  <Trash2 size={14} color="var(--text-dim)" />
                </button>
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <Layers size={13} />
                  <span>{deck.card_count} cards</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <Calendar size={13} />
                  <span>{new Date(deck.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.6rem', marginTop: 'auto' }}>
                <Link href={`/flashcards/${deck.id}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                  <Zap size={13} /> Study Now
                </Link>
                <Link href={`/flashcards/${deck.id}?tab=manage`} className="btn btn-ghost btn-sm">
                  Manage <ChevronRight size={13} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
