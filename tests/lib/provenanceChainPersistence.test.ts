import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerCard,
  getMyRegisteredCards,
  initProvenanceService,
} from '../../lib/core/provenanceChainService';
import { store } from '../../lib/dal/syncStore';

const SAMPLE_INPUT = {
  playerName: 'Test Player',
  cardDescription: 'Test 2024 #100',
  year: 2024,
  manufacturer: 'Topps',
  setName: 'Chrome',
  cardNumber: '100',
  currentValue: 250,
};

describe('provenanceChainService — user-registered card persistence', () => {
  beforeEach(() => {
    // Clear all msi_provenance_registered_v1__* keys between tests.
    initProvenanceService(null);
    store.set('msi_provenance_registered_v1__guest', []);
    store.set('msi_provenance_registered_v1__user-a', []);
    store.set('msi_provenance_registered_v1__user-b', []);
  });

  it('persists a newly registered card via the DAL', () => {
    initProvenanceService('user-a');
    const twin = registerCard(SAMPLE_INPUT, []);
    expect(twin.playerName).toBe('Test Player');
    expect(twin.owner).toBe('You');
    expect(twin.status).toBe('pending');

    const stored = store.get<unknown[]>('msi_provenance_registered_v1__user-a', []);
    expect(stored.length).toBe(1);
  });

  it('includes user-registered cards in getMyRegisteredCards alongside the seeded "You" mocks', () => {
    initProvenanceService('user-a');
    const seededBefore = getMyRegisteredCards().length;
    registerCard(SAMPLE_INPUT, []);
    const after = getMyRegisteredCards();
    expect(after.length).toBe(seededBefore + 1);
    // Newest is at the head so the user immediately sees their submission.
    expect(after[0].playerName).toBe('Test Player');
  });

  it('does not leak entries across users on the same browser', () => {
    initProvenanceService('user-a');
    registerCard({ ...SAMPLE_INPUT, playerName: 'A only' }, []);
    initProvenanceService('user-b');
    const bView = getMyRegisteredCards();
    expect(bView.some((t) => t.playerName === 'A only')).toBe(false);

    // Switching back to user-a recovers their entry.
    initProvenanceService('user-a');
    const aView = getMyRegisteredCards();
    expect(aView.some((t) => t.playerName === 'A only')).toBe(true);
  });

  it('falls back to the guest key when no user is set', () => {
    initProvenanceService(null);
    registerCard({ ...SAMPLE_INPUT, playerName: 'Guest entry' }, []);
    const stored = store.get<unknown[]>('msi_provenance_registered_v1__guest', []);
    expect(stored.length).toBe(1);
  });
});
