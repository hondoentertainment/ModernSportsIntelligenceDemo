import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { store } from '../../lib/dal/syncStore';
import { IN_APP_ALERTS_KEY, IN_APP_ALERTS_UPDATED_EVENT } from '../../lib/utils/alertPreferences';
import { useAlerts } from '../../lib/utils/useAlerts';

describe('useAlerts inbox refresh', () => {
  it('reloads when a show alert writes the in-app inbox', () => {
    store.remove(IN_APP_ALERTS_KEY);
    const { result } = renderHook(() => useAlerts());
    expect(result.current.unreadCount).toBe(0);
    act(() => {
      store.set(IN_APP_ALERTS_KEY, [{
        id: 'show-alert:nyc:2026-10-18',
        type: 'system',
        title: 'Card show in 5 days: NYC Monthly Card Meetup',
        description: 'Seeded calendar',
        timestamp: '2026-10-13T00:00:00.000Z',
        isRead: false,
        priority: 'medium',
      }]);
      window.dispatchEvent(new CustomEvent(IN_APP_ALERTS_UPDATED_EVENT));
    });
    expect(result.current.unreadCount).toBe(1);
    expect(result.current.alerts[0]?.title).toMatch(/NYC Monthly/i);
    store.remove(IN_APP_ALERTS_KEY);
  });
});
