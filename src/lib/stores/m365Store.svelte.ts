import type { Suggestion, M365Config } from '../types.js';
import { loadFromStorage, saveToStorage } from '../utils/storage.js';

const DEFAULT_CONFIG: M365Config = {
  enabled: false,
  folders: ['inbox'],
  timeWindow: '3d',
  importFlagged: false,
  autoSyncInterval: 0,
  customKeywords: [],
};

let connected = $state(false);
let userEmail = $state<string | null>(loadFromStorage<string | null>('m365_userEmail', null));
let userName = $state<string | null>(loadFromStorage<string | null>('m365_userName', null));
let suggestions = $state<Suggestion[]>(loadFromStorage<Suggestion[]>('m365_suggestions', []));
let dismissedIds = $state<string[]>(loadFromStorage<string[]>('m365_dismissedIds', []));
let config = $state<M365Config>(loadFromStorage<M365Config>('m365_config', DEFAULT_CONFIG));
let scanning = $state(false);
let lastSyncTime = $state<string | null>(loadFromStorage<string | null>('m365_lastSync', null));

$effect.root(() => {
  $effect(() => { saveToStorage('m365_suggestions', suggestions); });
  $effect(() => { saveToStorage('m365_dismissedIds', dismissedIds); });
  $effect(() => { saveToStorage('m365_config', config); });
  $effect(() => { saveToStorage('m365_userEmail', userEmail); });
  $effect(() => { saveToStorage('m365_userName', userName); });
  $effect(() => { saveToStorage('m365_lastSync', lastSyncTime); });
});

export function getConnected() { return connected; }
export function getUserEmail() { return userEmail; }
export function getUserName() { return userName; }
export function getSuggestions() { return suggestions; }
export function getPendingSuggestions() { return suggestions.filter((s) => s.status === 'pending'); }
export function getDismissedIdSet() { return new Set(dismissedIds); }
export function getConfig() { return config; }
export function getScanning() { return scanning; }
export function getLastSyncTime() { return lastSyncTime; }

export function setConnected(value: boolean) { connected = value; }

export function setUserInfo(email: string | null, name: string | null) {
  userEmail = email;
  userName = name;
}

export function setScanning(value: boolean) { scanning = value; }

export function setSuggestions(newSuggestions: Suggestion[]) {
  suggestions = newSuggestions;
}

export function addSuggestions(newSuggestions: Suggestion[]) {
  const existingIds = new Set(suggestions.map((s) => s.messageId));
  const unique = newSuggestions.filter((s) => !existingIds.has(s.messageId));
  suggestions = [...suggestions, ...unique];
}

export function acceptSuggestion(id: string) {
  suggestions = suggestions.map((s) =>
    s.id === id ? { ...s, status: 'accepted' as const } : s,
  );
}

export function dismissSuggestion(id: string) {
  const suggestion = suggestions.find((s) => s.id === id);
  if (suggestion) {
    dismissedIds = [...dismissedIds, suggestion.messageId];
  }
  suggestions = suggestions.map((s) =>
    s.id === id ? { ...s, status: 'dismissed' as const } : s,
  );
}

export function dismissAllSuggestions() {
  const pendingMessageIds = suggestions
    .filter((s) => s.status === 'pending')
    .map((s) => s.messageId);
  dismissedIds = [...dismissedIds, ...pendingMessageIds];
  suggestions = suggestions.map((s) =>
    s.status === 'pending' ? { ...s, status: 'dismissed' as const } : s,
  );
}

export function updateConfig(updates: Partial<M365Config>) {
  config = { ...config, ...updates };
}

export function setLastSyncTime(time: string) {
  lastSyncTime = time;
}

export function clearM365Data() {
  suggestions = [];
  dismissedIds = [];
  userEmail = null;
  userName = null;
  connected = false;
  scanning = false;
  lastSyncTime = null;
  config = { ...DEFAULT_CONFIG };
}

export function getExistingMessageIds(): Set<string> {
  return new Set(
    suggestions
      .filter((s) => s.status === 'accepted')
      .map((s) => s.messageId),
  );
}
