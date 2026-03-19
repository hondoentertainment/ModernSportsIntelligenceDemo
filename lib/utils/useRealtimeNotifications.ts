import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getNotificationManager,
  RealtimeNotification,
  NotificationChannel,
  WebSocketConnectionState,
  NotificationStats,
  NotificationPreference,
  NotificationDigest,
  NotificationRule,
  NotificationFilter,
} from './realTimeNotificationService';

export interface UseRealtimeNotificationsReturn {
  notifications: RealtimeNotification[];
  unreadCount: number;
  connectionState: WebSocketConnectionState;
  stats: NotificationStats;
  preferences: NotificationPreference[];
  rules: NotificationRule[];
  markAsRead: (id: string) => void;
  markAllRead: (channel?: NotificationChannel) => void;
  dismiss: (id: string) => void;
  dismissAll: (channel?: NotificationChannel) => void;
  setPreferences: (prefs: NotificationPreference[]) => void;
  createRule: (rule: Omit<NotificationRule, 'id' | 'createdAt' | 'triggeredCount'>) => void;
  deleteRule: (id: string) => void;
  toggleRule: (id: string) => void;
  getDigest: (period: 'hourly' | 'daily' | 'weekly') => NotificationDigest;
  applyFilter: (filter: NotificationFilter) => void;
}

export function useRealtimeNotifications(
  channels?: NotificationChannel[]
): UseRealtimeNotificationsReturn {
  const manager = getNotificationManager();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [connectionState, setConnectionState] = useState<WebSocketConnectionState>(
    manager.getConnectionState()
  );
  const [stats, setStats] = useState<NotificationStats>(manager.getStats());
  const [preferences, setPreferencesState] = useState<NotificationPreference[]>(
    manager.getPreferences()
  );
  const [rules, setRules] = useState<NotificationRule[]>(manager.getRules());
  const filterRef = useRef<NotificationFilter | undefined>(
    channels ? { channels } : undefined
  );

  const refreshNotifications = useCallback(() => {
    const items = manager.getNotificationHistory(filterRef.current);
    setNotifications(items);
    setStats(manager.getStats());
    setRules(manager.getRules());
  }, [manager]);

  useEffect(() => {
    // Connect on mount
    manager.connect();

    // Load initial data
    refreshNotifications();

    // Subscribe to new notifications
    const unsubs: (() => void)[] = [];

    if (channels && channels.length > 0) {
      channels.forEach((ch) => {
        const unsub = manager.subscribe(ch, () => {
          refreshNotifications();
        });
        unsubs.push(unsub);
      });
    } else {
      const unsub = manager.subscribe('*', () => {
        refreshNotifications();
      });
      unsubs.push(unsub);
    }

    // Subscribe to connection state
    const unsubState = manager.onConnectionStateChange((state) => {
      setConnectionState(state);
    });
    unsubs.push(unsubState);

    // Poll stats every 5 seconds for freshness
    const statInterval = setInterval(() => {
      setStats(manager.getStats());
    }, 5000);

    return () => {
      unsubs.forEach((u) => u());
      clearInterval(statInterval);
      manager.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markAsRead = useCallback(
    (id: string) => {
      manager.markAsRead(id);
      refreshNotifications();
    },
    [manager, refreshNotifications]
  );

  const markAllRead = useCallback(
    (channel?: NotificationChannel) => {
      manager.markAllRead(channel);
      refreshNotifications();
    },
    [manager, refreshNotifications]
  );

  const dismiss = useCallback(
    (id: string) => {
      manager.dismiss(id);
      refreshNotifications();
    },
    [manager, refreshNotifications]
  );

  const dismissAll = useCallback(
    (channel?: NotificationChannel) => {
      manager.dismissAll(channel);
      refreshNotifications();
    },
    [manager, refreshNotifications]
  );

  const setPreferences = useCallback(
    (prefs: NotificationPreference[]) => {
      manager.setPreferences(prefs);
      setPreferencesState(prefs);
    },
    [manager]
  );

  const createRule = useCallback(
    (rule: Omit<NotificationRule, 'id' | 'createdAt' | 'triggeredCount'>) => {
      manager.createRule(rule);
      setRules(manager.getRules());
    },
    [manager]
  );

  const deleteRule = useCallback(
    (id: string) => {
      manager.deleteRule(id);
      setRules(manager.getRules());
    },
    [manager]
  );

  const toggleRule = useCallback(
    (id: string) => {
      manager.toggleRule(id);
      setRules(manager.getRules());
    },
    [manager]
  );

  const getDigest = useCallback(
    (period: 'hourly' | 'daily' | 'weekly') => {
      return manager.getDigest(period);
    },
    [manager]
  );

  const applyFilter = useCallback(
    (filter: NotificationFilter) => {
      filterRef.current = filter;
      refreshNotifications();
    },
    [refreshNotifications]
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    connectionState,
    stats,
    preferences,
    rules,
    markAsRead,
    markAllRead,
    dismiss,
    dismissAll,
    setPreferences,
    createRule,
    deleteRule,
    toggleRule,
    getDigest,
    applyFilter,
  };
}

export default useRealtimeNotifications;
