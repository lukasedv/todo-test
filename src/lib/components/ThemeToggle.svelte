<script lang="ts">
  import type { ThemePreference, EffectiveTheme } from '../stores/theme.svelte.js';
  import { t } from '../i18n/index.svelte.js';

  const {
    themePreference,
    effectiveTheme,
    onToggle,
    onResetToSystem,
  }: {
    themePreference: ThemePreference;
    effectiveTheme: EffectiveTheme;
    onToggle: () => void;
    onResetToSystem: () => void;
  } = $props();

  const ariaLabel = $derived(
    effectiveTheme === 'light' ? t('theme.switchToDark') : t('theme.switchToLight')
  );

  const isSystemMode = $derived(themePreference === 'system');
</script>

<div class="theme-toggle-wrapper">
  <button
    class="theme-toggle"
    onclick={onToggle}
    aria-label={ariaLabel}
    title={isSystemMode ? t('theme.usingSystem') : ariaLabel}
  >
    <span class="icon">
      {#if effectiveTheme === 'light'}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      {/if}
    </span>
  </button>

  {#if !isSystemMode}
    <button
      class="reset-btn"
      onclick={onResetToSystem}
      aria-label={t('theme.resetToSystem')}
      title={t('theme.resetToSystem')}
    >
      {t('theme.auto')}
    </button>
  {/if}
</div>

<style>
  .theme-toggle-wrapper {
    display: flex;
    align-items: center;
    gap: var(--space-1);
  }

  .theme-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 44px;
    min-height: 44px;
    background: none;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    color: var(--color-text);
    padding: var(--space-2);
    transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
  }

  .theme-toggle:hover {
    background: var(--color-accent-soft);
    border-color: var(--color-accent);
    transform: scale(1.05);
  }

  .theme-toggle:active {
    transform: scale(0.95);
  }

  .theme-toggle:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    animation: icon-enter 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes icon-enter {
    from {
      opacity: 0;
      transform: rotate(-90deg) scale(0.5);
    }
    to {
      opacity: 1;
      transform: rotate(0deg) scale(1);
    }
  }

  .reset-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.7rem;
    color: var(--color-text-muted);
    padding: var(--space-1) var(--space-1);
    border-radius: var(--radius-sm);
    transition: color 0.2s ease, background-color 0.2s ease;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: var(--letter-spacing-wide);
  }

  .reset-btn:hover {
    color: var(--color-accent);
    background: var(--color-accent-soft);
  }

  .reset-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .icon {
      animation: none;
    }
    .theme-toggle:hover, .theme-toggle:active {
      transform: none;
    }
  }
</style>
