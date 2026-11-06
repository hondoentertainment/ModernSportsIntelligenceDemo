import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HoldCallAlerts from '../../components/HoldCallAlerts';
import CollectorAlertDigest from '../../components/CollectorAlertDigest';
import type { HoldCallAlert } from '../../lib/collector/holdCallAlert';
import { store } from '../../lib/dal/syncStore';
import { HAGGLE_KEY } from '../../lib/shows/showHaggleLog';
import { floorBuyId } from '../../lib/collector/showClose';

const row = (overrides: Partial<HoldCallAlert> = {}): HoldCallAlert => ({
  id: 'hold:floor:near',
  cardId: 'floor:near',
  player: 'Near',
  call: 'hold',
  daysToLongTerm: 20,
  title: 'Near · hold',
  detail: 'Entered the hold window. 20 days to long-term. Still ahead after the ~4% card-show fee. Not a tax determination.',
  href: '/audit-dossier?cardId=floor%3Anear',
  ...overrides,
});

describe('Hold call alerts', () => {
  it('names the card, the call, the days, and links to that card', () => {
    render(
      <MemoryRouter>
        <HoldCallAlerts rows={[row(), row({
          id: 'hold:clear',
          cardId: 'floor:booked',
          player: 'Booked',
          call: 'clear',
          daysToLongTerm: 0,
          title: 'Booked · clear',
          detail: 'Crossed into long-term and is clear. Still ahead after the ~4% card-show fee. Not a tax determination.',
          href: '/audit-dossier?cardId=floor%3Abooked',
        })]} />
      </MemoryRouter>,
    );
    const section = screen.getByRole('region', { name: 'Hold call alerts' });
    expect(section).toHaveTextContent(/not a tax determination/i);
    expect(section).toHaveTextContent('Near · hold');
    expect(section).toHaveTextContent(/20 days to long-term/);
    expect(section).toHaveTextContent('Booked · clear');
    expect(screen.getByRole('link', { name: 'Open Near' })).toHaveAttribute('href', '/audit-dossier?cardId=floor%3Anear');
    expect(screen.getByRole('link', { name: 'Open Near' })).toHaveClass('min-h-[44px]');
  });

  it('says when no unsold card needs a call', () => {
    render(
      <MemoryRouter>
        <HoldCallAlerts rows={[]} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/no unsold card is in the hold window/i)).toBeInTheDocument();
  });

  it('shows a filed unsold card on the alert digest', () => {
    const boughtAt = new Date(Date.parse('2026-10-31T12:00:00.000Z') - 330 * 24 * 60 * 60 * 1000).toISOString();
    store.set(HAGGLE_KEY, [{
      id: 'near-buy',
      showId: 'nyc',
      dealer: 'Ada',
      table: '1',
      askUsd: 20,
      offerUsd: 20,
      result: 'bought',
      note: '',
      player: 'Near',
      savedAt: boughtAt,
    }]);
    const inventory = [{
      id: floorBuyId('near-buy'),
      player: 'Near',
      year: 2024,
      manufacturer: 'Topps',
      cardNumber: '1',
      set: 'Chrome',
      sport: 'Baseball' as const,
      league: 'MLB' as const,
      isAutographed: false,
      condition: 'Raw',
      isGraded: false,
      purchasePrice: 20,
      purchaseDate: boughtAt,
      currentValue: 80,
      status: 'active' as const,
      taxBasis: 20,
    }];
    render(
      <MemoryRouter>
        <CollectorAlertDigest targets={[]} inventory={inventory} />
      </MemoryRouter>,
    );
    const digest = screen.getByRole('region', { name: /watchlist and show alert digest/i });
    expect(digest).toHaveTextContent('Near · hold');
    expect(digest).toHaveTextContent(/days to long-term/);
    expect(digest).toHaveTextContent(/not a tax determination/i);
    expect(screen.getByRole('link', { name: 'Open Near' })).toHaveAttribute('href', '/audit-dossier?cardId=floor%3Anear-buy');
  });
});
