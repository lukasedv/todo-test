import { describe, it, expect } from 'vitest';
import { extractActionItems, detectDueDate, assessPriority } from '$lib/services/emailParser.js';
import type { GraphEmail } from '$lib/types.js';

function makeEmail(overrides: Partial<GraphEmail> = {}): GraphEmail {
  return {
    id: 'msg-1',
    subject: 'Test email',
    bodyPreview: 'This is a test email body.',
    from: {
      emailAddress: {
        name: 'John Doe',
        address: 'john@example.com',
      },
    },
    receivedDateTime: '2026-03-20T10:00:00Z',
    flag: { flagStatus: 'notFlagged' },
    importance: 'normal',
    isRead: true,
    ...overrides,
  };
}

describe('emailParser', () => {
  describe('extractActionItems', () => {
    it('detects "please" action phrases', () => {
      const email = makeEmail({
        bodyPreview: 'Hi, please review the quarterly report and send feedback.',
      });
      const items = extractActionItems(email);
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items[0].title.toLowerCase()).toContain('review');
    });

    it('detects "could you" action phrases', () => {
      const email = makeEmail({
        bodyPreview: 'Could you update the project timeline by next week?',
      });
      const items = extractActionItems(email);
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items[0].title.toLowerCase()).toContain('update');
    });

    it('detects "can you" action phrases', () => {
      const email = makeEmail({
        bodyPreview: 'Can you schedule a meeting with the client this week?',
      });
      const items = extractActionItems(email);
      expect(items.length).toBeGreaterThanOrEqual(1);
    });

    it('detects "action required" phrases', () => {
      const email = makeEmail({
        subject: 'Action Required: Submit your timesheet',
        bodyPreview: 'Action required: submit your timesheet before end of day Friday.',
      });
      const items = extractActionItems(email);
      expect(items.length).toBeGreaterThanOrEqual(1);
    });

    it('detects "follow up" phrases', () => {
      const email = makeEmail({
        bodyPreview: 'Could you follow up on the vendor contract review and update?',
      });
      const items = extractActionItems(email);
      expect(items.length).toBeGreaterThanOrEqual(1);
    });

    it('returns empty array for non-actionable emails', () => {
      const email = makeEmail({
        bodyPreview: 'Thanks for your help yesterday. The report looked great!',
      });
      const items = extractActionItems(email);
      expect(items).toHaveLength(0);
    });

    it('generates suggestions for flagged emails even without action phrases', () => {
      const email = makeEmail({
        flag: { flagStatus: 'flagged' },
        bodyPreview: 'FYI: The meeting has been moved to Thursday.',
      });
      const items = extractActionItems(email);
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items[0].actionPhrase).toBe('Flagged email');
    });

    it('does not duplicate action items', () => {
      const email = makeEmail({
        subject: 'Please review the document',
        bodyPreview: 'Please review the document and provide feedback.',
      });
      const items = extractActionItems(email);
      const titles = items.map((i) => i.title.toLowerCase());
      const uniqueTitles = new Set(titles);
      expect(titles.length).toBe(uniqueTitles.size);
    });

    it('includes proper description with sender info', () => {
      const email = makeEmail({
        bodyPreview: 'Please send the updated budget spreadsheet.',
      });
      const items = extractActionItems(email);
      expect(items.length).toBeGreaterThanOrEqual(1);
      expect(items[0].description).toContain('John Doe');
      expect(items[0].description).toContain('john@example.com');
    });
  });

  describe('detectDueDate', () => {
    it('detects "by [month day]" pattern', () => {
      const result = detectDueDate('Please complete this by March 25, 2026');
      expect(result).toBe('2026-03-25');
    });

    it('detects "due [month day]" pattern', () => {
      const result = detectDueDate('This is due January 15, 2026');
      expect(result).toBeDefined();
      expect(result).toContain('2026');
    });

    it('detects "tomorrow" pattern', () => {
      const result = detectDueDate('I need this by tomorrow please');
      expect(result).toBeDefined();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(result).toBe(tomorrow.toISOString().split('T')[0]);
    });

    it('detects "EOD" pattern', () => {
      const result = detectDueDate('Please submit EOD');
      expect(result).toBeDefined();
      const today = new Date();
      expect(result).toBe(today.toISOString().split('T')[0]);
    });

    it('detects "end of week" pattern', () => {
      const result = detectDueDate('Need this by end of week');
      expect(result).toBeDefined();
    });

    it('returns undefined for text without dates', () => {
      const result = detectDueDate('Please review the document');
      expect(result).toBeUndefined();
    });
  });

  describe('assessPriority', () => {
    it('returns high for high importance emails', () => {
      const email = makeEmail({ importance: 'high' });
      expect(assessPriority(email)).toBe('high');
    });

    it('returns high for urgent keywords', () => {
      const email = makeEmail({
        bodyPreview: 'This is urgent, please respond ASAP.',
      });
      expect(assessPriority(email)).toBe('high');
    });

    it('returns high for "action required" keyword', () => {
      const email = makeEmail({
        subject: 'Action Required: Update your password',
      });
      expect(assessPriority(email)).toBe('high');
    });

    it('returns high for flagged emails', () => {
      const email = makeEmail({
        flag: { flagStatus: 'flagged' },
      });
      expect(assessPriority(email)).toBe('high');
    });

    it('returns medium for unread emails', () => {
      const email = makeEmail({ isRead: false });
      expect(assessPriority(email)).toBe('medium');
    });

    it('returns medium for normal emails', () => {
      const email = makeEmail();
      expect(assessPriority(email)).toBe('medium');
    });
  });
});
