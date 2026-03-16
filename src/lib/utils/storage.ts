export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`[Storage] Failed to load key "${key}":`, err);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`[Storage] Failed to save key "${key}":`, err);
  }
}

export function clearAppStorage(): void {
  try {
    localStorage.removeItem('todos');
    localStorage.removeItem('filter');
    localStorage.removeItem('sortBy');
    localStorage.removeItem('theme');
  } catch (err) {
    console.error('[Storage] Failed to clear app data:', err);
  }
}
