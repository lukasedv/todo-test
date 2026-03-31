<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';
  import { getFilteredTodos, getFilter, getSearchQuery, getTodos } from '../stores/todos.svelte.js';
  import { getWeatherData } from '../stores/weatherStore.svelte.js';
  import { t } from '../i18n/index.svelte.js';
  import { getEmptyStateMessage } from '../utils/weatherHelpers.js';
  import TodoItem from './TodoItem.svelte';
  import EmptyState from './EmptyState.svelte';
  
  const filteredTodos = $derived(getFilteredTodos());
  const allTodos = $derived(getTodos());
  const filter = $derived(getFilter());
  const searchQuery = $derived(getSearchQuery());
  const weather = $derived(getWeatherData());
  
  const emptyMessage = $derived(() => {
    if (searchQuery.trim()) return t('empty.noResults', { query: searchQuery });
    if (filter !== 'all') return t('empty.noFilterResults');
    return t('empty.noTasks');
  });

  const weatherEmptyMessage = $derived(() => {
    // Only show weather message when there are no tasks at all or all are completed
    if (searchQuery.trim() || filter !== 'all') return null;
    const hasTasks = allTodos.length > 0;
    const allCompleted = hasTasks && allTodos.every(t => t.completed);
    if (!hasTasks || allCompleted) {
      return getEmptyStateMessage(weather?.current?.conditionCode);
    }
    return null;
  });
</script>

{#if filteredTodos.length === 0}
  <EmptyState message={emptyMessage()} weatherMessage={weatherEmptyMessage()} />
{:else}
  <ul class="todo-list" role="list" aria-label={t('aria.todoList')}>
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
