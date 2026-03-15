import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock useFocusTrap
vi.mock('../../lib/useFocusTrap', () => ({
  useFocusTrap: () => React.createRef(),
}));

import FeatureSearch from '../../components/FeatureSearch';
import { DISCOVERABLE_FEATURE_CATALOG } from '../../lib/featureCatalog';

describe('FeatureSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders trigger button', () => {
    render(<FeatureSearch />);
    const btn = screen.getByLabelText('Search features (Ctrl+K)');
    expect(btn).toBeInTheDocument();
  });

  it('opens modal on trigger click', () => {
    render(<FeatureSearch />);
    fireEvent.click(screen.getByLabelText('Search features (Ctrl+K)'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText('Search features')).toBeInTheDocument();
  });

  it('shows popular features when query is empty', () => {
    render(<FeatureSearch />);
    fireEvent.click(screen.getByLabelText('Search features (Ctrl+K)'));
    expect(screen.getByText('Popular Features')).toBeInTheDocument();
  });

  it('searches features by query', () => {
    render(<FeatureSearch />);
    fireEvent.click(screen.getByLabelText('Search features (Ctrl+K)'));
    const input = screen.getByLabelText('Search features');
    fireEvent.change(input, { target: { value: 'auction' } });
    // Should show result count
    expect(screen.getByText(/result/i)).toBeInTheDocument();
  });

  it('shows no results message for gibberish', () => {
    render(<FeatureSearch />);
    fireEvent.click(screen.getByLabelText('Search features (Ctrl+K)'));
    const input = screen.getByLabelText('Search features');
    fireEvent.change(input, { target: { value: 'xyzqwerty999' } });
    expect(screen.getByText(/No features found/i)).toBeInTheDocument();
  });

  it('closes modal on Escape key', () => {
    render(<FeatureSearch />);
    fireEvent.click(screen.getByLabelText('Search features (Ctrl+K)'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('dialog').querySelector('[class*="max-w"]')!, {
      key: 'Escape',
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens modal on Ctrl+K', () => {
    render(<FeatureSearch />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('navigates on feature select with path', () => {
    render(<FeatureSearch />);
    fireEvent.click(screen.getByLabelText('Search features (Ctrl+K)'));
    // The dashboard feature should be in popular features and has path '/'
    const dashboardOption = screen.getByText('League Intelligence Dashboard');
    fireEvent.click(dashboardOption);
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('has view-all link for the current feature count', () => {
    render(<FeatureSearch />);
    fireEvent.click(screen.getByLabelText('Search features (Ctrl+K)'));
    expect(screen.getByText(new RegExp(`View All ${DISCOVERABLE_FEATURE_CATALOG.length} Features`))).toBeInTheDocument();
  });
});
