<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import type { Suggestion } from '../types.js';

  const {
    suggestion,
    onAccept,
    onDismiss,
    onEditAccept,
  }: {
    suggestion: Suggestion;
    onAccept: (id: string) => void;
    onDismiss: (id: string) => void;
    onEditAccept: (suggestion: Suggestion) => void;
  } = $props();

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  }

  function highlightAction(text: string, phrase: string): { before: string; match: string; after: string } {
    if (!phrase) return { before: text, match: '', after: '' };
    const idx = text.toLowerCase().indexOf(phrase.toLowerCase());
    if (idx === -1) return { before: text, match: '', after: '' };
    return {
      before: text.slice(0, idx),
      match: text.slice(idx, idx + phrase.length),
      after: text.slice(idx + phrase.length),
    };
  }
</script>

<div
  class="suggestion-card"
  role="article"
  aria-label="Suggested todo: {suggestion.suggestedTitle}"
  transition:fly={{ y: 20, duration: 200 }}
>
  <div class="card-header">
    <span class="sender">{suggestion.senderName}</span>
    <span class="date">{formatDate(suggestion.emailDate)}</span>
  </div>
  <div class="card-subject">{suggestion.emailSubject}</div>
  <div class="card-title">{suggestion.suggestedTitle}</div>
  <p class="card-snippet">
    {#if suggestion.actionPhrase}
      {@const parts = highlightAction(suggestion.snippet, suggestion.actionPhrase)}
      {parts.before}<strong class="action-highlight">{parts.match}</strong>{parts.after}
    {:else}
      {suggestion.snippet}
    {/if}
  </p>
  {#if suggestion.suggestedDueDate}
    <span class="card-due">📅 Due: {formatDate(suggestion.suggestedDueDate)}</span>
  {/if}
  <div class="card-actions">
    <button class="btn-accept" onclick={() => onAccept(suggestion.id)} aria-label="Accept suggestion">
      ✓ Accept
    </button>
    <button class="btn-edit" onclick={() => onEditAccept(suggestion)} aria-label="Edit and accept suggestion">
      ✎ Edit & Accept
    </button>
    <button class="btn-dismiss" onclick={() => onDismiss(suggestion.id)} aria-label="Dismiss suggestion">
      ✕ Dismiss
    </button>
  </div>
</div>

<style>
  .suggestion-card {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 0.875rem;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    transition: box-shadow 0.15s;
  }
  .suggestion-card:hover { box-shadow: var(--shadow-md); }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
  }
  .sender { font-weight: 600; color: var(--color-text); }
  .date { color: var(--color-text-muted); }

  .card-subject {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .card-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .card-snippet {
    font-size: 0.8rem;
    color: var(--color-text-muted);
    margin: 0;
    line-height: 1.4;
  }
  .card-snippet .action-highlight {
    color: var(--color-accent);
    font-weight: 600;
  }

  .card-due {
    font-size: 0.75rem;
    color: var(--color-priority-medium);
    font-weight: 500;
  }

  .card-actions {
    display: flex;
    gap: 0.4rem;
    margin-top: 0.25rem;
    flex-wrap: wrap;
  }

  .btn-accept {
    padding: 0.3rem 0.75rem;
    background: var(--color-accent);
    color: #fff;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 600;
    transition: opacity 0.15s;
  }
  .btn-accept:hover { opacity: 0.9; }

  .btn-edit {
    padding: 0.3rem 0.75rem;
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text);
    cursor: pointer;
    font-size: 0.75rem;
    transition: background 0.15s;
  }
  .btn-edit:hover { background: var(--color-surface); }

  .btn-dismiss {
    padding: 0.3rem 0.75rem;
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    cursor: pointer;
    font-size: 0.75rem;
    transition: background 0.15s, color 0.15s;
  }
  .btn-dismiss:hover {
    background: var(--color-danger-hover-bg);
    color: var(--color-priority-high);
    border-color: var(--color-priority-high);
  }
</style>
