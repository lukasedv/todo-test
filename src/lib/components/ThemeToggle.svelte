<script lang="ts">
  import type { ThemePreference, EffectiveTheme } from '../stores/theme.svelte.js';

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
    effectiveTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
  );

  const isSystemMode = $derived(themePreference === 'system');
</script>

<div class="theme-toggle-wrapper">
  <button
    class="theme-toggle"
    onclick={onToggle}
    aria-label={ariaLabel}
    title={isSystemMode ? 'Using system preference' : ariaLabel}
  >
    <span class="icon" class:spin={true}>
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
      aria-label="Reset to system theme preference"
      title="Reset to system preference"
    >
      Auto
    </button>
  {/if}
</div>

<style>
  .theme-toggle-wrapper {
    display: flex;
    align-items: center;
    gap: 0.375rem;
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
    padding: 0.5rem;
    transition: background-color 0.2s ease, border-color 0.2s ease;
  }

  .theme-toggle:hover {
    background: var(--color-surface);
  }

  .theme-toggle:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    animation: icon-enter 0.25s ease;
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
    padding: 0.25rem 0.375rem;
    border-radius: var(--radius-md);
    transition: color 0.2s ease, background-color 0.2s ease;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.025em;
  }

  .reset-btn:hover {
    color: var(--color-accent);
    background: var(--color-surface);
  }

  .reset-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .icon {
      animation: none;
    }
  }
</style>
