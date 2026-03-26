<script lang="ts">
  import type { TimeWindow } from '../types.js';
  import M365ConnectButton from './M365ConnectButton.svelte';
  import {
    getConnected,
    getConfig,
    updateConfig,
    getLastSyncTime,
  } from '../stores/m365Store.svelte.js';

  const { onError }: { onError?: (msg: string) => void } = $props();

  const connected = $derived(getConnected());
  const config = $derived(getConfig());
  const lastSync = $derived(getLastSyncTime());

  function handleTimeWindowChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value as TimeWindow;
    updateConfig({ timeWindow: value });
  }

  function handleFlaggedToggle() {
    updateConfig({ importFlagged: !config.importFlagged });
  }

  function formatLastSync(iso: string | null): string {
    if (!iso) return 'Never';
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return 'Unknown';
    }
  }
</script>

<div class="settings-panel" role="region" aria-label="Microsoft 365 integration settings">
  <h2 class="settings-title">
    <svg viewBox="0 0 21 21" width="18" height="18" aria-hidden="true" class="ms-logo">
      <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
      <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
      <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
    </svg>
    Microsoft 365 Integration
  </h2>

  <div class="settings-section">
    <h3 class="section-label">Connection</h3>
    <M365ConnectButton {onError} />
  </div>

  {#if connected}
    <div class="settings-section">
      <h3 class="section-label">Scan Settings</h3>

      <div class="setting-row">
        <label class="setting-label" for="time-window">Time window</label>
        <select
          id="time-window"
          class="setting-select"
          value={config.timeWindow}
          onchange={handleTimeWindowChange}
        >
          <option value="1d">Last 24 hours</option>
          <option value="3d">Last 3 days</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>

      <div class="setting-row">
        <label class="setting-label" for="import-flagged">Import flagged emails</label>
        <button
          id="import-flagged"
          class="toggle-btn"
          role="switch"
          aria-checked={config.importFlagged}
          aria-label="Import flagged emails"
          onclick={handleFlaggedToggle}
        >
          <span class="toggle-track" class:active={config.importFlagged}>
            <span class="toggle-thumb"></span>
          </span>
        </button>
      </div>

      <div class="setting-info">
        <span class="info-label">Last sync:</span>
        <span class="info-value">{formatLastSync(lastSync)}</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .settings-panel {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 1rem;
  }

  .settings-title {
    margin: 0 0 1rem;
    font-size: 1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .ms-logo { flex-shrink: 0; }

  .settings-section {
    padding: 0.75rem 0;
    border-top: 1px solid var(--color-border);
  }

  .section-label {
    margin: 0 0 0.5rem;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--color-text-muted);
    letter-spacing: 0.03em;
  }

  .setting-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
  }

  .setting-label {
    font-size: 0.875rem;
    color: var(--color-text);
  }

  .setting-select {
    padding: 0.3rem 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: var(--color-bg);
    color: var(--color-text);
    font-size: 0.8rem;
  }

  .toggle-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }

  .toggle-track {
    display: block;
    width: 2.5rem;
    height: 1.25rem;
    background: var(--color-border);
    border-radius: 9999px;
    position: relative;
    transition: background 0.2s;
  }
  .toggle-track.active { background: var(--color-accent); }

  .toggle-thumb {
    display: block;
    width: 1rem;
    height: 1rem;
    background: #fff;
    border-radius: 50%;
    position: absolute;
    top: 0.125rem;
    left: 0.125rem;
    transition: transform 0.2s;
  }
  .toggle-track.active .toggle-thumb { transform: translateX(1.25rem); }

  .setting-info {
    display: flex;
    gap: 0.4rem;
    padding: 0.5rem 0;
    font-size: 0.8rem;
  }
  .info-label { color: var(--color-text-muted); }
  .info-value { color: var(--color-text); }
</style>
