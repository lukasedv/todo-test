import { describe, it, expect } from 'vitest';
import {
  getConditionText,
  getWeatherEmoji,
  isBadWeather,
  isSevereWeather,
  convertTemperature,
  formatTemperature,
  getEmptyStateMessage,
  findForecastForDate,
  getWeatherConflictMessage,
} from '$lib/utils/weatherHelpers.js';
import type { WeatherCondition, WeatherForecastDay } from '$lib/types.js';

function createCondition(overrides: Partial<WeatherCondition> = {}): WeatherCondition {
  return {
    temperature: 20,
    temperatureUnit: 'C',
    conditionCode: 0,
    conditionText: 'Clear sky',
    icon: '☀️',
    ...overrides,
  };
}

describe('getConditionText', () => {
  it('returns text for known WMO codes', () => {
    expect(getConditionText(0)).toBe('Clear sky');
    expect(getConditionText(61)).toBe('Slight rain');
    expect(getConditionText(95)).toBe('Thunderstorm');
  });

  it('returns "Unknown" for unrecognized codes', () => {
    expect(getConditionText(999)).toBe('Unknown');
  });
});

describe('getWeatherEmoji', () => {
  it('returns sun for clear sky', () => {
    expect(getWeatherEmoji(0)).toBe('☀️');
  });

  it('returns cloud for overcast', () => {
    expect(getWeatherEmoji(3)).toBe('☁️');
  });

  it('returns rain for rain codes', () => {
    expect(getWeatherEmoji(61)).toBe('🌧️');
  });

  it('returns snow for snow codes', () => {
    expect(getWeatherEmoji(71)).toBe('❄️');
  });

  it('returns thunderstorm for thunderstorm codes', () => {
    expect(getWeatherEmoji(95)).toBe('⛈️');
  });
});

describe('isBadWeather', () => {
  it('returns false for clear sky', () => {
    expect(isBadWeather(createCondition({ conditionCode: 0 }))).toBe(false);
  });

  it('returns false for partly cloudy', () => {
    expect(isBadWeather(createCondition({ conditionCode: 2 }))).toBe(false);
  });

  it('returns true for heavy rain', () => {
    expect(isBadWeather(createCondition({ conditionCode: 65 }))).toBe(true);
  });

  it('returns true for thunderstorm', () => {
    expect(isBadWeather(createCondition({ conditionCode: 95 }))).toBe(true);
  });

  it('returns true for extreme heat (>38°C)', () => {
    expect(isBadWeather(createCondition({ conditionCode: 0, temperature: 40, high: 40 }))).toBe(true);
  });

  it('returns true for extreme cold (<-10°C)', () => {
    expect(isBadWeather(createCondition({ conditionCode: 0, temperature: -15 }))).toBe(true);
  });

  it('returns false for moderate temperatures', () => {
    expect(isBadWeather(createCondition({ conditionCode: 0, temperature: 25 }))).toBe(false);
  });

  it('handles Fahrenheit temperatures correctly', () => {
    // 105°F > 40°C which is > 38°C
    expect(isBadWeather(createCondition({
      conditionCode: 0,
      temperature: 105,
      high: 105,
      temperatureUnit: 'F',
    }))).toBe(true);
  });
});

describe('isSevereWeather', () => {
  it('returns true for violent rain showers', () => {
    expect(isSevereWeather(createCondition({ conditionCode: 82 }))).toBe(true);
  });

  it('returns true for thunderstorms with hail', () => {
    expect(isSevereWeather(createCondition({ conditionCode: 99 }))).toBe(true);
  });

  it('returns false for slight rain', () => {
    expect(isSevereWeather(createCondition({ conditionCode: 61 }))).toBe(false);
  });

  it('returns true for extreme heat (>42°C)', () => {
    expect(isSevereWeather(createCondition({ conditionCode: 0, temperature: 45, high: 45 }))).toBe(true);
  });

  it('returns true for extreme cold (<-20°C)', () => {
    expect(isSevereWeather(createCondition({ conditionCode: 0, temperature: -25 }))).toBe(true);
  });
});

describe('convertTemperature', () => {
  it('converts C to F', () => {
    expect(convertTemperature(0, 'C', 'F')).toBe(32);
    expect(convertTemperature(100, 'C', 'F')).toBe(212);
  });

  it('converts F to C', () => {
    expect(convertTemperature(32, 'F', 'C')).toBe(0);
    expect(convertTemperature(212, 'F', 'C')).toBe(100);
  });

  it('returns same value when from equals to', () => {
    expect(convertTemperature(25, 'C', 'C')).toBe(25);
    expect(convertTemperature(77, 'F', 'F')).toBe(77);
  });
});

describe('formatTemperature', () => {
  it('formats Celsius', () => {
    expect(formatTemperature(20, 'C')).toBe('20°C');
  });

  it('formats Fahrenheit', () => {
    expect(formatTemperature(68, 'F')).toBe('68°F');
  });

  it('rounds to nearest integer', () => {
    expect(formatTemperature(20.7, 'C')).toBe('21°C');
  });
});

describe('getEmptyStateMessage', () => {
  it('returns null when no condition code is provided', () => {
    expect(getEmptyStateMessage(undefined)).toBeNull();
  });

  it('returns sunny message for clear sky', () => {
    const msg = getEmptyStateMessage(0);
    expect(msg).toContain('☀️');
    expect(msg).toContain('enjoy');
  });

  it('returns rainy message for rain codes', () => {
    const msg = getEmptyStateMessage(61);
    expect(msg).toContain('🌧️');
  });

  it('returns snowy message for snow codes', () => {
    const msg = getEmptyStateMessage(71);
    expect(msg).toContain('❄️');
  });

  it('returns storm message for thunderstorm codes', () => {
    const msg = getEmptyStateMessage(95);
    expect(msg).toContain('⛈️');
  });

  it('returns a default message for partly cloudy', () => {
    const msg = getEmptyStateMessage(2);
    expect(msg).toContain('⛅');
  });
});

describe('findForecastForDate', () => {
  const forecast: WeatherForecastDay[] = [
    { date: '2026-03-31', condition: createCondition() },
    { date: '2026-04-01', condition: createCondition({ conditionCode: 61 }) },
    { date: '2026-04-02', condition: createCondition({ conditionCode: 95 }) },
  ];

  it('finds forecast for matching date', () => {
    const result = findForecastForDate(forecast, '2026-04-01');
    expect(result).toBeDefined();
    expect(result!.condition.conditionCode).toBe(61);
  });

  it('returns undefined for non-matching date', () => {
    expect(findForecastForDate(forecast, '2026-04-10')).toBeUndefined();
  });
});

describe('getWeatherConflictMessage', () => {
  it('includes condition text and emoji', () => {
    const forecast: WeatherForecastDay = {
      date: '2026-04-01',
      condition: createCondition({ conditionCode: 95, conditionText: 'Thunderstorm' }),
    };
    const msg = getWeatherConflictMessage(forecast, '2026-04-01');
    expect(msg).toContain('Thunderstorm');
    expect(msg).toContain('⛈️');
    expect(msg).toContain('rescheduling');
  });
});
