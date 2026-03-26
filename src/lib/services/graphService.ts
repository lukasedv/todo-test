import { Client } from '@microsoft/microsoft-graph-client';
import { getAccessToken } from './authService.js';
import { graphScopes } from './msalConfig.js';
import type { GraphEmail, MailFolder, TimeWindow } from '../types.js';

function getGraphClient(): Client {
  return Client.init({
    authProvider: async (done) => {
      try {
        const token = await getAccessToken(graphScopes.mail);
        done(null, token);
      } catch (error) {
        done(error as Error, null);
      }
    },
  });
}

function getTimeWindowDate(timeWindow: TimeWindow): string {
  const now = new Date();
  const days: Record<TimeWindow, number> = {
    '1d': 1,
    '3d': 3,
    '7d': 7,
    '30d': 30,
  };
  now.setDate(now.getDate() - days[timeWindow]);
  return now.toISOString();
}

export async function fetchEmails(
  folders: string[],
  timeWindow: TimeWindow,
  top: number = 100,
): Promise<GraphEmail[]> {
  const client = getGraphClient();
  const sinceDate = getTimeWindowDate(timeWindow);
  const allEmails: GraphEmail[] = [];

  const folderIds = folders.length > 0 ? folders : ['inbox'];

  for (const folderId of folderIds) {
    try {
      const response = await client
        .api(`/me/mailFolders/${folderId}/messages`)
        .select('id,subject,bodyPreview,from,receivedDateTime,flag,importance,isRead')
        .filter(`receivedDateTime ge ${sinceDate}`)
        .orderby('receivedDateTime desc')
        .top(top)
        .get();

      if (response?.value) {
        allEmails.push(...(response.value as GraphEmail[]));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to fetch emails from folder "${folderId}": ${message}`);
    }
  }

  return allEmails;
}

export async function fetchMailFolders(): Promise<MailFolder[]> {
  const client = getGraphClient();
  try {
    const response = await client
      .api('/me/mailFolders')
      .select('id,displayName,totalItemCount')
      .top(50)
      .get();
    return (response?.value as MailFolder[]) ?? [];
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to fetch mail folders: ${message}`);
  }
}

export async function fetchFlaggedEmails(timeWindow: TimeWindow): Promise<GraphEmail[]> {
  const client = getGraphClient();
  const sinceDate = getTimeWindowDate(timeWindow);
  try {
    const response = await client
      .api('/me/messages')
      .select('id,subject,bodyPreview,from,receivedDateTime,flag,importance,isRead')
      .filter(`receivedDateTime ge ${sinceDate} and flag/flagStatus eq 'flagged'`)
      .orderby('receivedDateTime desc')
      .top(100)
      .get();
    return (response?.value as GraphEmail[]) ?? [];
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to fetch flagged emails: ${message}`);
  }
}

export function buildOutlookDeepLink(messageId: string): string {
  return `https://outlook.office.com/mail/deeplink/read/${encodeURIComponent(messageId)}`;
}
