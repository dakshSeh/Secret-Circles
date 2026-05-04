'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, FileText, BookMarked, BarChart2, ArrowRight, Clock, TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Upload, QuizSet, QuizSession } from '@/lib/types';

export default function DashboardPage() {
  const [userName, setUserName] = useState('');
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [sessions, setSessions] = useState<QuizSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, uploadsRes, quizRes, sessionsRes] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', user.id).single(),
        supabase.from('uploads').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('quiz_sets').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(6),
        supabase.from('quiz_sessions').select('*').eq('user_id', user.id).eq('completed', true).order('completed_at', { ascending: false }).limit(10),
      ]);

      setUserName(profileRes.data?.full_name || user.email?.split('@')[0] || 'Student');
      setUploads(uploadsRes.data || []);
      setQuizSets(quizRes.data || []);
      setSessions(sessionsRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  const avgAccuracy = sessions.length > 0
    ? Math.round(sessions.reduce((s, ss) => s + (ss.accuracy || 0), 0) / sessions.length)
    : null;

  const totalQuestions = quizSets.reduce((s, q) => s + q.question_count, 0);

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    const diff = Date.now() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 1100 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
              <span style={{ color: 'var(--ember)' }}>{loading ? '…' : userName}</span>
            </h1>
            <p>Your forge is ready. What are we practising today?</p>
          </div>
          <Link href="/generate" className="btn btn-primary">
            <Zap size={15} /> Quick Generate
          </Link>
        </div>
      </motion.div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { icon: FileText, label: 'Uploads', value: uploads.length, sub: 'PDFs processed' },
          { icon: BookMarked, label: 'Quiz Sets', value: quizSets.length, sub: 'Generated sets' },
          { icon: Zap, label: 'Questions', value: totalQuestions, sub: 'Total forged' },
          { icon: TrendingUp, label: 'Accuracy', value: avgAccuracy !== null ? `${avgAccuracy}%` : '—', sub: 'Avg. across sessions' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card"
            style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', background: 'var(--ember-subtle)', border: '1px solid var(--ember-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <stat.icon size={18} color="var(--ember)" />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1, color: 'var(--text)' }}>
                {loading ? <div className="shimmer" style={{ width: 40, height: 24, borderRadius: 4 }} /> : stat.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{stat.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent Uploads */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ gridColumn: '1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem' }}>Recent Uploads</h3>
            <Link href="/generate" style={{ fontSize: '0.78rem', color: 'var(--ember)' }}>Upload new <ArrowRight size={12} style={{ display: 'inline' }} /></Link>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1,2,3].map(i => <div key={i} className="shimmer" style={{ height: 48, borderRadius: 'var(--radius)' }} />)}
            </div>
          ) : uploads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No uploads yet. <Link href="/generate">Upload a PDF</Link> to begin.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {uploads.map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                  <FileText size={15} color="var(--ember)" />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.file_name}</div>
                    {u.subject && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.subject}{u.chapter ? ` · ${u.chapter}` : ''}</div>}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', flexShrink: 0 }}>{formatTime(u.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Quiz Sets */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem' }}>Saved Quiz Sets</h3>
            <Link href="/saved" style={{ fontSize: '0.78rem', color: 'var(--ember)' }}>View all <ArrowRight size={12} style={{ display: 'inline' }} /></Link>
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1,2,3].map(i => <div key={i} className="shimmer" style={{ height: 48, borderRadius: 'var(--radius)' }} />)}
            </div>
          ) : quizSets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              No quiz sets yet. <Link href="/generate">Generate one</Link> first.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {quizSets.map(qs => (
                <Link key={qs.id} href={`/practice/${qs.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', background: 'var(--surface-2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', textDecoration: 'none', transition: 'border-color 0.2s' }}>
                  <BookMarked size={15} color="var(--ember)" />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{qs.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{qs.question_count} questions · {qs.difficulty}</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', flexShrink: 0 }}>{formatTime(qs.created_at)}</span>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card" style={{ gridColumn: '1 / -1' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '0.9rem' }}>Recent Sessions</h3>
              <Link href="/review" style={{ fontSize: '0.78rem', color: 'var(--ember)' }}>Full review <ArrowRight size={12} style={{ display: 'inline' }} /></Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
              {sessions.slice(0, 6).map(s => (
                <div key={s.id} className="card" style={{ padding: '0.875rem', background: 'var(--surface-2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <BarChart2 size={13} color="var(--ember)" />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize', color: 'var(--text-muted)' }}>{s.mode} mode</span>
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--ember)' }}>{s.accuracy ? `${Math.round(s.accuracy)}%` : '—'}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={10} /> {formatTime(s.completed_at || s.started_at)}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
