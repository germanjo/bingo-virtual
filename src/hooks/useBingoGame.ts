import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { allNumbers, defaultGame, isSavedGame } from '../lib/bingoStorage';
import { useStoredState } from './useStoredState';

export function useBingoGame() {
  const {
    value: saved,
    setValue: setSaved,
    ready,
    storageError,
  } = useStoredState('bingo-game', defaultGame, isSavedGame);
  const { called, intervalSeconds } = saved;
  const current = called.at(-1) ?? null;
  const remaining = useMemo(() => {
    const calledSet = new Set(called);
    return allNumbers.filter((n) => !calledSet.has(n));
  }, [called]);
  const [isAutoDraw, setIsAutoDraw] = useState(false);
  const [restartMessage, setRestartMessage] = useState(false);

  const remainingRef = useRef(remaining);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync remainingRef so drawNumber can read the latest pool without re-creating
  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  const drawNumber = useCallback(() => {
    if (!ready) return;
    const pool = remainingRef.current;
    if (pool.length === 0) {
      setIsAutoDraw(false);
      return;
    }
    const index = Math.floor(Math.random() * pool.length);
    const number = pool[index];
    // Update synchronously so rapid/batched draws cannot reuse the same number.
    remainingRef.current = pool.filter((n) => n !== number);
    setSaved((prev) => ({ ...prev, called: [...prev.called, number] }));
    if (pool.length === 1) setIsAutoDraw(false);
  }, [ready, setSaved]);

  // Auto-draw interval
  useEffect(() => {
    if (!isAutoDraw || !ready) return;
    const id = setInterval(drawNumber, intervalSeconds * 1000);
    return () => clearInterval(id);
  }, [isAutoDraw, intervalSeconds, drawNumber, ready]);

  // Unmount cleanup for restartMessage timeout
  useEffect(() => {
    return () => {
      if (restartTimeoutRef.current !== null) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, []);

  function resetGame() {
    remainingRef.current = [...allNumbers];
    setSaved((prev) => ({ ...prev, called: [] }));
    setIsAutoDraw(false);
    setRestartMessage(true);
    if (restartTimeoutRef.current !== null) {
      clearTimeout(restartTimeoutRef.current);
    }
    restartTimeoutRef.current = setTimeout(() => {
      setRestartMessage(false);
      restartTimeoutRef.current = null;
    }, 3000);
  }

  function toggleAutoDraw() {
    setIsAutoDraw((prev) => !prev);
  }

  function setIntervalSeconds(n: number) {
    if (Number.isFinite(n) && n >= 1) {
      setSaved((prev) => ({ ...prev, intervalSeconds: n }));
    }
  }

  return {
    current,
    called,
    remaining,
    isAutoDraw,
    intervalSeconds,
    restartMessage,
    ready,
    storageError,
    drawNumber,
    resetGame,
    toggleAutoDraw,
    setIntervalSeconds,
  };
}
