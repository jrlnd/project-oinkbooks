import { describe, it, expect } from 'vitest';
import { rainbowColors } from './colors';

describe('rainbowColors', () => {
  it('returns an empty array when N <= 0', () => {
    expect(rainbowColors(0)).toEqual([]);
    expect(rainbowColors(-1)).toEqual([]);
  });

  it('returns exactly N colors', () => {
    expect(rainbowColors(1)).toHaveLength(1);
    expect(rainbowColors(7)).toHaveLength(7);
    expect(rainbowColors(20)).toHaveLength(20);
  });

  it('produces valid 6-digit hex colors', () => {
    const colors = rainbowColors(7);
    for (const c of colors) {
      expect(c).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it('produces distinct colors across the spectrum', () => {
    // The sine-wave palette must spread colors; 5 categories should yield 5 unique hexes.
    const colors = rainbowColors(5);
    const unique = new Set(colors);
    expect(unique.size).toBe(colors.length);
  });

  it('is deterministic — same N produces the same palette', () => {
    expect(rainbowColors(7)).toEqual(rainbowColors(7));
  });
});
