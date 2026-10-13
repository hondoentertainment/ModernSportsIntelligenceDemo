import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import PortfolioInsightsPanel from '../../components/PortfolioInsightsPanel';
import { PORTFOLIO_INSIGHTS_DISCLOSURE } from '../../lib/analytics/portfolioInsights';
import { makeCard } from '../helpers';

describe('PortfolioInsightsPanel', () => {
  it('renders nothing for an empty book', () => {
    const { container } = render(<PortfolioInsightsPanel inventory={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows cost, duplicates, mix, and the local-book disclosure', () => {
    render(
      <PortfolioInsightsPanel
        inventory={[
          makeCard({
            id: 'a',
            player: 'Julio Rodriguez',
            year: 2019,
            manufacturer: 'Bowman',
            set: 'Silver /499',
            cardNumber: 'BCP-33',
            purchasePrice: 40,
            gradingFees: 20,
            currentValue: 120,
            isGraded: true,
            gradingCompany: 'PSA',
            grade: '10',
          }),
          makeCard({
            id: 'b',
            player: 'Julio Rodriguez',
            year: 2019,
            manufacturer: 'Bowman',
            set: 'Silver /499',
            cardNumber: 'BCP-33',
            purchasePrice: 30,
            currentValue: 35,
          }),
          makeCard({
            id: 'sold',
            player: 'Sold',
            status: 'sold',
            purchasePrice: 10,
            salePrice: 25,
            currentValue: 25,
          }),
          makeCard({
            id: 'stale',
            player: 'Stale Tape',
            purchasePrice: 50,
            currentValue: 200,
            salesData: [{ title: 'old', price: 80, condition: 'raw', soldAt: '2020-01-01' }],
          }),
        ]}
      />,
    );

    expect(screen.getByRole('region', { name: /portfolio book insights/i })).toBeInTheDocument();
    expect(screen.getByText(PORTFOLIO_INSIGHTS_DISCLOSURE)).toBeInTheDocument();
    expect(screen.getByText(/Includes \$20 in fees/)).toBeInTheDocument();
    expect(screen.getByText(/1 sold/)).toBeInTheDocument();
    expect(screen.getByText(/uses a sold-comp median/i)).toBeInTheDocument();
    expect(screen.getByRole('list', { name: /book insight notes/i })).toBeInTheDocument();
    expect(screen.getByText('1 duplicate stack')).toBeInTheDocument();
    expect(screen.getByText('PSA')).toBeInTheDocument();
    expect(screen.getByText('Numbered /100–/499')).toBeInTheDocument();
    expect(screen.getAllByText(/Julio Rodriguez/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Stale Tape/).length).toBeGreaterThan(0);
  });

  it('states when nothing is above or below cost and when there are no duplicates', () => {
    render(
      <PortfolioInsightsPanel
        inventory={[makeCard({ id: 'flat', player: 'Flat', purchasePrice: 20, currentValue: 20, set: 'Paper' })]}
      />,
    );
    expect(screen.getByText(/No holdings are above all-in cost/i)).toBeInTheDocument();
    expect(screen.getByText(/No holdings are below all-in cost/i)).toBeInTheDocument();
    expect(screen.getByText(/No duplicate stacks/i)).toBeInTheDocument();
    expect(screen.getByText(/No sold cards/)).toBeInTheDocument();
    expect(screen.queryByText(/sold-comp median/i)).not.toBeInTheDocument();
  });

  it('shows an empty mix when every card is already sold', () => {
    render(
      <PortfolioInsightsPanel
        inventory={[
          makeCard({ id: 'sold', status: 'sold', purchasePrice: 10, salePrice: 0, currentValue: 10, player: 'Gone' }),
        ]}
      />,
    );
    expect(screen.getAllByText(/Nothing to mix/i).length).toBe(3);
    expect(screen.getByText(/No holdings are above all-in cost/i)).toBeInTheDocument();
  });
});
