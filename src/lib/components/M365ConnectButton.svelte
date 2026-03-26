<script lang="ts">
  import {
    getConnected,
    getUserEmail,
    getUserName,
    setConnected,
    setUserInfo,
    clearM365Data,
  } from '../stores/m365Store.svelte.js';
  import { login, logout } from '../services/authService.js';

  const { onError }: { onError?: (msg: string) => void } = $props();

  const connected = $derived(getConnected());
  const userEmail = $derived(getUserEmail());
  const userName = $derived(getUserName());

  let showPermissions = $state(false);
  let showDisconnectConfirm = $state(false);
  let loading = $state(false);

  async function handleConnect() {
    showPermissions = false;
    loading = true;
    try {
      const result = await login();
      setConnected(true);
      setUserInfo(
        result.account?.username ?? null,
        result.account?.name ?? null,
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to connect to Microsoft 365';
      onError?.(msg);
    } finally {
      loading = false;
    }
  }

  async function handleDisconnect() {
    showDisconnectConfirm = false;
    loading = true;
    try {
      await logout();
    } catch {
      // Continue with local cleanup even if remote logout fails
    } finally {
      clearM365Data();
      loading = false;
    }
  }
</script>

{#if !connected}
  {#if showPermissions}
    <div class="permission-panel" role="dialog" aria-label="Microsoft 365 permissions">
      <h3 class="permission-title">Connect Microsoft 365</h3>
      <p class="permission-desc">This will allow the app to:</p>
      <ul class="permission-list">
        <li>📧 Read your email messages (read-only)</li>
        <li>👤 Access your basic profile information</li>
      </ul>
      <p class="permission-note">
        Your data is processed locally in the browser. No email content is stored permanently.
        You can revoke access at any time.
      </p>
      <div class="permission-actions">
        <button class="btn-primary" onclick={handleConnect} disabled={loading}>
          {#if loading}Connecting...{:else}Authorize & Connect{/if}
        </button>
        <button class="btn-secondary" onclick={() => { showPermissions = false; }}>
          Cancel
        </button>
      </div>
    </div>
  {:else}
    <button
      class="connect-btn"
      onclick={() => { showPermissions = true; }}
      disabled={loading}
      aria-label="Connect your Microsoft 365 account"
    >
      <svg class="ms-icon" viewBox="0 0 21 21" width="16" height="16" aria-hidden="true">
        <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
        <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
        <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
        <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
      </svg>
      Connect Microsoft 365
    </button>
  {/if}
{:else}
  <div class="connected-info">
    <div class="status-row">
      <span class="status-dot"></span>
      <span class="status-text">Connected</span>
      {#if userName}
        <span class="user-name">{userName}</span>
      {/if}
    </div>
    {#if userEmail}
      <span class="user-email">{userEmail}</span>
    {/if}
    {#if showDisconnectConfirm}
      <div class="disconnect-confirm">
        <p>Disconnect Microsoft 365? Pending suggestions will be cleared, but accepted todos will remain.</p>
        <div class="confirm-actions">
          <button class="btn-danger" onclick={handleDisconnect} disabled={loading}>
            {#if loading}Disconnecting...{:else}Disconnect{/if}
          </button>
          <button class="btn-secondary" onclick={() => { showDisconnectConfirm = false; }}>
            Cancel
          </button>
        </div>
      </div>
    {:else}
      <button
        class="disconnect-btn"
        onclick={() => { showDisconnectConfirm = true; }}
        disabled={loading}
      >
        Disconnect
      </button>
    {/if}
  </div>
{/if}

<style>
  .connect-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text);
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: background 0.15s, box-shadow 0.15s;
  }
  .connect-btn:hover { background: var(--color-border); }
  .connect-btn:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
  .connect-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .ms-icon { flex-shrink: 0; }

  .permission-panel {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 1rem;
  }
  .permission-title { margin: 0 0 0.5rem; font-size: 1rem; font-weight: 600; }
  .permission-desc { margin: 0 0 0.5rem; font-size: 0.875rem; color: var(--color-text-muted); }
  .permission-list {
    list-style: none;
    padding: 0;
    margin: 0 0 0.75rem;
    font-size: 0.875rem;
  }
  .permission-list li { padding: 0.25rem 0; }
  .permission-note {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    margin: 0 0 0.75rem;
    line-height: 1.4;
  }
  .permission-actions { display: flex; gap: 0.5rem; }

  .connected-info { display: flex; flex-direction: column; gap: 0.25rem; }
  .status-row { display: flex; align-items: center; gap: 0.4rem; }
  .status-dot {
    width: 0.5rem;
    height: 0.5rem;
    background: #10b981;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .status-text { font-size: 0.8rem; font-weight: 600; color: #10b981; }
  .user-name { font-size: 0.8rem; color: var(--color-text); }
  .user-email { font-size: 0.75rem; color: var(--color-text-muted); }

  .disconnect-btn {
    align-self: flex-start;
    background: none;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    color: var(--color-text-muted);
    cursor: pointer;
    margin-top: 0.25rem;
  }
  .disconnect-btn:hover { border-color: var(--color-priority-high); color: var(--color-priority-high); }

  .disconnect-confirm {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: var(--color-text-muted);
  }
  .disconnect-confirm p { margin: 0 0 0.5rem; }
  .confirm-actions { display: flex; gap: 0.5rem; }

  .btn-primary {
    padding: 0.4rem 1rem;
    background: var(--color-accent);
    color: #fff;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: 600;
    font-size: 0.8rem;
  }
  .btn-primary:hover { opacity: 0.9; }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .btn-secondary {
    padding: 0.4rem 1rem;
    background: transparent;
    color: var(--color-text-muted);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: 0.8rem;
  }
  .btn-secondary:hover { background: var(--color-surface); }

  .btn-danger {
    padding: 0.4rem 1rem;
    background: var(--color-priority-high);
    color: #fff;
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: 600;
    font-size: 0.8rem;
  }
  .btn-danger:hover { opacity: 0.9; }
  .btn-danger:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
