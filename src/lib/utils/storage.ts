export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    console.warn(`[storage] Failed to read "${key}" from localStorage.`);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.warn(`[storage] Failed to write "${key}" to localStorage.`);
  }
}

export function clearAppStorage(): void {
  try {
    localStorage.removeItem('todos');
    localStorage.removeItem('filter');
    localStorage.removeItem('sortBy');
    localStorage.removeItem('theme');
    localStorage.removeItem('todo-app-locale');
  } catch {
    console.warn('[storage] Failed to clear app data.');
  }
}
