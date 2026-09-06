import { store } from '../dal/syncStore';

const REVIEW_QUEUE_KEY = 'msi_collection_triage_review';

export function getTriageReviewIds(): string[] {
  const raw = store.get<string[]>(REVIEW_QUEUE_KEY, []);
  return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === 'string' && id.length > 0) : [];
}

export function isInTriageReview(cardId: string): boolean {
  return getTriageReviewIds().includes(cardId);
}

export function addToTriageReview(cardId: string): string[] {
  const next = Array.from(new Set([...getTriageReviewIds(), cardId]));
  store.set(REVIEW_QUEUE_KEY, next);
  return next;
}

export function removeFromTriageReview(cardId: string): string[] {
  const next = getTriageReviewIds().filter((id) => id !== cardId);
  store.set(REVIEW_QUEUE_KEY, next);
  return next;
}

export function toggleTriageReview(cardId: string): { ids: string[]; added: boolean } {
  if (isInTriageReview(cardId)) {
    return { ids: removeFromTriageReview(cardId), added: false };
  }
  return { ids: addToTriageReview(cardId), added: true };
}
