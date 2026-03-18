import React, { useState, useMemo, useCallback } from 'react';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  Filter,
  Gavel,
  Globe,
  Layers,
  Mail,
  MailOpen,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Shield,
  Trash2,
  TrendingUp,
  Users,
  Wifi,
  WifiOff,
  X,
  Zap,
  BarChart3,
  FileText,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  NotificationChannel,
  NotificationPriority,
  ALL_CHANNELS,
  CHANNEL_LABELS,
  NotificationPreference,
  NotificationRule,
} from '../lib/utils/realTimeNotificationService';
import { useRealtimeNotifications } from '../lib/utils/useRealtimeNotifications';

// ---- Helpers ----

const CHANNEL_ICONS: Record<NotificationChannel, React.ReactNode> = {
  price_alert: <DollarSign size={16} />,
  auction_ending: <Gavel size={16} />,
  grading_update: <Shield size={16} />,
  trade_offer: <Users size={16} />,
  market_movement: <TrendingUp size={16} />,
  portfolio_change: <Layers size={16} />,
  social_mention: <Globe size={16} />,
  system: <Settings size={16} />,
};

const PRIORITY_COLORS: Record<NotificationPriority, string> = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  low: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const PRIORITY_DOTS: Record<NotificationPriority, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-blue-500',
  low: 'bg-slate-500',
};

const CHANNEL_COLORS: Record<NotificationChannel, string> = {
  price_alert: '#ef4444',
  auction_ending: '#f59e0b',
  grading_update: '#8b5cf6',
  trade_offer: '#10b981',
  market_movement: '#3b82f6',
  portfolio_change: '#06b6d4',
  social_mention: '#ec4899',
  system: '#6b7280',
};

function formatTimeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);

  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

// ---- Tabs ----

type TabView = 'feed' | 'preferences' | 'rules' | 'stats' | 'digest';

// ---- Component ----

const NotificationCenter: React.FC = () => {
  const {
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
  } = useRealtimeNotifications();

  const [activeTab, setActiveTab] = useState<TabView>('feed');
  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<NotificationPriority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [digestPeriod, setDigestPeriod] = useState<'hourly' | 'daily' | 'weekly'>('daily');
  const [showRuleForm, setShowRuleForm] = useState(false);

  // New rule form state
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleChannel, setNewRuleChannel] = useState<NotificationChannel>('price_alert');
  const [newRuleCondition, setNewRuleCondition] = useState('price_drop > 10%');
  const [newRuleThreshold, setNewRuleThreshold] = useState(10);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    let items = [...notifications];
    if (selectedChannel !== 'all') {
      items = items.filter((n) => n.channel === selectedChannel);
    }
    if (selectedPriority !== 'all') {
      items = items.filter((n) => n.priority === selectedPriority);
    }
    if (showUnreadOnly) {
      items = items.filter((n) => !n.isRead);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
      );
    }
    return items;
  }, [notifications, selectedChannel, selectedPriority, showUnreadOnly, searchQuery]);

  // Digest
  const digest = useMemo(() => getDigest(digestPeriod), [digestPeriod, getDigest]);

  // Stats chart data
  const channelChartData = useMemo(() => {
    return ALL_CHANNELS.map((ch) => ({
      name: CHANNEL_LABELS[ch].replace(' ', '\n'),
      count: stats.byChannel[ch] || 0,
      color: CHANNEL_COLORS[ch],
    }));
  }, [stats]);

  const handleCreateRule = useCallback(() => {
    if (!newRuleName.trim()) return;
    createRule({
      name: newRuleName,
      channel: newRuleChannel,
      condition: newRuleCondition,
      threshold: newRuleThreshold,
      enabled: true,
    });
    setNewRuleName('');
    setNewRuleCondition('price_drop > 10%');
    setNewRuleThreshold(10);
    setShowRuleForm(false);
  }, [newRuleName, newRuleChannel, newRuleCondition, newRuleThreshold, createRule]);

  const handleTogglePreference = useCallback(
    (channel: NotificationChannel, field: 'enabled' | 'soundEnabled') => {
      const updated = preferences.map((p) =>
        p.channel === channel ? { ...p, [field]: !p[field] } : p
      );
      setPreferences(updated);
    },
    [preferences, setPreferences]
  );

  const handleSetQuietHours = useCallback(
    (channel: NotificationChannel, start: string, end: string) => {
      const updated = preferences.map((p) =>
        p.channel === channel ? { ...p, quietHoursStart: start, quietHoursEnd: end } : p
      );
      setPreferences(updated);
    },
    [preferences, setPreferences]
  );

  // ---- Render helpers ----

  const renderConnectionStatus = () => {
    const isConnected = connectionState === 'connected';
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-xs text-slate-400">
          {connectionState === 'connected' && 'Live'}
          {connectionState === 'connecting' && 'Connecting...'}
          {connectionState === 'disconnected' && 'Disconnected'}
          {connectionState === 'reconnecting' && 'Reconnecting...'}
          {connectionState === 'error' && 'Error'}
        </span>
        {isConnected ? <Wifi size={14} className="text-green-500" /> : <WifiOff size={14} className="text-red-500" />}
      </div>
    );
  };

  const renderTabBar = () => {
    const tabs: { id: TabView; label: string; icon: React.ReactNode }[] = [
      { id: 'feed', label: 'Live Feed', icon: <Bell size={16} /> },
      { id: 'preferences', label: 'Preferences', icon: <Settings size={16} /> },
      { id: 'rules', label: 'Rules', icon: <Zap size={16} /> },
      { id: 'stats', label: 'Stats', icon: <BarChart3 size={16} /> },
      { id: 'digest', label: 'Digest', icon: <FileText size={16} /> },
    ];
    return (
      <div className="flex gap-1 border-b border-slate-700 mb-4 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors
              ${activeTab === t.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-200'
              }`}
          >
            {t.icon}
            {t.label}
            {t.id === 'feed' && unreadCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-red-500 text-white">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  };

  const renderFeed = () => (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Channel filter */}
        <div className="relative">
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value as NotificationChannel | 'all')}
            className="appearance-none pl-3 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Channels</option>
            {ALL_CHANNELS.map((ch) => (
              <option key={ch} value={ch}>{CHANNEL_LABELS[ch]}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>

        {/* Priority filter */}
        <div className="relative">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as NotificationPriority | 'all')}
            className="appearance-none pl-3 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
        </div>

        {/* Unread toggle */}
        <button
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors ${
            showUnreadOnly
              ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Filter size={14} />
          Unread
        </button>

        {/* Bulk actions */}
        <button
          onClick={() => markAllRead(selectedChannel === 'all' ? undefined : selectedChannel)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <CheckCheck size={14} />
          Mark All Read
        </button>
        <button
          onClick={() => dismissAll(selectedChannel === 'all' ? undefined : selectedChannel)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-slate-800 border border-slate-700 text-red-400 hover:text-red-300 transition-colors"
        >
          <Trash2 size={14} />
          Dismiss All
        </button>
      </div>

      {/* Channel quick filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedChannel('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            selectedChannel === 'all'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
          }`}
        >
          <Bell size={12} />
          All ({notifications.length})
        </button>
        {ALL_CHANNELS.map((ch) => {
          const count = notifications.filter((n) => n.channel === ch).length;
          return (
            <button
              key={ch}
              onClick={() => setSelectedChannel(ch)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedChannel === ch
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200'
              }`}
            >
              {CHANNEL_ICONS[ch]}
              {CHANNEL_LABELS[ch]} ({count})
            </button>
          );
        })}
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        {filteredNotifications.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <BellOff size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No notifications match your filters</p>
          </div>
        )}
        {filteredNotifications.map((n) => (
          <div
            key={n.id}
            className={`group relative flex items-start gap-3 p-4 rounded-xl border transition-all duration-300 animate-fade-in ${
              n.isRead
                ? 'bg-slate-900/50 border-slate-800'
                : 'bg-slate-800/80 border-slate-700 shadow-lg shadow-blue-500/5'
            }`}
          >
            {/* Priority dot */}
            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${PRIORITY_DOTS[n.priority]}`} />

            {/* Channel icon */}
            <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
              n.isRead ? 'bg-slate-800 text-slate-500' : 'bg-blue-500/10 text-blue-400'
            }`}>
              {CHANNEL_ICONS[n.channel]}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className={`text-sm font-semibold ${n.isRead ? 'text-slate-400' : 'text-slate-100'}`}>
                    {n.title}
                  </h4>
                  <p className={`text-xs mt-0.5 ${n.isRead ? 'text-slate-500' : 'text-slate-400'}`}>
                    {n.body}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[n.priority]}`}>
                    {n.priority}
                  </span>
                  <span className="text-[10px] text-slate-500">{formatTimeAgo(n.timestamp)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-2">
                {n.actions.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      if (a.type === 'dismiss') dismiss(n.id);
                      else markAsRead(n.id);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-slate-700/60 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    {a.label}
                  </button>
                ))}
                {!n.isRead && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors flex items-center gap-1"
                  >
                    <Check size={10} /> Read
                  </button>
                )}
                <button
                  onClick={() => dismiss(n.id)}
                  className="ml-auto opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-1">Channel Preferences</h3>
        <p className="text-sm text-slate-400 mb-4">Configure how you receive notifications for each channel.</p>
      </div>

      <div className="space-y-3">
        {preferences.map((pref) => (
          <div
            key={pref.channel}
            className="flex items-center justify-between p-4 bg-slate-800/80 border border-slate-700 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-slate-700/60 text-slate-300">
                {CHANNEL_ICONS[pref.channel]}
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-200">{CHANNEL_LABELS[pref.channel]}</h4>
                <p className="text-xs text-slate-500">
                  {pref.quietHoursStart && pref.quietHoursEnd
                    ? `Quiet: ${pref.quietHoursStart} - ${pref.quietHoursEnd}`
                    : 'No quiet hours set'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Sound toggle */}
              <button
                onClick={() => handleTogglePreference(pref.channel, 'soundEnabled')}
                className={`p-1.5 rounded-lg transition-colors ${
                  pref.soundEnabled
                    ? 'text-blue-400 bg-blue-500/10'
                    : 'text-slate-600 bg-slate-800'
                }`}
                title={pref.soundEnabled ? 'Sound on' : 'Sound off'}
              >
                {pref.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              {/* Quiet hours inputs */}
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-slate-500" />
                <input
                  type="time"
                  value={pref.quietHoursStart || ''}
                  onChange={(e) =>
                    handleSetQuietHours(pref.channel, e.target.value, pref.quietHoursEnd || '07:00')
                  }
                  className="w-20 px-1.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-300 focus:outline-none focus:border-blue-500"
                  placeholder="Start"
                />
                <span className="text-xs text-slate-600">-</span>
                <input
                  type="time"
                  value={pref.quietHoursEnd || ''}
                  onChange={(e) =>
                    handleSetQuietHours(pref.channel, pref.quietHoursStart || '22:00', e.target.value)
                  }
                  className="w-20 px-1.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-300 focus:outline-none focus:border-blue-500"
                  placeholder="End"
                />
              </div>

              {/* Enable toggle */}
              <button
                onClick={() => handleTogglePreference(pref.channel, 'enabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  pref.enabled ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    pref.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderRules = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 mb-1">Notification Rules</h3>
          <p className="text-sm text-slate-400">Create custom rules to get alerted on specific conditions.</p>
        </div>
        <button
          onClick={() => setShowRuleForm(!showRuleForm)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          New Rule
        </button>
      </div>

      {/* New rule form */}
      {showRuleForm && (
        <div className="p-4 bg-slate-800/80 border border-blue-500/30 rounded-xl space-y-3">
          <h4 className="text-sm font-semibold text-blue-400">Create New Rule</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Rule Name</label>
              <input
                type="text"
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
                placeholder="e.g., Big Price Drop"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Channel</label>
              <select
                value={newRuleChannel}
                onChange={(e) => setNewRuleChannel(e.target.value as NotificationChannel)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              >
                {ALL_CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>{CHANNEL_LABELS[ch]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Condition</label>
              <input
                type="text"
                value={newRuleCondition}
                onChange={(e) => setNewRuleCondition(e.target.value)}
                placeholder="e.g., price_drop > 15%"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Threshold</label>
              <input
                type="number"
                value={newRuleThreshold}
                onChange={(e) => setNewRuleThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowRuleForm(false)}
              className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateRule}
              className="px-4 py-1.5 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Create Rule
            </button>
          </div>
        </div>
      )}

      {/* Rules list */}
      <div className="space-y-2">
        {rules.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Zap size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">No rules configured yet</p>
          </div>
        )}
        {rules.map((rule) => (
          <div
            key={rule.id}
            className="flex items-center justify-between p-4 bg-slate-800/80 border border-slate-700 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                rule.enabled ? 'bg-green-500/10 text-green-400' : 'bg-slate-700/60 text-slate-500'
              }`}>
                <Zap size={16} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-200">{rule.name}</h4>
                <p className="text-xs text-slate-500">
                  {CHANNEL_LABELS[rule.channel]} &middot; {rule.condition} &middot; Triggered {rule.triggeredCount}x
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleRule(rule.id)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  rule.enabled ? 'bg-green-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                    rule.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <button
                onClick={() => deleteRule(rule.id)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-100">Notification Statistics</h3>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Received', value: stats.totalReceived, color: 'text-blue-400' },
          { label: 'Unread', value: stats.totalUnread, color: 'text-orange-400' },
          { label: 'Dismissed', value: stats.totalDismissed, color: 'text-slate-400' },
          { label: 'Avg Response', value: `${stats.avgResponseTimeMs}ms`, color: 'text-green-400' },
        ].map((s) => (
          <div key={s.label} className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Channel breakdown chart */}
      <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl">
        <h4 className="text-sm font-semibold text-slate-200 mb-4">Notifications by Channel</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channelChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={{ stroke: '#475569' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={{ stroke: '#475569' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {channelChartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority breakdown */}
      <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl">
        <h4 className="text-sm font-semibold text-slate-200 mb-3">By Priority</h4>
        <div className="grid grid-cols-4 gap-3">
          {(['critical', 'high', 'medium', 'low'] as NotificationPriority[]).map((p) => (
            <div key={p} className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${PRIORITY_DOTS[p]}`} />
              <p className="text-lg font-bold text-slate-200">{stats.byPriority[p] || 0}</p>
              <p className="text-[10px] text-slate-500 capitalize">{p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Peak hour */}
      <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Peak Activity Hour</p>
          <p className="text-lg font-bold text-slate-200">{stats.peakHour}:00</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Last Received</p>
          <p className="text-sm text-slate-300">
            {stats.lastReceivedAt ? formatTimeAgo(stats.lastReceivedAt) : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );

  const renderDigest = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">Notification Digest</h3>
        <div className="flex gap-1 bg-slate-800 border border-slate-700 rounded-lg p-0.5">
          {(['hourly', 'daily', 'weekly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setDigestPeriod(p)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                digestPeriod === p
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Digest summary */}
      <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-200 capitalize">{digestPeriod} Summary</h4>
          <span className="text-xs text-slate-500">{digest.totalCount} notifications</span>
        </div>

        {/* Channel breakdown bars */}
        <div className="space-y-2">
          {ALL_CHANNELS.map((ch) => {
            const count = digest.channelBreakdown[ch] || 0;
            const maxCount = Math.max(...(Object.values(digest.channelBreakdown) as number[]), 1);
            const pct = (count / maxCount) * 100;
            return (
              <div key={ch} className="flex items-center gap-3">
                <div className="w-24 flex items-center gap-1.5 text-xs text-slate-400">
                  {CHANNEL_ICONS[ch]}
                  <span className="truncate">{CHANNEL_LABELS[ch]}</span>
                </div>
                <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: CHANNEL_COLORS[ch] }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top priority items */}
      <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl">
        <h4 className="text-sm font-semibold text-slate-200 mb-3">Top Priority Items</h4>
        {digest.topPriorityItems.length === 0 ? (
          <p className="text-xs text-slate-500">No items in this period</p>
        ) : (
          <div className="space-y-2">
            {digest.topPriorityItems.map((n) => (
              <div key={n.id} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
                <div className={`w-2 h-2 rounded-full ${PRIORITY_DOTS[n.priority]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">{n.title}</p>
                  <p className="text-[10px] text-slate-500 truncate">{n.body}</p>
                </div>
                <span className="text-[10px] text-slate-500 flex-shrink-0">{formatTimeAgo(n.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Highlights */}
      <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl">
        <h4 className="text-sm font-semibold text-slate-200 mb-3">Recent Highlights</h4>
        {digest.highlights.length === 0 ? (
          <p className="text-xs text-slate-500">No highlights for this period</p>
        ) : (
          <div className="space-y-2">
            {digest.highlights.map((n) => (
              <div key={n.id} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-700/60 text-slate-400 flex-shrink-0">
                  {CHANNEL_ICONS[n.channel]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-200 truncate">{n.title}</p>
                  <p className="text-[10px] text-slate-500 truncate">{n.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Bell size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Notification Center</h1>
              <p className="text-xs text-slate-500">Real-time WebSocket notification pipeline</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {renderConnectionStatus()}
            {unreadCount > 0 && (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        {renderTabBar()}

        {/* Tab content */}
        {activeTab === 'feed' && renderFeed()}
        {activeTab === 'preferences' && renderPreferences()}
        {activeTab === 'rules' && renderRules()}
        {activeTab === 'stats' && renderStats()}
        {activeTab === 'digest' && renderDigest()}
      </div>
    </div>
  );
};

export default NotificationCenter;
