import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDrawSound } from '../useDrawSound';

afterEach(() => vi.unstubAllGlobals());

function mockAudio() {
  const start = vi.fn();
  const stop = vi.fn();
  const close = vi.fn().mockResolvedValue(undefined);
  const resume = vi.fn().mockResolvedValue(undefined);
  const createOscillator = vi.fn(() => ({
    frequency: { value: 0 },
    connect: vi.fn(),
    start,
    stop,
  }));
  const createGain = vi.fn(() => ({
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
  }));
  vi.stubGlobal(
    'AudioContext',
    class {
      state = 'suspended';
      currentTime = 0;
      destination = {};
      createOscillator = createOscillator;
      createGain = createGain;
      resume = resume;
      close = close;
    },
  );
  return { start, stop, resume, close };
}

describe('useDrawSound', () => {
  it('plays only for a new draw after a user gesture, not recovered numbers', () => {
    const audio = mockAudio();
    const { result, rerender, unmount } = renderHook<
      ReturnType<typeof useDrawSound>,
      { number: number | null; enabled: boolean }
    >(
      ({ number, enabled }: { number: number | null; enabled: boolean }) =>
        useDrawSound(number, enabled),
      { initialProps: { number: 17, enabled: true } },
    );
    expect(audio.start).not.toHaveBeenCalled();
    act(() => result.current());
    expect(audio.resume).toHaveBeenCalledOnce();
    expect(audio.start).not.toHaveBeenCalled();
    rerender({ number: 18, enabled: true });
    expect(audio.start).toHaveBeenCalledOnce();
    expect(audio.stop).toHaveBeenCalledWith(0.15);
    rerender({ number: 19, enabled: false });
    rerender({ number: 19, enabled: true });
    rerender({ number: null, enabled: true });
    expect(audio.start).toHaveBeenCalledOnce();
    unmount();
    expect(audio.close).toHaveBeenCalledOnce();
  });

  it('does not create audio while muted', () => {
    const audio = mockAudio();
    const { result, rerender } = renderHook(
      ({ number }) => useDrawSound(number, false),
      { initialProps: { number: null as number | null } },
    );
    act(() => result.current());
    rerender({ number: 1 });
    expect(audio.resume).not.toHaveBeenCalled();
    expect(audio.start).not.toHaveBeenCalled();
  });

  it('ignores unavailable audio and constructor failures', () => {
    vi.stubGlobal('AudioContext', undefined);
    const { result, rerender } = renderHook(
      ({ number }) => useDrawSound(number, true),
      { initialProps: { number: null as number | null } },
    );
    expect(() => act(() => result.current())).not.toThrow();
    vi.stubGlobal(
      'AudioContext',
      class {
        constructor() {
          throw new Error('Audio blocked');
        }
      },
    );
    expect(() => act(() => result.current())).not.toThrow();
    expect(() => rerender({ number: 1 })).not.toThrow();
  });
});
