<script lang="ts">
  import { fly } from 'svelte/transition';
  import { t } from '../i18n/index.svelte.js';
  import { getWeatherData, getWeatherPreferences } from '../stores/weatherStore.svelte.js';
  import { formatTemperature } from '../utils/weatherHelpers.js';
  import { getTodos } from '../stores/todos.svelte.js';

  const { onClose }: { onClose?: () => void } = $props();

  const weather = $derived(getWeatherData());
  const prefs = $derived(getWeatherPreferences());
  const todos = $derived(getTodos());

  const todoDueDates = $derived(new Set(
    todos
      .filter(t => t.dueDate && !t.completed)
      .map(t => t.dueDate!)
  ));

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  function formatDay(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.getTime() === today.getTime()) return 'Today';
    if (d.getTime() === tomorrow.getTime()) return 'Tomorrow';
    return dayNames[d.getDay()];
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose?.();
  }
</script>

{#if weather}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div
    class="forecast-panel"
    role="region"
    aria-label={t('weather.aria.forecast')}
    transition:fly={{ y: -10, duration: 200 }}
    onkeydown={handleKeydown}
  >
    <div class="forecast-header">
      <h3 class="forecast-title">{t('weather.forecast')}</h3>
      {#if onClose}
        <button class="close-btn" onclick={onClose} aria-label={t('about.aria.close')}>✕</button>
      {/if}
    </div>

    <div class="forecast-days">
      {#each weather.forecast as day}
        <div class="forecast-day" class:has-todo={todoDueDates.has(day.date)}>
          <span class="day-name">{formatDay(day.date)}</span>
          <span class="day-icon">{day.condition.icon}</span>
          <span class="day-temps">
            {#if day.condition.high != null && day.condition.low != null}
              <span class="temp-high">{formatTemperature(day.condition.high, prefs.unit)}</span>
              <span class="temp-low">{formatTemperature(day.condition.low, prefs.unit)}</span>
            {:else}
              <span>{formatTemperature(day.condition.temperature, prefs.unit)}</span>
            {/if}
          </span>
          <span class="day-condition">{day.condition.conditionText}</span>
          {#if todoDueDates.has(day.date)}
            <span class="todo-indicator" title="You have tasks due this day">📋</span>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .forecast-panel {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 1rem;
    box-shadow: var(--shadow-md);
  }

  .forecast-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .forecast-title {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text-muted);
    font-size: 1rem;
    padding: 0.2rem 0.4rem;
    border-radius: var(--radius-md);
    transition: color 0.15s, background 0.15s;
  }

  .close-btn:hover {
    color: var(--color-text);
    background: var(--color-border);
  }

  .close-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .forecast-days {
    display: flex;
    gap: 0.25rem;
    overflow-x: auto;
  }

  .forecast-day {
    flex: 1;
    min-width: 5.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.6rem 0.4rem;
    border-radius: var(--radius-md);
    background: var(--color-bg);
    border: 1px solid transparent;
    transition: border-color 0.15s;
  }

  .forecast-day.has-todo {
    border-color: var(--color-accent);
    background: color-mix(in srgb, var(--color-accent) 5%, var(--color-bg));
  }

  .day-name {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
  }

  .day-icon {
    font-size: 1.5rem;
    line-height: 1;
  }

  .day-temps {
    display: flex;
    gap: 0.3rem;
    font-size: 0.8rem;
  }

  .temp-high {
    font-weight: 600;
    color: var(--color-text);
  }

  .temp-low {
    color: var(--color-text-muted);
  }

  .day-condition {
    font-size: 0.65rem;
    color: var(--color-text-muted);
    text-align: center;
    line-height: 1.2;
  }

  .todo-indicator {
    font-size: 0.7rem;
  }

  @media (max-width: 640px) {
    .forecast-days {
      gap: 0.15rem;
    }
    .forecast-day {
      min-width: 4rem;
      padding: 0.4rem 0.2rem;
    }
  }
</style>
