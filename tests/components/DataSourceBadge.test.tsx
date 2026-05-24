import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

import DataSourceBadge, { DataSourceVariant } from '../../components/DataSourceBadge';

describe('DataSourceBadge', () => {
  const variants: { variant: DataSourceVariant; label: string }[] = [
    { variant: 'live', label: 'Live' },
    { variant: 'sample', label: 'Sample' },
    { variant: 'stale', label: 'Stale' },
    { variant: 'mock', label: 'Demo data' },
  ];

  it.each(variants)('renders $variant variant with default label "$label"', ({ variant, label }) => {
    render(<DataSourceBadge variant={variant} />);
    const badge = screen.getByRole('status', { name: label });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent(label);
  });

  it('uses custom label override when provided', () => {
    render(<DataSourceBadge variant="live" label="Live · 3s ago" />);
    const badge = screen.getByRole('status', { name: 'Live · 3s ago' });
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Live · 3s ago');
    expect(screen.queryByText('Live', { exact: true })).not.toBeInTheDocument();
  });

  it('matches aria-label to visible text', () => {
    render(<DataSourceBadge variant="sample" />);
    const badge = screen.getByRole('status');
    const ariaLabel = badge.getAttribute('aria-label');
    expect(ariaLabel).toBe('Sample');
    expect(badge.textContent).toContain(ariaLabel);
  });

  it('applies the xs size typography class', () => {
    const { container } = render(<DataSourceBadge variant="sample" size="xs" />);
    const badge = container.querySelector('[role="status"]');
    expect(badge?.className).toContain('text-[9px]');
  });

  it('applies the sm size typography class by default', () => {
    const { container } = render(<DataSourceBadge variant="sample" />);
    const badge = container.querySelector('[role="status"]');
    expect(badge?.className).toContain('text-[10px]');
  });

  it('applies optional className', () => {
    const { container } = render(<DataSourceBadge variant="live" className="extra-class" />);
    const badge = container.querySelector('[role="status"]');
    expect(badge?.className).toContain('extra-class');
  });
});
