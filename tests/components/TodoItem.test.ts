import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import TodoItem from '$lib/components/TodoItem.svelte';
import type { Todo } from '$lib/types.js';

const mockTodo: Todo = {
  id: '1',
  title: 'Test Todo',
  description: 'Test description',
  completed: false,
  priority: 'medium',
  tags: ['work', 'urgent'],
  createdAt: '2026-03-16T00:00:00Z',
  updatedAt: '2026-03-16T00:00:00Z',
  order: 0,
};

describe('TodoItem', () => {
  it('renders todo title', () => {
    render(TodoItem, { todo: mockTodo });
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
  });

  it('renders todo description', () => {
    render(TodoItem, { todo: mockTodo });
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders priority badge', () => {
    render(TodoItem, { todo: mockTodo });
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('renders tags', () => {
    render(TodoItem, { todo: mockTodo });
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });

  it('shows completed state', () => {
    const completedTodo = { ...mockTodo, completed: true };
    render(TodoItem, { todo: completedTodo });
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('shows active state', () => {
    render(TodoItem, { todo: mockTodo });
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('renders edit and delete buttons', async () => {
    const user = userEvent.setup();
    const { container } = render(TodoItem, { todo: mockTodo });
    
    // Hover to show action buttons
    const todoDiv = container.querySelector('.todo-item');
    if (todoDiv) {
      await user.hover(todoDiv);
    }
    
    expect(screen.getByLabelText('Edit todo')).toBeInTheDocument();
    expect(screen.getByLabelText('Delete todo')).toBeInTheDocument();
  });

  it('enters edit mode on double click', async () => {
    const user = userEvent.setup();
    render(TodoItem, { todo: mockTodo });
    
    const title = screen.getByText('Test Todo');
    await user.dblClick(title);
    
    expect(screen.getByLabelText('Edit title')).toBeInTheDocument();
  });
});
