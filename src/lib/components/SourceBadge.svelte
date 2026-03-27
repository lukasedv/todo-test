<script lang="ts">
  const { source }: { source?: { type: string; sourceUrl: string } } = $props();
</script>

{#if source?.type === 'email'}
  <a
    class="source-badge"
    href={source.sourceUrl}
    target="_blank"
    rel="noopener noreferrer"
    title="Open in Outlook"
    aria-label="Open source email in Outlook"
  >
    <svg class="outlook-icon" viewBox="0 0 21 21" width="14" height="14" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
      <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
      <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
    </svg>
  </a>
{:else if source}
  <span class="source-badge source-badge--static" title="From Microsoft 365" aria-label="Auto-generated from Microsoft 365">
    <svg class="outlook-icon" viewBox="0 0 21 21" width="14" height="14" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
      <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
      <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
    </svg>
  </span>
{/if}

<style>
  .source-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 0.25rem;
    background: rgba(0, 164, 239, 0.1);
    text-decoration: none;
    transition: background 0.15s;
    flex-shrink: 0;
  }
  .source-badge:hover {
    background: rgba(0, 164, 239, 0.2);
  }
  .source-badge:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 1px;
  }
  .source-badge--static {
    cursor: default;
  }
  .outlook-icon {
    flex-shrink: 0;
  }
</style>
