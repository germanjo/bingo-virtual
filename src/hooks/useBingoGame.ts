import { useState, useRef, useEffect, useCallback } from 'react';

const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);

export function useBingoGame() {
  const [remaining, setRemaining] = useState<number[]>([...allNumbers]);
  const [called, setCalled] = useState<number[]>([]);
  const [current, setCurrent] = useState<number | null>(null);
  const [isAutoDraw, setIsAutoDraw] = useState(false);
  const [intervalSeconds, setIntervalSecondsState] = useState(3);
  const [restartMessage, setRestartMessage] = useState(false);

  const remainingRef = useRef(remaining);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync remainingRef so drawNumber can read the latest pool without re-creating
  useEffect(() => {
    remainingRef.current = remaining;
  }, [remaining]);

  const drawNumber = useCallback(() => {
    const pool = remainingRef.current;
    if (pool.length === 0) {
      setIsAutoDraw(false);
      return;
    }
    const index = Math.floor(Math.random() * pool.length);
    const number = pool[index];
    setCurrent(number);
    setCalled((prev) => [...prev, number]);
    setRemaining((prev) => {
      const next = prev.filter((n) => n !== number);
      if (next.length === 0) {
        setIsAutoDraw(false);
      }
      return next;
    });
  }, []);

  // Auto-draw interval
  useEffect(() => {
    if (!isAutoDraw) return;
    const id = setInterval(drawNumber, intervalSeconds * 1000);
    return () => clearInterval(id);
  }, [isAutoDraw, intervalSeconds, drawNumber]);

  // Unmount cleanup for restartMessage timeout
  useEffect(() => {
    return () => {
      if (restartTimeoutRef.current !== null) {
        clearTimeout(restartTimeoutRef.current);
      }
    };
  }, []);

  function resetGame() {
    setRemaining([...allNumbers]);
    setCalled([]);
    setCurrent(null);
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
    if (n >= 1) {
      setIntervalSecondsState(n);
    }
  }

  return {
    current,
    called,
    remaining,
    isAutoDraw,
    intervalSeconds,
    restartMessage,
    drawNumber,
    resetGame,
    toggleAutoDraw,
    setIntervalSeconds,
  };
}
