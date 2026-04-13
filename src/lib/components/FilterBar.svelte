<script lang="ts">
  import type { Filter, SortBy } from '../types.js';
  import { getFilter, getSortBy, setFilter, setSortBy } from '../stores/todos.svelte.js';
  import { t } from '../i18n/index.svelte.js';
  
  let activeFilter = $state<Filter>(getFilter());
  let activeSortBy = $state<SortBy>(getSortBy());

  const filterLabels = $derived<Record<Filter, string>>({
    all: t('filter.all'),
    active: t('filter.active'),
    completed: t('filter.completed'),
  });
  
  function selectFilter(f: Filter) {
    activeFilter = f;
    setFilter(f);
  }
  
  function handleSortChange(e: Event) {
    const val = (e.target as HTMLSelectElement).value as SortBy;
    activeSortBy = val;
    setSortBy(val);
  }
</script>

<div class="filter-bar">
  <div class="filter-buttons" role="group" aria-label={t('aria.filterTodos')}>
    {#each (['all', 'active', 'completed'] as Filter[]) as f}
      <button
        class="filter-btn"
        class:active={activeFilter === f}
        onclick={() => selectFilter(f)}
        aria-pressed={activeFilter === f}
      >
        {filterLabels[f]}
      </button>
    {/each}
  </div>
  
  <select class="sort-select" value={activeSortBy} onchange={handleSortChange} aria-label={t('aria.sortTodosBy')}>
    <option value="createdAt">{t('sort.createdAt')}</option>
    <option value="dueDate">{t('sort.dueDate')}</option>
    <option value="priority">{t('sort.priority')}</option>
    <option value="title">{t('sort.title')}</option>
    <option value="manual">{t('sort.manual')}</option>
  </select>
</div>

<style>
  .filter-bar {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }
  .filter-buttons {
    display: flex;
    gap: var(--space-1);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: 0.2rem;
  }
  .filter-btn {
    padding: var(--space-2) var(--space-4);
    border: none;
    border-radius: calc(var(--radius-lg) - 2px);
    cursor: pointer;
    font-size: var(--font-size-sm);
    font-weight: 500;
    background: transparent;
    color: var(--color-text-muted);
    transition: all 0.2s ease;
    min-height: 36px;
  }
  .filter-btn:hover {
    color: var(--color-text-secondary);
    background: var(--color-accent-soft);
  }
  .filter-btn.active {
    background: var(--color-accent);
    color: #fff;
    font-weight: 600;
    box-shadow: var(--shadow-sm);
  }
  .filter-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .sort-select {
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    font-size: var(--font-size-sm);
    cursor: pointer;
    min-height: 36px;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .sort-select:hover {
    border-color: var(--color-border-hover);
  }
  .sort-select:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px var(--color-accent-soft);
  }
</style>
