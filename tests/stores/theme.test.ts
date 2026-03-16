import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Theme anti-flash script logic', () => {
  function resolveThemeClass(storedValue: string | null, osPrefersDark: boolean): 'light' | 'dark' {
    if (storedValue === 'dark' || (storedValue !== 'light' && osPrefersDark)) {
      return 'dark';
    }
    return 'light';
  }

  it('returns dark when stored value is "dark"', () => {
    expect(resolveThemeClass('dark', false)).toBe('dark');
    expect(resolveThemeClass('dark', true)).toBe('dark');
  });

  it('returns light when stored value is "light"', () => {
    expect(resolveThemeClass('light', false)).toBe('light');
    expect(resolveThemeClass('light', true)).toBe('light');
  });

  it('follows OS preference when stored value is "system"', () => {
    expect(resolveThemeClass('system', false)).toBe('light');
    expect(resolveThemeClass('system', true)).toBe('dark');
  });

  it('follows OS preference when no value is stored (null)', () => {
    expect(resolveThemeClass(null, false)).toBe('light');
    expect(resolveThemeClass(null, true)).toBe('dark');
  });
});

describe('Theme store logic', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getStoredTheme behavior', () => {
    function getStoredTheme(): 'light' | 'dark' | 'system' {
      try {
        const stored = localStorage.getItem('theme');
        if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
        return 'system';
      } catch {
        return 'system';
      }
    }

    it('returns "system" when nothing is stored', () => {
      expect(getStoredTheme()).toBe('system');
    });

    it('returns "light" when "light" is stored', () => {
      localStorage.setItem('theme', 'light');
      expect(getStoredTheme()).toBe('light');
    });

    it('returns "dark" when "dark" is stored', () => {
      localStorage.setItem('theme', 'dark');
      expect(getStoredTheme()).toBe('dark');
    });

    it('returns "system" when "system" is stored', () => {
      localStorage.setItem('theme', 'system');
      expect(getStoredTheme()).toBe('system');
    });

    it('returns "system" for invalid stored values', () => {
      localStorage.setItem('theme', 'invalid');
      expect(getStoredTheme()).toBe('system');
    });

    it('returns "system" for legacy JSON-wrapped values', () => {
      localStorage.setItem('theme', '"dark"');
      expect(getStoredTheme()).toBe('system');
    });
  });

  describe('resolveEffectiveTheme', () => {
    function resolveEffectiveTheme(
      preference: 'light' | 'dark' | 'system',
      osPrefersDark: boolean
    ): 'light' | 'dark' {
      if (preference !== 'system') return preference;
      return osPrefersDark ? 'dark' : 'light';
    }

    it('returns light when preference is light', () => {
      expect(resolveEffectiveTheme('light', false)).toBe('light');
      expect(resolveEffectiveTheme('light', true)).toBe('light');
    });

    it('returns dark when preference is dark', () => {
      expect(resolveEffectiveTheme('dark', false)).toBe('dark');
      expect(resolveEffectiveTheme('dark', true)).toBe('dark');
    });

    it('returns light when system and OS prefers light', () => {
      expect(resolveEffectiveTheme('system', false)).toBe('light');
    });

    it('returns dark when system and OS prefers dark', () => {
      expect(resolveEffectiveTheme('system', true)).toBe('dark');
    });
  });

  describe('theme persistence', () => {
    function persistTheme(preference: 'light' | 'dark' | 'system'): void {
      try {
        if (preference === 'system') {
          localStorage.removeItem('theme');
        } else {
          localStorage.setItem('theme', preference);
        }
      } catch {
        // Ignore
      }
    }

    it('stores "light" for light preference', () => {
      persistTheme('light');
      expect(localStorage.getItem('theme')).toBe('light');
    });

    it('stores "dark" for dark preference', () => {
      persistTheme('dark');
      expect(localStorage.getItem('theme')).toBe('dark');
    });

    it('removes key for system preference', () => {
      localStorage.setItem('theme', 'dark');
      persistTheme('system');
      expect(localStorage.getItem('theme')).toBeNull();
    });
  });
});
