import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import CenteringHeuristicPanel from '../../components/CenteringHeuristicPanel';
import {
  CENTERING_HEURISTIC_DISCLOSURE,
  estimateCenteringFromMetadata,
} from '../../lib/utils/centeringHeuristic';

describe('CenteringHeuristicPanel', () => {
  it('states it is not a production CV model or PSA prediction', () => {
    const result = estimateCenteringFromMetadata({ width: 714, height: 1000, byteLength: 80_000 });
    render(<CenteringHeuristicPanel result={result} />);
    expect(screen.getByRole('region', { name: /centering heuristic/i })).toBeInTheDocument();
    expect(screen.getByText(CENTERING_HEURISTIC_DISCLOSURE)).toBeInTheDocument();
    expect(screen.getByText(/not a PSA prediction/i)).toBeInTheDocument();
    expect(screen.getByText('PSA 10')).toBeInTheDocument();
    expect(screen.getByText(result.leftRightRatio)).toBeInTheDocument();
  });
});
