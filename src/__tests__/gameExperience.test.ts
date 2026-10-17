import { createElement, StrictMode } from 'react';
import {
  renderHook,
  act,
  cleanup,
  render,
  screen,
  fireEvent,
} from '@testing-library/react';
import { beforeEach, afterEach, it, expect, vi } from 'vitest';
import { useBingoGame } from '../hooks/useBingoGame';
import BingoBoard from '../components/BingoBoard';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it('preserves recovery through StrictMode and finishes with exactly 90 unique numbers', () => {
  const saved = { version: 1, called: [90, 44, 1, 8], intervalSeconds: 2 };
  localStorage.setItem('bingo-game', JSON.stringify(saved));
  const writes = vi.spyOn(Storage.prototype, 'setItem');
  const game = renderHook(() => useBingoGame(), { wrapper: StrictMode });
  expect(game.result.current.called).toEqual(saved.called);
  expect(
    writes.mock.calls
      .filter(([key]) => key === 'bingo-game')
      .every(([, value]) => JSON.parse(value).called.length === 4),
  ).toBe(true);
  act(() => {
    vi.advanceTimersByTime(10000);
  });
  expect(game.result.current.called).toEqual(saved.called);
  act(() => {
    for (let i = 0; i < 90; i++) game.result.current.drawNumber();
  });
  expect(game.result.current.called.slice(0, 4)).toEqual(saved.called);
  expect(game.result.current.called).toHaveLength(90);
  expect(new Set(game.result.current.called).size).toBe(90);
  expect([...game.result.current.called].sort((a, b) => a - b)).toEqual(
    Array.from({ length: 90 }, (_, i) => i + 1),
  );
  expect(game.result.current.remaining).toEqual([]);
  const prior = localStorage.getItem('bingo-game');
  act(() => game.result.current.drawNumber());
  expect(localStorage.getItem('bingo-game')).toBe(prior);
  act(() => game.result.current.setIntervalSeconds(0));
  expect(localStorage.getItem('bingo-game')).toBe(prior);
});

it('retains the interval on reset, cancels auto-draw and saves an empty sequence', () => {
  const game = renderHook(() => useBingoGame());
  act(() => {
    game.result.current.setIntervalSeconds(2);
    game.result.current.toggleAutoDraw();
  });
  act(() => {
    vi.advanceTimersByTime(6000);
  });
  expect(game.result.current.called).toHaveLength(3);
  act(() => game.result.current.resetGame());
  act(() => {
    vi.advanceTimersByTime(10000);
  });
  expect(game.result.current.called).toEqual([]);
  expect(JSON.parse(localStorage.getItem('bingo-game')!)).toEqual({
    version: 1,
    called: [],
    intervalSeconds: 2,
  });
  game.unmount();
  const restored = renderHook(() => useBingoGame());
  expect(restored.result.current.called).toEqual([]);
  expect(restored.result.current.intervalSeconds).toBe(2);
});

it('restores silently, sounds on a user draw and keeps playing if the audio device fails', () => {
  localStorage.setItem(
    'bingo-game',
    JSON.stringify({ version: 1, called: [5, 8], intervalSeconds: 1 }),
  );
  const preferences = {
    version: 1,
    primaryColor: '#ffff00',
    soundEnabled: true,
  };
  localStorage.setItem('bingo-preferences', JSON.stringify(preferences));
  const start = vi.fn();
  const oscillator = vi.fn(() => ({
    frequency: { value: 0 },
    connect: vi.fn(),
    start,
    stop: vi.fn(),
  }));
  const constructor = vi.fn();
  vi.stubGlobal(
    'AudioContext',
    class {
      state = 'running';
      currentTime = 0;
      destination = {};
      constructor() {
        constructor();
      }
      createOscillator = oscillator;
      createGain = () => ({
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      });
      close = () => Promise.resolve();
    },
  );
  render(createElement(BingoBoard));
  expect(start).not.toHaveBeenCalled();
  expect(constructor).not.toHaveBeenCalled();
  const draw = screen.getByRole('button', { name: 'Sacar número' });
  fireEvent.click(draw);
  expect(start).toHaveBeenCalledOnce();
  oscillator.mockImplementation(() => {
    throw new Error('Device blocked');
  });
  fireEvent.click(draw);
  expect(JSON.parse(localStorage.getItem('bingo-game')!).called).toHaveLength(
    4,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Reiniciar' }));
  expect(JSON.parse(localStorage.getItem('bingo-preferences')!)).toEqual(
    preferences,
  );
});

it('allows a complete game and reset when saving fails', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('Quota exceeded');
  });
  const game = renderHook(() => useBingoGame());
  act(() => {
    for (let i = 0; i < 90; i++) game.result.current.drawNumber();
  });
  expect(new Set(game.result.current.called).size).toBe(90);
  expect(game.result.current.storageError).toBe(true);
  act(() => game.result.current.resetGame());
  expect(game.result.current.remaining).toHaveLength(90);
});
