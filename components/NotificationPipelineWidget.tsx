import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  DollarSign,
  Gavel,
  Globe,
  Layers,
  Settings,
  Shield,
  TrendingUp,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  NotificationChannel,
  ALL_CHANNELS,
  CHANNEL_LABELS,
  RealtimeNotification,
  getNotificationManager,
  WebSocketConnectionState,
  NotificationPreference,
} from '../lib/realTimeNotificationService';

const CHANNEL_ICONS: Record<NotificationChannel, React.ReactNode> = {
  price_alert: <DollarSign size={12} />,
  auction_ending: <Gavel size={12} />,
  grading_update: <Shield size={12} />,
  trade_offer: <Users size={12} />,
  market_movement: <TrendingUp size={12} />,
  portfolio_change: <Layers size={12} />,
  social_mention: <Globe size={12} />,
  system: <Settings size={12} />,
};

const PRIORITY_DOTS: Record<string, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-blue-500',
  low: 'bg-slate-500',
};

function formatTimeAgo(timestamp: string): string {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffMs / 60000);
  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  return `${Math.floor(diffMin / 60)}h ago`;
}

const NotificationPipelineWidget: React.FC = () => {
  const manager = getNotificationManager();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionState, setConnectionState] = useState<WebSocketConnectionState>('disconnected');
  const [preferences, setPreferencesLocal] = useState<NotificationPreference[]>([]);

  const refresh = useCallback(() => {
    const items = manager.getNotificationHistory({ limit: 3 });
    setNotifications(items);
    const stats = manager.getStats();
    setUnreadCount(stats.totalUnread);
    setPreferencesLocal(manager.getPreferences());
  }, [manager]);

  useEffect(() => {
    manager.connect();
    refresh();

    const unsub = manager.subscribe('*', () => {
      refresh();
    });

    const unsubState = manager.onConnectionStateChange((state) => {
      setConnectionState(state);
    });

    // Set initial connection state
    setConnectionState(manager.getConnectionState());

    const interval = setInterval(refresh, 5000);

    return () => {
      unsub();
      unsubState();
      clearInterval(interval);
      manager.disconnect();
    };
  }, [manager, refresh]);

  const handleToggleChannel = (channel: NotificationChannel) => {
    const updated = preferences.map((p) =>
      p.channel === channel ? { ...p, enabled: !p.enabled } : p
    );
    manager.setPreferences(updated);
    setPreferencesLocal(updated);
  };

  const isConnected = connectionState === 'connected';

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell size={18} className="text-blue-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 flex items-center justify-center px-1 text-[9px] font-bold rounded-full bg-red-500 text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Notifications</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          {isConnected ? (
            <Wifi size={12} className="text-green-500" />
          ) : (
            <WifiOff size={12} className="text-red-500" />
          )}
        </div>
      </div>

      {/* Recent notifications */}
      <div className="space-y-2 mb-3">
        {notifications.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No recent notifications</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-2 p-2 rounded-lg transition-colors ${
                n.isRead ? 'bg-slate-900/40' : 'bg-slate-700/40 border border-slate-600/50'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${PRIORITY_DOTS[n.priority]}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${n.isRead ? 'text-slate-400' : 'text-slate-200'}`}>
                  {n.title}
                </p>
                <p className="text-[10px] text-slate-500 truncate">{n.body}</p>
              </div>
              <span className="text-[9px] text-slate-600 flex-shrink-0">{formatTimeAgo(n.timestamp)}</span>
            </div>
          ))
        )}
      </div>

      {/* Channel quick toggles */}
      <div>
        <p className="text-[10px] text-slate-500 mb-1.5 uppercase tracking-wider">Channels</p>
        <div className="flex flex-wrap gap-1">
          {ALL_CHANNELS.map((ch) => {
            const pref = preferences.find((p) => p.channel === ch);
            const enabled = pref?.enabled ?? true;
            return (
              <button
                key={ch}
                onClick={() => handleToggleChannel(ch)}
                title={CHANNEL_LABELS[ch]}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] transition-colors ${
                  enabled
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    : 'bg-slate-900/60 text-slate-600 border border-slate-800'
                }`}
              >
                {CHANNEL_ICONS[ch]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default NotificationPipelineWidget;
