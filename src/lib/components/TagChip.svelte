<script lang="ts">
  import { getTagColor } from '../utils/tags.js';
  import { t } from '../i18n/index.svelte.js';
  
  const { tag, onRemove }: { tag: string; onRemove?: () => void } = $props();
  
  const color = $derived(getTagColor(tag));
</script>

<span class="chip" style="background:{color.bg};color:{color.text}">
  {tag}
  {#if onRemove}
    <button class="remove-btn" onclick={onRemove} aria-label={t('aria.removeTag', { tag })}>×</button>
  {/if}
</span>

<style>
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.15rem 0.55rem;
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    font-weight: 500;
    line-height: var(--line-height-normal);
    transition: transform 0.15s ease;
  }
  .chip:hover {
    transform: scale(1.03);
  }
  .remove-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    font-size: 1rem;
    opacity: 0.6;
    color: inherit;
    transition: opacity 0.15s ease;
  }
  .remove-btn:hover { opacity: 1; }
  .remove-btn:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 1px;
    border-radius: var(--radius-full);
  }
</style>
