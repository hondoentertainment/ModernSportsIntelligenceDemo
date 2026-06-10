import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PricingProvenanceNotice from '../../components/PricingProvenanceNotice';

describe('PricingProvenanceNotice', () => {
  it('renders title, detail, and data source badge', () => {
    render(
      <PricingProvenanceNotice
        title="AI-derived pricing"
        detail="Estimates are not verified comps."
        badgeVariant="sample"
        badgeLabel="AI estimate"
      />,
    );

    expect(screen.getByText('AI-derived pricing')).toBeInTheDocument();
    expect(screen.getByText(/not verified comps/i)).toBeInTheDocument();
    expect(screen.getByLabelText('AI estimate')).toBeInTheDocument();
  });
});
