/**
 * Offline queue summary + retry helpers (lite).
 * Counts real store-backed items only — never seeds mock pending rows.
 */
import type { SyncQueueItem } from './offlineService';

export const OFFLINE_SYNC_DISCLOSURE =
  'Shows the real local sync queue only. Pending and failed counts come from MSI store — demo preview rows are not mixed in.';

export interface OfflineSyncSummary {
  pending: number;
  failed: number;
  processing: number;
  completed: number;
  total: number;
}

export function summarizeSyncQueue(items: SyncQueueItem[]): OfflineSyncSummary {
  const pending = items.filter((item) => item.status === 'pending').length;
  const failed = items.filter((item) => item.status === 'failed').length;
  const processing = items.filter((item) => item.status === 'processing').length;
  const completed = items.filter((item) => item.status === 'completed').length;
  return {
    pending,
    failed,
    processing,
    completed,
    total: items.length,
  };
}

export function markFailedForRetry(items: SyncQueueItem[]): SyncQueueItem[] {
  return items.map((item) =>
    item.status === 'failed'
      ? { ...item, status: 'pending', error: undefined }
      : item,
  );
}

export function formatOfflineSyncLine(summary: OfflineSyncSummary): string {
  if (summary.total === 0) {
    return 'No queued sync actions on this device.';
  }
  const parts: string[] = [];
  if (summary.pending > 0) {
    parts.push(`${summary.pending} pending`);
  }
  if (summary.failed > 0) {
    parts.push(`${summary.failed} failed`);
  }
  if (summary.processing > 0) {
    parts.push(`${summary.processing} in flight`);
  }
  if (parts.length === 0) {
    return `${summary.total} queued item${summary.total === 1 ? '' : 's'} (none pending).`;
  }
  return parts.join(' · ');
}
