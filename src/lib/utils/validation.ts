import type { Todo } from '../types.js';

export function isValidTodo(value: unknown): value is Todo {
  if (typeof value !== 'object' || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    typeof t.title === 'string' &&
    typeof t.completed === 'boolean' &&
    typeof t.createdAt === 'string' &&
    typeof t.updatedAt === 'string'
  );
}
