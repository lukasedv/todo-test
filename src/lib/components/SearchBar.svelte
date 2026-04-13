<script lang="ts">
  import { getSearchQuery, setSearchQuery } from '../stores/todos.svelte.js';
  import { t } from '../i18n/index.svelte.js';
  
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
    placeholder={t('search.placeholder')}
    value={query}
    oninput={handleInput}
    aria-label={t('search.aria.label')}
  />
  {#if query}
    <button class="clear-btn" onclick={clear} aria-label={t('search.aria.clear')}>×</button>
  {/if}
</div>

<style>
  .search-bar {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    padding: var(--space-2) var(--space-3);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    min-height: 42px;
  }
  .search-bar:focus-within {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px var(--color-accent-soft);
  }
  .icon {
    width: 1.125rem;
    height: 1.125rem;
    color: var(--color-text-muted);
    flex-shrink: 0;
    transition: color 0.15s ease;
  }
  .search-bar:focus-within .icon {
    color: var(--color-accent);
  }
  input {
    border: none;
    background: transparent;
    outline: none;
    font-size: var(--font-size-sm);
    color: var(--color-text);
    flex: 1;
    min-width: 0;
  }
  input::placeholder { color: var(--color-text-muted); }
  .clear-btn {
    background: var(--color-border);
    border: none;
    cursor: pointer;
    color: var(--color-text-muted);
    font-size: 0.8rem;
    padding: 0;
    line-height: 1;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: var(--radius-full);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease, color 0.15s ease;
    flex-shrink: 0;
  }
  .clear-btn:hover {
    color: var(--color-text);
    background: var(--color-border-hover);
  }
  .clear-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
</style>
