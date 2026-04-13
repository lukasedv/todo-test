<script lang="ts">
  import AddTodo from './lib/components/AddTodo.svelte';
  import TodoList from './lib/components/TodoList.svelte';
  import FilterBar from './lib/components/FilterBar.svelte';
  import SearchBar from './lib/components/SearchBar.svelte';
  import ToastNotification from './lib/components/ToastNotification.svelte';
  import ThemeToggle from './lib/components/ThemeToggle.svelte';
  import LanguageSwitcher from './lib/components/LanguageSwitcher.svelte';
  import Confetti from './lib/components/Confetti.svelte';
  import AboutModal from './lib/components/AboutModal.svelte';
  import SuggestionPanel from './lib/components/SuggestionPanel.svelte';
  import IntegrationSettings from './lib/components/IntegrationSettings.svelte';
  import WeatherWidget from './lib/components/WeatherWidget.svelte';
  import { getTodos, getDeletedTodo } from './lib/stores/todos.svelte.js';
  import { getConnected } from './lib/stores/m365Store.svelte.js';
  import {
    getThemePreference,
    getEffectiveTheme,
    toggleTheme,
    resetToSystem,
  } from './lib/stores/theme.svelte.js';
  import type { Suggestion } from './lib/types.js';
  import { t } from './lib/i18n/index.svelte.js';

  const themePreference = $derived(getThemePreference());
  const effectiveTheme = $derived(getEffectiveTheme());

  let showAbout = $state(false);
  let showSettings = $state(false);
  let aboutTriggerRef: HTMLButtonElement | undefined = $state();

  const todos = $derived(getTodos());
  const deletedTodo = $derived(getDeletedTodo());
  const showToast = $derived(deletedTodo !== null);
  const m365Connected = $derived(getConnected());

  const allCompleted = $derived(todos.length > 0 && todos.every(t => t.completed));
  let previousAllCompleted = $state(false);
  let showConfetti = $state(false);

  $effect(() => {
    if (allCompleted && !previousAllCompleted) {
      showConfetti = true;
      setTimeout(() => { showConfetti = false; }, 3000);
    }
    previousAllCompleted = allCompleted;
  });

  $effect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === '?') {
        e.preventDefault();
        showAbout = true;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  function closeAbout() {
    showAbout = false;
    aboutTriggerRef?.focus();
  }

  function handleEditSuggestion(_suggestion: Suggestion) {
    // Edit & Accept pre-fills the AddTodo form — full implementation in a future iteration
  }

  function handleIntegrationError(msg: string) {
    // Errors shown via component-level UI for now
  }
</script>

<div class="app">
  <header class="header">
    <div class="header-content">
      <h1 class="title">{t('app.title')}</h1>
      <div class="header-actions">
        <WeatherWidget />
        <button
          class="about-btn"
          onclick={() => { showSettings = !showSettings; }}
          aria-label="Integration settings"
          title="Integration settings"
        >⚙</button>
        <button
          class="about-btn"
          onclick={() => { showAbout = true; }}
          aria-label={t('aria.about')}
          bind:this={aboutTriggerRef}
        >ⓘ</button>
        <LanguageSwitcher />
        <ThemeToggle {themePreference} {effectiveTheme} onToggle={toggleTheme} onResetToSystem={resetToSystem} />
      </div>
    </div>
  </header>
  
  <main class="main">
    <div class="container">
      {#if showSettings}
        <IntegrationSettings onError={handleIntegrationError} />
      {/if}
      
      <SuggestionPanel onEditSuggestion={handleEditSuggestion} onError={handleIntegrationError} />
      
      <AddTodo />
      
      <div class="controls">
        <SearchBar />
        <FilterBar />
      </div>
      
      <TodoList />
    </div>
  </main>
  
  <ToastNotification show={showToast} />
  <Confetti show={showConfetti} />
  <AboutModal isOpen={showAbout} onClose={closeAbout} />
</div>

<style>
  /* ===== DESIGN TOKENS ===== */
  :global(:root),
  :global(html.light) {
    /* Primary & accent */
    --color-primary: #6366f1;
    --color-accent: #6366f1;
    --color-accent-hover: #4f46e5;
    --color-accent-soft: rgba(99, 102, 241, 0.1);

    /* Surfaces */
    --color-bg: #f8fafc;
    --color-surface: #ffffff;
    --color-card: #ffffff;
    --color-border: #e2e8f0;
    --color-border-hover: #cbd5e1;

    /* Text */
    --color-text: #0f172a;
    --color-text-secondary: #334155;
    --color-text-muted: #64748b;

    /* Semantic */
    --color-success: #10b981;
    --color-warning: #f59e0b;
    --color-error: #ef4444;
    --color-info: #3b82f6;

    /* Priority */
    --color-priority-high: #ef4444;
    --color-priority-medium: #f59e0b;
    --color-priority-low: #10b981;
    --color-priority-high-bg: #fef2f2;
    --color-priority-medium-bg: #fffbeb;
    --color-priority-low-bg: #ecfdf5;

    /* Danger */
    --color-danger-hover-bg: #fef2f2;
    --color-danger-hover: #dc2626;

    /* Spacing scale (4px base) */
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-5: 1.25rem;
    --space-6: 1.5rem;
    --space-8: 2rem;
    --space-10: 2.5rem;
    --space-12: 3rem;

    /* Border-radius scale */
    --radius-sm: 0.375rem;
    --radius-md: 0.625rem;
    --radius-lg: 0.875rem;
    --radius-xl: 1rem;
    --radius-full: 9999px;

    /* Shadow scale */
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.04);

    /* Typography */
    --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.8125rem;
    --font-size-base: 0.9375rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.375rem;
    --font-size-2xl: 1.75rem;
    --line-height-tight: 1.25;
    --line-height-normal: 1.5;
    --line-height-relaxed: 1.625;
    --letter-spacing-tight: -0.01em;
    --letter-spacing-normal: 0;
    --letter-spacing-wide: 0.04em;
  }

  :global(html.dark) {
    --color-primary: #818cf8;
    --color-accent: #818cf8;
    --color-accent-hover: #a5b4fc;
    --color-accent-soft: rgba(129, 140, 248, 0.12);

    --color-bg: #0f172a;
    --color-surface: #1e293b;
    --color-card: #1e293b;
    --color-border: #334155;
    --color-border-hover: #475569;

    --color-text: #f1f5f9;
    --color-text-secondary: #cbd5e1;
    --color-text-muted: #94a3b8;

    --color-success: #34d399;
    --color-warning: #fbbf24;
    --color-error: #f87171;
    --color-info: #60a5fa;

    --color-priority-high: #f87171;
    --color-priority-medium: #fbbf24;
    --color-priority-low: #34d399;
    --color-priority-high-bg: rgba(248, 113, 113, 0.15);
    --color-priority-medium-bg: rgba(251, 191, 36, 0.12);
    --color-priority-low-bg: rgba(52, 211, 153, 0.12);

    --color-danger-hover-bg: rgba(248, 113, 113, 0.15);
    --color-danger-hover: #fca5a5;

    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.2);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.25), 0 2px 4px -2px rgb(0 0 0 / 0.15);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.15);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.35), 0 8px 10px -6px rgb(0 0 0 / 0.15);
  }

  :global(*) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    font-family: var(--font-family);
    font-size: var(--font-size-base);
    line-height: var(--line-height-normal);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: var(--color-bg);
    color: var(--color-text);
    transition: background 0.25s ease, color 0.25s ease;
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .header {
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    padding: var(--space-3) 0;
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(12px);
    background: color-mix(in srgb, var(--color-surface) 85%, transparent);
  }

  .header-content {
    max-width: 48rem;
    margin: 0 auto;
    padding: 0 var(--space-4);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .about-btn {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: var(--color-text-muted);
    padding: var(--space-2);
    border-radius: var(--radius-md);
    line-height: 1;
    min-width: 44px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s ease, background 0.15s ease, transform 0.15s ease;
  }

  .about-btn:hover {
    color: var(--color-text);
    background: var(--color-accent-soft);
    transform: scale(1.05);
  }

  .about-btn:active {
    transform: scale(0.95);
  }

  .about-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .title {
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: 800;
    letter-spacing: var(--letter-spacing-tight);
    background: linear-gradient(135deg, var(--color-accent) 0%, #a78bfa 50%, #f472b6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .main {
    flex: 1;
    padding: var(--space-8) var(--space-4);
  }

  .container {
    max-width: 48rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .controls {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  @media (min-width: 640px) {
    .controls {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  @media (max-width: 640px) {
    .main {
      padding: var(--space-4) var(--space-3);
    }
    .title {
      font-size: var(--font-size-lg);
    }
  }
</style>

