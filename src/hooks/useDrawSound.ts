import { useCallback, useEffect, useRef } from 'react';

/** Audio is unlocked only by controls receiving a real user interaction. */
export function useDrawSound(current: number | null, enabled: boolean) {
  const context = useRef<AudioContext | null>(null);
  const previous = useRef(current);

  const unlockAudio = useCallback(() => {
    if (!enabled || typeof AudioContext === 'undefined') return;
    try {
      context.current ??= new AudioContext();
      if (context.current.state === 'suspended') {
        void context.current.resume().catch(() => {});
      }
    } catch {
      // Audio support/permission must never prevent drawing a number.
    }
  }, [enabled]);

  useEffect(() => {
    if (previous.current === current) return;
    previous.current = current;
    const audio = context.current;
    if (!enabled || current === null || !audio) return;
    try {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.frequency.value = 660;
      gain.gain.setValueAtTime(0.12, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.15);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + 0.15);
    } catch {
      // A suspended or unavailable audio device is a silent fallback.
    }
  }, [current, enabled]);

  useEffect(
    () => () => {
      const audio = context.current;
      context.current = null;
      if (audio) void audio.close().catch(() => {});
    },
    [],
  );

  return unlockAudio;
}
