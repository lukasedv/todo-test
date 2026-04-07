import type { WeatherData, WeatherCondition, WeatherForecastDay, TemperatureUnit } from '../types.js';
import { getConditionText, getWeatherEmoji } from './weatherHelpers.js';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1';
const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1';

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

function buildCondition(code: number, temperature: number, unit: TemperatureUnit, high?: number, low?: number): WeatherCondition {
  return {
    temperature: Math.round(temperature),
    temperatureUnit: unit,
    conditionCode: code,
    conditionText: getConditionText(code),
    icon: getWeatherEmoji(code),
    high: high != null ? Math.round(high) : undefined,
    low: low != null ? Math.round(low) : undefined,
  };
}

export async function fetchWeatherData(
  latitude: number,
  longitude: number,
  unit: TemperatureUnit,
  signal?: AbortSignal,
): Promise<WeatherData> {
  const tempUnit = unit === 'F' ? 'fahrenheit' : 'celsius';
  const url = `${OPEN_METEO_BASE}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&temperature_unit=${tempUnit}&timezone=auto&forecast_days=5`;

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data = await response.json();

  const current = buildCondition(
    data.current.weather_code,
    data.current.temperature_2m,
    unit,
  );

  const forecast: WeatherForecastDay[] = (data.daily.time as string[]).map((date: string, i: number) => ({
    date,
    condition: buildCondition(
      data.daily.weather_code[i],
      (data.daily.temperature_2m_max[i] + data.daily.temperature_2m_min[i]) / 2,
      unit,
      data.daily.temperature_2m_max[i],
      data.daily.temperature_2m_min[i],
    ),
  }));

  return {
    location: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
    current,
    forecast,
    fetchedAt: new Date().toISOString(),
  };
}

export async function searchCity(query: string, signal?: AbortSignal): Promise<GeocodingResult[]> {
  if (query.length < 3) return [];

  const url = `${GEOCODING_BASE}/search?name=${encodeURIComponent(query)}&count=5&language=en`;
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Geocoding API error: ${response.status}`);
  }

  const data = await response.json();
  if (!data.results) return [];

  return (data.results as Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1?: string;
  }>).map((r) => ({
    id: r.id,
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    country: r.country,
    admin1: r.admin1,
  }));
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<string> {
  try {
    const url = `${GEOCODING_BASE}/search?name=${latitude.toFixed(1)},${longitude.toFixed(1)}&count=1&language=en`;
    const response = await fetch(url, { signal });
    if (!response.ok) return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].name;
    }
  } catch {
    // Fall through to coordinate string
  }
  return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
}
