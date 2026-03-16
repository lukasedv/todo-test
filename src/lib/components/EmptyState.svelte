<script lang="ts">
  const { message }: { message: string } = $props();
</script>

<div class="empty-state" role="status" aria-live="polite">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="160" height="160" aria-hidden="true">
    <circle cx="100" cy="100" r="90" fill="var(--color-surface)" stroke="var(--color-border)" stroke-width="2"/>
    <rect x="60" y="70" width="80" height="12" rx="6" fill="var(--color-border)"/>
    <rect x="60" y="94" width="60" height="12" rx="6" fill="var(--color-border)"/>
    <rect x="60" y="118" width="40" height="12" rx="6" fill="var(--color-border)"/>
    <circle cx="50" cy="76" r="6" fill="var(--color-border)"/>
    <circle cx="50" cy="100" r="6" fill="var(--color-border)"/>
    <circle cx="50" cy="124" r="6" fill="var(--color-border)"/>
  </svg>
  <p class="message">{message}</p>
</div>

<style>
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    text-align: center;
    color: var(--color-text-muted);
  }
  .message {
    margin-top: 1rem;
    font-size: 1rem;
    max-width: 24rem;
  }
</style>
