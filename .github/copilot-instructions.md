# Copilot Instructions for Lukasedv/todo-test

## Project Overview

This is **the coolest Svelte to-do app** — a feature-rich, visually impressive, and highly interactive task management application built with Svelte. The goal is not just functional correctness, but to deliver a delightful, modern user experience that stands out from typical to-do apps.

---

## Tech Stack & Architecture

| Layer | Technology |
|---|---|
| UI Framework | [Svelte 5](https://svelte.dev/) (use runes: `$state`, `$derived`, `$effect`) |
| Build Tool | Vite |
| Styling | CSS custom properties + scoped Svelte styles; consider TailwindCSS if already configured |
| Persistence | `localStorage` (default); optionally a backend/DB if configured |
| Testing | Vitest + Svelte Testing Library |
| Package Manager | npm (check `package.json` for the exact version) |

> Always check `package.json` and `svelte.config.js` before assuming versions or plugins.

---

## Key Directories & Files

```
src/
  lib/
    components/       # Reusable Svelte components (TodoItem, TodoList, FilterBar, etc.)
    stores/           # Svelte stores or rune-based state modules
    utils/            # Pure utility functions (sorting, filtering, date helpers)
    types.ts          # Shared TypeScript interfaces/types (Todo, Filter, Priority, etc.)
  routes/             # SvelteKit pages (if SvelteKit is used)
  App.svelte          # Root component
  main.ts             # Entry point
static/               # Static assets
tests/                # Unit and component tests
.github/
  copilot-instructions.md
svelte.config.js
vite.config.ts
package.json
```

---

## Core Data Model

The primary `Todo` type should look like this and be defined in `src/lib/types.ts`:

```ts
interface Todo {
  id: string;           // crypto.randomUUID()
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  dueDate?: string;     // ISO 8601 date string
  createdAt: string;    // ISO 8601 timestamp
  updatedAt: string;    // ISO 8601 timestamp
}

type Filter = 'all' | 'active' | 'completed';
type SortBy = 'createdAt' | 'dueDate' | 'priority' | 'title';
```

---

## Coding Conventions & Patterns

### General
- Use **TypeScript** everywhere. Avoid `any`; prefer explicit types or generics.
- Prefer **Svelte 5 runes** (`$state`, `$derived`, `$effect`, `$props`) over legacy `writable` stores unless the codebase already uses stores consistently.
- All components live in `src/lib/components/` and are **PascalCase** named (e.g., `TodoItem.svelte`).
- Utility functions in `src/lib/utils/` must be **pure functions** with no side effects.
- Use `crypto.randomUUID()` for generating unique IDs — never `Math.random()`.

### Svelte Components
- Keep components **small and focused** — one responsibility per component.
- Use `$props()` rune for component props in Svelte 5:
  ```svelte
  <script lang="ts">
    let { todo, onDelete, onToggle }: { todo: Todo; onDelete: (id: string) => void; onToggle: (id: string) => void } = $props();
  </script>
  ```
- Use `$derived` for computed values instead of reactive statements where possible.
- Emit events upward via **callback props** (not `createEventDispatcher` in Svelte 5).
- Avoid direct DOM manipulation; let Svelte handle the DOM.

### Styling
- Use **scoped `<style>` blocks** inside each `.svelte` file.
- Define design tokens (colors, spacing, border-radius, shadows) as **CSS custom properties** in a global stylesheet or `:root` in `App.svelte`.
- Animations and transitions should use **Svelte's built-in `transition:` and `animate:` directives** (e.g., `fly`, `fade`, `flip`) to make the UI feel alive and polished.
- The app should support a **dark mode** via `prefers-color-scheme` media query or a manual toggle stored in `localStorage`.
- Prioritize visual polish: smooth transitions, micro-interactions, clear typography, and consistent spacing.

### State Management
- Global app state (todo list, active filter, sort order) lives in a dedicated state module under `src/lib/stores/` or as a rune-based context.
- Persist state to `localStorage` using `$effect` or a custom persistence helper.
- Never mutate todo objects directly — always create new objects (immutable update pattern):
  ```ts
  todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t);
  ```

### "Coolness" Features to Implement/Maintain
When adding features, lean into what makes this app stand out:
- **Drag-and-drop** reordering of todos (use the HTML5 Drag and Drop API or a Svelte-compatible library).
- **Priority indicators** with distinct colors and icons.
- **Due date countdowns** with urgency highlighting (e.g., overdue items turn red).
- **Confetti or celebration animation** when all todos are completed.
- **Keyboard shortcuts** (e.g., `n` to add new, `Enter` to confirm, `Escape` to cancel).
- **Smooth list animations** using Svelte's `flip` animation on reorder/filter changes.
- **Tag/label system** for categorizing todos with color-coded chips.
- **Search/filter bar** with live filtering as you type.
- **Undo last delete** with a toast notification and timeout.

---

## Component Responsibilities

| Component | Responsibility |
|---|---|
| `App.svelte` | Root layout, global state context, theme toggle |
| `TodoList.svelte` | Renders the filtered/sorted list; handles `flip` animation |
| `TodoItem.svelte` | Single todo row; inline editing, complete toggle, delete, drag handle |
| `AddTodo.svelte` | Form for creating new todos (title, priority, due date, tags) |
| `FilterBar.svelte` | Filter buttons (All / Active / Completed) + sort dropdown |
| `SearchBar.svelte` | Live search input |
| `TagChip.svelte` | Reusable colored tag/label chip |
| `PriorityBadge.svelte` | Visual indicator for priority level |
| `EmptyState.svelte` | Friendly illustration + message when no todos match |
| `ToastNotification.svelte` | Ephemeral messages (e.g., undo delete) |
| `ThemeToggle.svelte` | Light/dark mode switch |

---

## Testing Approach

- Use **Vitest** as the test runner.
- Use **Svelte Testing Library** (`@testing-library/svelte`) for component tests.
- Test files live in `tests/` or co-located as `ComponentName.test.ts`.
- **Unit test** all utility functions in `src/lib/utils/`.
- **Component tests** should cover:
  - Rendering with required props.
  - User interactions (click, type, keyboard).
  - State changes after interaction.
- Do **not** test implementation details — test observable behavior.
- Mock `localStorage` in tests using `vitest`'s `vi.stubGlobal`.

Example test pattern:
```ts
import { render, fireEvent } from '@testing-library/svelte';
import TodoItem from '$lib/components/TodoItem.svelte';

test('toggles completion on click', async () => {
  const mockToggle = vi.fn();
  const { getByRole } = render(TodoItem, { props: { todo: mockTodo, onToggle: mockToggle, onDelete: vi.fn() } });
  await fireEvent.click(getByRole('checkbox'));
  expect(mockToggle).toHaveBeenCalledWith(mockTodo.id);
});
```

---

## Important Constraints & Considerations

1. **Accessibility (a11y):** All interactive elements must have appropriate ARIA roles/labels. Use semantic HTML (`<button>`, `<input>`, `<ul>/<li>`). Svelte's a11y warnings in the compiler must not be suppressed without justification.

2. **Performance:** The todo list can grow large. Use `{#key}` blocks wisely, avoid unnecessary reactive recalculations, and keep `$derived` computations efficient.

3. **No external UI component libraries** unless already present in `package.json`. Build custom components to maintain the unique "coolest" aesthetic.

4. **LocalStorage safety:** Always wrap `localStorage` access in try/catch to handle private browsing or quota errors gracefully.

5. **IDs are immutable:** Once a `Todo` is created, its `id` must never change. Always update `updatedAt` when mutating any other field.

6. **Mobile-first:** All layouts must be responsive. Interactions must work on touch devices (consider touch events for drag-and-drop).

7. **No `console.log` in committed code.** Use proper error handling.

8. **Svelte version discipline:** Do not mix Svelte 4 legacy syntax (e.g., `export let prop`) with Svelte 5 runes in the same component. Pick one style per component and be consistent across the codebase.

---

## Getting Started (for Copilot context)

```bash
npm install
npm run dev      # Start dev server
npm run build    # Production build
npm run test     # Run tests
npm run check    # Svelte type checking
```

---

*Last updated: 2026-03-16. Keep this file updated as the project evolves.* 