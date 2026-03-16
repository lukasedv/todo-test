<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';
  import { getFilteredTodos, getFilter, getSearchQuery } from '../stores/todos.svelte.js';
  import TodoItem from './TodoItem.svelte';
  import EmptyState from './EmptyState.svelte';
  
  const filteredTodos = $derived(getFilteredTodos());
  const filter = $derived(getFilter());
  const searchQuery = $derived(getSearchQuery());
  
  const emptyMessage = $derived(() => {
    if (searchQuery.trim()) return `No results for "${searchQuery}"`;
    if (filter !== 'all') return 'No tasks here — try a different filter.';
    return 'No tasks yet — add one!';
  });
</script>

{#if filteredTodos.length === 0}
  <EmptyState message={emptyMessage()} />
{:else}
  <ul class="todo-list" role="list" aria-label="Todo list">
    {#each filteredTodos as todo (todo.id)}
      <li
        animate:flip={{ duration: 250 }}
        in:fly={{ y: -20, duration: 200 }}
        out:fly={{ x: 40, duration: 200 }}
      >
        <TodoItem {todo} />
      </li>
    {/each}
  </ul>
{/if}

<style>
  .todo-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0;
    margin: 0;
  }
  .todo-list > li {
    list-style: none;
  }
</style>
