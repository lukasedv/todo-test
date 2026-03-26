import { describe, it, expect } from 'vitest';
import { generateSuggestions } from '$lib/services/suggestionService.js';
import type { GraphEmail } from '$lib/types.js';

function makeEmail(overrides: Partial<GraphEmail> = {}): GraphEmail {
  return {
    id: 'msg-1',
    subject: 'Test email',
    bodyPreview: 'Please review the attached document and provide feedback.',
    from: {
      emailAddress: {
        name: 'Jane Smith',
        address: 'jane@example.com',
      },
    },
    receivedDateTime: '2026-03-20T10:00:00Z',
    flag: { flagStatus: 'notFlagged' },
    importance: 'normal',
    isRead: true,
    ...overrides,
  };
}

describe('suggestionService', () => {
  describe('generateSuggestions', () => {
    it('generates suggestions from actionable emails', () => {
      const emails = [makeEmail()];
      const suggestions = generateSuggestions(emails, new Set(), new Set());
      expect(suggestions.length).toBeGreaterThanOrEqual(1);
      expect(suggestions[0].sourceType).toBe('email');
      expect(suggestions[0].status).toBe('pending');
      expect(suggestions[0].senderName).toBe('Jane Smith');
      expect(suggestions[0].senderEmail).toBe('jane@example.com');
      expect(suggestions[0].emailSubject).toBe('Test email');
    });

    it('includes m365 and email tags', () => {
      const emails = [makeEmail()];
      const suggestions = generateSuggestions(emails, new Set(), new Set());
      expect(suggestions.length).toBeGreaterThanOrEqual(1);
      expect(suggestions[0].suggestedTags).toContain('m365');
      expect(suggestions[0].suggestedTags).toContain('email');
    });

    it('skips dismissed emails', () => {
      const emails = [makeEmail()];
      const dismissed = new Set(['msg-1']);
      const suggestions = generateSuggestions(emails, dismissed, new Set());
      expect(suggestions).toHaveLength(0);
    });

    it('skips already-accepted email IDs', () => {
      const emails = [makeEmail()];
      const existing = new Set(['msg-1']);
      const suggestions = generateSuggestions(emails, new Set(), existing);
      expect(suggestions).toHaveLength(0);
    });

    it('handles multiple emails', () => {
      const emails = [
        makeEmail({ id: 'msg-1', bodyPreview: 'Please review the proposal.' }),
        makeEmail({ id: 'msg-2', bodyPreview: 'Could you send the report by Friday?' }),
        makeEmail({ id: 'msg-3', bodyPreview: 'Thanks for your help!' }),
      ];
      const suggestions = generateSuggestions(emails, new Set(), new Set());
      const messageIds = new Set(suggestions.map((s) => s.messageId));
      expect(messageIds.has('msg-1')).toBe(true);
      expect(messageIds.has('msg-2')).toBe(true);
      expect(messageIds.has('msg-3')).toBe(false);
    });

    it('generates suggestions for flagged emails without action phrases', () => {
      const emails = [
        makeEmail({
          id: 'msg-flagged',
          bodyPreview: 'FYI: the schedule has changed.',
          flag: { flagStatus: 'flagged' },
        }),
      ];
      const suggestions = generateSuggestions(emails, new Set(), new Set());
      expect(suggestions.length).toBeGreaterThanOrEqual(1);
      expect(suggestions[0].messageId).toBe('msg-flagged');
    });

    it('creates unique suggestion IDs', () => {
      const emails = [
        makeEmail({ id: 'msg-1', bodyPreview: 'Please review the document.' }),
        makeEmail({ id: 'msg-2', bodyPreview: 'Could you update the spreadsheet?' }),
      ];
      const suggestions = generateSuggestions(emails, new Set(), new Set());
      const ids = suggestions.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('includes sourceUrl with Outlook deep link', () => {
      const emails = [makeEmail()];
      const suggestions = generateSuggestions(emails, new Set(), new Set());
      expect(suggestions.length).toBeGreaterThanOrEqual(1);
      expect(suggestions[0].sourceUrl).toContain('outlook.office.com');
    });
  });
});
