import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Bell, BellRing, DollarSign, TrendingUp, TrendingDown, Filter, Settings, Eye, EyeOff, Trash2, CheckCircle, Clock, Tag, AlertTriangle, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  getNotifications,
  getUnreadNotifications,
  getDealAlerts,
  getActiveDealAlerts,
  getNotificationRules,
  getNotificationStats,
  getNotificationPreferences,
  getNotificationGroups,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  getCategoryColor,
  getCategoryLabel,
  getPriorityColor,
  getDealTypeLabel,
  formatTimeAgo,
  formatCurrency,
  type SmartNotification,
  type DealAlert,
  type NotificationRule,
  type NotificationStats,
  type NotificationPreferences,
  type NotificationGroup,
  type NotificationCategory,
  type NotificationPriority,
} from '../lib/utils/smartNotificationsService.ts';

const CHART_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316', '#ec4899', '#6b7280'];

const ALL_CATEGORIES: NotificationCategory[] = [
  'price_alert', 'deal_found', 'market_move', 'portfolio',
  'auction', 'news', 'grading', 'social', 'system',
];

const ALL_PRIORITIES: NotificationPriority[] = ['critical', 'high', 'medium', 'low'];

type TabType = 'feed' | 'deals' | 'rules' | 'preferences';
type ReadFilter = 'all' | 'unread' | 'read';

const SmartNotifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [deals, setDeals] = useState<DealAlert[]>([]);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [groups, setGroups] = useState<NotificationGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<NotificationCategory | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority | 'all'>('all');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  const loadData = useCallback(() => {
    try {
      setNotifications(getNotifications());
      setDeals(getActiveDealAlerts());
      setRules(getNotificationRules());
      setStats(getNotificationStats());
      setPreferences(getNotificationPreferences());
      setGroups(getNotificationGroups());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleMarkAsRead = useCallback((id: string) => {
    markAsRead(id);
    loadData();
  }, [loadData]);

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead();
    loadData();
  }, [loadData]);

  const handleDismiss = useCallback((id: string) => {
    dismissNotification(id);
    loadData();
  }, [loadData]);

  const filteredNotifications = useMemo(() => {
    let result = notifications;
    if (categoryFilter !== 'all') {
      result = result.filter(n => n.category === categoryFilter);
    }
    if (priorityFilter !== 'all') {
      result = result.filter(n => n.priority === priorityFilter);
    }
    if (readFilter === 'unread') {
      result = result.filter(n => !n.isRead);
    } else if (readFilter === 'read') {
      result = result.filter(n => n.isRead);
    }
    return result;
  }, [notifications, categoryFilter, priorityFilter, readFilter]);

  const categoryChartData = useMemo(() => {
    if (!stats) return [];
    return stats.byCategory
      .filter(c => c.count > 0)
      .map(c => ({
        name: getCategoryLabel(c.category),
        value: c.count,
        color: getCategoryColor(c.category),
      }));
  }, [stats]);

  const priorityChartData = useMemo(() => {
    if (!stats) return [];
    return stats.byPriority.map(p => ({
      name: p.priority.charAt(0).toUpperCase() + p.priority.slice(1),
      count: p.count,
      fill: getPriorityColor(p.priority),
    }));
  }, [stats]);

  const getPriorityIcon = (priority: NotificationPriority) => {
    switch (priority) {
      case 'critical': return <AlertTriangle size={14} className="text-red-400" />;
      case 'high': return <Zap size={14} className="text-orange-400" />;
      case 'medium': return <Bell size={14} className="text-yellow-400" />;
      case 'low': return <Bell size={14} className="text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Smart Notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 rounded-xl">
            <BellRing size={24} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Smart Notifications & Deal Alerts</h1>
            <p className="text-sm text-slate-400 mt-0.5">AI-powered alerts for price changes, deals, and market intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {stats && stats.unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
            >
              <CheckCircle size={14} />
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Bell size={16} className="text-amber-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wide">Unread</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.unreadCount}</p>
            <p className="text-xs text-slate-500 mt-1">of {stats.totalNotifications} total</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Tag size={16} className="text-emerald-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wide">Deals Found</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.dealsFound}</p>
            <p className="text-xs text-slate-500 mt-1">{stats.dealsSaved} active now</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={16} className="text-green-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wide">Total Savings</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalSavings)}</p>
            <p className="text-xs text-slate-500 mt-1">from active deals</p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-blue-400" />
              <span className="text-xs text-slate-400 uppercase tracking-wide">Today&apos;s Alerts</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.todayCount}</p>
            <p className="text-xs text-slate-500 mt-1">avg response {stats.avgResponseTime}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-800/40 p-1 rounded-xl border border-slate-700/40 w-fit">
        {([
          { id: 'feed' as TabType, label: 'Notification Feed', icon: Bell },
          { id: 'deals' as TabType, label: 'Deal Alerts', icon: DollarSign },
          { id: 'rules' as TabType, label: 'Alert Rules', icon: Settings },
          { id: 'preferences' as TabType, label: 'Preferences', icon: Settings },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                showFilters ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700/50 text-slate-400 hover:text-slate-300'
              }`}
            >
              <Filter size={14} />
              Filters
            </button>
            <div className="flex items-center gap-1.5">
              {(['all', 'unread', 'read'] as ReadFilter[]).map(rf => (
                <button
                  key={rf}
                  onClick={() => setReadFilter(rf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    readFilter === rf
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-800/40 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {rf === 'all' ? 'All' : rf === 'unread' ? 'Unread' : 'Read'}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-500">
              {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
            </span>
          </div>

          {showFilters && (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 space-y-3">
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wide mb-1.5 block">Category</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setCategoryFilter('all')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      categoryFilter === 'all' ? 'bg-slate-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    All
                  </button>
                  {ALL_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        categoryFilter === cat ? 'text-white' : 'text-slate-400 hover:text-slate-300'
                      }`}
                      style={categoryFilter === cat ? { backgroundColor: getCategoryColor(cat) + '33', color: getCategoryColor(cat) } : {}}
                    >
                      {getCategoryLabel(cat)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase tracking-wide mb-1.5 block">Priority</label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setPriorityFilter('all')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      priorityFilter === 'all' ? 'bg-slate-600 text-white' : 'bg-slate-700/50 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    All
                  </button>
                  {ALL_PRIORITIES.map(p => (
                    <button
                      key={p}
                      onClick={() => setPriorityFilter(p)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        priorityFilter === p ? 'text-white' : 'text-slate-400 hover:text-slate-300'
                      }`}
                      style={priorityFilter === p ? { backgroundColor: getPriorityColor(p) + '33', color: getPriorityColor(p) } : {}}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notification List + Charts Side-by-side on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Notification Feed */}
            <div className="lg:col-span-2 space-y-2">
              {filteredNotifications.length === 0 ? (
                <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-8 text-center">
                  <Bell size={32} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400">No notifications match your filters</p>
                </div>
              ) : (
                filteredNotifications.map(notif => (
                  <div
                    key={notif.id}
                    className={`bg-slate-800/60 border rounded-xl p-4 transition-all hover:border-slate-600/60 ${
                      notif.isRead ? 'border-slate-700/30 opacity-75' : 'border-slate-600/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Category indicator */}
                      <div
                        className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                        style={{ backgroundColor: getCategoryColor(notif.category) }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                            style={{
                              backgroundColor: getCategoryColor(notif.category) + '20',
                              color: getCategoryColor(notif.category),
                            }}
                          >
                            {getCategoryLabel(notif.category)}
                          </span>
                          <span className="flex items-center gap-0.5">
                            {getPriorityIcon(notif.priority)}
                            <span className="text-[10px] text-slate-500 uppercase">{notif.priority}</span>
                          </span>
                          <span className="text-[10px] text-slate-500">{formatTimeAgo(notif.timestamp)}</span>
                          {!notif.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          )}
                        </div>
                        <h3 className="text-sm font-semibold text-white mb-0.5">{notif.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{notif.message}</p>

                        {/* Price data */}
                        {notif.priceData && (
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-sm font-bold text-white">{formatCurrency(notif.priceData.current)}</span>
                            {notif.priceData.changePercent !== 0 && (
                              <span className={`flex items-center gap-0.5 text-xs font-medium ${
                                notif.priceData.changePercent > 0 ? 'text-emerald-400' : 'text-red-400'
                              }`}>
                                {notif.priceData.changePercent > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {notif.priceData.changePercent > 0 ? '+' : ''}{notif.priceData.changePercent.toFixed(1)}%
                              </span>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-2.5">
                          <button className="px-2.5 py-1 bg-amber-500/10 text-amber-300 text-xs font-medium rounded-md hover:bg-amber-500/20 transition-colors">
                            {notif.actionLabel}
                          </button>
                          {!notif.isRead && (
                            <button
                              onClick={() => handleMarkAsRead(notif.id)}
                              className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                              title="Mark as read"
                            >
                              <Eye size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDismiss(notif.id)}
                            className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                            title="Dismiss"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Category Breakdown Chart + Priority Chart */}
            <div className="space-y-4">
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-white mb-3">By Category</h3>
                {categoryChartData.length > 0 && (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryChartData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                        itemStyle={{ color: '#e2e8f0' }}
                        labelStyle={{ color: '#94a3b8' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {categoryChartData.map(item => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-[10px] text-slate-400 truncate">{item.name}</span>
                      <span className="text-[10px] text-slate-500 ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-white mb-3">By Priority</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={priorityChartData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={60} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                      {priorityChartData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Top Alerted Cards */}
              {stats && stats.topAlertedCards.length > 0 && (
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Top Alerted Cards</h3>
                  <div className="space-y-2">
                    {stats.topAlertedCards.map((card, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-xs text-slate-300 truncate mr-2">{card.cardName}</span>
                        <span className="text-xs text-amber-400 font-medium flex-shrink-0">{card.alertCount} alerts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Deals Tab */}
      {activeTab === 'deals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Active Deal Alerts</h2>
            <span className="text-sm text-slate-400">{deals.length} deals found</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {deals.map(deal => (
              <div
                key={deal.id}
                className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-emerald-500/30 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400"
                  >
                    {getDealTypeLabel(deal.dealType)}
                  </span>
                  <span className="text-lg font-bold text-emerald-400">-{deal.savingsPercent.toFixed(0)}%</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-0.5">{deal.player}</h3>
                <p className="text-xs text-slate-400 mb-3">{deal.cardName}</p>

                <div className="flex items-baseline gap-3 mb-3">
                  <span className="text-xl font-bold text-white">{formatCurrency(deal.listPrice)}</span>
                  <span className="text-sm text-slate-500 line-through">{formatCurrency(deal.marketPrice)}</span>
                  <span className="text-xs text-emerald-400 font-medium">Save {formatCurrency(deal.savings)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-slate-500">Platform</span>
                    <p className="text-slate-300 font-medium">{deal.platform}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Seller Rating</span>
                    <p className="text-slate-300 font-medium">{deal.sellerRating}%</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Confidence</span>
                    <p className="text-slate-300 font-medium">{deal.confidence}%</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Time Left</span>
                    <p className={`font-medium ${deal.timeRemaining ? 'text-amber-300' : 'text-slate-500'}`}>
                      {deal.timeRemaining || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">{formatTimeAgo(deal.discoveredAt)}</span>
                  <button className="px-3 py-1.5 bg-emerald-500/15 text-emerald-400 text-xs font-medium rounded-lg hover:bg-emerald-500/25 transition-colors">
                    View Deal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Notification Rules</h2>
            <button className="px-3 py-1.5 bg-amber-500/15 text-amber-300 text-sm font-medium rounded-lg hover:bg-amber-500/25 transition-colors">
              + New Rule
            </button>
          </div>
          <div className="space-y-2">
            {rules.map(rule => (
              <div
                key={rule.id}
                className={`bg-slate-800/60 border rounded-xl p-4 transition-all ${
                  rule.enabled ? 'border-slate-700/50' : 'border-slate-700/30 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Toggle */}
                    <button
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        rule.enabled ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          rule.enabled ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{rule.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: getCategoryColor(rule.category) + '20',
                            color: getCategoryColor(rule.category),
                          }}
                        >
                          {getCategoryLabel(rule.category)}
                        </span>
                        <span
                          className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: getPriorityColor(rule.priority) + '20',
                            color: getPriorityColor(rule.priority),
                          }}
                        >
                          {rule.priority}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Cooldown: {rule.cooldown === '0' ? 'None' : rule.cooldown}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {rule.channels.map(ch => (
                        <span key={ch} className="text-[10px] text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">
                          {ch.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Conditions */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {rule.conditions.map((cond, idx) => (
                    <span key={idx} className="text-[10px] text-slate-400 bg-slate-700/30 px-2 py-0.5 rounded-md">
                      {cond.field} {cond.operator} {cond.value}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && preferences && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-white">Notification Preferences</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Settings */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">General Settings</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Quiet Hours</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-300 bg-slate-700/50 px-3 py-1.5 rounded-lg">{preferences.quietHoursStart}</span>
                    <span className="text-xs text-slate-500">to</span>
                    <span className="text-sm text-slate-300 bg-slate-700/50 px-3 py-1.5 rounded-lg">{preferences.quietHoursEnd}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Max Notifications Per Day</label>
                  <span className="text-sm text-slate-300 bg-slate-700/50 px-3 py-1.5 rounded-lg inline-block">{preferences.maxPerDay}</span>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-400">Group Similar Notifications</label>
                  <div
                    className={`relative inline-flex h-5 w-9 items-center rounded-full ${
                      preferences.groupSimilar ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        preferences.groupSimilar ? 'translate-x-4.5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Channels */}
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">Delivery Channels</h3>
              <div className="space-y-3">
                {preferences.channels.map(ch => (
                  <div key={ch.channel} className="flex items-center justify-between">
                    <span className="text-sm text-slate-300 capitalize">{ch.channel.replace('_', ' ')}</span>
                    <div
                      className={`relative inline-flex h-5 w-9 items-center rounded-full ${
                        ch.enabled ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          ch.enabled ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Preferences */}
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Category Preferences</h3>
            <div className="space-y-3">
              {preferences.categoryPreferences.map(cp => (
                <div key={cp.category} className="flex items-center justify-between py-1.5 border-b border-slate-700/30 last:border-0">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: getCategoryColor(cp.category) }}
                    />
                    <span className="text-sm text-slate-300">{getCategoryLabel(cp.category)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-500 uppercase">Min: {cp.minPriority}</span>
                    <div
                      className={`relative inline-flex h-5 w-9 items-center rounded-full ${
                        cp.enabled ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          cp.enabled ? 'translate-x-4.5' : 'translate-x-0.5'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartNotifications;
