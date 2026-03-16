<script lang="ts">
  import { fade } from 'svelte/transition';
  
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
</script>

{#if show}
  <div class="confetti-container" aria-hidden="true" transition:fade={{ duration: 300 }}>
    {#each confetti as piece}
      <div
        class="confetti"
        style="left:{piece.left}%;animation-delay:{piece.delay}s;animation-duration:{piece.duration}s;background:{piece.color};transform:rotate({piece.rotation}deg)"
      ></div>
    {/each}
  </div>
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
    animation: fall linear forwards;
  }
  
  @keyframes fall {
    to {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }
</style>
