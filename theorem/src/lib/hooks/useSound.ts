import { useCallback, useRef } from 'react';

export function useSound() {
  const audioCtx = useRef<AudioContext | null>(null);

  const init = () => {
    if (typeof window === 'undefined') return;
    if (!audioCtx.current) {
      // @ts-expect-error webkitAudioContext is non-standard
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx.current = new AudioContextClass();
      }
    }
    if (audioCtx.current?.state === 'suspended') {
      audioCtx.current.resume();
    }
  };

  const playPop = useCallback(() => {
    init();
    if (!audioCtx.current) return;
    const t = audioCtx.current.currentTime;
    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.1);
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    osc.connect(gain);
    gain.connect(audioCtx.current.destination);
    
    osc.start();
    osc.stop(t + 0.1);
  }, []);

  const playThunk = useCallback(() => {
    init();
    if (!audioCtx.current) return;
    const t = audioCtx.current.currentTime;
    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    
    osc.connect(gain);
    gain.connect(audioCtx.current.destination);
    
    osc.start();
    osc.stop(t + 0.15);
  }, []);

  return { playPop, playThunk };
}
