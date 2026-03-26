<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import type { Suggestion, Todo } from '../types.js';
  import SuggestionCard from './SuggestionCard.svelte';
  import {
    getPendingSuggestions,
    getScanning,
    getConnected,
    acceptSuggestion,
    dismissSuggestion,
    dismissAllSuggestions,
    addSuggestions,
    setScanning,
    setLastSyncTime,
    getConfig,
    getDismissedIdSet,
    getExistingMessageIds,
  } from '../stores/m365Store.svelte.js';
  import { addTodo } from '../stores/todos.svelte.js';
  import { scanEmails } from '../services/suggestionService.js';

  const { onEditSuggestion, onError }: {
    onEditSuggestion?: (suggestion: Suggestion) => void;
    onError?: (msg: string) => void;
  } = $props();

  const connected = $derived(getConnected());
  const pending = $derived(getPendingSuggestions());
  const scanning = $derived(getScanning());
  const pendingCount = $derived(pending.length);

  function handleAccept(id: string) {
    const suggestion = pending.find((s) => s.id === id);
    if (!suggestion) return;

    const todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'order'> = {
      title: suggestion.suggestedTitle,
      description: suggestion.suggestedDescription,
      completed: false,
      priority: suggestion.suggestedPriority,
      tags: suggestion.suggestedTags,
      dueDate: suggestion.suggestedDueDate,
      source: {
        type: suggestion.sourceType,
        messageId: suggestion.messageId,
        sourceUrl: suggestion.sourceUrl,
        sender: suggestion.senderName,
        subject: suggestion.emailSubject,
      },
    };

    addTodo(todo);
    acceptSuggestion(id);
  }

  function handleDismiss(id: string) {
    dismissSuggestion(id);
  }

  function handleEditAccept(suggestion: Suggestion) {
    onEditSuggestion?.(suggestion);
  }

  async function handleSync() {
    setScanning(true);
    try {
      const config = getConfig();
      const dismissed = getDismissedIdSet();
      const existing = getExistingMessageIds();
      const newSuggestions = await scanEmails(config, dismissed, existing);
      addSuggestions(newSuggestions);
      setLastSyncTime(new Date().toISOString());
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to scan emails';
      onError?.(msg);
    } finally {
      setScanning(false);
    }
  }
</script>

{#if connected}
  <div class="suggestion-panel" role="region" aria-label="Email suggestions">
    <div class="panel-header">
      <h2 class="panel-title">
        📧 Suggestions
        {#if pendingCount > 0}
          <span class="badge" aria-label="{pendingCount} pending suggestions">{pendingCount}</span>
        {/if}
      </h2>
      <div class="panel-actions">
        {#if pendingCount >= 3}
          <button class="btn-dismiss-all" onclick={dismissAllSuggestions}>
            Dismiss all
          </button>
        {/if}
        <button
          class="sync-btn"
          onclick={handleSync}
          disabled={scanning}
          aria-label="Sync emails now"
        >
          {#if scanning}
            <span class="spinner" aria-hidden="true"></span>
            Scanning...
          {:else}
            🔄 Sync now
          {/if}
        </button>
      </div>
    </div>

    {#if pendingCount === 0}
      <div class="empty-state" transition:fade={{ duration: 150 }}>
        <p>No suggestions — you're all caught up! 🎉</p>
      </div>
    {:else}
      <div class="suggestion-list" role="list" aria-label="Pending suggestions">
        {#each pending as suggestion (suggestion.id)}
          <SuggestionCard
            {suggestion}
            onAccept={handleAccept}
            onDismiss={handleDismiss}
            onEditAccept={handleEditAccept}
          />
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .suggestion-panel {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 1rem;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .panel-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.25rem;
    height: 1.25rem;
    padding: 0 0.375rem;
    background: var(--color-accent);
    color: #fff;
    border-radius: 9999px;
    font-size: 0.7rem;
    font-weight: 700;
  }

  .panel-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .sync-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.75rem;
    background: var(--color-accent);
    color: #fff;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 600;
    transition: opacity 0.15s;
  }
  .sync-btn:hover { opacity: 0.9; }
  .sync-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .btn-dismiss-all {
    padding: 0.35rem 0.75rem;
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-muted);
    cursor: pointer;
    font-size: 0.75rem;
    transition: background 0.15s;
  }
  .btn-dismiss-all:hover { background: var(--color-surface); }

  .spinner {
    display: inline-block;
    width: 0.75rem;
    height: 0.75rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .suggestion-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .empty-state {
    text-align: center;
    padding: 1.5rem 1rem;
    color: var(--color-text-muted);
    font-size: 0.9rem;
  }
  .empty-state p { margin: 0; }
</style>
