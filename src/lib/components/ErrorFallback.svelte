<script lang="ts">
  import { clearAppStorage } from '../utils/storage.js';
  import { t } from '../i18n/index.svelte.js';

  let { error }: { error: Error } = $props();

  function reload() {
    window.location.reload();
  }

  function resetAppData() {
    if (window.confirm(t('error.confirmReset'))) {
      clearAppStorage();
      window.location.reload();
    }
  }
</script>

<div class="error-fallback" role="alert" aria-live="assertive">
  <div class="error-icon">⚠️</div>
  <h1 class="error-title">{t('error.title')}</h1>
  <p class="error-message">
    {t('error.message')}
  </p>
  <p class="error-detail">{error.message}</p>
  {#if import.meta.env.DEV && error.stack}
    <pre class="error-stack">{error.stack}</pre>
  {/if}
  <div class="error-actions">
    <button class="btn btn-primary" onclick={reload} aria-label={t('error.reload')}>
      {t('error.reload')}
    </button>
    <button class="btn btn-danger" onclick={resetAppData} aria-label={t('error.resetData')}>
      {t('error.resetData')}
    </button>
  </div>
</div>

<style>
  .error-fallback {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    text-align: center;
    background: var(--color-bg, #ffffff);
    color: var(--color-text, #1f2937);
  }

  :global(html.dark) .error-fallback {
    background: var(--color-bg, #1f2937);
    color: var(--color-text, #f9fafb);
  }

  :global(html.dark) .error-detail {
    background: var(--color-surface, #374151);
    color: var(--color-text-muted, #d1d5db);
  }

  :global(html.dark) .btn-primary {
    background: var(--color-accent, #60a5fa);
  }

  :global(html.dark) .btn-primary:hover {
    background: var(--color-accent-hover, #93bbfd);
  }

  :global(html.dark) .btn-danger {
    background: var(--color-priority-high, #f87171);
  }

  :global(html.dark) .btn-danger:hover {
    background: var(--color-danger-hover, #fca5a5);
  }

  .error-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .error-title {
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .error-message {
    margin: 0 0 1rem;
    max-width: 32rem;
    color: var(--color-text-muted, #6b7280);
    line-height: 1.5;
  }

  .error-detail {
    margin: 0 0 1.5rem;
    padding: 0.75rem 1rem;
    background: var(--color-surface, #f9fafb);
    border-radius: 0.5rem;
    font-family: monospace;
    font-size: 0.875rem;
    max-width: 32rem;
    word-break: break-word;
  }

  .error-stack {
    margin: 0 0 1.5rem;
    padding: 0.75rem 1rem;
    background: var(--color-surface, #f9fafb);
    border-radius: 0.5rem;
    font-family: monospace;
    font-size: 0.75rem;
    max-width: 48rem;
    text-align: left;
    white-space: pre-wrap;
    word-break: break-word;
    overflow-x: auto;
  }

  .error-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .btn {
    padding: 0.625rem 1.25rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    color: #ffffff;
  }

  .btn:focus-visible {
    outline: 2px solid var(--color-accent, #3b82f6);
    outline-offset: 2px;
  }

  .btn-primary {
    background: var(--color-accent, #3b82f6);
  }

  .btn-primary:hover {
    background: var(--color-accent-hover, #2563eb);
  }

  .btn-danger {
    background: var(--color-priority-high, #dc2626);
  }

  .btn-danger:hover {
    background: var(--color-danger-hover, #b91c1c);
  }
</style>
