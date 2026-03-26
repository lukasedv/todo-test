import type { Translations, TranslationKey, Locale } from './types.js';
import { en } from './en.js';
import { fi } from './fi.js';

const STORAGE_KEY = 'todo-app-locale';
const SUPPORTED_LOCALES: Locale[] = ['en', 'fi'];

const translations: Record<Locale, Translations> = { en, fi };

function detectBrowserLocale(): Locale {
  try {
    const languages = navigator.languages ?? [navigator.language];
    for (const lang of languages) {
      const prefix = lang.split('-')[0].toLowerCase();
      if (SUPPORTED_LOCALES.includes(prefix as Locale)) {
        return prefix as Locale;
      }
    }
  } catch {
    // Ignore errors in environments without navigator
  }
  return 'en';
}

function loadLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_LOCALES.includes(stored as Locale)) {
      return stored as Locale;
    }
  } catch {
    // Ignore localStorage errors (e.g. private browsing, quota exceeded)
  }
  return detectBrowserLocale();
}

function saveLocale(locale: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Ignore localStorage errors
  }
}

let currentLocale = $state<Locale>(loadLocale());

$effect.root(() => {
  $effect(() => {
    saveLocale(currentLocale);
    try {
      document.documentElement.lang = currentLocale === 'fi' ? 'fi' : 'en';
    } catch {
      // Ignore DOM errors in non-browser environments
    }
  });
});

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

export function t(key: TranslationKey, params?: Record<string, string>): string {
  let value = translations[currentLocale][key] ?? translations.en[key] ?? key;
  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      value = value.replace(`{${paramKey}}`, paramValue);
    }
  }
  return value;
}

export function getDateLocale(): string {
  return currentLocale === 'fi' ? 'fi-FI' : 'en-US';
}

export { SUPPORTED_LOCALES };
export type { Locale, TranslationKey };
