<script lang="ts">
  import type { Priority } from '../types.js';
  import { addTodo } from '../stores/todos.svelte.js';
  import { t } from '../i18n/index.svelte.js';
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
  let weatherSensitive = $state(false);
  
  function addTag(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    if (tags.length >= 10) {
      tagError = t('todo.error.maxTags');
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
      titleError = t('todo.error.titleRequired');
      return;
    }
    if (title.length > 200) {
      titleError = t('todo.error.titleMaxLength');
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
      weatherSensitive: weatherSensitive || undefined,
    });
    
    title = '';
    description = '';
    priority = 'medium';
    dueDate = '';
    tagInput = '';
    tags = [];
    weatherSensitive = false;
    onClose?.();
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose?.();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<form class="add-todo" onsubmit={handleSubmit} novalidate aria-label={t('aria.addNewTodo')}>
  <div class="field">
    <label for="todo-title">{t('todo.label.title')} <span aria-hidden="true">*</span></label>
    <input
      id="todo-title"
      type="text"
      placeholder={t('todo.placeholder.title')}
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
    <label for="todo-desc">{t('todo.label.description')}</label>
    <textarea id="todo-desc" placeholder={t('todo.placeholder.description')} bind:value={description} rows={2}></textarea>
  </div>
  
  <div class="row">
    <div class="field">
      <label for="todo-priority">{t('todo.label.priority')}</label>
      <div class="priority-select">
        <select id="todo-priority" bind:value={priority}>
          <option value="high">{t('priority.high')}</option>
          <option value="medium">{t('priority.medium')}</option>
          <option value="low">{t('priority.low')}</option>
        </select>
        <PriorityBadge {priority} />
      </div>
    </div>
    
    <div class="field">
      <label for="todo-due">{t('todo.label.dueDate')}</label>
      <input id="todo-due" type="date" bind:value={dueDate} />
    </div>
  </div>
  
  <div class="field">
    <label for="todo-tags">{t('todo.label.tags')}</label>
    <div class="tags-container">
      {#each tags as tag}
        <TagChip {tag} onRemove={() => removeTag(tag)} />
      {/each}
      <input
        id="todo-tags"
        type="text"
        placeholder={t('todo.placeholder.tag')}
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
  
  <div class="field weather-sensitive-field">
    <label class="weather-toggle">
      <input
        type="checkbox"
        bind:checked={weatherSensitive}
        aria-label={t('weather.sensitiveToggle')}
      />
      <span class="weather-toggle-label">🌤️ {t('weather.sensitiveToggle')}</span>
    </label>
  </div>
  
  <div class="actions">
    <button type="submit" class="btn-primary">{t('todo.add')}</button>
    {#if onClose}
      <button type="button" class="btn-secondary" onclick={onClose}>{t('todo.cancel')}</button>
    {/if}
  </div>
</form>

<style>
  .add-todo {
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-xl);
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    box-shadow: var(--shadow-sm);
    transition: box-shadow 0.2s ease;
  }
  .add-todo:focus-within {
    box-shadow: var(--shadow-md);
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }
  label {
    font-size: var(--font-size-xs);
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wide);
  }
  input[type="text"], input[type="date"], textarea, select {
    padding: var(--space-3) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    color: var(--color-text);
    font-size: var(--font-size-base);
    width: 100%;
    box-sizing: border-box;
    font-family: inherit;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px var(--color-accent-soft);
  }
  textarea { resize: vertical; }
  .row { display: flex; gap: var(--space-4); }
  .row .field { flex: 1; }
  .priority-select { display: flex; align-items: center; gap: var(--space-2); }
  .priority-select select { flex: 1; }
  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    align-items: center;
    min-height: 2.75rem;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .tags-container:focus-within {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px var(--color-accent-soft);
  }
  .tags-container input {
    border: none;
    padding: 0;
    outline: none;
    background: transparent;
    flex: 1;
    min-width: 8rem;
    font-size: var(--font-size-base);
  }
  .tags-container input:focus {
    box-shadow: none;
  }
  .error {
    color: var(--color-error);
    font-size: var(--font-size-xs);
    margin: 0;
    font-weight: 500;
  }
  .weather-toggle {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    cursor: pointer;
    font-size: var(--font-size-sm);
  }
  .weather-toggle input[type="checkbox"] {
    width: auto;
    accent-color: var(--color-accent);
    cursor: pointer;
  }
  .weather-toggle-label {
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    font-weight: normal;
    text-transform: none;
    letter-spacing: normal;
  }
  .actions { display: flex; gap: var(--space-2); margin-top: var(--space-1); }
  .btn-primary {
    padding: var(--space-3) var(--space-5);
    background: var(--color-accent);
    color: var(--color-on-accent);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: 600;
    font-size: var(--font-size-base);
    transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
    box-shadow: var(--shadow-sm);
  }
  .btn-primary:hover {
    background: var(--color-accent-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  .btn-primary:active { transform: translateY(0); box-shadow: var(--shadow-sm); }
  .btn-primary:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .btn-secondary {
    padding: var(--space-3) var(--space-5);
    background: transparent;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: var(--font-size-base);
    transition: background 0.15s ease, border-color 0.15s ease;
  }
  .btn-secondary:hover {
    background: var(--color-surface);
    border-color: var(--color-border-hover);
  }
  .btn-secondary:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  @media (max-width: 640px) {
    .row {
      flex-direction: column;
      gap: var(--space-3);
    }
  }
</style>
