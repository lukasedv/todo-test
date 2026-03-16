<script lang="ts">
  import AddTodo from './lib/components/AddTodo.svelte';
  import TodoList from './lib/components/TodoList.svelte';
  import FilterBar from './lib/components/FilterBar.svelte';
  import SearchBar from './lib/components/SearchBar.svelte';
  import ToastNotification from './lib/components/ToastNotification.svelte';
  import ThemeToggle from './lib/components/ThemeToggle.svelte';
  import Confetti from './lib/components/Confetti.svelte';
  import { getTodos, getDeletedTodo } from './lib/stores/todos.svelte.js';
  
  let theme = $state<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') ?? 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
  
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
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  });
  
  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light';
  }
</script>

<div class="app">
  <header class="header">
    <div class="header-content">
      <h1 class="title">✨ Todo App</h1>
      <ThemeToggle {theme} onToggle={toggleTheme} />
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
</div>

<style>
  :global(:root) {
    --color-bg: #ffffff;
    --color-surface: #f9fafb;
    --color-border: #e5e7eb;
    --color-text: #1f2937;
    --color-text-muted: #6b7280;
    --color-accent: #3b82f6;
    --color-priority-high: #dc2626;
    --color-priority-medium: #f59e0b;
    --color-priority-low: #10b981;
    --radius-md: 0.5rem;
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  }
  
  :global([data-theme="dark"]) {
    --color-bg: #1f2937;
    --color-surface: #374151;
    --color-border: #4b5563;
    --color-text: #f9fafb;
    --color-text-muted: #d1d5db;
    --color-accent: #60a5fa;
    --color-priority-high: #f87171;
    --color-priority-medium: #fbbf24;
    --color-priority-low: #34d399;
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
