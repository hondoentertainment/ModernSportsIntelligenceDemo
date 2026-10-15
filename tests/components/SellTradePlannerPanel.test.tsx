import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import React, { act } from 'react';
import SellTradePlannerPanel from '../../components/SellTradePlannerPanel';
import { SELL_TRADE_PLANNER_DISCLOSURE } from '../../lib/analytics/sellTradePlanner';
import { setTaxLotMethod, setTaxLotPreferences, toggleSpecificLotId } from '../../lib/utils/taxLotPreferences';
import { setPlace } from '../../lib/collector/deskNext';
import { makeCard } from '../helpers';

const AS_OF_PURCHASE = '2020-01-01';

describe('SellTradePlannerPanel', () => {
  beforeEach(() => {
    localStorage.clear();
    setTaxLotPreferences({ method: 'FIFO', specificLotIds: [] });
  });

  it('renders nothing for an empty book', () => {
    const { container } = render(
      <MemoryRouter>
        <SellTradePlannerPanel inventory={[]} />
      </MemoryRouter>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('lists a trade-in and a sale, and the filter hides the other action', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SellTradePlannerPanel
          inventory={[
            makeCard({
              id: 'keep',
              player: 'Julio Rodriguez',
              year: 2019,
              manufacturer: 'Bowman',
              set: 'Chrome',
              cardNumber: '1',
              purchasePrice: 40,
              currentValue: 180,
              purchaseDate: AS_OF_PURCHASE,
              isGraded: true,
              gradingCompany: 'PSA',
              grade: '10',
            }),
            makeCard({
              id: 'extra',
              player: 'Julio Rodriguez',
              year: 2019,
              manufacturer: 'Bowman',
              set: 'Chrome',
              cardNumber: '1',
              purchasePrice: 30,
              currentValue: 70,
              purchaseDate: AS_OF_PURCHASE,
            }),
            makeCard({
              id: 'loser',
              player: 'Cost Basis',
              purchasePrice: 150,
              currentValue: 40,
              purchaseDate: AS_OF_PURCHASE,
            }),
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('region', { name: /sell and trade-in planner/i })).toBeInTheDocument();
    expect(screen.getByText(SELL_TRADE_PLANNER_DISCLOSURE)).toBeInTheDocument();
    expect(screen.getByText(/not IRS Form 8949 completeness/i)).toBeInTheDocument();
    expect(screen.queryByText(/live market movers/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /tax-lot method/i })).toHaveAttribute('href', '/tax-report');
    expect(screen.getByRole('link', { name: /card-show desk/i })).toHaveAttribute('href', '/local-card-shows');
    expect(screen.getByRole('radio', { name: 'All' })).toHaveClass('min-h-[44px]');
    expect(screen.getAllByText(/Julio Rodriguez/).length).toBeGreaterThan(0);
    expect(screen.getByText('Cost Basis')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Sell' }));
    expect(screen.getByText('Cost Basis')).toBeInTheDocument();
    expect(screen.queryByText('Julio Rodriguez')).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Hold' }));
    expect(screen.getByText(/nothing in this filter/i)).toBeInTheDocument();
  });

  it('names the saved place for a sell card', () => {
    setPlace('loser', 'slab');
    render(
      <MemoryRouter>
        <SellTradePlannerPanel
          inventory={[makeCard({
            id: 'loser',
            player: 'Cost Basis',
            purchasePrice: 150,
            currentValue: 40,
            purchaseDate: AS_OF_PURCHASE,
          })]}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('Pull from Slab case')).toBeInTheDocument();
  });

  it('shows the honest empty line when the book has no sell or trade-in', () => {
    render(
      <MemoryRouter>
        <SellTradePlannerPanel
          inventory={[makeCard({ id: 'flat', player: 'Flat', purchasePrice: 20, currentValue: 24, purchaseDate: AS_OF_PURCHASE })]}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText(/nothing in this book stands out/i)).toBeInTheDocument();
  });

  it('rebuilds when the saved tax-lot method or specific lots change', () => {
    render(
      <MemoryRouter>
        <SellTradePlannerPanel
          inventory={[
            makeCard({
              id: 'keep',
              player: 'Julio Rodriguez',
              year: 2019,
              manufacturer: 'Bowman',
              set: 'Chrome',
              cardNumber: '1',
              purchasePrice: 40,
              currentValue: 180,
              purchaseDate: AS_OF_PURCHASE,
              isGraded: true,
              gradingCompany: 'PSA',
              grade: '10',
            }),
            makeCard({
              id: 'extra',
              player: 'Julio Rodriguez',
              year: 2019,
              manufacturer: 'Bowman',
              set: 'Chrome',
              cardNumber: '1',
              purchasePrice: 30,
              currentValue: 70,
              purchaseDate: AS_OF_PURCHASE,
            }),
          ]}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText(/net of fees · FIFO/i)).toBeInTheDocument();
    expect(screen.getByText(/Extra copy/i)).toBeInTheDocument();

    act(() => {
      setTaxLotMethod('SpecificID');
    });
    expect(screen.getByText(/net of fees · SpecificID/i)).toBeInTheDocument();
    expect(screen.getByText(/no lots are marked/i)).toBeInTheDocument();
    expect(screen.queryByText(/Extra copy/i)).not.toBeInTheDocument();

    act(() => {
      toggleSpecificLotId('extra');
    });
    expect(screen.getByText(/Extra copy/i)).toBeInTheDocument();
  });
});
