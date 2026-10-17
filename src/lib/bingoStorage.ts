export const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);

export interface SavedGame {
  version: 1;
  called: number[];
  intervalSeconds: number;
}

export interface Preferences {
  version: 1;
  primaryColor: string;
  soundEnabled: boolean;
}

export const defaultGame: SavedGame = {
  version: 1,
  called: [],
  intervalSeconds: 3,
};
export const defaultPreferences: Preferences = {
  version: 1,
  primaryColor: '#e11d48',
  soundEnabled: false,
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

export function isPreferences(value: unknown): value is Preferences {
  return (
    isRecord(value) &&
    value.version === 1 &&
    typeof value.primaryColor === 'string' &&
    /^#[0-9a-f]{6}$/i.test(value.primaryColor) &&
    typeof value.soundEnabled === 'boolean'
  );
}

/** Choose readable foreground text for any six-digit sRGB primary color. */
export function contrastColor(hex: string) {
  const channels = [1, 3, 5].map((offset) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance =
    0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  return luminance > 0.179 ? '#000000' : '#ffffff';
}
