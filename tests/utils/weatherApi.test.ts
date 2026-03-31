import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchWeatherData, searchCity } from '$lib/utils/weatherApi.js';

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('fetchWeatherData', () => {
  it('fetches and parses weather data correctly', async () => {
    const mockResponse = {
      current: {
        temperature_2m: 22.5,
        weather_code: 2,
      },
      daily: {
        time: ['2026-03-31', '2026-04-01', '2026-04-02', '2026-04-03', '2026-04-04'],
        weather_code: [2, 61, 0, 3, 95],
        temperature_2m_max: [25, 18, 28, 22, 15],
        temperature_2m_min: [15, 12, 18, 14, 8],
      },
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    }));

    const result = await fetchWeatherData(60.17, 24.94, 'C');

    expect(result.current.temperature).toBe(23); // rounded
    expect(result.current.conditionCode).toBe(2);
    expect(result.current.conditionText).toBe('Partly cloudy');
    expect(result.current.temperatureUnit).toBe('C');
    expect(result.forecast).toHaveLength(5);
    expect(result.forecast[0].date).toBe('2026-03-31');
    expect(result.forecast[0].condition.high).toBe(25);
    expect(result.forecast[0].condition.low).toBe(15);
    expect(result.forecast[1].condition.conditionCode).toBe(61);
    expect(result.fetchedAt).toBeDefined();
  });

  it('throws on API error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }));

    await expect(fetchWeatherData(60.17, 24.94, 'C')).rejects.toThrow('Weather API error: 500');
  });

  it('uses fahrenheit when unit is F', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        current: { temperature_2m: 72, weather_code: 0 },
        daily: {
          time: ['2026-03-31'],
          weather_code: [0],
          temperature_2m_max: [80],
          temperature_2m_min: [60],
        },
      }),
    }));

    const result = await fetchWeatherData(40.71, -74.01, 'F');
    expect(result.current.temperatureUnit).toBe('F');

    const fetchCall = (fetch as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(fetchCall).toContain('temperature_unit=fahrenheit');
  });

  it('passes abort signal to fetch', async () => {
    const controller = new AbortController();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        current: { temperature_2m: 20, weather_code: 0 },
        daily: { time: [], weather_code: [], temperature_2m_max: [], temperature_2m_min: [] },
      }),
    }));

    await fetchWeatherData(0, 0, 'C', controller.signal);
    expect((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1]).toEqual({ signal: controller.signal });
  });
});

describe('searchCity', () => {
  it('returns empty array for short queries', async () => {
    const result = await searchCity('ab');
    expect(result).toEqual([]);
  });

  it('returns geocoding results', async () => {
    const mockResults = {
      results: [
        {
          id: 1,
          name: 'Helsinki',
          latitude: 60.17,
          longitude: 24.94,
          country: 'Finland',
          admin1: 'Uusimaa',
        },
      ],
    };

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResults),
    }));

    const result = await searchCity('Helsinki');
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Helsinki');
    expect(result[0].latitude).toBe(60.17);
    expect(result[0].country).toBe('Finland');
  });

  it('returns empty array when no results', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    }));

    const result = await searchCity('NonexistentCity');
    expect(result).toEqual([]);
  });

  it('throws on API error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    }));

    await expect(searchCity('Helsinki')).rejects.toThrow('Geocoding API error: 503');
  });
});
