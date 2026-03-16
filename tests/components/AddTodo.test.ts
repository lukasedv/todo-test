import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import AddTodo from '$lib/components/AddTodo.svelte';

describe('AddTodo', () => {
  it('renders the form', () => {
    render(AddTodo);
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /priority/i })).toBeInTheDocument();
  });

  it('shows error when submitting without title', async () => {
    const user = userEvent.setup();
    render(AddTodo);
    
    const submitBtn = screen.getByText('Add Todo');
    await user.click(submitBtn);
    
    expect(screen.getByText('Title is required')).toBeInTheDocument();
  });

  it('allows typing in title field', async () => {
    const user = userEvent.setup();
    render(AddTodo);
    
    const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
    await user.type(titleInput, 'New task');
    
    expect(titleInput.value).toBe('New task');
  });

  it('allows selecting priority', async () => {
    const user = userEvent.setup();
    render(AddTodo);
    
    const prioritySelect = screen.getByRole('combobox', { name: /priority/i }) as HTMLSelectElement;
    await user.selectOptions(prioritySelect, 'high');
    
    expect(prioritySelect.value).toBe('high');
  });

  it('renders cancel button when onClose is provided', () => {
    const onClose = () => {};
    render(AddTodo, { onClose });
    
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('does not render cancel button when onClose is not provided', () => {
    render(AddTodo);
    
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  it('allows adding tags', async () => {
    const user = userEvent.setup();
    render(AddTodo);
    
    const tagInput = screen.getByLabelText(/tags/i);
    await user.type(tagInput, 'work{Enter}');
    
    expect(screen.getByText('work')).toBeInTheDocument();
  });

  it('shows tag error when exceeding limit', async () => {
    const user = userEvent.setup();
    render(AddTodo);
    
    const tagInput = screen.getByLabelText(/tags/i);
    
    // Add 10 tags (max limit)
    for (let i = 0; i < 10; i++) {
      await user.type(tagInput, `tag${i}{Enter}`);
    }
    
    // Try to add one more
    await user.type(tagInput, 'tag11{Enter}');
    
    expect(screen.getByText(/maximum 10 tags/i)).toBeInTheDocument();
  });
});
