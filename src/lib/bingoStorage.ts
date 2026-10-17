export const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);

export interface SavedGame {
  version: 1;
  called: number[];
  intervalSeconds: number;
}

export const defaultGame: SavedGame = {
  version: 1,
  called: [],
  intervalSeconds: 3,
};
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isSavedGame(value: unknown): value is SavedGame {
  return (
    isRecord(value) &&
    value.version === 1 &&
    Array.isArray(value.called) &&
    value.called.length <= 90 &&
    value.called.every(
      (n: unknown) =>
        typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 90,
    ) &&
    new Set(value.called).size === value.called.length &&
    typeof value.intervalSeconds === 'number' &&
    Number.isFinite(value.intervalSeconds) &&
    value.intervalSeconds >= 1
  );
}
