<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import { version } from '../../../package.json';
  import { t } from '../i18n/index.svelte.js';

  let { isOpen, onClose }: { isOpen: boolean; onClose: () => void } = $props();

  let closeButtonRef: HTMLButtonElement | undefined = $state();

  $effect(() => {
    if (isOpen && closeButtonRef) {
      closeButtonRef.focus();
    }
  });

  function handleKeydown(e: KeyboardEvent) {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
    if (e.key === 'Tab') {
      trapFocus(e);
    }
  }

  function trapFocus(e: KeyboardEvent) {
    const modal = document.getElementById('about-modal');
    if (!modal) return;
    const focusable = modal.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('backdrop')) {
      onClose();
    }
  }

  const features = $derived([
    { icon: '🖱️', label: t('about.feature.dragDrop'), description: t('about.feature.dragDrop.desc') },
    { icon: '🎯', label: t('about.feature.priority'), description: t('about.feature.priority.desc') },
    { icon: '🏷️', label: t('about.feature.tags'), description: t('about.feature.tags.desc') },
    { icon: '🌙', label: t('about.feature.darkMode'), description: t('about.feature.darkMode.desc') },
    { icon: '📅', label: t('about.feature.dueDate'), description: t('about.feature.dueDate.desc') },
    { icon: '↩️', label: t('about.feature.undoDelete'), description: t('about.feature.undoDelete.desc') },
    { icon: '🔍', label: t('about.feature.liveSearch'), description: t('about.feature.liveSearch.desc') },
    { icon: '🎉', label: t('about.feature.confetti'), description: t('about.feature.confetti.desc') },
  ]);

  const shortcuts = $derived([
    { key: 'n', action: t('about.shortcut.newTodo') },
    { key: 'Enter', action: t('about.shortcut.confirm') },
    { key: 'Escape', action: t('about.shortcut.cancelClose') },
    { key: '?', action: t('about.shortcut.openAbout') },
  ]);

  const techStack = [
    { name: 'Svelte 5', url: 'https://svelte.dev/' },
    { name: 'Vite', url: 'https://vite.dev/' },
    { name: 'TypeScript', url: 'https://www.typescriptlang.org/' },
    { name: 'Vitest', url: 'https://vitest.dev/' },
  ];
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="backdrop"
    transition:fade={{ duration: 200 }}
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
  >
    <div
      id="about-modal"
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-title"
      transition:fly={{ y: 20, duration: 250 }}
    >
      <div class="modal-header">
        <h2 id="about-title">{t('about.title')}</h2>
        <button
          class="close-btn"
          onclick={onClose}
          aria-label={t('about.aria.close')}
          bind:this={closeButtonRef}
        >×</button>
      </div>

      <div class="modal-body">
        <section class="section identity">
          <h3 class="app-name">{t('about.appName')}</h3>
          <p class="tagline">{t('about.tagline')}</p>
          <span class="version">v{version}</span>
          <p class="description">
            {t('about.description')}
          </p>
        </section>

        <section class="section">
          <h3>{t('about.shortcuts')}</h3>
          <div class="shortcuts-table-wrapper">
            <table class="shortcuts-table">
              <thead>
                <tr>
                  <th>{t('about.shortcuts.shortcut')}</th>
                  <th>{t('about.shortcuts.action')}</th>
                </tr>
              </thead>
              <tbody>
                {#each shortcuts as shortcut}
                  <tr>
                    <td><kbd>{shortcut.key}</kbd></td>
                    <td>{shortcut.action}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </section>

        <section class="section">
          <h3>{t('about.features')}</h3>
          <ul class="features-list">
            {#each features as feature}
              <li>
                <span class="feature-icon" aria-hidden="true">{feature.icon}</span>
                <div>
                  <strong>{feature.label}</strong>
                  <span class="feature-desc">{feature.description}</span>
                </div>
              </li>
            {/each}
          </ul>
        </section>

        <section class="section">
          <h3>{t('about.builtWith')}</h3>
          <ul class="tech-list">
            {#each techStack as tech}
              <li>
                <a href={tech.url} target="_blank" rel="noopener noreferrer">
                  {tech.name}<span class="sr-only"> {t('about.opensInNewTab')}</span>
                </a>
              </li>
            {/each}
          </ul>
        </section>
      </div>
    </div>
  </div>
{/if}

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
    padding: 1rem;
  }

  .modal {
    background: var(--color-surface);
    color: var(--color-text);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    max-width: 600px;
    width: 100%;
    max-height: 85vh;
    overflow-y: auto;
    border: 1px solid var(--color-border);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1.5rem 0.75rem;
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;
    background: var(--color-surface);
    z-index: 1;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--color-text-muted);
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-md);
    line-height: 1;
    transition: color 0.15s, background 0.15s;
  }

  .close-btn:hover {
    color: var(--color-text);
    background: var(--color-border);
  }

  .close-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .modal-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  .section h3 {
    margin: 0 0 0.75rem;
    font-size: 1rem;
    font-weight: 600;
  }

  .identity {
    text-align: center;
  }

  .app-name {
    font-size: 1.15rem !important;
    background: linear-gradient(135deg, var(--color-accent) 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .tagline {
    color: var(--color-text-muted);
    margin: 0.25rem 0 0.5rem;
    font-size: 0.95rem;
  }

  .version {
    display: inline-block;
    background: var(--color-border);
    color: var(--color-text-muted);
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.15rem 0.5rem;
    border-radius: 9999px;
    margin-bottom: 0.75rem;
  }

  .description {
    color: var(--color-text);
    font-size: 0.9rem;
    line-height: 1.6;
    margin: 0;
  }

  /* Keyboard Shortcuts Table */
  .shortcuts-table-wrapper {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .shortcuts-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  .shortcuts-table th,
  .shortcuts-table td {
    text-align: left;
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--color-border);
  }

  .shortcuts-table th {
    font-weight: 600;
    color: var(--color-text-muted);
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  kbd {
    display: inline-block;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 0.1rem 0.45rem;
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
    font-size: 0.85rem;
    font-weight: 600;
    box-shadow: 0 1px 0 var(--color-border);
    min-width: 1.5rem;
    text-align: center;
  }

  /* Features List */
  .features-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .features-list li {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .feature-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
    line-height: 1.4;
  }

  .features-list strong {
    display: block;
    font-size: 0.9rem;
    margin-bottom: 0.1rem;
  }

  .feature-desc {
    color: var(--color-text-muted);
    font-size: 0.85rem;
    line-height: 1.4;
  }

  /* Tech Stack */
  .tech-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tech-list li a {
    display: inline-block;
    background: var(--color-bg);
    color: var(--color-accent);
    border: 1px solid var(--color-border);
    border-radius: 9999px;
    padding: 0.35rem 0.85rem;
    font-size: 0.85rem;
    font-weight: 500;
    text-decoration: none;
    transition: background 0.15s, border-color 0.15s;
  }

  .tech-list li a:hover {
    background: var(--color-accent);
    color: #fff;
    border-color: var(--color-accent);
  }

  .tech-list li a:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (max-width: 480px) {
    .modal-body {
      padding: 1rem;
    }

    .modal-header {
      padding: 1rem 1rem 0.75rem;
    }

    .features-list li {
      gap: 0.5rem;
    }
  }
</style>
