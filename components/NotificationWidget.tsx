// @ts-nocheck
import React, { useMemo } from 'react';
import {
  Bell,
  ChevronRight,
  AlertTriangle,
  TrendingUp,
  Shield,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  getNotificationSummary,
  NotificationPriority,
  NotificationCategory,
  NotificationSummary,
} from '../lib/utils/notificationCenterService';

interface NotificationWidgetProps {
  cards: CardInventory[];
  onClick?: () => void;
}

const priorityConfig: Record<NotificationPriority, { dot: string; text: string }> = {
  critical: { dot: 'bg-red-500', text: 'text-red-400' },
  high: { dot: 'bg-amber-500', text: 'text-amber-400' },
  medium: { dot: 'bg-blue-500', text: 'text-blue-400' },
  low: { dot: 'bg-slate-400', text: 'text-slate-400' },
};

const categoryIcons: Record<NotificationCategory, React.ReactNode> = {
  Trading: <TrendingUp size={12} />,
  Analytics: <Zap size={12} />,
  Social: <Users size={12} />,
  Alerts: <AlertTriangle size={12} />,
  Achievements: <Trophy size={12} />,
  System: <Shield size={12} />,
};

const categoryColors: Record<NotificationCategory, string> = {
  Trading: 'text-green-400',
  Analytics: 'text-purple-400',
  Social: 'text-cyan-400',
  Alerts: 'text-amber-400',
  Achievements: 'text-yellow-400',
  System: 'text-red-400',
};

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const NotificationWidget: React.FC<NotificationWidgetProps> = ({ cards, onClick }) => {
  const summary: NotificationSummary = useMemo(
    () => getNotificationSummary(cards),
    [cards]
  );

  const topNotifications = summary.topPriority;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
            <Bell size={22} />
            {summary.totalUnread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 flex items-center justify-center px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {summary.totalUnread > 99 ? '99+' : summary.totalUnread}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Notification <span className="text-blue-400">Center</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Unified command inbox
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Summary Stats */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-medium">Unread:</span>
          <span className="font-bebas text-lg text-white tracking-wider">
            {summary.totalUnread}
          </span>
        </div>
        <div className="h-5 w-px bg-slate-700" />
        {summary.criticalUnread > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 font-mono">{summary.criticalUnread}</span>
          </div>
        )}
        {summary.highUnread > 0 && (
          <div className="flex items-center gap-1 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-amber-400 font-mono">{summary.highUnread}</span>
          </div>
        )}
        <div className="ml-auto text-xs text-slate-400">
          Total: <span className="font-mono text-white">{summary.totalCount}</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-3 gap-2">
        {(['Alerts', 'Trading', 'Analytics', 'System', 'Achievements', 'Social'] as NotificationCategory[]).map(
          (cat) =>
            summary.categoryUnread[cat] > 0 && (
              <div
                key={cat}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/30 rounded-lg text-xs"
              >
                <span className={categoryColors[cat]}>{categoryIcons[cat]}</span>
                <span className="text-slate-300 truncate">{cat}</span>
                <span className={`ml-auto font-mono font-bold ${categoryColors[cat]}`}>
                  {summary.categoryUnread[cat]}
                </span>
              </div>
            )
        )}
      </div>

      {/* Top Priority Notifications */}
      {topNotifications.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">
            Top Priority
          </p>
          {topNotifications.map((n) => {
            const pCfg = priorityConfig[n.priority];
            return (
              <div
                key={n.id}
                className="flex items-center gap-3 px-3 py-2.5 bg-slate-800/30 hover:bg-slate-800/60 border border-slate-700/50 rounded-xl text-left transition-all"
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${pCfg.dot} ${n.priority === 'critical' ? 'animate-pulse' : ''}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{n.title}</p>
                  <p className="text-[11px] text-slate-500 truncate">{n.message}</p>
                </div>
                <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${pCfg.text}`}>
                    {n.priority}
                  </span>
                  <span className="text-[10px] text-slate-600">{formatTimeAgo(n.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {topNotifications.length === 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-500/5 border border-green-500/15 rounded-xl">
          <Bell size={14} className="text-green-400 flex-shrink-0" />
          <span className="text-xs text-slate-400">All caught up — no unread notifications</span>
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center justify-center gap-2 pt-1 text-xs text-slate-500 group-hover:text-brand-lime transition-colors">
        <span className="font-medium">Open Notification Center</span>
        <ChevronRight size={14} />
      </div>
    </button>
  );
};

export default NotificationWidget;
