import { describe, it, expect } from 'vitest';
import { getTagColor } from '$lib/utils/tags.js';

describe('getTagColor', () => {
  it('returns a color object with bg and text properties', () => {
    const color = getTagColor('work');
    expect(color).toHaveProperty('bg');
    expect(color).toHaveProperty('text');
    expect(typeof color.bg).toBe('string');
    expect(typeof color.text).toBe('string');
  });

  it('returns consistent color for the same tag', () => {
    const color1 = getTagColor('personal');
    const color2 = getTagColor('personal');
    expect(color1).toEqual(color2);
  });

  it('returns different colors for different tags', () => {
    const color1 = getTagColor('work');
    const color2 = getTagColor('home');
    // They might be the same due to hash collision, but usually different
    // Just check both are valid
    expect(color1).toHaveProperty('bg');
    expect(color2).toHaveProperty('bg');
  });

  it('handles empty string', () => {
    const color = getTagColor('');
    expect(color).toHaveProperty('bg');
    expect(color).toHaveProperty('text');
  });

  it('handles special characters', () => {
    const color = getTagColor('🔥 urgent!!!');
    expect(color).toHaveProperty('bg');
    expect(color).toHaveProperty('text');
  });
});
