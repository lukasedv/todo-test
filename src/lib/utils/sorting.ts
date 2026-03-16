import type { Todo, Filter, SortBy } from '../types.js';

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

export function applyFilterAndSort(
  todos: Todo[],
  filter: Filter,
  sortBy: SortBy,
  searchQuery: string
): Todo[] {
  let result = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q)
    );
  }

  if (sortBy === 'manual') {
    return result.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  if (sortBy === 'priority') {
    return result.sort(
      (a, b) => (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2)
    );
  }

  if (sortBy === 'title') {
    return result.sort((a, b) => a.title.localeCompare(b.title));
  }

  if (sortBy === 'dueDate') {
    return result.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }

  // Default: createdAt descending
  return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
