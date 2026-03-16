<script lang="ts">
  import type { Filter, SortBy } from '../types.js';
  import { getFilter, getSortBy, setFilter, setSortBy } from '../stores/todos.svelte.js';
  
  let activeFilter = $state<Filter>(getFilter());
  let activeSortBy = $state<SortBy>(getSortBy());
  
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
  <div class="filter-buttons" role="group" aria-label="Filter todos">
    {#each (['all', 'active', 'completed'] as Filter[]) as f}
      <button
        class="filter-btn"
        class:active={activeFilter === f}
        onclick={() => selectFilter(f)}
        aria-pressed={activeFilter === f}
      >
        {f.charAt(0).toUpperCase() + f.slice(1)}
      </button>
    {/each}
  </div>
  
  <select class="sort-select" value={activeSortBy} onchange={handleSortChange} aria-label="Sort todos by">
    <option value="createdAt">Created Date</option>
    <option value="dueDate">Due Date</option>
    <option value="priority">Priority</option>
    <option value="title">Title</option>
    <option value="manual">Manual Order</option>
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
