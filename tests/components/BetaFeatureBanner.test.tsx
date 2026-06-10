import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import BetaFeatureBanner from '../../components/BetaFeatureBanner';

describe('BetaFeatureBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders feature name and data source disclosure', () => {
    render(
      <BetaFeatureBanner
        featureName="Live Game Impact Engine"
        dataSourceLabel="Simulated replay scores"
        disclaimer="Not financial advice."
      />,
    );

    expect(screen.getByTestId('beta-feature-banner')).toBeInTheDocument();
    expect(screen.getByText(/Beta — Live Game Impact Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulated replay scores/i)).toBeInTheDocument();
    expect(screen.getByText(/Not financial advice/i)).toBeInTheDocument();
  });
});
