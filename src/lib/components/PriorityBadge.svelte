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
    padding: 0.125rem 0.5rem;
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wide);
    line-height: var(--line-height-normal);
  }
  .badge-high { background: var(--color-priority-high-bg); color: var(--color-priority-high); border: 1px solid var(--color-priority-high); }
  .badge-medium { background: var(--color-priority-medium-bg); color: var(--color-priority-medium); border: 1px solid var(--color-priority-medium); }
  .badge-low { background: var(--color-priority-low-bg); color: var(--color-priority-low); border: 1px solid var(--color-priority-low); }
</style>
