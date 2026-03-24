<script lang="ts">
  import AddTodo from './lib/components/AddTodo.svelte';
  import TodoList from './lib/components/TodoList.svelte';
  import FilterBar from './lib/components/FilterBar.svelte';
  import SearchBar from './lib/components/SearchBar.svelte';
  import ToastNotification from './lib/components/ToastNotification.svelte';
  import ThemeToggle from './lib/components/ThemeToggle.svelte';
  import Confetti from './lib/components/Confetti.svelte';
  import AboutModal from './lib/components/AboutModal.svelte';
  import { getTodos, getDeletedTodo } from './lib/stores/todos.svelte.js';
  import {
    getThemePreference,
    getEffectiveTheme,
    toggleTheme,
    resetToSystem,
  } from './lib/stores/theme.svelte.js';

  const themePreference = $derived(getThemePreference());
  const effectiveTheme = $derived(getEffectiveTheme());

  let showAbout = $state(false);
  let aboutTriggerRef: HTMLButtonElement | undefined = $state();

  const todos = $derived(getTodos());
  const deletedTodo = $derived(getDeletedTodo());
  const showToast = $derived(deletedTodo !== null);

  const allCompleted = $derived(todos.length > 0 && todos.every(t => t.completed));
  let previousAllCompleted = $state(false);
  let showConfetti = $state(false);

  $effect(() => {
    if (allCompleted && !previousAllCompleted) {
      showConfetti = true;
      setTimeout(() => { showConfetti = false; }, 3000);
    }
    previousAllCompleted = allCompleted;
  });

  $effect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === '?') {
        e.preventDefault();
        showAbout = true;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  function closeAbout() {
    showAbout = false;
    aboutTriggerRef?.focus();
  }
</script>

<div class="app">
  <header class="header">
    <div class="header-content">
      <h1 class="title">✨ Todo App</h1>
      <div class="header-actions">
        <button
          class="about-btn"
          onclick={() => { showAbout = true; }}
          aria-label="About"
          bind:this={aboutTriggerRef}
        >ⓘ</button>
        <ThemeToggle {themePreference} {effectiveTheme} onToggle={toggleTheme} onResetToSystem={resetToSystem} />
      </div>
    </div>
  </header>
  
  <main class="main">
    <div class="container">
      <AddTodo />
      
      <div class="controls">
        <SearchBar />
        <FilterBar />
      </div>
      
      <TodoList />
    </div>
  </main>
  
  <ToastNotification show={showToast} />
  <Confetti show={showConfetti} />
  <AboutModal isOpen={showAbout} onClose={closeAbout} />
</div>

<style>
  :global(:root),
  :global(html.light) {
    --color-bg: #ffffff;
    --color-surface: #f9fafb;
    --color-border: #e5e7eb;
    --color-text: #1f2937;
    --color-text-muted: #6b7280;
    --color-accent: #3b82f6;
    --color-priority-high: #dc2626;
    --color-priority-medium: #f59e0b;
    --color-priority-low: #10b981;
    --color-priority-high-bg: #fef2f2;
    --color-priority-medium-bg: #fffbeb;
    --color-priority-low-bg: #f0fdf4;
    --color-danger-hover-bg: #fef2f2;
    --color-accent-hover: #2563eb;
    --color-danger-hover: #b91c1c;
    --radius-md: 0.5rem;
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  }
  
  :global(html.dark) {
    --color-bg: #1f2937;
    --color-surface: #374151;
    --color-border: #4b5563;
    --color-text: #f9fafb;
    --color-text-muted: #d1d5db;
    --color-accent: #60a5fa;
    --color-priority-high: #f87171;
    --color-priority-medium: #fbbf24;
    --color-priority-low: #34d399;
    --color-priority-high-bg: rgba(248, 113, 113, 0.15);
    --color-priority-medium-bg: rgba(251, 191, 36, 0.15);
    --color-priority-low-bg: rgba(52, 211, 153, 0.15);
    --color-danger-hover-bg: rgba(248, 113, 113, 0.15);
    --color-accent-hover: #93bbfd;
    --color-danger-hover: #fca5a5;
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.2);
  }
  
  :global(*) {
    box-sizing: border-box;
  }
  
  :global(body) {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: var(--color-bg);
    color: var(--color-text);
    transition: background 0.2s, color 0.2s;
  }
  
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  .header {
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    padding: 1rem 0;
    position: sticky;
    top: 0;
    z-index: 100;
  }
  
  .header-content {
    max-width: 48rem;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  
  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .about-btn {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: var(--color-text-muted);
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-md);
    line-height: 1;
    transition: color 0.15s, background 0.15s;
  }
  
  .about-btn:hover {
    color: var(--color-text);
    background: var(--color-border);
  }
  
  .about-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }
  
  .title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    background: linear-gradient(135deg, var(--color-accent) 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .main {
    flex: 1;
    padding: 2rem 1rem;
  }
  
  .container {
    max-width: 48rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  @media (min-width: 640px) {
    .controls {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }
</style>

