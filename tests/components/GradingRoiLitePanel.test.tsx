import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import GradingRoiLitePanel from '../../components/GradingRoiLitePanel';
import { makeCard } from '../helpers';
import { GRADING_ROI_LITE_DISCLOSURE } from '../../lib/analytics/gradingRoiLite';

describe('GradingRoiLitePanel', () => {
  it('returns nothing for graded or sold cards', () => {
    const { container } = render(
      <GradingRoiLitePanel
        inventory={[
          makeCard({ id: 'g1', isGraded: true, grade: '10', currentValue: 400 }),
          makeCard({ id: 's1', status: 'sold', currentValue: 200 }),
        ]}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('discloses simulated comps and shows raw vs PSA 9/10', () => {
    render(
      <GradingRoiLitePanel
        inventory={[makeCard({ id: 'raw-1', player: 'Shohei Ohtani', currentValue: 220, isGraded: false })]}
      />,
    );
    expect(screen.getByRole('region', { name: /grading roi lite/i })).toBeInTheDocument();
    expect(screen.getByText(GRADING_ROI_LITE_DISCLOSURE)).toBeInTheDocument();
    expect(screen.getByText(/Shohei Ohtani/)).toBeInTheDocument();
    expect(screen.getAllByText(/PSA 9/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/PSA 10/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/simulated/i).length).toBeGreaterThan(0);
  });
});
