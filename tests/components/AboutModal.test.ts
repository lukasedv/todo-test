import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import AboutModal from '$lib/components/AboutModal.svelte';

describe('AboutModal', () => {
  it('renders the dialog when isOpen is true', () => {
    const { getByRole } = render(AboutModal, {
      props: { isOpen: true, onClose: vi.fn() },
    });
    expect(getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    const { queryByRole } = render(AboutModal, {
      props: { isOpen: false, onClose: vi.fn() },
    });
    expect(queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('displays the app name', () => {
    const { getByText } = render(AboutModal, {
      props: { isOpen: true, onClose: vi.fn() },
    });
    expect(getByText(/The Coolest Svelte To-Do App/)).toBeInTheDocument();
  });

  it('displays the version string', () => {
    const { container } = render(AboutModal, {
      props: { isOpen: true, onClose: vi.fn() },
    });
    expect(container.textContent).toMatch(/v\d+\.\d+\.\d+/);
  });

  it('has a close button with correct aria-label', () => {
    const { getByRole } = render(AboutModal, {
      props: { isOpen: true, onClose: vi.fn() },
    });
    expect(getByRole('button', { name: 'Close About' })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    const { getByRole } = render(AboutModal, {
      props: { isOpen: true, onClose },
    });
    await fireEvent.click(getByRole('button', { name: 'Close About' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders keyboard shortcut kbd elements', () => {
    const { container } = render(AboutModal, {
      props: { isOpen: true, onClose: vi.fn() },
    });
    const kbdElements = container.querySelectorAll('kbd');
    expect(kbdElements.length).toBeGreaterThanOrEqual(1);
  });

  it('has aria-modal and aria-labelledby attributes on the dialog', () => {
    const { getByRole } = render(AboutModal, {
      props: { isOpen: true, onClose: vi.fn() },
    });
    const dialog = getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'about-title');
  });

  it('displays the About heading', () => {
    const { getByText } = render(AboutModal, {
      props: { isOpen: true, onClose: vi.fn() },
    });
    expect(getByText('About')).toBeInTheDocument();
  });

  it('renders tech stack links with rel="noopener noreferrer"', () => {
    const { container } = render(AboutModal, {
      props: { isOpen: true, onClose: vi.fn() },
    });
    const links = container.querySelectorAll('a[target="_blank"]');
    expect(links.length).toBeGreaterThanOrEqual(4);
    links.forEach((link) => {
      expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    });
  });

  it('renders at least 6 feature items', () => {
    const { container } = render(AboutModal, {
      props: { isOpen: true, onClose: vi.fn() },
    });
    const features = container.querySelectorAll('.features-list li');
    expect(features.length).toBeGreaterThanOrEqual(6);
  });
});
