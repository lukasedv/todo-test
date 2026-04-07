import type { WeatherData, WeatherPreferences, WeatherForecastDay, Todo, TemperatureUnit } from '../types.js';
import { loadFromStorage, saveToStorage } from '../utils/storage.js';
import { fetchWeatherData } from '../utils/weatherApi.js';
import { isBadWeather, isSevereWeather, findForecastForDate } from '../utils/weatherHelpers.js';

const WEATHER_CACHE_KEY = 'weather-cache';
const WEATHER_PREFS_KEY = 'weather-preferences';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

let weatherData = $state<WeatherData | null>(loadFromStorage<WeatherData | null>(WEATHER_CACHE_KEY, null));
let preferences = $state<WeatherPreferences>(loadFromStorage<WeatherPreferences>(WEATHER_PREFS_KEY, { unit: 'C' }));
let loading = $state(false);
let error = $state<string | null>(null);
let abortController = $state<AbortController | null>(null);

$effect.root(() => {
  $effect(() => {
    if (weatherData) {
      saveToStorage(WEATHER_CACHE_KEY, weatherData);
    }
  });
  $effect(() => {
    saveToStorage(WEATHER_PREFS_KEY, preferences);
  });
});

// Getters
export function getWeatherData(): WeatherData | null { return weatherData; }
export function getWeatherPreferences(): WeatherPreferences { return preferences; }
export function getWeatherLoading(): boolean { return loading; }
export function getWeatherError(): string | null { return error; }

export function isWeatherStale(): boolean {
  if (!weatherData) return true;
  const elapsed = Date.now() - new Date(weatherData.fetchedAt).getTime();
  return elapsed > CACHE_TTL_MS;
}

// Setters
export function setWeatherPreferences(prefs: Partial<WeatherPreferences>): void {
  preferences = { ...preferences, ...prefs };
}

export function setTemperatureUnit(unit: TemperatureUnit): void {
  preferences = { ...preferences, unit };
  // Clear cached data so it re-fetches with new unit
  weatherData = null;
}

export function clearWeatherData(): void {
  weatherData = null;
  error = null;
}

// Fetch weather
export async function refreshWeather(): Promise<void> {
  const { latitude, longitude, unit } = preferences;
  if (latitude == null || longitude == null) {
    error = 'No location set';
    return;
  }

  // Cancel any in-flight request
  if (abortController) {
    abortController.abort();
  }
  abortController = new AbortController();

  loading = true;
  error = null;

  try {
    const data = await fetchWeatherData(latitude, longitude, unit, abortController.signal);
    if (preferences.cityName) {
      data.location = preferences.cityName;
    }
    weatherData = data;
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === 'AbortError') return;
    error = e instanceof Error ? e.message : 'Failed to fetch weather';
  } finally {
    loading = false;
    abortController = null;
  }
}

// Refresh if stale
export async function refreshWeatherIfStale(): Promise<void> {
  if (isWeatherStale()) {
    await refreshWeather();
  }
}

// Geolocation
export function requestGeolocation(): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setWeatherPreferences(coords);
        resolve(coords);
      },
      () => resolve(null),
      { timeout: 10000 },
    );
  });
}

// Conflict detection
export interface WeatherConflict {
  todoId: string;
  forecast: WeatherForecastDay;
  severity: 'warning' | 'severe';
}

export function detectWeatherConflicts(todos: Todo[]): WeatherConflict[] {
  if (!weatherData || !weatherData.forecast.length) return [];

  const conflicts: WeatherConflict[] = [];

  for (const todo of todos) {
    if (!todo.weatherSensitive || !todo.dueDate || todo.completed) continue;

    const forecastDay = findForecastForDate(weatherData.forecast, todo.dueDate);
    if (!forecastDay) continue;

    if (isBadWeather(forecastDay.condition)) {
      conflicts.push({
        todoId: todo.id,
        forecast: forecastDay,
        severity: isSevereWeather(forecastDay.condition) ? 'severe' : 'warning',
      });
    }
  }

  return conflicts;
}
