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
    padding: 0.15rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
  }
  .remove-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    line-height: 1;
    font-size: 1rem;
    opacity: 0.7;
    color: inherit;
  }
  .remove-btn:hover { opacity: 1; }
</style>
