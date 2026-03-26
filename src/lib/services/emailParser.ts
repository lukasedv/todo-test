import type { GraphEmail, ActionItem, Priority } from '../types.js';

const ACTION_PATTERNS: RegExp[] = [
  /(?:please|pls|kindly)\s+(\w[\w\s]{5,80})/i,
  /(?:could you|can you|would you|will you)\s+(\w[\w\s]{5,80})/i,
  /(?:i need you to|i'd like you to|i want you to)\s+(\w[\w\s]{5,80})/i,
  /(?:action required)[:\s]*(\w[\w\s]{5,80})/i,
  /(?:follow up on|circle back on|loop back on|check in on)\s+(\w[\w\s]{5,80})/i,
  /(?:make sure to|don't forget to|remember to|be sure to)\s+(\w[\w\s]{5,80})/i,
  /(?:let's|let us)\s+(schedule|set up|plan|arrange|organize)\s+(\w[\w\s]{5,80})/i,
];

const DEADLINE_PATTERNS: { pattern: RegExp; extract: (match: RegExpMatchArray) => string | undefined }[] = [
  {
    pattern: /by\s+((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:,?\s+\d{4})?)/i,
    extract: (match) => parseDateString(match[1]),
  },
  {
    pattern: /(?:due|deadline|before)\s+((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(?:,?\s+\d{4})?)/i,
    extract: (match) => parseDateString(match[1]),
  },
  {
    pattern: /by\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i,
    extract: (match) => parseDateString(match[1]),
  },
  {
    pattern: /\b(eod|end of day)\b/i,
    extract: () => {
      const d = new Date();
      d.setHours(23, 59, 59, 0);
      return d.toISOString().split('T')[0];
    },
  },
  {
    pattern: /\b(eow|end of week)\b/i,
    extract: () => {
      const d = new Date();
      const daysUntilFriday = (5 - d.getDay() + 7) % 7 || 7;
      d.setDate(d.getDate() + daysUntilFriday);
      return d.toISOString().split('T')[0];
    },
  },
  {
    pattern: /\btomorrow\b/i,
    extract: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    },
  },
  {
    pattern: /\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
    extract: (match) => {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDay = days.indexOf(match[1].toLowerCase());
      if (targetDay === -1) return undefined;
      const d = new Date();
      const currentDay = d.getDay();
      const daysAhead = ((targetDay - currentDay + 7) % 7) || 7;
      d.setDate(d.getDate() + daysAhead);
      return d.toISOString().split('T')[0];
    },
  },
];

const URGENCY_KEYWORDS = [
  'urgent',
  'asap',
  'action required',
  'time-sensitive',
  'high priority',
  'critical',
  'immediately',
  'right away',
];

function parseDateString(dateStr: string): string | undefined {
  try {
    const cleaned = dateStr.replace(',', '');
    const date = new Date(cleaned);
    if (isNaN(date.getTime())) return undefined;
    return date.toISOString().split('T')[0];
  } catch {
    return undefined;
  }
}

function extractSnippet(text: string, phrase: string): string {
  const index = text.toLowerCase().indexOf(phrase.toLowerCase());
  if (index === -1) return text.slice(0, 150);
  const start = Math.max(0, index - 40);
  const end = Math.min(text.length, index + phrase.length + 60);
  let snippet = text.slice(start, end).trim();
  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';
  return snippet;
}

export function detectDueDate(text: string): string | undefined {
  for (const { pattern, extract } of DEADLINE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const date = extract(match);
      if (date) return date;
    }
  }
  return undefined;
}

export function assessPriority(email: GraphEmail): Priority {
  const text = `${email.subject} ${email.bodyPreview}`.toLowerCase();

  if (email.importance === 'high') return 'high';

  for (const keyword of URGENCY_KEYWORDS) {
    if (text.includes(keyword)) return 'high';
  }

  if (email.flag?.flagStatus === 'flagged') return 'high';
  if (!email.isRead) return 'medium';

  return 'medium';
}

export function extractActionItems(email: GraphEmail): ActionItem[] {
  const text = `${email.subject} ${email.bodyPreview}`;
  const items: ActionItem[] = [];
  const seenPhrases = new Set<string>();

  for (const pattern of ACTION_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      const rawPhrase = match[1]?.trim() ?? match[0].trim();
      const actionPhrase = rawPhrase.replace(/[.!?,;:]+$/, '').trim();

      if (seenPhrases.has(actionPhrase.toLowerCase())) continue;
      seenPhrases.add(actionPhrase.toLowerCase());

      const title = actionPhrase.charAt(0).toUpperCase() + actionPhrase.slice(1);
      const dueDate = detectDueDate(text);
      const priority = assessPriority(email);
      const snippet = extractSnippet(text, actionPhrase);

      items.push({
        title,
        description: `From: ${email.from.emailAddress.name} <${email.from.emailAddress.address}>\nSubject: ${email.subject}\n\n${snippet}`,
        priority,
        dueDate,
        actionPhrase,
        snippet,
      });
    }
  }

  if (items.length === 0 && email.flag?.flagStatus === 'flagged') {
    items.push({
      title: email.subject,
      description: `From: ${email.from.emailAddress.name} <${email.from.emailAddress.address}>\nSubject: ${email.subject}\n\n${email.bodyPreview.slice(0, 150)}`,
      priority: assessPriority(email),
      dueDate: detectDueDate(text),
      actionPhrase: 'Flagged email',
      snippet: email.bodyPreview.slice(0, 150),
    });
  }

  return items;
}
