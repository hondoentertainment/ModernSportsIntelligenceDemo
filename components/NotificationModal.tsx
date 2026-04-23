// @ts-nocheck
import React, { useMemo, useState, useCallback } from 'react';
import {
  X,
  Bell,
  BellOff,
  CheckCheck,
  Search,
  Filter,
  AlertTriangle,
  TrendingUp,
  Shield,
  Trophy,
  Users,
  Zap,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  Settings,
  FileText,
  Trash2,
  Calendar,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  Notification,
  NotificationCategory,
  NotificationPriority,
  DeliveryPreference,
  NotificationPreferences,
  getActiveNotifications,
  getNotifications,
  getNotificationSummary,
  groupNotifications,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  generateDailyDigest,
  loadPreferences,
  savePreferences,
  ALL_CATEGORIES,
} from '../lib/utils/notificationCenterService';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardInventory[];
}

type ModalTab = 'inbox' | 'grouped' | 'history' | 'digest' | 'preferences';
type SortMode = 'priority' | 'newest' | 'oldest';

const priorityConfig: Record<NotificationPriority, { dot: string; text: string; bg: string; border: string; label: string }> = {
  critical: { dot: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Critical' },
  high: { dot: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'High' },
  medium: { dot: 'bg-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', label: 'Medium' },
  low: { dot: 'bg-slate-400', text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30', label: 'Low' },
};

const categoryConfig: Record<NotificationCategory, { icon: React.ReactNode; color: string; bg: string }> = {
  Trading: { icon: <TrendingUp size={14} />, color: 'text-green-400', bg: 'bg-green-500/10' },
  Analytics: { icon: <Zap size={14} />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  Social: { icon: <Users size={14} />, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  Alerts: { icon: <AlertTriangle size={14} />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  Achievements: { icon: <Trophy size={14} />, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  System: { icon: <Shield size={14} />, color: 'text-red-400', bg: 'bg-red-500/10' },
};

const deliveryLabels: Record<DeliveryPreference, string> = {
  immediate: 'Immediate',
  daily_digest: 'Daily Digest',
  weekly_digest: 'Weekly Digest',
  muted: 'Muted',
};

const TAB_ITEMS: { id: ModalTab; label: string; icon: React.ReactNode }[] = [
  { id: 'inbox', label: 'Inbox', icon: <Bell size={14} /> },
  { id: 'grouped', label: 'Grouped', icon: <Filter size={14} /> },
  { id: 'history', label: 'History', icon: <Clock size={14} /> },
  { id: 'digest', label: 'Digest', icon: <FileText size={14} /> },
  { id: 'preferences', label: 'Settings', icon: <Settings size={14} /> },
];

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

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ---- Sub-components ----

const NotificationRow: React.FC<{
  notification: Notification;
  onRead: (_id: string) => void;
  onDismiss: (_id: string) => void;
  onAction: (_notification: Notification, _actionType: string) => void;
}> = ({ notification, onRead, onDismiss, onAction }) => {
  const pCfg = priorityConfig[notification.priority];
  const catCfg = categoryConfig[notification.category];

  return (
    <div
      className={`relative flex flex-col gap-2 px-4 py-3 rounded-xl border transition-all ${
        notification.isRead
          ? 'bg-slate-800/20 border-slate-800/50'
          : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${pCfg.dot} ${
            notification.priority === 'critical' ? 'animate-pulse' : ''
          }`}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`${catCfg.color}`}>{catCfg.icon}</span>
            <span className="text-sm font-semibold text-white truncate">{notification.title}</span>
            {!notification.isRead && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-slate-400 line-clamp-2">{notification.message}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={`text-[9px] font-black uppercase tracking-widest ${pCfg.text}`}>
            {notification.priority}
          </span>
          <span className="text-[10px] text-slate-600">{formatTimeAgo(notification.createdAt)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-5">
        {notification.actions.map((action) => (
          <button
            key={action.id}
            onClick={(e) => {
              e.stopPropagation();
              onAction(notification, action.type);
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${
              action.variant === 'primary'
                ? 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25 border border-blue-500/30'
                : action.variant === 'danger'
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 border border-slate-600/50'
            }`}
          >
            {action.label}
          </button>
        ))}
        {!notification.isRead && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRead(notification.id);
            }}
            className="ml-auto p-1 rounded-md text-slate-600 hover:text-slate-300 hover:bg-slate-700/50 transition-colors"
            title="Mark as read"
          >
            <Eye size={12} />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(notification.id);
          }}
          className="p-1 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Dismiss"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

// ---- Main Modal ----

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  cards,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('inbox');
  const [activeCategory, setActiveCategory] = useState<NotificationCategory | 'all'>('all');
  const [sortMode, setSortMode] = useState<SortMode>('priority');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [prefs, setPrefs] = useState<NotificationPreferences>(() => loadPreferences());

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const allNotifications = useMemo(
    () => getActiveNotifications(cards),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cards, refreshKey]
  );

  const allIncludingDismissed = useMemo(
    () => getNotifications(cards),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cards, refreshKey]
  );

  const summary = useMemo(
    () => getNotificationSummary(cards),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cards, refreshKey]
  );

  const filteredNotifications = useMemo(() => {
    let list =
      activeTab === 'history' ? allIncludingDismissed : allNotifications;

    if (activeCategory !== 'all') {
      list = list.filter((n) => n.category === activeCategory);
    }

    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(lower) ||
          n.message.toLowerCase().includes(lower)
      );
    }

    if (dateFrom) {
      list = list.filter((n) => new Date(n.createdAt) >= new Date(dateFrom));
    }
    if (dateTo) {
      list = list.filter((n) => new Date(n.createdAt) <= new Date(dateTo));
    }

    if (sortMode === 'priority') {
      list = [...list].sort((a, b) => b.priorityScore - a.priorityScore);
    } else if (sortMode === 'newest') {
      list = [...list].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      list = [...list].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    return list;
  }, [allNotifications, allIncludingDismissed, activeTab, activeCategory, searchQuery, dateFrom, dateTo, sortMode]);

  const groups = useMemo(() => groupNotifications(allNotifications), [allNotifications]);

  const digest = useMemo(() => generateDailyDigest(cards), [cards]);

  const handleRead = useCallback(
    (id: string) => {
      markAsRead(id);
      refresh();
    },
    [refresh]
  );

  const handleDismiss = useCallback(
    (id: string) => {
      dismissNotification(id);
      refresh();
    },
    [refresh]
  );

  const handleBulkRead = useCallback(() => {
    const unreadIds = filteredNotifications.filter((n) => !n.isRead).map((n) => n.id);
    markAllAsRead(unreadIds);
    refresh();
  }, [filteredNotifications, refresh]);

  const handleAction = useCallback(
    (notification: Notification, actionType: string) => {
      if (actionType === 'dismiss') {
        dismissNotification(notification.id);
      } else if (actionType === 'acknowledge') {
        markAsRead(notification.id);
        dismissNotification(notification.id);
      } else {
        markAsRead(notification.id);
      }
      refresh();
    },
    [refresh]
  );

  const handlePrefChange = useCallback(
    (category: NotificationCategory, delivery: DeliveryPreference) => {
      const updated = { ...prefs, categories: { ...prefs.categories, [category]: delivery } };
      setPrefs(updated);
      savePreferences(updated);
      refresh();
    },
    [prefs, refresh]
  );

  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  if (!isOpen) return null;

  const unreadInView = filteredNotifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0a0f1c] border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative p-2 bg-blue-500/10 rounded-xl text-blue-400">
              <Bell size={20} />
              {summary.totalUnread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold">
                  {summary.totalUnread}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Notification Center</h2>
              <p className="text-xs text-slate-500">
                {summary.totalUnread} unread of {summary.totalCount} total
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 py-2 border-b border-slate-800 overflow-x-auto">
          {TAB_ITEMS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        {(activeTab === 'inbox' || activeTab === 'history') && (
          <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-800">
            {/* Search */}
            <div className="flex items-center gap-2 flex-1 px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg">
              <Search size={14} className="text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notifications..."
                className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-600 outline-none"
              />
            </div>

            {/* Category filter */}
            <select
              value={activeCategory}
              onChange={(e) =>
                setActiveCategory(e.target.value as NotificationCategory | 'all')
              }
              className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-slate-300 outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="px-3 py-1.5 bg-slate-800/50 border border-slate-700 rounded-lg text-xs text-slate-300 outline-none cursor-pointer"
            >
              <option value="priority">Priority</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>

            {/* Bulk read */}
            {unreadInView > 0 && (
              <button
                onClick={handleBulkRead}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold hover:bg-blue-500/20 transition-colors whitespace-nowrap"
              >
                <CheckCheck size={14} />
                Read All ({unreadInView})
              </button>
            )}
          </div>
        )}

        {/* Date filter for history */}
        {activeTab === 'history' && (
          <div className="flex items-center gap-3 px-6 py-2 border-b border-slate-800">
            <Calendar size={14} className="text-slate-500" />
            <span className="text-xs text-slate-500">From:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2 py-1 bg-slate-800/50 border border-slate-700 rounded-md text-xs text-slate-300 outline-none"
            />
            <span className="text-xs text-slate-500">To:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-2 py-1 bg-slate-800/50 border border-slate-700 rounded-md text-xs text-slate-300 outline-none"
            />
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {/* ---- Inbox Tab ---- */}
          {activeTab === 'inbox' && (
            <>
              {filteredNotifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
                    <Bell size={32} className="text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-400">No notifications</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {searchQuery ? 'Try a different search query' : 'You are all caught up'}
                  </p>
                </div>
              )}
              {filteredNotifications.map((n) => (
                <NotificationRow
                  key={n.id}
                  notification={n}
                  onRead={handleRead}
                  onDismiss={handleDismiss}
                  onAction={handleAction}
                />
              ))}
            </>
          )}

          {/* ---- Grouped Tab ---- */}
          {activeTab === 'grouped' && (
            <>
              {groups.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
                    <Filter size={32} className="text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-400">No grouped notifications</p>
                </div>
              )}
              {groups.map((group) => {
                const isExpanded = expandedGroups.has(group.id);
                const pCfg = priorityConfig[group.priority];
                const catCfg = categoryConfig[group.category];
                const unreadCount = group.notifications.filter((n) => !n.isRead).length;

                return (
                  <div key={group.id} className="border border-slate-800 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleGroup(group.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/30 hover:bg-slate-800/50 transition-colors text-left"
                    >
                      <span className={catCfg.color}>{catCfg.icon}</span>
                      <span className="text-sm font-semibold text-white flex-1">
                        {group.label}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${pCfg.text} ${pCfg.bg} border ${pCfg.border}`}>
                        {pCfg.label}
                      </span>
                      {unreadCount > 0 && (
                        <span className="min-w-[20px] h-5 flex items-center justify-center px-1 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                          {unreadCount}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 font-mono">
                        {group.notifications.length}
                      </span>
                      {isExpanded ? (
                        <ChevronDown size={14} className="text-slate-500" />
                      ) : (
                        <ChevronRight size={14} className="text-slate-500" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="px-3 py-2 space-y-2 border-t border-slate-800">
                        {group.notifications.map((n) => (
                          <NotificationRow
                            key={n.id}
                            notification={n}
                            onRead={handleRead}
                            onDismiss={handleDismiss}
                            onAction={handleAction}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* ---- History Tab ---- */}
          {activeTab === 'history' && (
            <>
              {filteredNotifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
                    <Clock size={32} className="text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-400">No notifications in this range</p>
                </div>
              )}
              {filteredNotifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                    n.isDismissed
                      ? 'bg-slate-800/10 border-slate-800/30 opacity-60'
                      : n.isRead
                      ? 'bg-slate-800/20 border-slate-800/50'
                      : 'bg-slate-800/40 border-slate-700/50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityConfig[n.priority].dot}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">{n.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{n.message}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {n.isDismissed && (
                      <span className="text-[9px] font-bold uppercase text-slate-600 px-1.5 py-0.5 rounded bg-slate-800">
                        Dismissed
                      </span>
                    )}
                    {n.isRead && !n.isDismissed && (
                      <span className="text-[9px] font-bold uppercase text-slate-500 px-1.5 py-0.5 rounded bg-slate-800">
                        Read
                      </span>
                    )}
                    <span className="text-[10px] text-slate-600">{formatDate(n.createdAt)}</span>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* ---- Digest Tab ---- */}
          {activeTab === 'digest' && (
            <div className="space-y-6">
              {/* Digest Summary Card */}
              <div className="p-5 bg-slate-800/30 border border-slate-700 rounded-xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Morning Briefing</h3>
                    <p className="text-xs text-slate-500">
                      Generated {digest.generatedAt ? formatDate(digest.generatedAt) : 'today'}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">{digest.summary}</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="px-3 py-2 bg-slate-800/50 rounded-lg text-center">
                    <p className="text-lg font-bold text-white font-mono">
                      {digest.stats.totalNotifications}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total</p>
                  </div>
                  <div className="px-3 py-2 bg-slate-800/50 rounded-lg text-center">
                    <p className="text-lg font-bold text-red-400 font-mono">
                      {digest.stats.criticalCount}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Critical</p>
                  </div>
                  <div className="px-3 py-2 bg-slate-800/50 rounded-lg text-center">
                    <p className="text-lg font-bold text-amber-400 font-mono">
                      {digest.stats.highCount}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">High</p>
                  </div>
                  <div className="px-3 py-2 bg-slate-800/50 rounded-lg text-center">
                    <p className="text-lg font-bold text-blue-400 font-mono">
                      {digest.stats.actionableCount}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Actionable</p>
                  </div>
                </div>

                {/* Category Breakdown */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    By Category
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ALL_CATEGORIES.filter(
                      (cat) => digest.stats.categoryCounts[cat] > 0
                    ).map((cat) => {
                      const cfg = categoryConfig[cat];
                      return (
                        <div
                          key={cat}
                          className="flex items-center gap-2 px-3 py-2 bg-slate-800/30 rounded-lg"
                        >
                          <span className={cfg.color}>{cfg.icon}</span>
                          <span className="text-xs text-slate-300 flex-1">{cat}</span>
                          <span className={`font-mono text-xs font-bold ${cfg.color}`}>
                            {digest.stats.categoryCounts[cat]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Highlights */}
              {digest.highlights.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Top Highlights
                  </p>
                  {digest.highlights.map((h) => {
                    const pCfg = priorityConfig[h.priority];
                    const catCfg = categoryConfig[h.category];
                    return (
                      <div
                        key={h.id}
                        className="flex items-start gap-3 px-4 py-3 bg-slate-800/30 border border-slate-700/50 rounded-xl"
                      >
                        <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${pCfg.dot}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={catCfg.color}>{catCfg.icon}</span>
                            <span className="text-sm font-semibold text-white truncate">
                              {h.title}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{h.description}</p>
                        </div>
                        <span
                          className={`text-[9px] font-black uppercase tracking-widest ${pCfg.text}`}
                        >
                          {h.priority}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ---- Preferences Tab ---- */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              {/* Category Delivery Preferences */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white">Category Delivery Settings</h3>
                <p className="text-xs text-slate-500">
                  Choose how you receive notifications for each category.
                </p>
                <div className="space-y-2">
                  {ALL_CATEGORIES.map((cat) => {
                    const cfg = categoryConfig[cat];
                    return (
                      <div
                        key={cat}
                        className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 border border-slate-800 rounded-xl"
                      >
                        <span className={`p-1.5 rounded-lg ${cfg.bg} ${cfg.color}`}>
                          {cfg.icon}
                        </span>
                        <span className="text-sm text-white font-medium flex-1">{cat}</span>
                        <div className="flex items-center gap-1">
                          {(
                            ['immediate', 'daily_digest', 'weekly_digest', 'muted'] as DeliveryPreference[]
                          ).map((dp) => (
                            <button
                              key={dp}
                              onClick={() => handlePrefChange(cat, dp)}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${
                                prefs.categories[cat] === dp
                                  ? dp === 'muted'
                                    ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                    : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                  : 'bg-slate-800/50 text-slate-600 border border-slate-700/50 hover:text-slate-400'
                              }`}
                            >
                              {deliveryLabels[dp]}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* General Preferences */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white">General</h3>
                <div className="space-y-2">
                  {/* Sound toggle */}
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-800/30 border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Bell size={14} className="text-slate-400" />
                      <span className="text-sm text-white">Sound Notifications</span>
                    </div>
                    <button
                      onClick={() => {
                        const updated = { ...prefs, soundEnabled: !prefs.soundEnabled };
                        setPrefs(updated);
                        savePreferences(updated);
                      }}
                      className={`w-10 h-5 rounded-full transition-colors relative ${
                        prefs.soundEnabled ? 'bg-blue-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          prefs.soundEnabled ? 'left-5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Badge toggle */}
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-800/30 border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[8px] font-bold">
                        3
                      </span>
                      <span className="text-sm text-white">Badge Count</span>
                    </div>
                    <button
                      onClick={() => {
                        const updated = { ...prefs, badgeEnabled: !prefs.badgeEnabled };
                        setPrefs(updated);
                        savePreferences(updated);
                      }}
                      className={`w-10 h-5 rounded-full transition-colors relative ${
                        prefs.badgeEnabled ? 'bg-blue-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          prefs.badgeEnabled ? 'left-5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Quiet Hours */}
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-800/30 border border-slate-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <BellOff size={14} className="text-slate-400" />
                      <div>
                        <span className="text-sm text-white">Quiet Hours</span>
                        <p className="text-[10px] text-slate-500">
                          {prefs.quietHoursStart} - {prefs.quietHoursEnd}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const updated = {
                          ...prefs,
                          quietHoursEnabled: !prefs.quietHoursEnabled,
                        };
                        setPrefs(updated);
                        savePreferences(updated);
                      }}
                      className={`w-10 h-5 rounded-full transition-colors relative ${
                        prefs.quietHoursEnabled ? 'bg-blue-500' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          prefs.quietHoursEnabled ? 'left-5' : 'left-0.5'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Mute All / Reset */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const updated = { ...prefs };
                    for (const cat of ALL_CATEGORIES) {
                      updated.categories[cat] = 'muted';
                    }
                    setPrefs(updated);
                    savePreferences(updated);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-colors"
                >
                  <BellOff size={14} />
                  Mute All
                </button>
                <button
                  onClick={() => {
                    const _defaults = loadPreferences();
                    // Reset to factory defaults
                    const fresh: NotificationPreferences = {
                      categories: {
                        Trading: 'daily_digest',
                        Analytics: 'daily_digest',
                        Social: 'daily_digest',
                        Alerts: 'immediate',
                        Achievements: 'daily_digest',
                        System: 'immediate',
                      },
                      quietHoursEnabled: false,
                      quietHoursStart: '22:00',
                      quietHoursEnd: '07:00',
                      soundEnabled: true,
                      badgeEnabled: true,
                    };
                    setPrefs(fresh);
                    savePreferences(fresh);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-slate-400 border border-slate-700 rounded-lg text-xs font-bold hover:bg-slate-700 hover:text-slate-300 transition-colors"
                >
                  Reset to Defaults
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <span>
              {summary.totalCount} notifications
            </span>
            <span className="h-3 w-px bg-slate-800" />
            <span>
              {summary.criticalUnread > 0 && (
                <span className="text-red-400 font-bold mr-2">
                  {summary.criticalUnread} critical
                </span>
              )}
              {summary.highUnread > 0 && (
                <span className="text-amber-400 font-bold">
                  {summary.highUnread} high
                </span>
              )}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
