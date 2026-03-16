import type { Todo, Filter, SortBy } from '../types.js';
import { loadFromStorage, saveToStorage } from '../utils/storage.js';
import { applyFilterAndSort } from '../utils/sorting.js';
import { isValidTodo } from '../utils/validation.js';

function loadTodos(): Todo[] {
  const raw = loadFromStorage<unknown[]>('todos', []);
  return Array.isArray(raw) ? raw.filter(isValidTodo) : [];
}

let todos = $state<Todo[]>(loadTodos());
let filter = $state<Filter>(loadFromStorage<Filter>('filter', 'all'));
let sortBy = $state<SortBy>(loadFromStorage<SortBy>('sortBy', 'createdAt'));
let searchQuery = $state('');
let deletedTodo = $state<{ todo: Todo; index: number } | null>(null);
let toastTimer = $state<ReturnType<typeof setTimeout> | null>(null);

$effect.root(() => {
  $effect(() => { saveToStorage('todos', todos); });
  $effect(() => { saveToStorage('filter', filter); });
  $effect(() => { saveToStorage('sortBy', sortBy); });
});

const filteredTodos = $derived(applyFilterAndSort(todos, filter, sortBy, searchQuery));

export function getTodos() { return todos; }
export function getFilter() { return filter; }
export function getSortBy() { return sortBy; }
export function getSearchQuery() { return searchQuery; }
export function getFilteredTodos() { return filteredTodos; }
export function getDeletedTodo() { return deletedTodo; }

export function setFilter(f: Filter) { filter = f; }
export function setSortBy(s: SortBy) { sortBy = s; }
export function setSearchQuery(q: string) { searchQuery = q; }

export function addTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'order'>): Todo {
  const now = new Date().toISOString();
  const newTodo: Todo = {
    ...todo,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    order: todos.length,
  };
  todos = [newTodo, ...todos];
  return newTodo;
}

export function toggleTodo(id: string) {
  todos = todos.map((t) =>
    t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t
  );
}

export function updateTodo(id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) {
  todos = todos.map((t) =>
    t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
  );
}

export function deleteTodo(id: string) {
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return;
  const todo = todos[index];
  if (toastTimer !== null) clearTimeout(toastTimer);
  deletedTodo = { todo, index };
  todos = todos.filter((t) => t.id !== id);
  toastTimer = setTimeout(() => {
    deletedTodo = null;
    toastTimer = null;
  }, 5000);
}

export function undoDelete() {
  if (!deletedTodo) return;
  const { todo, index } = deletedTodo;
  const newTodos = [...todos];
  newTodos.splice(index, 0, todo);
  todos = newTodos;
  deletedTodo = null;
  if (toastTimer !== null) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
}

export function dismissToast() {
  deletedTodo = null;
  if (toastTimer !== null) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
}

export function reorderTodos(fromId: string, toId: string) {
  const fromIndex = todos.findIndex((t) => t.id === fromId);
  const toIndex = todos.findIndex((t) => t.id === toId);
  if (fromIndex === -1 || toIndex === -1) return;
  const newTodos = [...todos];
  const [moved] = newTodos.splice(fromIndex, 1);
  newTodos.splice(toIndex, 0, moved);
  todos = newTodos.map((t, i) => ({ ...t, order: i }));
}
