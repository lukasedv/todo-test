<script lang="ts">
  import { getLocale, setLocale, t } from '../i18n/index.svelte.js';
  import type { Locale } from '../i18n/index.svelte.js';

  const locale = $derived(getLocale());

  function handleChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value as Locale;
    setLocale(value);
  }
</script>

<div class="language-switcher">
  <select
    class="language-select"
    value={locale}
    onchange={handleChange}
    aria-label={t('language.label')}
  >
    <option value="en">EN</option>
    <option value="fi">FI</option>
    <option value="et">ET</option>
    <option value="da">DA</option>
  </select>
</div>

<style>
  .language-switcher {
    display: flex;
    align-items: center;
  }

  .language-select {
    padding: 0.35rem 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background: none;
    color: var(--color-text);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    min-width: 44px;
    min-height: 44px;
    transition: background-color 0.2s ease, border-color 0.2s ease;
  }

  .language-select:hover {
    background: var(--color-surface);
  }

  .language-select:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
</style>
