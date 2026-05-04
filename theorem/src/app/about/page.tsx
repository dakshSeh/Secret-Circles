'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Flame, ArrowRight, BookOpen, Cpu, Target } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      {/* Minimal nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{ width: 28, height: 28, background: 'var(--ember)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={16} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, color: 'var(--text)' }}>Theorem</span>
          </Link>
          <Link href="/signup" className="btn btn-primary btn-sm">Start Forging <ArrowRight size={14} /></Link>
        </div>
      </nav>

      <div style={{ paddingTop: 80 }}>
        {/* Hero */}
        <section className="section" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: 720 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="badge badge-ember" style={{ marginBottom: '1.5rem' }}>About Theorem</div>
              <h1 style={{ marginBottom: '1.5rem', lineHeight: 1.15 }}>
                Cold PDFs enter.<br />
                <span style={{ backgroundImage: 'linear-gradient(135deg, var(--ember) 0%, var(--ember-glow) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Sharper minds leave.
                </span>
              </h1>
              <p style={{ fontSize: '1.1rem', lineHeight: 1.8, maxWidth: 560 }}>
                Theorem was built on one observation: students spend more time <em>hunting for good practice questions</em> than actually practising. We built the tool we wished existed.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission */}
        <section className="section" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div className="container" style={{ maxWidth: 720 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {[
                { icon: Target, title: 'Mission', desc: 'To make quality exam preparation accessible, intelligent, and adaptive — for every CBSE student, regardless of school or resources.' },
                { icon: BookOpen, title: 'Philosophy', desc: 'Learning is strengthened through deliberate challenge. Passive re-reading fools you into false confidence. Theorem forces active recall.' },
                { icon: Cpu, title: 'Technology', desc: 'State-of-the-art language models, prompted specifically to understand CBSE conventions — not generic quiz generators.' },
              ].map((item, i) => (
                <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }} className="card card-ember">
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius)', background: 'var(--ember-subtle)', border: '1px solid var(--ember-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                    <item.icon size={18} color="var(--ember)" />
                  </div>
                  <h3 style={{ marginBottom: '0.5rem' }}>{item.title}</h3>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* The Forge Metaphor */}
        <section className="section">
          <div className="container" style={{ maxWidth: 680 }}>
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="badge badge-ember" style={{ marginBottom: '1.5rem' }}>The Metaphor</div>
              <h2 style={{ marginBottom: '1.5rem' }}>Why &ldquo;Theorem&rdquo;?</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  'A theorem is not a guess. It is a proven truth — arrived at through rigorous process, not intuition. That is what we want your exam preparation to feel like.',
                  'The forge metaphor runs through everything we do. A forge does not just heat metal — it works it, shapes it, removes impurities. Raw information is not enough. It needs to be forged into understanding.',
                  'Theorem is not just a quiz generator. It is a system that converts passive studying into active intellectual refinement. The questions it generates are not random — they follow the logic of how CBSE examiners actually think.',
                  'We built Theorem to be a quiet academic weapon. Not loud. Not gimmicky. Just devastatingly useful.',
                ].map((para, i) => (
                  <p key={i} style={{ fontSize: '1rem', lineHeight: 1.85 }}>{para}</p>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '5rem 0', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <Flame size={40} color="var(--ember)" style={{ margin: '0 auto 1rem' }} />
            <h2 style={{ marginBottom: '1rem' }}>Ready to start forging?</h2>
            <p style={{ marginBottom: '2rem', maxWidth: 420, margin: '0 auto 2rem' }}>
              Upload your first chapter and see what Theorem can do.
            </p>
            <Link href="/signup" className="btn btn-primary btn-lg">
              Get started free <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid var(--border)', padding: '2rem 0' }}>
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 22, height: 22, background: 'var(--ember)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Flame size={12} color="#fff" />
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-muted)' }}>Theorem</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Where learning is forged through practice.</p>
            <Link href="/" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>← Back to home</Link>
          </div>
        </footer>
      </div>
    </>
  );
}
