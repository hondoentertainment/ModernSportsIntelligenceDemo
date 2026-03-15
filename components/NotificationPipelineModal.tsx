import React, { useEffect, useRef } from 'react';
import {
  Bell,
  BellOff,
  Check,
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
  X,
  CheckCheck,
} from 'lucide-react';
import {
  NotificationChannel,
  CHANNEL_LABELS,
  NotificationPriority,
} from '../lib/realTimeNotificationService';
import { useRealtimeNotifications } from '../lib/useRealtimeNotifications';

const CHANNEL_ICONS: Record<NotificationChannel, React.ReactNode> = {
  price_alert: <DollarSign size={14} />,
  auction_ending: <Gavel size={14} />,
  grading_update: <Shield size={14} />,
  trade_offer: <Users size={14} />,
  market_movement: <TrendingUp size={14} />,
  portfolio_change: <Layers size={14} />,
  social_mention: <Globe size={14} />,
  system: <Settings size={14} />,
};

const PRIORITY_DOTS: Record<NotificationPriority, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-blue-500',
  low: 'bg-slate-500',
};

const PRIORITY_COLORS: Record<NotificationPriority, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
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

interface NotificationPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPipelineModal: React.FC<NotificationPipelineModalProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    connectionState,
    markAsRead,
    markAllRead,
    dismiss,
  } = useRealtimeNotifications();

  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isConnected = connectionState === 'connected';
  const recentNotifications = notifications.slice(0, 15);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden animate-fade-in z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell size={20} className="text-blue-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 flex items-center justify-center px-0.5 text-[8px] font-bold rounded-full bg-red-500 text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Notifications</h2>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-[10px] text-slate-500">
                  {isConnected ? 'Live' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => markAllRead()}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <CheckCheck size={12} />
              Read All
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="max-h-[60vh] overflow-y-auto">
          {recentNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <BellOff size={32} className="mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {recentNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`group flex items-start gap-3 px-5 py-3 transition-colors hover:bg-slate-800/50 ${
                    !n.isRead ? 'bg-blue-500/5' : ''
                  }`}
                >
                  {/* Channel icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    n.isRead ? 'bg-slate-800 text-slate-500' : 'bg-blue-500/10 text-blue-400'
                  }`}>
                    {CHANNEL_ICONS[n.channel]}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-xs font-semibold ${n.isRead ? 'text-slate-400' : 'text-slate-100'}`}>
                        {n.title}
                      </h4>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${PRIORITY_COLORS[n.priority]}`}>
                          {n.priority}
                        </span>
                      </div>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${n.isRead ? 'text-slate-600' : 'text-slate-400'}`}>
                      {n.body}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[9px] text-slate-600">{formatTimeAgo(n.timestamp)}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.isRead && (
                          <button
                            onClick={() => markAsRead(n.id)}
                            className="p-1 rounded text-blue-400 hover:bg-blue-500/10 transition-colors"
                            title="Mark as read"
                          >
                            <Check size={10} />
                          </button>
                        )}
                        <button
                          onClick={() => dismiss(n.id)}
                          className="p-1 rounded text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Dismiss"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Unread indicator */}
                  {!n.isRead && (
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${PRIORITY_DOTS[n.priority]}`} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-600">
            {notifications.length} total &middot; {unreadCount} unread
          </span>
          <button
            onClick={onClose}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            View All in Notification Center
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPipelineModal;
