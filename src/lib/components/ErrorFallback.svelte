<script lang="ts">
  import { clearAppStorage } from '../utils/storage.js';

  let { error }: { error: Error } = $props();

  function reload() {
    window.location.reload();
  }

  function resetAppData() {
    if (window.confirm('This will delete all your todos and settings. Are you sure?')) {
      clearAppStorage();
      window.location.reload();
    }
  }
</script>

<div class="error-fallback" role="alert" aria-live="assertive">
  <div class="error-icon">⚠️</div>
  <h1 class="error-title">Something went wrong</h1>
  <p class="error-message">
    The app encountered an unexpected error and couldn't load properly. Try refreshing the page, or reset your app data if the problem persists.
  </p>
  <p class="error-detail">{error.message}</p>
  <div class="error-actions">
    <button class="btn btn-primary" onclick={reload} aria-label="Reload App">
      Reload App
    </button>
    <button class="btn btn-danger" onclick={resetAppData} aria-label="Reset App Data">
      Reset App Data
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

  @media (prefers-color-scheme: dark) {
    .error-fallback {
      background: #1f2937;
      color: #f9fafb;
    }

    .error-detail {
      background: #374151;
      color: #d1d5db;
    }

    .btn-primary {
      background: #60a5fa;
    }

    .btn-primary:hover {
      background: #93bbfd;
    }

    .btn-danger {
      background: #f87171;
    }

    .btn-danger:hover {
      background: #fca5a5;
    }
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
    background: #2563eb;
  }

  .btn-danger {
    background: var(--color-priority-high, #dc2626);
  }

  .btn-danger:hover {
    background: #b91c1c;
  }
</style>
