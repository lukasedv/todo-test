<script lang="ts">
  import { fly } from 'svelte/transition';
  import { undoDelete, dismissToast } from '../stores/todos.svelte.js';
  import { t } from '../i18n/index.svelte.js';
  
  const { show }: { show: boolean } = $props();
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') dismissToast();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if show}
  <div
    class="toast"
    role="status"
    aria-live="polite"
    transition:fly={{ y: 80, duration: 300 }}
  >
    <div class="toast-content">
      <span class="toast-message">{t('toast.deleted')}</span>
      <button class="undo-btn" onclick={undoDelete}>{t('toast.undo')}</button>
      <button class="dismiss-btn" onclick={dismissToast} aria-label={t('toast.aria.dismiss')}>×</button>
    </div>
    <div class="toast-progress"></div>
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    bottom: var(--space-6);
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-text);
    color: var(--color-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    z-index: 1000;
    white-space: nowrap;
    overflow: hidden;
    min-width: 280px;
  }
  .toast-content {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
  }
  .toast-message {
    font-size: var(--font-size-sm);
    font-weight: 500;
  }
  .undo-btn {
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.25);
    color: inherit;
    padding: var(--space-1) var(--space-3);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: var(--font-size-sm);
    font-weight: 600;
    transition: background 0.15s ease, border-color 0.15s ease;
    margin-left: auto;
  }
  .undo-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.4);
  }
  .undo-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  .dismiss-btn {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 1.25rem;
    padding: 0;
    opacity: 0.5;
    transition: opacity 0.15s ease;
    line-height: 1;
  }
  .dismiss-btn:hover { opacity: 1; }
  .toast-progress {
    height: 3px;
    background: var(--color-accent);
    animation: toast-timer 5s linear forwards;
  }
  @keyframes toast-timer {
    from { width: 100%; }
    to { width: 0%; }
  }
  @media (prefers-reduced-motion: reduce) {
    .toast-progress {
      animation: none;
      width: 100%;
    }
  }
</style>
