<script lang="ts">
  import type { Priority } from '../types.js';
  
  const { priority }: { priority: Priority } = $props();
  
  const labels: Record<Priority, string> = { high: 'High', medium: 'Medium', low: 'Low' };
</script>

<span class="badge badge-{priority}" aria-label="Priority: {labels[priority]}">
  {labels[priority]}
</span>

<style>
  .badge {
    display: inline-block;
    padding: 0.15rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .badge-high { background: var(--color-priority-high-bg); color: var(--color-priority-high); border: 1px solid var(--color-priority-high); }
  .badge-medium { background: var(--color-priority-medium-bg); color: var(--color-priority-medium); border: 1px solid var(--color-priority-medium); }
  .badge-low { background: var(--color-priority-low-bg); color: var(--color-priority-low); border: 1px solid var(--color-priority-low); }
</style>
