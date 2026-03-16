export type ThemePreference = 'light' | 'dark' | 'system';
export type EffectiveTheme = 'light' | 'dark';

function getStoredTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
    return 'system';
  } catch {
    return 'system';
  }
}

function getOsPrefersDark(): boolean {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
}

function resolveTheme(preference: ThemePreference, osPrefersDark: boolean): EffectiveTheme {
  if (preference !== 'system') return preference;
  return osPrefersDark ? 'dark' : 'light';
}

let preference = $state<ThemePreference>(getStoredTheme());
let osPrefersDark = $state<boolean>(getOsPrefersDark());
const effective = $derived<EffectiveTheme>(resolveTheme(preference, osPrefersDark));

$effect.root(() => {
  $effect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(effective);
  });

  $effect(() => {
    try {
      if (preference === 'system') {
        localStorage.removeItem('theme');
      } else {
        localStorage.setItem('theme', preference);
      }
    } catch {
      // Ignore localStorage errors (e.g. private browsing, quota exceeded)
    }
  });

  $effect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      osPrefersDark = e.matches;
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  });
});

export function getThemePreference(): ThemePreference {
  return preference;
}

export function getEffectiveTheme(): EffectiveTheme {
  return effective;
}

export function setThemePreference(theme: ThemePreference): void {
  preference = theme;
}

export function toggleTheme(): void {
  const current = effective;
  preference = current === 'light' ? 'dark' : 'light';
}

export function resetToSystem(): void {
  preference = 'system';
}
