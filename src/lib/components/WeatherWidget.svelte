<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { t } from '../i18n/index.svelte.js';
  import {
    getWeatherData,
    getWeatherLoading,
    getWeatherError,
    getWeatherPreferences,
    refreshWeather,
    refreshWeatherIfStale,
    requestGeolocation,
  } from '../stores/weatherStore.svelte.js';
  import { formatTemperature } from '../utils/weatherHelpers.js';
  import WeatherForecast from './WeatherForecast.svelte';
  import WeatherSettings from './WeatherSettings.svelte';

  const weather = $derived(getWeatherData());
  const loading = $derived(getWeatherLoading());
  const error = $derived(getWeatherError());
  const prefs = $derived(getWeatherPreferences());

  let showForecast = $state(false);
  let showSettings = $state(false);

  const hasLocation = $derived(prefs.latitude != null && prefs.longitude != null);
  const lastUpdatedText = $derived(() => {
    if (!weather?.fetchedAt) return '';
    const d = new Date(weather.fetchedAt);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  });

  // Initialize weather on mount
  $effect(() => {
    if (hasLocation) {
      refreshWeatherIfStale();
    }
  });

  // Auto-refresh every 30 minutes
  $effect(() => {
    if (!hasLocation) return;
    const interval = setInterval(() => {
      refreshWeatherIfStale();
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  });

  async function handleSetupLocation() {
    const coords = await requestGeolocation();
    if (coords) {
      await refreshWeather();
    } else {
      showSettings = true;
    }
  }

  function toggleForecast() {
    showForecast = !showForecast;
    if (showForecast) showSettings = false;
  }

  function toggleSettings() {
    showSettings = !showSettings;
    if (showSettings) showForecast = false;
  }

  function handleForecastKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleForecast();
    }
  }
</script>

<div class="weather-widget" aria-label={t('weather.aria.widget')}>
  {#if !hasLocation}
    <button class="setup-btn" onclick={handleSetupLocation} transition:fade={{ duration: 150 }}>
      🌤️ {t('weather.setLocation')}
    </button>
  {:else if loading && !weather}
    <span class="loading" transition:fade={{ duration: 150 }}>
      ⏳ {t('weather.loading')}
    </span>
  {:else if error && !weather}
    <span class="error-state" transition:fade={{ duration: 150 }}>
      ⚠️ {t('weather.unavailable')}
      <button class="retry-btn" onclick={() => refreshWeather()}>
        {t('weather.retry')}
      </button>
    </span>
  {:else if weather}
    <div class="weather-display" transition:fly={{ y: -5, duration: 200 }}>
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <span
        class="weather-main"
        onclick={toggleForecast}
        onkeydown={handleForecastKeydown}
        role="button"
        tabindex="0"
        title={weather.current.conditionText}
      >
        <span class="weather-icon">{weather.current.icon}</span>
        <span class="weather-temp">{formatTemperature(weather.current.temperature, prefs.unit)}</span>
        <span class="weather-condition">{weather.current.conditionText}</span>
      </span>
      <span class="weather-location">{weather.location}</span>
      {#if error}
        <span class="last-updated" title={t('weather.lastUpdated', { time: lastUpdatedText() })}>⚠️</span>
      {/if}
      <button
        class="settings-trigger"
        onclick={toggleSettings}
        aria-label={t('weather.changeLocation')}
        title={t('weather.changeLocation')}
      >⚙</button>
    </div>
  {/if}

  {#if showForecast && weather}
    <div class="dropdown-panel">
      <WeatherForecast onClose={() => { showForecast = false; }} />
    </div>
  {/if}

  {#if showSettings}
    <div class="dropdown-panel">
      <WeatherSettings onClose={() => { showSettings = false; }} />
    </div>
  {/if}
</div>

<style>
  .weather-widget {
    position: relative;
    display: flex;
    align-items: center;
    font-size: 0.85rem;
  }

  .setup-btn {
    background: none;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 0.3rem 0.6rem;
    cursor: pointer;
    color: var(--color-text-muted);
    font-size: 0.8rem;
    transition: background 0.15s, color 0.15s;
  }

  .setup-btn:hover {
    background: var(--color-surface);
    color: var(--color-text);
  }

  .loading {
    font-size: 0.8rem;
    color: var(--color-text-muted);
  }

  .error-state {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .retry-btn {
    background: none;
    border: none;
    color: var(--color-accent);
    cursor: pointer;
    font-size: 0.75rem;
    text-decoration: underline;
    padding: 0;
  }

  .weather-display {
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }

  .weather-main {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    cursor: pointer;
    padding: 0.2rem 0.4rem;
    border-radius: var(--radius-md);
    transition: background 0.15s;
  }

  .weather-main:hover {
    background: var(--color-border);
  }

  .weather-main:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .weather-icon {
    font-size: 1.1rem;
    line-height: 1;
  }

  .weather-temp {
    font-weight: 600;
    color: var(--color-text);
    font-size: 0.85rem;
  }

  .weather-condition {
    color: var(--color-text-muted);
    font-size: 0.75rem;
    display: none;
  }

  @media (min-width: 640px) {
    .weather-condition {
      display: inline;
    }
  }

  .weather-location {
    font-size: 0.7rem;
    color: var(--color-text-muted);
    display: none;
  }

  .last-updated {
    font-size: 0.7rem;
    color: var(--color-priority-medium);
    cursor: help;
  }

  @media (min-width: 768px) {
    .weather-location {
      display: inline;
    }
  }

  .settings-trigger {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-text-muted);
    font-size: 0.8rem;
    padding: 0.15rem;
    border-radius: var(--radius-md);
    line-height: 1;
    transition: color 0.15s;
  }

  .settings-trigger:hover {
    color: var(--color-text);
  }

  .settings-trigger:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .dropdown-panel {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    width: min(24rem, 90vw);
    z-index: 200;
  }
</style>
