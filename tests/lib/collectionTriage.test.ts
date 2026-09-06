import { beforeEach, describe, expect, it } from 'vitest';
import { store } from '../../lib/dal/syncStore';
import {
  addToTriageReview,
  getTriageReviewIds,
  isInTriageReview,
  toggleTriageReview,
} from '../../lib/utils/collectionTriage';

describe('collectionTriage review queue', () => {
  beforeEach(() => {
    store.remove('msi_collection_triage_review');
  });

  it('adds, toggles, and reports review membership', () => {
    expect(getTriageReviewIds()).toEqual([]);
    addToTriageReview('a');
    expect(isInTriageReview('a')).toBe(true);
    const removed = toggleTriageReview('a');
    expect(removed.added).toBe(false);
    expect(isInTriageReview('a')).toBe(false);
    const added = toggleTriageReview('a');
    expect(added.added).toBe(true);
    expect(added.ids).toEqual(['a']);
  });
});
