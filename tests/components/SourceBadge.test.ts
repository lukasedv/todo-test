import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import SourceBadge from '$lib/components/SourceBadge.svelte';

describe('SourceBadge', () => {
  it('renders nothing when source is undefined', () => {
    const { container } = render(SourceBadge, { props: { source: undefined } });
    expect(container.querySelector('.source-badge')).toBeNull();
  });

  it('renders a clickable link for email source', () => {
    const { container } = render(SourceBadge, {
      props: {
        source: {
          type: 'email',
          sourceUrl: 'https://outlook.office.com/mail/deeplink/read/abc123',
        },
      },
    });
    const link = container.querySelector('a.source-badge');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toBe('https://outlook.office.com/mail/deeplink/read/abc123');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toContain('noopener');
    expect(link?.getAttribute('aria-label')).toBe('Open source email in Outlook');
  });

  it('renders a static badge for non-email source', () => {
    const { container } = render(SourceBadge, {
      props: {
        source: {
          type: 'teams',
          sourceUrl: 'https://example.com',
        },
      },
    });
    const badge = container.querySelector('.source-badge--static');
    expect(badge).not.toBeNull();
    expect(badge?.getAttribute('aria-label')).toBe('Auto-generated from Microsoft 365');
  });

  it('contains an SVG icon', () => {
    const { container } = render(SourceBadge, {
      props: {
        source: {
          type: 'email',
          sourceUrl: 'https://outlook.office.com/mail/deeplink/read/abc123',
        },
      },
    });
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });
});
