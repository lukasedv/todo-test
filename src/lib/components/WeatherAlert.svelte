<script lang="ts">
  import type { WeatherForecastDay } from '../types.js';
  import { t } from '../i18n/index.svelte.js';
  import { isBadWeather, isSevereWeather, getWeatherConflictMessage } from '../utils/weatherHelpers.js';
  import { formatDueDate } from '../utils/date.js';
  import { getDateLocale } from '../i18n/index.svelte.js';

  const { forecast, dueDate }: { forecast: WeatherForecastDay; dueDate: string } = $props();

  const severity = $derived(isSevereWeather(forecast.condition) ? 'severe' : 'warning');
  const message = $derived(getWeatherConflictMessage(forecast, formatDueDate(dueDate, getDateLocale()) ?? dueDate));
  let showTooltip = $state(false);
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<span
  class="weather-alert weather-alert-{severity}"
  role="status"
  aria-label={t('weather.aria.alert')}
  title={message}
  onmouseenter={() => { showTooltip = true; }}
  onmouseleave={() => { showTooltip = false; }}
  onfocus={() => { showTooltip = true; }}
  onblur={() => { showTooltip = false; }}
  tabindex="0"
>
  {#if severity === 'severe'}
    🔴
  {:else}
    🟠
  {/if}
  {#if showTooltip}
    <span class="tooltip">{message}</span>
  {/if}
</span>

<style>
  .weather-alert {
    position: relative;
    cursor: help;
    font-size: 0.7rem;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    border-radius: 50%;
  }

  .weather-alert:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .tooltip {
    position: absolute;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-surface);
    color: var(--color-text);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 0.4rem 0.6rem;
    font-size: 0.75rem;
    white-space: nowrap;
    box-shadow: var(--shadow-md);
    z-index: 10;
    pointer-events: none;
    max-width: 20rem;
    white-space: normal;
    text-align: center;
  }
</style>
