<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { t } from '../i18n/index.svelte.js';

  const { message, weatherMessage, showCta = false }: { message: string; weatherMessage?: string | null; showCta?: boolean } = $props();
</script>

<div class="empty-state" role="status" aria-live="polite" in:fly={{ y: 20, duration: 300 }} out:fade={{ duration: 150 }}>
  <div class="illustration">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="160" height="160" aria-hidden="true">
      <circle cx="100" cy="100" r="90" fill="var(--color-surface)" stroke="var(--color-border)" stroke-width="2"/>
      <rect x="60" y="65" width="80" height="12" rx="6" fill="var(--color-border)"/>
      <rect x="60" y="89" width="60" height="12" rx="6" fill="var(--color-border)" opacity="0.7"/>
      <rect x="60" y="113" width="40" height="12" rx="6" fill="var(--color-border)" opacity="0.4"/>
      <circle cx="48" cy="71" r="6" fill="none" stroke="var(--color-border)" stroke-width="2"/>
      <circle cx="48" cy="95" r="6" fill="none" stroke="var(--color-border)" stroke-width="2"/>
      <circle cx="48" cy="119" r="6" fill="none" stroke="var(--color-border)" stroke-width="2"/>
      <polyline points="44,71 47,74 52,68" fill="none" stroke="var(--color-accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>
    </svg>
  </div>
  <p class="message">{weatherMessage ?? message}</p>
  {#if showCta}
    <p class="cta-hint">{t('empty.ctaHint')}</p>
  {/if}
</div>

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-12) var(--space-4);
    text-align: center;
    color: var(--color-text-muted);
  }
  .illustration {
    opacity: 0.8;
    transition: opacity 0.2s ease;
  }
  .empty-state:hover .illustration {
    opacity: 1;
  }
  .message {
    margin-top: var(--space-4);
    font-size: var(--font-size-lg);
    font-weight: 500;
    max-width: 24rem;
    line-height: var(--line-height-relaxed);
  }
  .cta-hint {
    margin-top: var(--space-2);
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    opacity: 0.7;
  }
</style>
