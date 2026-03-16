import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import { fireEvent } from '@testing-library/svelte';
import ErrorFallback from '$lib/components/ErrorFallback.svelte';

describe('ErrorFallback', () => {
  it('renders the error message', () => {
    const error = new Error('Test crash');
    const { getByText } = render(ErrorFallback, { props: { error } });
    expect(getByText('Something went wrong')).toBeInTheDocument();
    expect(getByText('Test crash')).toBeInTheDocument();
  });

  it('renders descriptive help text', () => {
    const error = new Error('fail');
    const { getByText } = render(ErrorFallback, { props: { error } });
    expect(getByText(/Try refreshing the page/)).toBeInTheDocument();
  });

  it('has a Reload App button', () => {
    const error = new Error('fail');
    const { getByRole } = render(ErrorFallback, { props: { error } });
    expect(getByRole('button', { name: 'Reload App' })).toBeInTheDocument();
  });

  it('has a Reset App Data button', () => {
    const error = new Error('fail');
    const { getByRole } = render(ErrorFallback, { props: { error } });
    expect(getByRole('button', { name: 'Reset App Data' })).toBeInTheDocument();
  });

  it('has role="alert" for accessibility', () => {
    const error = new Error('fail');
    const { getByRole } = render(ErrorFallback, { props: { error } });
    expect(getByRole('alert')).toBeInTheDocument();
  });

  it('calls window.confirm and clearAppStorage on Reset App Data click', async () => {
    const error = new Error('fail');
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadSpy },
      writable: true,
      configurable: true,
    });

    localStorage.setItem('todos', '[]');
    const { getByRole } = render(ErrorFallback, { props: { error } });
    await fireEvent.click(getByRole('button', { name: 'Reset App Data' }));

    expect(confirmSpy).toHaveBeenCalled();
    expect(localStorage.getItem('todos')).toBeNull();
    confirmSpy.mockRestore();
  });

  it('does not clear data when user cancels confirm dialog', async () => {
    const error = new Error('fail');
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    localStorage.setItem('todos', '["test"]');
    const { getByRole } = render(ErrorFallback, { props: { error } });
    await fireEvent.click(getByRole('button', { name: 'Reset App Data' }));

    expect(confirmSpy).toHaveBeenCalled();
    expect(localStorage.getItem('todos')).toBe('["test"]');
    confirmSpy.mockRestore();
  });
});
