<script lang="ts">
  import type { Priority } from '../types.js';
  import { t } from '../i18n/index.svelte.js';
  
  const { priority }: { priority: Priority } = $props();
  
  const labelKeys: Record<Priority, 'priority.high' | 'priority.medium' | 'priority.low'> = {
    high: 'priority.high',
    medium: 'priority.medium',
    low: 'priority.low',
  };

  const label = $derived(t(labelKeys[priority]));
</script>

<span class="badge badge-{priority}" aria-label="{t('todo.label.priority')}: {label}">
  {label}
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
