import { describe, it, expect, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import FrontierLab from '../../pages/FrontierLab';

function renderFrontierLab(initialEntry = '/frontier-lab') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/frontier-lab" element={<FrontierLab />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('FrontierLab', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads a selected feature from the query string', () => {
    renderFrontierLab('/frontier-lab?feature=counterfeit-cluster-radar');
    expect(screen.getByRole('heading', { name: 'Counterfeit Cluster Radar' })).toBeInTheDocument();
    expect(screen.getAllByText(/Spot fake networks/i).length).toBeGreaterThan(0);
  });

  it('persists stage and implementation notes', () => {
    renderFrontierLab('/frontier-lab?feature=reacquisition-radar');

    fireEvent.change(screen.getByPlaceholderText(/Add launch blockers/i), {
      target: { value: 'Start with Sold Vault triggers.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save Note' }));
    fireEvent.click(screen.getByRole('button', { name: 'Production Ready' }));

    const raw = localStorage.getItem('msi_frontier_feature_states') || '{}';
    expect(raw).toContain('Start with Sold Vault triggers.');
    expect(raw).toContain('production-ready');
  });
});
