import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadFromStorage, saveToStorage, clearAppStorage } from '$lib/utils/storage.js';

describe('loadFromStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns fallback when key does not exist', () => {
    expect(loadFromStorage('nonexistent', 'default')).toBe('default');
  });

  it('parses and returns stored JSON value', () => {
    localStorage.setItem('test', JSON.stringify({ a: 1 }));
    expect(loadFromStorage('test', {})).toEqual({ a: 1 });
  });

  it('returns fallback when stored value is malformed JSON', () => {
    localStorage.setItem('test', '{invalid json');
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(loadFromStorage('test', 'fallback')).toBe('fallback');
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('returns fallback with array fallback type', () => {
    expect(loadFromStorage<string[]>('missing', [])).toEqual([]);
  });

  it('handles localStorage throwing an error', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Access denied');
    });
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(loadFromStorage('key', 42)).toBe(42);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
    vi.restoreAllMocks();
  });
});

describe('saveToStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves a value to localStorage as JSON', () => {
    saveToStorage('key', { name: 'test' });
    expect(localStorage.getItem('key')).toBe(JSON.stringify({ name: 'test' }));
  });

  it('handles QuotaExceededError gracefully', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(() => saveToStorage('key', 'value')).not.toThrow();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
    vi.restoreAllMocks();
  });
});

describe('clearAppStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('removes app-specific keys from localStorage', () => {
    localStorage.setItem('todos', '[]');
    localStorage.setItem('filter', '"all"');
    localStorage.setItem('sortBy', '"createdAt"');
    localStorage.setItem('theme', '"light"');
    localStorage.setItem('other', 'keep');

    clearAppStorage();

    expect(localStorage.getItem('todos')).toBeNull();
    expect(localStorage.getItem('filter')).toBeNull();
    expect(localStorage.getItem('sortBy')).toBeNull();
    expect(localStorage.getItem('theme')).toBeNull();
    expect(localStorage.getItem('other')).toBe('keep');
  });
});
