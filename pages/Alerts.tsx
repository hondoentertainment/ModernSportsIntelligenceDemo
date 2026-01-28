
import React, { useMemo } from 'react';
import {
  Bell,
  Zap,
  TrendingUp,
  TrendingDown,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Target,
  RefreshCw,
  Trash2,
  Check,
  X,
  Clock,
  Info
} from 'lucide-react';
import { useAlerts } from '../lib/useAlerts.ts';
import { AlertType } from '../types.ts';

const Alerts: React.FC = () => {
  const {
    alerts,
    markAsRead,
    markAllAsRead,
    dismissAlert,
    clearAllAlerts,
    unreadCount
  } = useAlerts();

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'price_target': return <Target size={28} />;
      case 'sync_complete': return <RefreshCw size={28} />;
      case 'trend': return <TrendingUp size={28} />;
      case 'momentum': return <Zap size={28} />;
      case 'warning': return <TrendingDown size={28} />;
      case 'system': return <Info size={28} />;
      default: return <Bell size={28} />;
    }
  };

  const getAlertStyles = (type: AlertType, priority: string) => {
    if (type === 'price_target') return 'bg-brand-lime/10 text-brand-lime';
    if (type === 'sync_complete') return 'bg-brand-green/10 text-brand-green';
    if (type === 'momentum') return 'bg-brand-green/10 text-brand-green';
    if (type === 'trend') return 'bg-blue-500/10 text-blue-400';
    if (type === 'warning') return 'bg-brand-red/10 text-brand-red';
    return 'bg-slate-500/10 text-slate-400';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const stats = useMemo(() => {
    const priceTargets = alerts.filter(a => a.type === 'price_target').length;
    const syncAlerts = alerts.filter(a => a.type === 'sync_complete').length;
    const highPriority = alerts.filter(a => a.priority === 'high' && !a.isRead).length;
    return { priceTargets, syncAlerts, highPriority };
  }, [alerts]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
            Alerts <span className="text-brand-lime">& Signals</span>
          </h1>
          <p className="text-brand-muted max-w-2xl font-medium">
            Real-time notifications for price targets, market syncs, and portfolio intelligence.
          </p>
        </div>
        <div className="flex items-center gap-4">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-6 py-3 bg-brand-slate border border-slate-800 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:text-white transition-all flex items-center gap-2"
            >
              <Check size={16} /> Mark All Read
            </button>
          )}
          {alerts.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear all alerts? This cannot be undone.')) {
                  clearAllAlerts();
                }
              }}
              className="px-6 py-3 bg-brand-slate border border-slate-800 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:text-brand-red transition-all flex items-center gap-2"
            >
              <Trash2 size={16} /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Unread', value: unreadCount, color: 'text-brand-lime' },
          { label: 'Price Targets', value: stats.priceTargets, color: 'text-brand-lime' },
          { label: 'Sync Alerts', value: stats.syncAlerts, color: 'text-brand-green' },
          { label: 'High Priority', value: stats.highPriority, color: 'text-brand-red' }
        ].map((stat, i) => (
          <div key={i} className="bg-brand-slate border border-slate-800 rounded-2xl p-4">
            <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-2xl font-mono font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-brand-lime flex items-center gap-2">
            <Zap size={14} /> {unreadCount > 0 ? 'Active Signals' : 'All Signals'}
          </h2>

          {alerts.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-32 bg-brand-slate border border-dashed border-slate-800 rounded-[3rem] space-y-6">
              <div className="w-24 h-24 bg-brand-lime/5 rounded-full flex items-center justify-center border border-brand-lime/10">
                <Bell className="text-brand-lime" size={32} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-bebas tracking-widest text-white">No Alerts Yet</h3>
                <p className="text-brand-muted max-w-sm font-medium">
                  Alerts will appear here when you trigger a Market Sync or when your target prices are hit.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-8 bg-brand-charcoal border rounded-[2rem] flex gap-8 group hover:border-brand-lime/30 transition-all relative overflow-hidden ${alert.isRead ? 'border-slate-800/50 opacity-70' : 'border-slate-800'
                    }`}
                >
                  {/* Unread indicator */}
                  {!alert.isRead && (
                    <div className="absolute top-4 right-4 w-3 h-3 bg-brand-lime rounded-full shadow-lg shadow-brand-lime/50"></div>
                  )}

                  <div className={`p-5 rounded-2xl h-fit shadow-xl ${getAlertStyles(alert.type, alert.priority)}`}>
                    {getAlertIcon(alert.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-xl leading-tight group-hover:text-brand-lime transition-colors pr-8">
                          {alert.title}
                        </h3>
                        {alert.priority === 'high' && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest rounded-full">
                            Urgent
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-brand-muted font-black uppercase tracking-tighter whitespace-nowrap flex items-center gap-1">
                        <Clock size={12} /> {formatTimeAgo(alert.timestamp)}
                      </span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium">
                      {alert.description}
                    </p>
                    <div className="flex gap-4">
                      {!alert.isRead && (
                        <button
                          onClick={() => markAsRead(alert.id)}
                          className="text-[10px] font-black uppercase tracking-widest text-brand-lime hover:text-white transition-colors border-b border-brand-lime/20 hover:border-white pb-1 flex items-center gap-1"
                        >
                          <Check size={12} /> Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-brand-red transition-colors border-b border-white/10 hover:border-brand-red pb-1 flex items-center gap-1"
                      >
                        <X size={12} /> Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-12">
          <section className="bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-2xl font-bebas tracking-widest mb-2 text-white">Alert Stats</h2>
            <p className="text-xs text-brand-muted font-medium mb-8">Your notification summary.</p>
            <div className="space-y-6">
              {[
                { label: 'Total Alerts', val: alerts.length },
                { label: 'Unread', val: unreadCount },
                { label: 'Read', val: alerts.length - unreadCount }
              ].map(stat => (
                <div key={stat.label} className="flex justify-between items-center py-3 border-b border-slate-800/50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-muted">{stat.label}</span>
                  <span className="text-lg font-mono font-bold text-white">{stat.val}</span>
                </div>
              ))}
            </div>
            {unreadCount > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-800">
                <div className="flex items-center gap-3 text-brand-lime">
                  <AlertTriangle size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {unreadCount} Unread Alert{unreadCount > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
          </section>

          <section className="p-10 bg-brand-lime/10 border border-brand-lime/20 rounded-[2.5rem] text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-lime shadow-[0_4px_12px_rgba(217,249,157,0.3)]"></div>
            <Bell className="mx-auto text-brand-lime mb-6" size={40} />
            <h3 className="text-2xl font-bebas tracking-widest text-white mb-2 uppercase">Alert Sources</h3>
            <p className="text-sm text-brand-muted leading-relaxed mb-4 font-medium">
              Alerts are generated from:
            </p>
            <ul className="text-left text-xs text-slate-300 space-y-2">
              <li className="flex items-center gap-2"><RefreshCw size={14} className="text-brand-green" /> Market Sync completions</li>
              <li className="flex items-center gap-2"><Target size={14} className="text-brand-lime" /> Watchlist price targets</li>
              <li className="flex items-center gap-2"><TrendingUp size={14} className="text-blue-400" /> Value changes &gt; 10%</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Alerts;
