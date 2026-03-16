import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import ThemeToggle from '$lib/components/ThemeToggle.svelte';

describe('ThemeToggle', () => {
  const defaultProps = {
    themePreference: 'system' as const,
    effectiveTheme: 'light' as const,
    onToggle: vi.fn(),
    onResetToSystem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the toggle button', () => {
    const { getByRole } = render(ThemeToggle, { props: defaultProps });
    const button = getByRole('button', { name: 'Switch to dark mode' });
    expect(button).toBeInTheDocument();
  });

  it('shows sun icon in light mode', () => {
    const { container } = render(ThemeToggle, { props: defaultProps });
    const svg = container.querySelector('.theme-toggle svg');
    expect(svg).toBeInTheDocument();
    // Sun icon has a circle element
    expect(svg?.querySelector('circle')).toBeInTheDocument();
  });

  it('shows moon icon in dark mode', () => {
    const { container } = render(ThemeToggle, {
      props: { ...defaultProps, effectiveTheme: 'dark' as const },
    });
    const svg = container.querySelector('.theme-toggle svg');
    expect(svg).toBeInTheDocument();
    // Moon icon has a path element (no circle)
    expect(svg?.querySelector('path')).toBeInTheDocument();
    expect(svg?.querySelector('circle')).not.toBeInTheDocument();
  });

  it('has accessible aria-label for light mode', () => {
    const { getByRole } = render(ThemeToggle, { props: defaultProps });
    expect(getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument();
  });

  it('has accessible aria-label for dark mode', () => {
    const { getByRole } = render(ThemeToggle, {
      props: { ...defaultProps, effectiveTheme: 'dark' as const },
    });
    expect(getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
  });

  it('calls onToggle when clicked', async () => {
    const onToggle = vi.fn();
    const { getByRole } = render(ThemeToggle, {
      props: { ...defaultProps, onToggle },
    });
    await fireEvent.click(getByRole('button', { name: 'Switch to dark mode' }));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('does not show reset button when in system mode', () => {
    const { queryByRole } = render(ThemeToggle, { props: defaultProps });
    expect(queryByRole('button', { name: 'Reset to system theme preference' })).not.toBeInTheDocument();
  });

  it('shows reset button when in manual light mode', () => {
    const { getByRole } = render(ThemeToggle, {
      props: { ...defaultProps, themePreference: 'light' as const },
    });
    expect(getByRole('button', { name: 'Reset to system theme preference' })).toBeInTheDocument();
  });

  it('shows reset button when in manual dark mode', () => {
    const { getByRole } = render(ThemeToggle, {
      props: { ...defaultProps, themePreference: 'dark' as const, effectiveTheme: 'dark' as const },
    });
    expect(getByRole('button', { name: 'Reset to system theme preference' })).toBeInTheDocument();
  });

  it('calls onResetToSystem when reset button is clicked', async () => {
    const onResetToSystem = vi.fn();
    const { getByRole } = render(ThemeToggle, {
      props: { ...defaultProps, themePreference: 'light' as const, onResetToSystem },
    });
    await fireEvent.click(getByRole('button', { name: 'Reset to system theme preference' }));
    expect(onResetToSystem).toHaveBeenCalledOnce();
  });

  it('has minimum 44x44px touch target class', () => {
    const { container } = render(ThemeToggle, { props: defaultProps });
    const button = container.querySelector('.theme-toggle');
    expect(button).toBeInTheDocument();
    // The component sets min-width/min-height: 44px via the .theme-toggle class.
    // jsdom doesn't process scoped Svelte styles, so we verify the class is applied.
    expect(button).toHaveClass('theme-toggle');
  });

  it('displays "Using system preference" title when in system mode', () => {
    const { getByRole } = render(ThemeToggle, { props: defaultProps });
    const button = getByRole('button', { name: 'Switch to dark mode' });
    expect(button).toHaveAttribute('title', 'Using system preference');
  });

  it('toggle button is focusable', () => {
    const { getByRole } = render(ThemeToggle, { props: defaultProps });
    const button = getByRole('button', { name: 'Switch to dark mode' });
    button.focus();
    expect(document.activeElement).toBe(button);
  });
});
