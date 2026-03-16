<script lang="ts">
  import type { Priority } from '../types.js';
  import { addTodo } from '../stores/todos.svelte.js';
  import TagChip from './TagChip.svelte';
  import PriorityBadge from './PriorityBadge.svelte';
  
  const { onClose }: { onClose?: () => void } = $props();
  
  let title = $state('');
  let description = $state('');
  let priority = $state<Priority>('medium');
  let dueDate = $state('');
  let tagInput = $state('');
  let tags = $state<string[]>([]);
  let titleError = $state('');
  let tagError = $state('');
  
  function addTag(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (tags.length >= 10) {
      tagError = 'Maximum 10 tags per todo';
      return;
    }
    if (!tags.includes(trimmed)) {
      tags = [...tags, trimmed];
    }
    tagInput = '';
    tagError = '';
  }
  
  function handleTagKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  }
  
  function handleTagBlur() {
    if (tagInput.trim()) addTag(tagInput);
  }
  
  function removeTag(tag: string) {
    tags = tags.filter((t) => t !== tag);
  }
  
  function handleSubmit(e: Event) {
    e.preventDefault();
    if (!title.trim()) {
      titleError = 'Title is required';
      return;
    }
    if (title.length > 200) {
      titleError = 'Title must be 200 characters or less';
      return;
    }
    titleError = '';
    
    const inputTags = tagInput.split(',').map((t) => t.trim()).filter(Boolean);
    const allTags = [...tags];
    for (const t of inputTags) {
      if (!allTags.includes(t) && allTags.length < 10) allTags.push(t);
    }
    
    addTodo({
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      priority,
      tags: allTags,
      dueDate: dueDate || undefined,
    });
    
    title = '';
    description = '';
    priority = 'medium';
    dueDate = '';
    tagInput = '';
    tags = [];
    onClose?.();
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose?.();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<form class="add-todo" onsubmit={handleSubmit} novalidate aria-label="Add new todo">
  <div class="field">
    <label for="todo-title">Title <span aria-hidden="true">*</span></label>
    <input
      id="todo-title"
      type="text"
      placeholder="What needs to be done?"
      bind:value={title}
      maxlength={200}
      aria-required="true"
      aria-describedby={titleError ? 'title-error' : undefined}
      aria-invalid={!!titleError}
      autofocus
    />
    {#if titleError}
      <p id="title-error" class="error" role="alert">{titleError}</p>
    {/if}
  </div>
  
  <div class="field">
    <label for="todo-desc">Description</label>
    <textarea id="todo-desc" placeholder="Optional details…" bind:value={description} rows={2}></textarea>
  </div>
  
  <div class="row">
    <div class="field">
      <label for="todo-priority">Priority</label>
      <div class="priority-select">
        <select id="todo-priority" bind:value={priority}>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <PriorityBadge {priority} />
      </div>
    </div>
    
    <div class="field">
      <label for="todo-due">Due Date</label>
      <input id="todo-due" type="date" bind:value={dueDate} />
    </div>
  </div>
  
  <div class="field">
    <label for="todo-tags">Tags</label>
    <div class="tags-container">
      {#each tags as tag}
        <TagChip {tag} onRemove={() => removeTag(tag)} />
      {/each}
      <input
        id="todo-tags"
        type="text"
        placeholder="Add tag, press Enter or comma"
        bind:value={tagInput}
        onkeydown={handleTagKeydown}
        onblur={handleTagBlur}
        aria-describedby={tagError ? 'tag-error' : undefined}
      />
    </div>
    {#if tagError}
      <p id="tag-error" class="error" role="alert">{tagError}</p>
    {/if}
  </div>
  
  <div class="actions">
    <button type="submit" class="btn-primary">Add Todo</button>
    {#if onClose}
      <button type="button" class="btn-secondary" onclick={onClose}>Cancel</button>
    {/if}
  </div>
</form>

<style>
  .add-todo {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }
  label {
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  input[type="text"], input[type="date"], textarea, select {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    color: var(--color-text);
    font-size: 0.875rem;
    width: 100%;
    box-sizing: border-box;
    font-family: inherit;
  }
  input:focus, textarea:focus, select:focus {
    outline: 2px solid var(--color-accent);
    outline-offset: 1px;
  }
  textarea { resize: vertical; }
  .row { display: flex; gap: 1rem; }
  .row .field { flex: 1; }
  .priority-select { display: flex; align-items: center; gap: 0.5rem; }
  .priority-select select { flex: 1; }
  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    align-items: center;
    min-height: 2.25rem;
    padding: 0.35rem 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg);
  }
  .tags-container input {
    border: none;
    padding: 0;
    outline: none;
    background: transparent;
    flex: 1;
    min-width: 8rem;
    font-size: 0.875rem;
  }
  .error { color: var(--color-priority-high); font-size: 0.8rem; margin: 0; }
  .actions { display: flex; gap: 0.5rem; margin-top: 0.25rem; }
  .btn-primary {
    padding: 0.5rem 1.25rem;
    background: var(--color-accent);
    color: #fff;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: 600;
    font-size: 0.875rem;
    transition: opacity 0.15s;
  }
  .btn-primary:hover { opacity: 0.9; }
  .btn-secondary {
    padding: 0.5rem 1.25rem;
    background: transparent;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: 0.875rem;
    transition: background 0.15s;
  }
  .btn-secondary:hover { background: var(--color-surface); }
</style>
