<script lang="ts">
  const { theme, onToggle }: { theme: 'light' | 'dark'; onToggle: () => void } = $props();
</script>

<button
  class="theme-toggle"
  onclick={onToggle}
  aria-label="Toggle {theme === 'light' ? 'dark' : 'light'} mode"
  title="Toggle theme"
>
  {#if theme === 'light'}
    🌙
  {:else}
    ☀️
  {/if}
</button>

<style>
  .theme-toggle {
    background: none;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: 1.25rem;
    padding: 0.4rem 0.6rem;
    transition: background 0.2s;
  }
  .theme-toggle:hover { background: var(--color-surface); }
</style>
