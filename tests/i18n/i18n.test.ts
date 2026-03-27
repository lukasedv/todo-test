import { describe, it, expect, beforeEach, vi } from 'vitest';
import { en } from '$lib/i18n/en.js';
import { fi } from '$lib/i18n/fi.js';
import type { TranslationKey } from '$lib/i18n/types.js';

describe('Translation files', () => {
  it('en and fi have identical keys', () => {
    const enKeys = Object.keys(en).sort();
    const fiKeys = Object.keys(fi).sort();
    expect(enKeys).toEqual(fiKeys);
  });

  it('no translation value is empty in en', () => {
    for (const [key, value] of Object.entries(en)) {
      expect(value, `en key "${key}" should not be empty`).toBeTruthy();
    }
  });

  it('no translation value is empty in fi', () => {
    for (const [key, value] of Object.entries(fi)) {
      expect(value, `fi key "${key}" should not be empty`).toBeTruthy();
    }
  });

  it('all values are strings in en', () => {
    for (const [key, value] of Object.entries(en)) {
      expect(typeof value, `en key "${key}" should be a string`).toBe('string');
    }
  });

  it('all values are strings in fi', () => {
    for (const [key, value] of Object.entries(fi)) {
      expect(typeof value, `fi key "${key}" should be a string`).toBe('string');
    }
  });

  it('priority translations exist for all levels', () => {
    expect(en['priority.low']).toBe('Low');
    expect(en['priority.medium']).toBe('Medium');
    expect(en['priority.high']).toBe('High');
    expect(fi['priority.low']).toBe('Matala');
    expect(fi['priority.medium']).toBe('Keskitaso');
    expect(fi['priority.high']).toBe('Korkea');
  });

  it('filter translations exist', () => {
    expect(en['filter.all']).toBe('All');
    expect(en['filter.active']).toBe('Active');
    expect(en['filter.completed']).toBe('Completed');
    expect(fi['filter.all']).toBe('Kaikki');
    expect(fi['filter.active']).toBe('Aktiiviset');
    expect(fi['filter.completed']).toBe('Valmiit');
  });

  it('date translations exist', () => {
    expect(en['date.overdue']).toContain('Overdue');
    expect(en['date.today']).toContain('today');
    expect(fi['date.overdue']).toContain('Myöhässä');
    expect(fi['date.today']).toContain('Tänään');
  });

  it('interpolation placeholders match between en and fi', () => {
    const placeholderRegex = /\{(\w+)\}/g;
    const enKeys = Object.keys(en) as TranslationKey[];

    for (const key of enKeys) {
      const enMatches = [...en[key].matchAll(placeholderRegex)].map(m => m[1]).sort();
      const fiMatches = [...fi[key].matchAll(placeholderRegex)].map(m => m[1]).sort();
      expect(fiMatches, `Placeholders for key "${key}" should match between en and fi`).toEqual(enMatches);
    }
  });
});

describe('i18n module', () => {
  let i18nModule: typeof import('$lib/i18n/index.svelte.js');

  beforeEach(async () => {
    localStorage.clear();
    // Reimport module to reset module-level $state since it uses $effect.root()
    vi.resetModules();
    i18nModule = await import('$lib/i18n/index.svelte.js');
  });

  it('exports getLocale function', () => {
    expect(typeof i18nModule.getLocale).toBe('function');
  });

  it('exports setLocale function', () => {
    expect(typeof i18nModule.setLocale).toBe('function');
  });

  it('exports t function', () => {
    expect(typeof i18nModule.t).toBe('function');
  });

  it('exports getDateLocale function', () => {
    expect(typeof i18nModule.getDateLocale).toBe('function');
  });

  it('t returns English text by default', () => {
    const result = i18nModule.t('app.title');
    expect(result).toBe('✨ Todo App');
  });

  it('t handles parameter interpolation', () => {
    const result = i18nModule.t('empty.noResults', { query: 'test' });
    expect(result).toContain('test');
  });

  it('SUPPORTED_LOCALES contains en and fi', () => {
    expect(i18nModule.SUPPORTED_LOCALES).toContain('en');
    expect(i18nModule.SUPPORTED_LOCALES).toContain('fi');
  });
});
