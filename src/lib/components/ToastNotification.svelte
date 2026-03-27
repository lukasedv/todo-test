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
    transition:fly={{ y: 80, duration: 250 }}
  >
    <span>{t('toast.deleted')}</span>
    <button class="undo-btn" onclick={undoDelete}>{t('toast.undo')}</button>
    <button class="dismiss-btn" onclick={dismissToast} aria-label={t('toast.aria.dismiss')}>×</button>
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-text);
    color: var(--color-bg);
    padding: 0.75rem 1.25rem;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    gap: 1rem;
    box-shadow: var(--shadow-md);
    z-index: 1000;
    white-space: nowrap;
  }
  .undo-btn {
    background: none;
    border: 1px solid currentColor;
    color: inherit;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 600;
  }
  .undo-btn:hover { background: rgba(255,255,255,0.1); }
  .dismiss-btn {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 1.25rem;
    padding: 0;
    opacity: 0.7;
  }
  .dismiss-btn:hover { opacity: 1; }
</style>
