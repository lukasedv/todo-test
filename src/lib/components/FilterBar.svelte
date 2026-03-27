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
    gap: 1rem;
    flex-wrap: wrap;
  }
  .filter-buttons {
    display: flex;
    gap: 0.25rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 0.2rem;
  }
  .filter-btn {
    padding: 0.3rem 0.85rem;
    border: none;
    border-radius: calc(var(--radius-md) - 2px);
    cursor: pointer;
    font-size: 0.875rem;
    background: transparent;
    color: var(--color-text-muted);
    transition: all 0.15s;
  }
  .filter-btn.active {
    background: var(--color-bg);
    color: var(--color-text);
    font-weight: 600;
    box-shadow: var(--shadow-md);
  }
  .sort-select {
    padding: 0.4rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-surface);
    color: var(--color-text);
    font-size: 0.875rem;
    cursor: pointer;
  }
</style>
