import { describe, expect, it } from 'vitest';
import { contrastColor, isPreferences } from '../bingoStorage';

describe('primary color preferences', () => {
  it.each(['#ffffff', '#ffff00', '#777777'])(
    'uses black text on %s',
    (color) => {
      expect(contrastColor(color)).toBe('#000000');
    },
  );
  it.each(['#000000', '#0000ff', '#e11d48'])(
    'uses white text on %s',
    (color) => {
      expect(contrastColor(color)).toBe('#ffffff');
    },
  );
  it.each([
    null,
    {},
    { version: 2, primaryColor: '#123456', soundEnabled: false },
    { version: 1, primaryColor: 'red', soundEnabled: false },
    { version: 1, primaryColor: '#123456', soundEnabled: 'yes' },
  ])('rejects invalid preferences: %j', (value) => {
    expect(isPreferences(value)).toBe(false);
  });
});
