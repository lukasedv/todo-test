import { describe, it, expect } from 'vitest';
import { isValidTodo } from '$lib/utils/validation.js';

describe('isValidTodo', () => {
  const validTodo = {
    id: '123',
    title: 'Test todo',
    completed: false,
    priority: 'medium',
    tags: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('returns true for a valid todo object', () => {
    expect(isValidTodo(validTodo)).toBe(true);
  });

  it('returns true for a valid todo with optional fields', () => {
    expect(isValidTodo({ ...validTodo, description: 'desc', dueDate: '2026-12-31', order: 0 })).toBe(true);
  });

  it('returns false for null', () => {
    expect(isValidTodo(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isValidTodo(undefined)).toBe(false);
  });

  it('returns false for a string', () => {
    expect(isValidTodo('not a todo')).toBe(false);
  });

  it('returns false for a number', () => {
    expect(isValidTodo(42)).toBe(false);
  });

  it('returns false when id is missing', () => {
    const { id, ...rest } = validTodo;
    expect(isValidTodo(rest)).toBe(false);
  });

  it('returns false when title is missing', () => {
    const { title, ...rest } = validTodo;
    expect(isValidTodo(rest)).toBe(false);
  });

  it('returns false when completed is missing', () => {
    const { completed, ...rest } = validTodo;
    expect(isValidTodo(rest)).toBe(false);
  });

  it('returns false when createdAt is missing', () => {
    const { createdAt, ...rest } = validTodo;
    expect(isValidTodo(rest)).toBe(false);
  });

  it('returns false when updatedAt is missing', () => {
    const { updatedAt, ...rest } = validTodo;
    expect(isValidTodo(rest)).toBe(false);
  });

  it('returns false when completed is a string instead of boolean', () => {
    expect(isValidTodo({ ...validTodo, completed: 'false' })).toBe(false);
  });

  it('returns false when id is a number instead of string', () => {
    expect(isValidTodo({ ...validTodo, id: 123 })).toBe(false);
  });

  it('returns false for an empty object', () => {
    expect(isValidTodo({})).toBe(false);
  });

  it('returns false for an array', () => {
    expect(isValidTodo([])).toBe(false);
  });
});
