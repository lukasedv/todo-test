import type { WeatherCondition, TemperatureUnit, WeatherForecastDay } from '../types.js';

const WMO_CONDITIONS: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

export function getConditionText(code: number): string {
  return WMO_CONDITIONS[code] ?? 'Unknown';
}

export function getWeatherEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 2) return '⛅';
  if (code === 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 57) return '🌧️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 86) return '🌨️';
  if (code >= 95) return '⛈️';
  return '🌤️';
}

const BAD_WEATHER_CODES = new Set([
  55, 56, 57,       // Dense/freezing drizzle
  63, 65, 66, 67,   // Moderate/heavy rain, freezing rain
  73, 75,           // Moderate/heavy snow
  77,               // Snow grains
  81, 82,           // Moderate/violent rain showers
  85, 86,           // Snow showers
  95, 96, 99,       // Thunderstorms
]);

const SEVERE_WEATHER_CODES = new Set([
  65, 67,           // Heavy rain / freezing rain
  75,               // Heavy snow
  82,               // Violent rain showers
  86,               // Heavy snow showers
  95, 96, 99,       // Thunderstorms
]);

export function isBadWeather(condition: WeatherCondition): boolean {
  if (BAD_WEATHER_CODES.has(condition.conditionCode)) return true;

  const tempC = condition.temperatureUnit === 'F'
    ? convertTemperature(condition.temperature, 'F', 'C')
    : condition.temperature;

  const highC = condition.high != null
    ? (condition.temperatureUnit === 'F' ? convertTemperature(condition.high, 'F', 'C') : condition.high)
    : tempC;

  if (highC > 38) return true;
  if (tempC < -10) return true;

  return false;
}

export function isSevereWeather(condition: WeatherCondition): boolean {
  if (SEVERE_WEATHER_CODES.has(condition.conditionCode)) return true;

  const tempC = condition.temperatureUnit === 'F'
    ? convertTemperature(condition.temperature, 'F', 'C')
    : condition.temperature;

  const highC = condition.high != null
    ? (condition.temperatureUnit === 'F' ? convertTemperature(condition.high, 'F', 'C') : condition.high)
    : tempC;

  if (highC > 42) return true;
  if (tempC < -20) return true;

  return false;
}

export function convertTemperature(temp: number, from: TemperatureUnit, to: TemperatureUnit): number {
  if (from === to) return temp;
  if (from === 'C' && to === 'F') return Math.round(temp * 9 / 5 + 32);
  return Math.round((temp - 32) * 5 / 9);
}

export function formatTemperature(temp: number, unit: TemperatureUnit): string {
  return `${Math.round(temp)}°${unit}`;
}

export function getEmptyStateMessage(conditionCode: number | undefined): string | null {
  if (conditionCode == null) return null;

  if (conditionCode === 0 || conditionCode === 1) {
    return '☀️ Great weather and no tasks — enjoy the day!';
  }
  if (conditionCode === 2 || conditionCode === 3) {
    return '⛅ A calm day and you\'re all done — nice!';
  }
  if (conditionCode >= 51 && conditionCode <= 67) {
    return '🌧️ Perfect day to stay in — and you\'re all done!';
  }
  if (conditionCode >= 71 && conditionCode <= 86) {
    return '❄️ Snowy outside and you have no tasks — cozy up!';
  }
  if (conditionCode >= 95) {
    return '⛈️ Stormy weather, but your task list is clear!';
  }
  if (conditionCode >= 45 && conditionCode <= 48) {
    return '🌫️ Foggy day and nothing to do — take it easy!';
  }
  return '🌤️ You\'re all caught up — enjoy your day!';
}

export function getWeatherConflictMessage(forecast: WeatherForecastDay, date: string): string {
  const conditionText = forecast.condition.conditionText.toLowerCase();
  return `${getWeatherEmoji(forecast.condition.conditionCode)} ${forecast.condition.conditionText} expected on ${date} — consider rescheduling.`;
}

export function findForecastForDate(forecast: WeatherForecastDay[], dueDate: string): WeatherForecastDay | undefined {
  return forecast.find(f => f.date === dueDate);
}
