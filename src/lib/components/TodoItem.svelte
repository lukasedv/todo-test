<script lang="ts">
  import type { Todo, Priority } from '../types.js';
  import { toggleTodo, updateTodo, deleteTodo, reorderTodos, getSortBy } from '../stores/todos.svelte.js';
  import { t, getDateLocale } from '../i18n/index.svelte.js';
  import PriorityBadge from './PriorityBadge.svelte';
  import TagChip from './TagChip.svelte';
  import SourceBadge from './SourceBadge.svelte';
  import WeatherAlert from './WeatherAlert.svelte';
  import { getDueDateStatus, formatDueDate } from '../utils/date.js';
  import { findForecastForDate, isBadWeather } from '../utils/weatherHelpers.js';
  import { getWeatherData } from '../stores/weatherStore.svelte.js';
  
  const { todo }: { todo: Todo } = $props();
  
  let editing = $state(false);
  let editTitle = $state('');
  let editDescription = $state('');
  let editPriority = $state<Priority>('medium');
  let editDueDate = $state('');
  let editTagInput = $state('');
  let editTags = $state<string[]>([]);
  let editTitleError = $state('');
  let editWeatherSensitive = $state(false);
  let isDraggingOver = $state(false);
  
  const dueDateStatus = $derived(getDueDateStatus(todo.dueDate));
  const formattedDate = $derived(formatDueDate(todo.dueDate, getDateLocale()));
  const isManualSort = $derived(getSortBy() === 'manual');
  
  const weatherData = $derived(getWeatherData());
  const weatherConflictForecast = $derived(() => {
    if (!todo.weatherSensitive || !todo.dueDate || todo.completed || !weatherData) return null;
    const forecastDay = findForecastForDate(weatherData.forecast, todo.dueDate);
    if (forecastDay && isBadWeather(forecastDay.condition)) return forecastDay;
    return null;
  });
  
  function startEdit() {
    editTitle = todo.title;
    editDescription = todo.description ?? '';
    editPriority = todo.priority;
    editDueDate = todo.dueDate ?? '';
    editTags = [...todo.tags];
    editTagInput = '';
    editTitleError = '';
    editWeatherSensitive = todo.weatherSensitive ?? false;
    editing = true;
  }
  
  function cancelEdit() {
    editing = false;
    editTitleError = '';
  }
  
  function confirmEdit() {
    if (!editTitle.trim()) {
      editTitleError = t('todo.error.titleRequired');
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
      weatherSensitive: editWeatherSensitive || undefined,
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
  data-priority={todo.priority}
  role="listitem"
  draggable={isManualSort}
  ondragstart={handleDragStart}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
>
  {#if isManualSort}
    <span class="drag-handle" aria-label={t('todo.aria.dragToReorder')} title={t('todo.aria.dragToReorder')}>⠿</span>
  {/if}
  
  {#if !editing}
    <label class="custom-checkbox">
      <input
        type="checkbox"
        aria-label={todo.completed ? t('todo.aria.markActive', { title: todo.title }) : t('todo.aria.markComplete', { title: todo.title })}
        checked={todo.completed}
        onchange={() => toggleTodo(todo.id)}
      />
      <span class="checkbox-visual">
        <svg class="checkmark" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="2,6 5,9 10,3" />
        </svg>
      </span>
    </label>
    
    <div class="content">
      <div class="title-row">
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <span
          class="title"
          ondblclick={startEdit}
          title={t('todo.title.doubleClickEdit')}
        >{todo.title}</span>
        <PriorityBadge priority={todo.priority} />
        <SourceBadge source={todo.source} />
        {#if todo.weatherSensitive}
          <span class="weather-sensitive-badge" title={t('weather.sensitive')}>🌤️</span>
        {/if}
        {#if weatherConflictForecast() && todo.dueDate}
          <WeatherAlert forecast={weatherConflictForecast()!} dueDate={todo.dueDate} />
        {/if}
      </div>
      
      {#if todo.description}
        <p class="description">{todo.description}</p>
      {/if}
      
      <div class="meta">
        {#if todo.dueDate}
          <span class="due-date due-{dueDateStatus}" title={formattedDate}>
            {#if dueDateStatus === 'overdue'}
              {t('date.overdue')}
            {:else if dueDateStatus === 'today'}
              {t('date.today')}
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
      <button class="edit-btn" onclick={startEdit} aria-label={t('todo.edit')}>✎</button>
      <button class="delete-btn" onclick={() => deleteTodo(todo.id)} aria-label={t('todo.delete')}>🗑</button>
    </div>
  {:else}
    <div class="edit-form">
      <input
        type="text"
        class="edit-title"
        bind:value={editTitle}
        onkeydown={handleEditKeydown}
        aria-label={t('todo.aria.editTitle')}
        aria-invalid={!!editTitleError}
        autofocus
      />
      {#if editTitleError}
        <p class="error" role="alert">{editTitleError}</p>
      {/if}
      <textarea
        class="edit-desc"
        bind:value={editDescription}
        placeholder={t('todo.placeholder.description')}
        onkeydown={(e) => { if (e.key === 'Escape') cancelEdit(); }}
        rows={2}
        aria-label={t('todo.aria.editDescription')}
      ></textarea>
      <div class="edit-row">
        <select bind:value={editPriority} aria-label={t('todo.aria.editPriority')}>
          <option value="high">{t('priority.high')}</option>
          <option value="medium">{t('priority.medium')}</option>
          <option value="low">{t('priority.low')}</option>
        </select>
        <input type="date" bind:value={editDueDate} aria-label={t('todo.aria.editDueDate')} />
      </div>
      <div class="tags-container">
        {#each editTags as tag}
          <TagChip {tag} onRemove={() => removeEditTag(tag)} />
        {/each}
        <input
          type="text"
          placeholder={t('todo.placeholder.tagEdit')}
          bind:value={editTagInput}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); 
              const t = editTagInput.trim();
              if (t && !editTags.includes(t) && editTags.length < 10) editTags = [...editTags, t];
              editTagInput = '';
            }
            if (e.key === 'Escape') cancelEdit();
          }}
          aria-label={t('todo.aria.addTag')}
        />
      </div>
      <label class="weather-toggle">
        <input
          type="checkbox"
          bind:checked={editWeatherSensitive}
          aria-label={t('weather.sensitiveToggle')}
        />
        <span class="weather-toggle-text">🌤️ {t('weather.sensitiveToggle')}</span>
      </label>
      <div class="edit-actions">
        <button class="btn-primary" onclick={confirmEdit}>{t('todo.save')}</button>
        <button class="btn-secondary" onclick={cancelEdit}>{t('todo.cancel')}</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .todo-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    border-left: 4px solid var(--color-border);
    box-shadow: var(--shadow-sm);
    transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
    list-style: none;
    position: relative;
  }
  .todo-item:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-1px);
    border-color: var(--color-border-hover);
  }
  .todo-item.completed {
    opacity: 0.55;
    border-left-color: var(--color-success) !important;
  }
  .todo-item.completed:hover {
    opacity: 0.75;
  }
  .todo-item.drag-over {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 2px var(--color-accent-soft), var(--shadow-lg);
  }

  /* Priority stripe on the left */
  .todo-item[data-priority="high"] { border-left-color: var(--color-priority-high); }
  .todo-item[data-priority="medium"] { border-left-color: var(--color-priority-medium); }
  .todo-item[data-priority="low"] { border-left-color: var(--color-priority-low); }

  .drag-handle {
    cursor: grab;
    color: var(--color-text-muted);
    font-size: 1.25rem;
    padding: var(--space-1);
    flex-shrink: 0;
    border-radius: var(--radius-sm);
    transition: color 0.15s ease, background 0.15s ease;
  }
  .drag-handle:hover {
    color: var(--color-text-secondary);
    background: var(--color-accent-soft);
  }
  .drag-handle:active { cursor: grabbing; }

  /* Custom checkbox */
  .custom-checkbox {
    position: relative;
    width: 1.375rem;
    height: 1.375rem;
    margin-top: 0.1rem;
    flex-shrink: 0;
  }
  .custom-checkbox input[type="checkbox"] {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    z-index: 1;
    margin: 0;
  }
  .checkbox-visual {
    width: 100%;
    height: 100%;
    border: 2px solid var(--color-border-hover);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
    background: var(--color-bg);
  }
  .custom-checkbox input:checked + .checkbox-visual {
    background: var(--color-accent);
    border-color: var(--color-accent);
  }
  .custom-checkbox input:focus-visible + .checkbox-visual {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .custom-checkbox input:hover + .checkbox-visual {
    border-color: var(--color-accent);
    transform: scale(1.08);
  }
  .checkmark {
    width: 12px;
    height: 12px;
    color: #fff;
    opacity: 0;
    transform: scale(0.5);
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  .custom-checkbox input:checked + .checkbox-visual .checkmark {
    opacity: 1;
    transform: scale(1);
  }

  .content { flex: 1; min-width: 0; }
  .title-row { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }
  .title {
    font-weight: 600;
    cursor: pointer;
    word-break: break-word;
    line-height: var(--line-height-tight);
    transition: color 0.15s ease;
  }
  .completed .title {
    text-decoration: line-through;
    color: var(--color-text-muted);
  }
  .description {
    margin: var(--space-1) 0 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    line-height: var(--line-height-relaxed);
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: var(--space-2);
    align-items: center;
  }
  .due-date {
    font-size: var(--font-size-xs);
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    border-radius: var(--radius-full);
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
  .due-overdue {
    color: var(--color-priority-high);
    background: var(--color-priority-high-bg);
  }
  .due-today {
    color: var(--color-priority-medium);
    background: var(--color-priority-medium-bg);
  }
  .due-soon {
    color: var(--color-priority-medium);
    background: var(--color-priority-medium-bg);
  }
  .due-future {
    color: var(--color-text-muted);
    background: var(--color-surface);
  }
  .tags { display: flex; flex-wrap: wrap; gap: 0.3rem; }

  .actions {
    display: flex;
    gap: var(--space-1);
    flex-shrink: 0;
    opacity: 0;
    transition: opacity 0.15s ease;
  }
  .todo-item:hover .actions, .todo-item:focus-within .actions { opacity: 1; }

  .edit-btn, .delete-btn {
    background: none;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    cursor: pointer;
    padding: var(--space-1) var(--space-2);
    font-size: var(--font-size-sm);
    min-width: 36px;
    min-height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
    color: var(--color-text-muted);
  }
  .edit-btn:hover {
    background: var(--color-accent-soft);
    border-color: var(--color-accent);
    color: var(--color-accent);
  }
  .delete-btn:hover {
    background: var(--color-danger-hover-bg);
    border-color: var(--color-priority-high);
    color: var(--color-priority-high);
    transform: scale(1.08);
  }
  .delete-btn:active {
    transform: scale(0.92);
  }
  .edit-btn:focus-visible, .delete-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .edit-form { flex: 1; display: flex; flex-direction: column; gap: var(--space-2); }
  .edit-title {
    width: 100%;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    font-weight: 500;
    background: var(--color-bg);
    color: var(--color-text);
    box-sizing: border-box;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .edit-title:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px var(--color-accent-soft);
  }
  .edit-desc {
    width: 100%;
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    resize: vertical;
    background: var(--color-bg);
    color: var(--color-text);
    box-sizing: border-box;
    font-family: inherit;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .edit-desc:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px var(--color-accent-soft);
  }
  .edit-row { display: flex; gap: var(--space-2); }
  .edit-row select, .edit-row input {
    flex: 1;
    padding: var(--space-2) var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    color: var(--color-text);
    font-size: var(--font-size-sm);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .edit-row select:focus, .edit-row input:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px var(--color-accent-soft);
  }
  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    align-items: center;
    padding: var(--space-1) var(--space-2);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    min-height: 2rem;
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
    min-width: 5rem;
    font-size: var(--font-size-xs);
    color: var(--color-text);
  }
  .error {
    color: var(--color-error);
    font-size: var(--font-size-xs);
    margin: 0;
    font-weight: 500;
  }
  .weather-sensitive-badge {
    font-size: var(--font-size-xs);
    line-height: 1;
  }
  .weather-toggle {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    cursor: pointer;
    font-size: var(--font-size-xs);
  }
  .weather-toggle input[type="checkbox"] {
    width: auto;
    accent-color: var(--color-accent);
    cursor: pointer;
  }
  .weather-toggle-text {
    color: var(--color-text-muted);
    font-size: var(--font-size-xs);
  }
  .edit-actions { display: flex; gap: var(--space-2); }
  .btn-primary {
    padding: var(--space-2) var(--space-4);
    background: var(--color-accent);
    color: #fff;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: 600;
    font-size: var(--font-size-sm);
    transition: background 0.15s ease, transform 0.15s ease;
  }
  .btn-primary:hover {
    background: var(--color-accent-hover);
    transform: translateY(-1px);
  }
  .btn-primary:active { transform: translateY(0); }
  .btn-primary:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .btn-secondary {
    padding: var(--space-2) var(--space-4);
    background: transparent;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: var(--font-size-sm);
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

  @media (prefers-reduced-motion: reduce) {
    .todo-item, .todo-item:hover,
    .custom-checkbox input:hover + .checkbox-visual,
    .delete-btn:hover, .delete-btn:active {
      transform: none !important;
    }
  }
</style>
