export type HeaderSyncLabel = 'demo' | 'saving' | 'loading' | 'error' | 'synced';

export function resolveHeaderSyncLabel(input: {
  demoSession: boolean;
  syncing: boolean;
  hydrated: boolean;
  lastError: string | null;
}): HeaderSyncLabel {
  if (input.demoSession) return 'demo';
  if (input.syncing) return 'saving';
  if (!input.hydrated) return 'loading';
  if (input.lastError) return 'error';
  return 'synced';
}

export function headerSyncCopy(
  label: HeaderSyncLabel,
  lastError: string | null,
): { title: string; ariaLabel: string } {
  switch (label) {
    case 'demo':
      return {
        title: 'Demo data on this device',
        ariaLabel: 'Demo data on this device',
      };
    case 'saving':
      return { title: 'Saving...', ariaLabel: 'Saving data' };
    case 'loading':
      return { title: 'Loading...', ariaLabel: 'Loading data' };
    case 'error':
      return {
        title: lastError ?? 'Sync Error',
        ariaLabel: `Sync error: ${lastError ?? 'Sync Error'}`,
      };
    default:
      return { title: 'Cloud Sync Active', ariaLabel: 'Cloud sync active' };
  }
}
