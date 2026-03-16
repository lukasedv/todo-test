import { describe, it, expect } from 'vitest';
import { applyFilterAndSort } from '$lib/utils/sorting.js';
import type { Todo } from '$lib/types.js';

const createTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: crypto.randomUUID(),
  title: 'Test Todo',
  completed: false,
  priority: 'medium',
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  order: 0,
  ...overrides,
});

describe('applyFilterAndSort', () => {
  it('filters by active status', () => {
    const todos = [
      createTodo({ title: 'Active', completed: false }),
      createTodo({ title: 'Completed', completed: true }),
    ];
    const result = applyFilterAndSort(todos, 'active', 'createdAt', '');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Active');
  });

  it('filters by completed status', () => {
    const todos = [
      createTodo({ title: 'Active', completed: false }),
      createTodo({ title: 'Completed', completed: true }),
    ];
    const result = applyFilterAndSort(todos, 'completed', 'createdAt', '');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Completed');
  });

  it('shows all todos when filter is "all"', () => {
    const todos = [
      createTodo({ completed: false }),
      createTodo({ completed: true }),
    ];
    const result = applyFilterAndSort(todos, 'all', 'createdAt', '');
    expect(result).toHaveLength(2);
  });

  it('searches by title', () => {
    const todos = [
      createTodo({ title: 'Buy milk' }),
      createTodo({ title: 'Walk dog' }),
    ];
    const result = applyFilterAndSort(todos, 'all', 'createdAt', 'milk');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Buy milk');
  });

  it('searches by description', () => {
    const todos = [
      createTodo({ title: 'Task 1', description: 'Important task' }),
      createTodo({ title: 'Task 2', description: 'Regular task' }),
    ];
    const result = applyFilterAndSort(todos, 'all', 'createdAt', 'important');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Task 1');
  });

  it('sorts by priority', () => {
    const todos = [
      createTodo({ title: 'Low', priority: 'low' }),
      createTodo({ title: 'High', priority: 'high' }),
      createTodo({ title: 'Medium', priority: 'medium' }),
    ];
    const result = applyFilterAndSort(todos, 'all', 'priority', '');
    expect(result[0].title).toBe('High');
    expect(result[1].title).toBe('Medium');
    expect(result[2].title).toBe('Low');
  });

  it('sorts by title alphabetically', () => {
    const todos = [
      createTodo({ title: 'Zebra' }),
      createTodo({ title: 'Apple' }),
      createTodo({ title: 'Mango' }),
    ];
    const result = applyFilterAndSort(todos, 'all', 'title', '');
    expect(result[0].title).toBe('Apple');
    expect(result[1].title).toBe('Mango');
    expect(result[2].title).toBe('Zebra');
  });

  it('sorts by manual order', () => {
    const todos = [
      createTodo({ title: 'Third', order: 2 }),
      createTodo({ title: 'First', order: 0 }),
      createTodo({ title: 'Second', order: 1 }),
    ];
    const result = applyFilterAndSort(todos, 'all', 'manual', '');
    expect(result[0].title).toBe('First');
    expect(result[1].title).toBe('Second');
    expect(result[2].title).toBe('Third');
  });

  it('sorts by due date with nulls last', () => {
    const todos = [
      createTodo({ title: 'No date' }),
      createTodo({ title: 'Tomorrow', dueDate: '2026-03-17' }),
      createTodo({ title: 'Today', dueDate: '2026-03-16' }),
    ];
    const result = applyFilterAndSort(todos, 'all', 'dueDate', '');
    expect(result[0].title).toBe('Today');
    expect(result[1].title).toBe('Tomorrow');
    expect(result[2].title).toBe('No date');
  });
});
