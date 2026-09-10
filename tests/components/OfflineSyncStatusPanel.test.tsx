import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OFFLINE_SYNC_DISCLOSURE } from '../../lib/utils/offlineSyncStatus';

const retryFailed = vi.fn();
const triggerSync = vi.fn();

vi.mock('../../lib/utils/useOfflineStatus', () => ({
  useOfflineStatus: () => ({
    isOnline: true,
    isSyncing: false,
    pendingCount: 1,
    failedCount: 1,
    triggerSync,
    retryFailed,
    syncQueue: [
      {
        id: 'p',
        action: 'update',
        entity: 'card',
        payload: {},
        timestamp: 1,
        retryCount: 0,
        maxRetries: 5,
        status: 'pending',
        priority: 1,
      },
      {
        id: 'f',
        action: 'update',
        entity: 'card',
        payload: {},
        timestamp: 1,
        retryCount: 2,
        maxRetries: 5,
        status: 'failed',
        priority: 1,
      },
    ],
  }),
}));

import OfflineSyncStatusPanel from '../../components/OfflineSyncStatusPanel';

describe('OfflineSyncStatusPanel', () => {
  it('shows real pending/failed counts and retry affordances', async () => {
    const user = userEvent.setup();
    render(<OfflineSyncStatusPanel />);
    expect(screen.getByRole('region', { name: /offline sync status/i })).toBeInTheDocument();
    expect(screen.getByText(OFFLINE_SYNC_DISCLOSURE)).toBeInTheDocument();
    expect(screen.getByText(/1 pending · 1 failed/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /requeue failed/i }));
    expect(retryFailed).toHaveBeenCalled();
  });
});
