<script lang="ts">
  import { fade } from 'svelte/transition';
  import { t } from '../i18n/index.svelte.js';
  
  const { show }: { show: boolean } = $props();
  
  const confettiCount = 50;
  const confetti = Array.from({ length: confettiCount }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2 + Math.random(),
    color: ['#fbbf24', '#f87171', '#60a5fa', '#34d399', '#a78bfa', '#fb923c'][Math.floor(Math.random() * 6)],
    rotation: Math.random() * 360,
  }));

  let prefersReducedMotion = $state(false);
  $effect(() => {
    prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
</script>

{#if show}
  {#if prefersReducedMotion}
    <div class="congrats-message" role="status" transition:fade={{ duration: 300 }}>
      <span class="congrats-icon">🎉</span>
      <span class="congrats-text">{t('confetti.allDone')}</span>
    </div>
  {:else}
    <div class="confetti-container" aria-hidden="true" transition:fade={{ duration: 300 }}>
      {#each confetti as piece}
        <div
          class="confetti"
          style="left:{piece.left}%;animation-delay:{piece.delay}s;animation-duration:{piece.duration}s;background:{piece.color};transform:rotate({piece.rotation}deg)"
        ></div>
      {/each}
    </div>
  {/if}
{/if}

<style>
  .confetti-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
  }
  
  .confetti {
    position: absolute;
    width: 10px;
    height: 10px;
    top: -20px;
    border-radius: 2px;
    animation: fall linear forwards;
  }
  
  @keyframes fall {
    to {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }

  .congrats-message {
    position: fixed;
    top: var(--space-8);
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-card);
    color: var(--color-text);
    padding: var(--space-3) var(--space-6);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    border: 1px solid var(--color-border);
    pointer-events: none;
  }
  .congrats-icon {
    font-size: 1.5rem;
  }
  .congrats-text {
    font-weight: 600;
    font-size: var(--font-size-base);
  }
</style>
