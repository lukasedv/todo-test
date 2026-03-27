import type { GraphEmail, Suggestion, M365Config } from '../types.js';
import { extractActionItems } from './emailParser.js';
import { fetchEmails, fetchFlaggedEmails, buildOutlookDeepLink } from './graphService.js';

export function generateSuggestions(
  emails: GraphEmail[],
  dismissedIds: Set<string>,
  existingMessageIds: Set<string>,
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  for (const email of emails) {
    if (dismissedIds.has(email.id) || existingMessageIds.has(email.id)) {
      continue;
    }

    const actionItems = extractActionItems(email);

    for (const item of actionItems) {
      suggestions.push({
        id: crypto.randomUUID(),
        sourceType: 'email',
        messageId: email.id,
        suggestedTitle: item.title,
        suggestedDescription: item.description,
        suggestedPriority: item.priority,
        suggestedDueDate: item.dueDate,
        suggestedTags: ['m365', 'email', ...(email.from.emailAddress.name ? [email.from.emailAddress.name.split(' ')[0].toLowerCase()] : [])],
        sourceUrl: buildOutlookDeepLink(email.id),
        senderName: email.from.emailAddress.name,
        senderEmail: email.from.emailAddress.address,
        emailSubject: email.subject,
        emailDate: email.receivedDateTime,
        snippet: item.snippet,
        actionPhrase: item.actionPhrase,
        createdAt: new Date().toISOString(),
        status: 'pending',
      });
    }
  }

  return suggestions;
}

export async function scanEmails(
  config: M365Config,
  dismissedIds: Set<string>,
  existingMessageIds: Set<string>,
): Promise<Suggestion[]> {
  const emails = await fetchEmails(config.folders, config.timeWindow);

  let allEmails = [...emails];

  if (config.importFlagged) {
    const flagged = await fetchFlaggedEmails(config.timeWindow);
    const existingIds = new Set(allEmails.map((e) => e.id));
    for (const email of flagged) {
      if (!existingIds.has(email.id)) {
        allEmails.push(email);
      }
    }
  }

  return generateSuggestions(allEmails, dismissedIds, existingMessageIds);
}
