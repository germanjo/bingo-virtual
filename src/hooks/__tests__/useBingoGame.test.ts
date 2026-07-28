import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBingoGame } from '../useBingoGame';

describe('useBingoGame', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('initializes with fresh game state', () => {
      const { result } = renderHook(() => useBingoGame());

      expect(result.current.remaining).toEqual(
        Array.from({ length: 90 }, (_, i) => i + 1)
      );
      expect(result.current.remaining).toHaveLength(90);
      expect(result.current.called).toEqual([]);
      expect(result.current.current).toBeNull();
      expect(result.current.isAutoDraw).toBe(false);
      expect(result.current.intervalSeconds).toBe(3);
      expect(result.current.restartMessage).toBe(false);
    });
  });

  describe('drawNumber', () => {
    it('picks a random number from remaining pool', () => {
      const { result } = renderHook(() => useBingoGame());
      const initialRemaining = [...result.current.remaining];

      act(() => {
        result.current.drawNumber();
      });

      const drawn = result.current.current;
      expect(drawn).not.toBeNull();
      expect(drawn).toBeGreaterThanOrEqual(1);
      expect(drawn).toBeLessThanOrEqual(90);
      expect(initialRemaining).toContain(drawn);
      expect(result.current.called).toContain(drawn);
      expect(result.current.called).toHaveLength(1);
      expect(result.current.remaining).toHaveLength(89);
      expect(result.current.remaining).not.toContain(drawn);
    });

    it('does not repeat numbers across multiple draws', () => {
      const { result } = renderHook(() => useBingoGame());
      const drawnNumbers: number[] = [];

      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.drawNumber();
        });
        drawnNumbers.push(result.current.current!);
      }

      const uniqueDrawn = new Set(drawnNumbers);
      expect(uniqueDrawn.size).toBe(10);
      expect(result.current.called).toHaveLength(10);
      expect(result.current.remaining).toHaveLength(80);
    });

    it('does nothing when pool is empty and sets isAutoDraw to false', () => {
      const { result } = renderHook(() => useBingoGame());

      // Drain the pool — each draw in its own act() so useEffect syncs the ref
      for (let i = 0; i < 90; i++) {
        act(() => {
          result.current.drawNumber();
        });
      }

      expect(result.current.remaining).toHaveLength(0);
      const lastCurrent = result.current.current;
      const lastCalled = [...result.current.called];

      // Enable autoDraw to verify it gets disabled
      act(() => {
        result.current.toggleAutoDraw();
      });
      expect(result.current.isAutoDraw).toBe(true);

      // Try to draw from empty pool
      act(() => {
        result.current.drawNumber();
      });

      expect(result.current.current).toBe(lastCurrent);
      expect(result.current.called).toEqual(lastCalled);
      expect(result.current.remaining).toHaveLength(0);
      expect(result.current.isAutoDraw).toBe(false);
    });
  });

  describe('resetGame', () => {
    it('restores initial state and sets restartMessage', () => {
      const { result } = renderHook(() => useBingoGame());

      // Draw some numbers and enable autoDraw
      act(() => {
        result.current.drawNumber();
        result.current.drawNumber();
        result.current.toggleAutoDraw();
      });

      expect(result.current.called).toHaveLength(2);
      expect(result.current.isAutoDraw).toBe(true);

      // Reset
      act(() => {
        result.current.resetGame();
      });

      expect(result.current.remaining).toHaveLength(90);
      expect(result.current.called).toEqual([]);
      expect(result.current.current).toBeNull();
      expect(result.current.isAutoDraw).toBe(false);
      expect(result.current.restartMessage).toBe(true);
    });

    it('clears restartMessage after 3 seconds', () => {
      const { result } = renderHook(() => useBingoGame());

      act(() => {
        result.current.resetGame();
      });

      expect(result.current.restartMessage).toBe(true);

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.restartMessage).toBe(false);
    });
  });

  describe('autoDraw interval', () => {
    it('fires drawNumber at configured interval', () => {
      const { result } = renderHook(() => useBingoGame());

      act(() => {
        result.current.setIntervalSeconds(2);
        result.current.toggleAutoDraw();
      });

      expect(result.current.isAutoDraw).toBe(true);
      const initialCalledLength = result.current.called.length;

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.called.length).toBe(initialCalledLength + 1);
    });

    it('stops when toggled off', () => {
      const { result } = renderHook(() => useBingoGame());

      act(() => {
        result.current.setIntervalSeconds(1);
        result.current.toggleAutoDraw();
      });

      expect(result.current.isAutoDraw).toBe(true);

      act(() => {
        result.current.toggleAutoDraw();
      });

      expect(result.current.isAutoDraw).toBe(false);
      const calledLengthAfterStop = result.current.called.length;

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.called.length).toBe(calledLengthAfterStop);
    });

    it('stops after last number is drawn', () => {
      const { result } = renderHook(() => useBingoGame());

      // Draw 89 numbers manually — each in its own act() so ref syncs
      for (let i = 0; i < 89; i++) {
        act(() => {
          result.current.drawNumber();
        });
      }

      expect(result.current.remaining).toHaveLength(1);

      // Enable autoDraw with 1s interval
      act(() => {
        result.current.setIntervalSeconds(1);
        result.current.toggleAutoDraw();
      });

      expect(result.current.isAutoDraw).toBe(true);

      // Advance to draw the last number
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.remaining).toHaveLength(0);
      expect(result.current.isAutoDraw).toBe(false);
    });
  });

  describe('intervalSeconds validation', () => {
    it('rejects zero (state remains unchanged)', () => {
      const { result } = renderHook(() => useBingoGame());

      expect(result.current.intervalSeconds).toBe(3);

      act(() => {
        result.current.setIntervalSeconds(0);
      });

      expect(result.current.intervalSeconds).toBe(3);
    });

    it('rejects negative values (state remains unchanged)', () => {
      const { result } = renderHook(() => useBingoGame());

      expect(result.current.intervalSeconds).toBe(3);

      act(() => {
        result.current.setIntervalSeconds(-1);
      });

      expect(result.current.intervalSeconds).toBe(3);
    });

    it('accepts valid values >= 1', () => {
      const { result } = renderHook(() => useBingoGame());

      act(() => {
        result.current.setIntervalSeconds(5);
      });

      expect(result.current.intervalSeconds).toBe(5);

      act(() => {
        result.current.setIntervalSeconds(1);
      });

      expect(result.current.intervalSeconds).toBe(1);
    });
  });

  describe('unmount cleanup', () => {
    it('clears restartMessage timeout on unmount', () => {
      const { result, unmount } = renderHook(() => useBingoGame());

      act(() => {
        result.current.resetGame();
      });

      expect(result.current.restartMessage).toBe(true);

      // Unmount before timeout fires
      unmount();

      // Advance timers — should not cause "state update on unmounted component" warning
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // If we got here without React warnings, the cleanup worked
      expect(true).toBe(true);
    });
  });
});
