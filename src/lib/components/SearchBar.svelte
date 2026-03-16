<script lang="ts">
  import { getSearchQuery, setSearchQuery } from '../stores/todos.svelte.js';
  
  let query = $state(getSearchQuery());
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  
  function handleInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    query = value;
    if (debounceTimer !== null) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => setSearchQuery(value), 150);
  }
  
  function clear() {
    query = '';
    setSearchQuery('');
  }
</script>

<div class="search-bar">
  <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/>
  </svg>
  <input
    type="search"
    placeholder="Search todos…"
    value={query}
    oninput={handleInput}
    aria-label="Search todos"
  />
  {#if query}
    <button class="clear-btn" onclick={clear} aria-label="Clear search">×</button>
  {/if}
</div>

<style>
  .search-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 0.4rem 0.75rem;
  }
  .icon {
    width: 1rem;
    height: 1rem;
    color: var(--color-text-muted);
    flex-shrink: 0;
  }
  input {
    border: none;
    background: transparent;
    outline: none;
    font-size: 0.875rem;
    color: var(--color-text);
    flex: 1;
    min-width: 0;
  }
  input::placeholder { color: var(--color-text-muted); }
  .clear-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text-muted);
    font-size: 1.1rem;
    padding: 0;
    line-height: 1;
  }
  .clear-btn:hover { color: var(--color-text); }
</style>
