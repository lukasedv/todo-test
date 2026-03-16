import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getDueDateStatus, formatDueDate } from '$lib/utils/date.js';

describe('getDueDateStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-16T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "none" for undefined date', () => {
    expect(getDueDateStatus(undefined)).toBe('none');
  });

  it('returns "overdue" for past dates', () => {
    expect(getDueDateStatus('2026-03-15')).toBe('overdue');
  });

  it('returns "today" for today', () => {
    expect(getDueDateStatus('2026-03-16')).toBe('today');
  });

  it('returns "soon" for tomorrow', () => {
    expect(getDueDateStatus('2026-03-17')).toBe('soon');
  });

  it('returns "future" for dates beyond 48 hours', () => {
    expect(getDueDateStatus('2026-03-20')).toBe('future');
  });
});

describe('formatDueDate', () => {
  it('returns empty string for undefined', () => {
    expect(formatDueDate(undefined)).toBe('');
  });

  it('formats a valid date', () => {
    const formatted = formatDueDate('2026-03-16');
    expect(formatted).toBeTruthy();
    expect(typeof formatted).toBe('string');
  });

  it('handles ISO date strings', () => {
    const formatted = formatDueDate('2026-12-25T00:00:00Z');
    expect(formatted).toContain('Dec');
    expect(formatted).toContain('25');
    expect(formatted).toContain('2026');
  });
});
