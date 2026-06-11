import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerCard,
  getMyRegisteredCards,
  initProvenanceService,
  _provenanceHydrationForTests,
} from '../../lib/core/provenanceChainService';
import { store } from '../../lib/dal/syncStore';
import { sealedStorage, _resetSealedStorageForTests } from '../../lib/dal/sealedStorage';

const SAMPLE_INPUT = {
  playerName: 'Test Player',
  cardDescription: 'Test 2024 #100',
  year: 2024,
  manufacturer: 'Topps',
  setName: 'Chrome',
  cardNumber: '100',
  currentValue: 250,
};

async function waitForSeal(key: string): Promise<void> {
  // The seal+persist on registerCard is fire-and-forget. Spin until the
  // stored value is the sealed token (or until a sensible cap is hit).
  for (let i = 0; i < 50; i++) {
    const raw = store.get<unknown>(key, null);
    if (sealedStorage.isSealed(raw)) return;
    await new Promise((r) => setTimeout(r, 5));
  }
}

describe('provenanceChainService — user-registered card persistence', () => {
  beforeEach(async () => {
    _resetSealedStorageForTests();
    store.set('msi_provenance_registered_v1__guest', null);
    store.set('msi_provenance_registered_v1__user-a', null);
    store.set('msi_provenance_registered_v1__user-b', null);
    initProvenanceService(null);
    await _provenanceHydrationForTests();
  });

  it('persists a newly registered card via the DAL, sealed at rest', async () => {
    initProvenanceService('user-a');
    await _provenanceHydrationForTests();
    const twin = registerCard(SAMPLE_INPUT, []);
    expect(twin.playerName).toBe('Test Player');
    expect(twin.owner).toBe('You');
    expect(twin.status).toBe('pending');

    await waitForSeal('msi_provenance_registered_v1__user-a');
    const stored = store.get<unknown>('msi_provenance_registered_v1__user-a', null);
    expect(sealedStorage.isSealed(stored)).toBe(true);
  });

  it('includes user-registered cards in getMyRegisteredCards alongside the seeded "You" mocks', async () => {
    initProvenanceService('user-a');
    await _provenanceHydrationForTests();
    const seededBefore = getMyRegisteredCards().length;
    registerCard(SAMPLE_INPUT, []);
    const after = getMyRegisteredCards();
    expect(after.length).toBe(seededBefore + 1);
    // Newest is at the head so the user immediately sees their submission.
    expect(after[0].playerName).toBe('Test Player');
  });

  it('does not leak entries across users on the same browser', async () => {
    initProvenanceService('user-a');
    await _provenanceHydrationForTests();
    registerCard({ ...SAMPLE_INPUT, playerName: 'A only' }, []);

    initProvenanceService('user-b');
    await _provenanceHydrationForTests();
    const bView = getMyRegisteredCards();
    expect(bView.some((t) => t.playerName === 'A only')).toBe(false);
  });

  it('falls back to the guest key when no user is set', async () => {
    initProvenanceService(null);
    await _provenanceHydrationForTests();
    registerCard({ ...SAMPLE_INPUT, playerName: 'Guest entry' }, []);
    await waitForSeal('msi_provenance_registered_v1__guest');
    const stored = store.get<unknown>('msi_provenance_registered_v1__guest', null);
    expect(sealedStorage.isSealed(stored)).toBe(true);
  });

  it('migrates a pre-seal plaintext entry on hydration', async () => {
    // Simulate a value persisted by an older build (before sealed storage).
    const preSealEntry = [{ playerName: 'Legacy', owner: 'You' }];
    store.set('msi_provenance_registered_v1__user-a', preSealEntry);
    initProvenanceService('user-a');
    await _provenanceHydrationForTests();
    expect(getMyRegisteredCards().some((t) => t.playerName === 'Legacy')).toBe(true);
  });

  it('drops a stale hydration if init is called again before it completes', async () => {
    // Seed sealed data for user-a so its hydration is async (has a real
    // unseal await inside hydrateFromSealed).
    initProvenanceService('user-a');
    await _provenanceHydrationForTests();
    registerCard({ ...SAMPLE_INPUT, playerName: 'A only' }, []);
    await waitForSeal('msi_provenance_registered_v1__user-a');

    // Now simulate a fast user switch: kick off A's hydration, then
    // immediately initialize user-b before A's await resolves.
    initProvenanceService('user-a');
    const aHydration = _provenanceHydrationForTests();
    initProvenanceService('user-b');
    await aHydration;
    await _provenanceHydrationForTests();

    // user-b's cache must not contain A's 'A only' entry — the stale
    // hydration from A's generation must not stomp on B's cleared cache.
    const bView = getMyRegisteredCards();
    expect(bView.some((t) => t.playerName === 'A only')).toBe(false);
  });
});
