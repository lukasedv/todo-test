<script lang="ts">
  import { t } from '../i18n/index.svelte.js';
  import { getWeatherPreferences, setWeatherPreferences, setTemperatureUnit, refreshWeather, requestGeolocation } from '../stores/weatherStore.svelte.js';
  import { searchCity, type GeocodingResult } from '../utils/weatherApi.js';

  const { onClose }: { onClose?: () => void } = $props();

  const prefs = $derived(getWeatherPreferences());

  let query = $state('');
  let results = $state<GeocodingResult[]>([]);
  let searching = $state(false);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let searchController: AbortController | null = null;

  function handleSearchInput() {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (query.length < 3) {
      results = [];
      return;
    }
    debounceTimer = setTimeout(async () => {
      if (searchController) searchController.abort();
      searchController = new AbortController();
      searching = true;
      try {
        results = await searchCity(query, searchController.signal);
      } catch {
        results = [];
      } finally {
        searching = false;
      }
    }, 300);
  }

  async function selectCity(city: GeocodingResult) {
    setWeatherPreferences({
      latitude: city.latitude,
      longitude: city.longitude,
      cityName: city.admin1 ? `${city.name}, ${city.admin1}` : `${city.name}, ${city.country}`,
    });
    query = '';
    results = [];
    await refreshWeather();
    onClose?.();
  }

  async function useMyLocation() {
    const coords = await requestGeolocation();
    if (coords) {
      setWeatherPreferences({ cityName: undefined });
      await refreshWeather();
      onClose?.();
    }
  }

  function handleUnitChange(unit: 'C' | 'F') {
    setTemperatureUnit(unit);
    refreshWeather();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose?.();
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div class="weather-settings" role="dialog" aria-label={t('weather.aria.settings')} onkeydown={handleKeydown} tabindex="-1">
  <h3 class="settings-title">{t('weather.settings')}</h3>

  <div class="field">
    <label for="city-search">{t('weather.locationSearch')}</label>
    <input
      id="city-search"
      type="text"
      placeholder={t('weather.searchPlaceholder')}
      bind:value={query}
      oninput={handleSearchInput}
      autocomplete="off"
    />
    {#if results.length > 0}
      <ul class="search-results" role="listbox">
        {#each results as city}
          <li role="option" aria-selected="false">
            <button class="city-btn" onclick={() => selectCity(city)}>
              {city.name}{city.admin1 ? `, ${city.admin1}` : ''}, {city.country}
            </button>
          </li>
        {/each}
      </ul>
    {/if}
    {#if searching}
      <p class="hint">{t('weather.loading')}</p>
    {/if}
  </div>

  <button class="btn-secondary location-btn" onclick={useMyLocation}>
    📍 {t('weather.useMyLocation')}
  </button>

  {#if prefs.cityName || (prefs.latitude != null && prefs.longitude != null)}
    <p class="current-location">📌 {prefs.cityName ?? `${prefs.latitude?.toFixed(2)}, ${prefs.longitude?.toFixed(2)}`}</p>
  {/if}

  <div class="unit-toggle">
    <span class="unit-label">{t('weather.temperatureUnit')}</span>
    <div class="unit-buttons" role="radiogroup" aria-label={t('weather.temperatureUnit')}>
      <button
        class="unit-btn"
        class:active={prefs.unit === 'C'}
        onclick={() => handleUnitChange('C')}
        role="radio"
        aria-checked={prefs.unit === 'C'}
      >{t('weather.celsius')}</button>
      <button
        class="unit-btn"
        class:active={prefs.unit === 'F'}
        onclick={() => handleUnitChange('F')}
        role="radio"
        aria-checked={prefs.unit === 'F'}
      >{t('weather.fahrenheit')}</button>
    </div>
  </div>

  {#if onClose}
    <button class="btn-secondary close-btn" onclick={onClose}>{t('todo.cancel')}</button>
  {/if}
</div>

<style>
  .weather-settings {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .settings-title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    position: relative;
  }

  label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  input {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    color: var(--color-text);
    font-size: 0.875rem;
    width: 100%;
    box-sizing: border-box;
  }

  input:focus {
    outline: 2px solid var(--color-accent);
    outline-offset: 1px;
  }

  .search-results {
    list-style: none;
    margin: 0;
    padding: 0;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    max-height: 12rem;
    overflow-y: auto;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 10;
    box-shadow: var(--shadow-md);
  }

  .city-btn {
    display: block;
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    color: var(--color-text);
    font-size: 0.85rem;
  }

  .city-btn:hover {
    background: var(--color-surface);
  }

  .hint {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin: 0;
  }

  .location-btn {
    align-self: flex-start;
  }

  .current-location {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin: 0;
  }

  .unit-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .unit-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .unit-buttons {
    display: flex;
    gap: 0.2rem;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 0.15rem;
  }

  .unit-btn {
    padding: 0.25rem 0.6rem;
    border: none;
    border-radius: calc(var(--radius-md) - 2px);
    cursor: pointer;
    font-size: 0.8rem;
    background: transparent;
    color: var(--color-text-muted);
    transition: all 0.15s;
  }

  .unit-btn.active {
    background: var(--color-accent);
    color: #fff;
    font-weight: 600;
  }

  .btn-secondary {
    padding: 0.4rem 0.8rem;
    background: transparent;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: 0.8rem;
    transition: background 0.15s;
  }

  .btn-secondary:hover {
    background: var(--color-surface);
  }

  .close-btn {
    align-self: flex-end;
  }
</style>
