<script lang="ts">
  import type { Todo, Priority } from '../types.js';
  import { toggleTodo, updateTodo, deleteTodo, reorderTodos, getSortBy } from '../stores/todos.svelte.js';
  import PriorityBadge from './PriorityBadge.svelte';
  import TagChip from './TagChip.svelte';
  import { getDueDateStatus, formatDueDate } from '../utils/date.js';
  
  const { todo }: { todo: Todo } = $props();
  
  let editing = $state(false);
  let editTitle = $state('');
  let editDescription = $state('');
  let editPriority = $state<Priority>('medium');
  let editDueDate = $state('');
  let editTagInput = $state('');
  let editTags = $state<string[]>([]);
  let editTitleError = $state('');
  let isDraggingOver = $state(false);
  
  const dueDateStatus = $derived(getDueDateStatus(todo.dueDate));
  const formattedDate = $derived(formatDueDate(todo.dueDate));
  const isManualSort = $derived(getSortBy() === 'manual');
  
  function startEdit() {
    editTitle = todo.title;
    editDescription = todo.description ?? '';
    editPriority = todo.priority;
    editDueDate = todo.dueDate ?? '';
    editTags = [...todo.tags];
    editTagInput = '';
    editTitleError = '';
    editing = true;
  }
  
  function cancelEdit() {
    editing = false;
    editTitleError = '';
  }
  
  function confirmEdit() {
    if (!editTitle.trim()) {
      editTitleError = 'Title is required';
      return;
    }
    const inputTags = editTagInput.split(',').map((t) => t.trim()).filter(Boolean);
    const allTags = [...editTags];
    for (const t of inputTags) {
      if (!allTags.includes(t) && allTags.length < 10) allTags.push(t);
    }
    updateTodo(todo.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      priority: editPriority,
      dueDate: editDueDate || undefined,
      tags: allTags,
    });
    editing = false;
  }
  
  function handleEditKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      confirmEdit();
    }
    if (e.key === 'Escape') cancelEdit();
  }
  
  function removeEditTag(tag: string) {
    editTags = editTags.filter((t) => t !== tag);
  }
  
  function handleDragStart(e: DragEvent) {
    e.dataTransfer?.setData('text/plain', todo.id);
  }
  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDraggingOver = true;
  }
  function handleDragLeave() { isDraggingOver = false; }
  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDraggingOver = false;
    const fromId = e.dataTransfer?.getData('text/plain');
    if (fromId && fromId !== todo.id) reorderTodos(fromId, todo.id);
  }
</script>

<div
  class="todo-item"
  class:completed={todo.completed}
  class:editing
  class:drag-over={isDraggingOver}
  role="listitem"
  draggable={isManualSort}
  ondragstart={handleDragStart}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
>
  {#if isManualSort}
    <span class="drag-handle" aria-label="Drag to reorder" title="Drag to reorder">⠿</span>
  {/if}
  
  {#if !editing}
    <input
      type="checkbox"
      aria-label="Mark '{todo.title}' as {todo.completed ? 'active' : 'complete'}"
      checked={todo.completed}
      onchange={() => toggleTodo(todo.id)}
    />
    
    <div class="content">
      <div class="title-row">
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <span
          class="title"
          ondblclick={startEdit}
          title="Double-click to edit"
        >{todo.title}</span>
        <PriorityBadge priority={todo.priority} />
      </div>
      
      {#if todo.description}
        <p class="description">{todo.description}</p>
      {/if}
      
      <div class="meta">
        {#if todo.dueDate}
          <span class="due-date due-{dueDateStatus}" title={formattedDate}>
            {#if dueDateStatus === 'overdue'}
              ⚠️ Overdue
            {:else if dueDateStatus === 'today'}
              📅 Due today
            {:else}
              📅 {formattedDate}
            {/if}
          </span>
        {/if}
        
        {#if todo.tags.length > 0}
          <div class="tags">
            {#each todo.tags as tag}
              <TagChip {tag} />
            {/each}
          </div>
        {/if}
      </div>
    </div>
    
    <div class="actions">
      <button class="edit-btn" onclick={startEdit} aria-label="Edit todo">✎</button>
      <button class="delete-btn" onclick={() => deleteTodo(todo.id)} aria-label="Delete todo">🗑</button>
    </div>
  {:else}
    <div class="edit-form">
      <input
        type="text"
        class="edit-title"
        bind:value={editTitle}
        onkeydown={handleEditKeydown}
        aria-label="Edit title"
        aria-invalid={!!editTitleError}
        autofocus
      />
      {#if editTitleError}
        <p class="error" role="alert">{editTitleError}</p>
      {/if}
      <textarea
        class="edit-desc"
        bind:value={editDescription}
        placeholder="Description (optional)"
        onkeydown={(e) => { if (e.key === 'Escape') cancelEdit(); }}
        rows={2}
        aria-label="Edit description"
      ></textarea>
      <div class="edit-row">
        <select bind:value={editPriority} aria-label="Edit priority">
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <input type="date" bind:value={editDueDate} aria-label="Edit due date" />
      </div>
      <div class="tags-container">
        {#each editTags as tag}
          <TagChip {tag} onRemove={() => removeEditTag(tag)} />
        {/each}
        <input
          type="text"
          placeholder="Add tag…"
          bind:value={editTagInput}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); 
              const t = editTagInput.trim();
              if (t && !editTags.includes(t) && editTags.length < 10) editTags = [...editTags, t];
              editTagInput = '';
            }
            if (e.key === 'Escape') cancelEdit();
          }}
          aria-label="Add tag"
        />
      </div>
      <div class="edit-actions">
        <button class="btn-primary" onclick={confirmEdit}>Save</button>
        <button class="btn-secondary" onclick={cancelEdit}>Cancel</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .todo-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    transition: box-shadow 0.15s, opacity 0.15s;
    list-style: none;
  }
  .todo-item:hover { box-shadow: var(--shadow-md); }
  .todo-item.completed { opacity: 0.65; }
  .todo-item.drag-over { border-color: var(--color-accent); box-shadow: 0 0 0 2px var(--color-accent); }
  .drag-handle {
    cursor: grab;
    color: var(--color-text-muted);
    font-size: 1.25rem;
    padding: 0.1rem;
    flex-shrink: 0;
  }
  .drag-handle:active { cursor: grabbing; }
  input[type="checkbox"] {
    width: 1.1rem;
    height: 1.1rem;
    margin-top: 0.15rem;
    cursor: pointer;
    flex-shrink: 0;
    accent-color: var(--color-accent);
  }
  .content { flex: 1; min-width: 0; }
  .title-row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
  .title {
    font-weight: 500;
    cursor: pointer;
    word-break: break-word;
  }
  .completed .title { text-decoration: line-through; }
  .description { margin: 0.25rem 0 0; font-size: 0.85rem; color: var(--color-text-muted); }
  .meta { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.4rem; align-items: center; }
  .due-date { font-size: 0.75rem; font-weight: 500; }
  .due-overdue { color: var(--color-priority-high); }
  .due-today { color: var(--color-priority-medium); }
  .due-soon { color: var(--color-priority-medium); }
  .tags { display: flex; flex-wrap: wrap; gap: 0.3rem; }
  .actions {
    display: flex;
    gap: 0.35rem;
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.15s;
  }
  .todo-item:hover .actions, .todo-item:focus-within .actions { opacity: 1; }
  .edit-btn, .delete-btn {
    background: none;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    padding: 0.25rem 0.45rem;
    font-size: 0.85rem;
    transition: background 0.15s;
  }
  .edit-btn:hover { background: var(--color-surface); }
  .delete-btn:hover { background: #fef2f2; border-color: var(--color-priority-high); }
  
  .edit-form { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
  .edit-title {
    width: 100%; padding: 0.4rem 0.6rem; border: 1px solid var(--color-border);
    border-radius: var(--radius-md); font-size: 0.9rem; font-weight: 500;
    background: var(--color-bg); color: var(--color-text); box-sizing: border-box;
  }
  .edit-title:focus { outline: 2px solid var(--color-accent); outline-offset: 1px; }
  .edit-desc {
    width: 100%; padding: 0.4rem 0.6rem; border: 1px solid var(--color-border);
    border-radius: var(--radius-md); font-size: 0.85rem; resize: vertical;
    background: var(--color-bg); color: var(--color-text); box-sizing: border-box; font-family: inherit;
  }
  .edit-row { display: flex; gap: 0.5rem; }
  .edit-row select, .edit-row input { flex: 1; padding: 0.35rem 0.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-bg); color: var(--color-text); font-size: 0.85rem; }
  .tags-container {
    display: flex; flex-wrap: wrap; gap: 0.3rem; align-items: center;
    padding: 0.3rem 0.5rem; border: 1px solid var(--color-border); border-radius: var(--radius-md);
    background: var(--color-bg); min-height: 2rem;
  }
  .tags-container input { border: none; padding: 0; outline: none; background: transparent; flex: 1; min-width: 5rem; font-size: 0.8rem; color: var(--color-text); }
  .error { color: var(--color-priority-high); font-size: 0.8rem; margin: 0; }
  .edit-actions { display: flex; gap: 0.4rem; }
  .btn-primary {
    padding: 0.4rem 1rem; background: var(--color-accent); color: #fff; border: none;
    border-radius: var(--radius-md); cursor: pointer; font-weight: 600; font-size: 0.8rem;
  }
  .btn-primary:hover { opacity: 0.9; }
  .btn-secondary {
    padding: 0.4rem 1rem; background: transparent; color: var(--color-text-muted);
    border: 1px solid var(--color-border); border-radius: var(--radius-md); cursor: pointer; font-size: 0.8rem;
  }
  .btn-secondary:hover { background: var(--color-surface); }
</style>
