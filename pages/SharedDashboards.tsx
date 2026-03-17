import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard, Users, Eye, MessageSquare, Star, TrendingUp,
  BarChart3, Zap, Activity, Grid3X3,
} from 'lucide-react';
import {
  getSharedDashboards,
  getDashboardTemplates,
  getSharedDashboardStats,
  getAccessColor,
} from '../lib/sharedDashboardService';

const WIDGET_COLORS: Record<string, string> = {
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  green: 'text-green-400 bg-green-500/10 border-green-500/30',
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  amber: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  rose: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
};

const SharedDashboards: React.FC = () => {
  const dashboards = useMemo(() => getSharedDashboards(), []);
  const templates = useMemo(() => getDashboardTemplates(), []);
  const stats = useMemo(() => getSharedDashboardStats(), []);
  const [selectedDashboard, setSelectedDashboard] = useState(dashboards[0]?.id || '');

  const active = dashboards.find(d => d.id === selectedDashboard);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <LayoutDashboard size={22} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Shared Analytics Dashboards</h1>
              <p className="text-slate-400 text-sm">
                Collaborative dashboards with shared widgets, KPIs, and real-time group metrics
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: LayoutDashboard, color: 'text-indigo-400', label: 'Dashboards', value: stats.totalDashboards },
            { icon: Users, color: 'text-blue-400', label: 'Total Viewers', value: stats.totalViewers },
            { icon: Eye, color: 'text-green-400', label: 'Active Now', value: stats.activeNow },
            { icon: MessageSquare, color: 'text-purple-400', label: 'Comments/Week', value: stats.commentsThisWeek },
          ].map((s, i) => (
            <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={16} className={s.color} />
                <span className="text-slate-400 text-xs uppercase tracking-wide">{s.label}</span>
              </div>
              <p className="text-white font-bold text-3xl">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Dashboard Selector */}
        <div className="flex gap-2 flex-wrap">
          {dashboards.map(d => (
            <button key={d.id} onClick={() => setSelectedDashboard(d.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                selectedDashboard === d.id ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}>
              {d.starred && <Star size={10} className="inline mr-1 fill-current" />}
              {d.name}
            </button>
          ))}
        </div>

        {active && (
          <>
            {/* Dashboard Header */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-semibold text-lg">{active.name}</h3>
                  <p className="text-slate-400 text-sm">{active.description}</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className={`px-2 py-1 rounded font-bold ${getAccessColor(active.access)}`}>{active.access}</span>
                  <span className="text-slate-500">
                    <Eye size={12} className="inline mr-1" />{active.activeViewers} watching
                  </span>
                  <span className="text-slate-500">Updated {active.lastUpdated}</span>
                </div>
              </div>
            </div>

            {/* Widget Grid */}
            <div className="grid grid-cols-3 gap-4">
              {active.widgets.map(widget => {
                const colorClasses = WIDGET_COLORS[widget.color] || WIDGET_COLORS.blue;
                return (
                  <div key={widget.id} className={`rounded-xl border p-4 ${colorClasses}`}
                    style={{ gridColumn: `span ${widget.span}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">{widget.title}</span>
                      <span className="text-[10px] uppercase opacity-60">{widget.type}</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{widget.value}</p>
                    {widget.change !== null && (
                      <p className={`text-xs font-bold mt-1 ${widget.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {widget.change >= 0 ? '+' : ''}{widget.change}%
                      </p>
                    )}
                    {widget.sparkline && (
                      <div className="flex items-end gap-0.5 h-6 mt-2">
                        {widget.sparkline.map((v, i) => {
                          const max = Math.max(...widget.sparkline!);
                          const min = Math.min(...widget.sparkline!);
                          const range = max - min || 1;
                          return (
                            <div key={i} className="flex-1 bg-white/20 rounded-sm"
                              style={{ height: `${((v - min) / range) * 100}%`, minHeight: '2px' }} />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Comments */}
            {active.comments.length > 0 && (
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                <h4 className="text-indigo-400 font-semibold text-xs uppercase tracking-wide mb-3">
                  <MessageSquare size={14} className="inline mr-1" />Discussion
                </h4>
                <div className="space-y-3">
                  {active.comments.map(c => (
                    <div key={c.id} className="bg-slate-800/50 rounded-lg p-3">
                      <p className="text-slate-300 text-xs">{c.content}</p>
                      <p className="text-slate-500 text-[10px] mt-1">@{c.authorHandle} • {c.timestamp}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Templates */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <Grid3X3 size={16} className="text-indigo-400" />
            Dashboard Templates
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {templates.map(t => (
              <div key={t.id} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:border-indigo-500/50 transition-all cursor-pointer">
                <h4 className="text-white font-semibold text-xs mb-1">{t.name}</h4>
                <p className="text-slate-400 text-[10px] mb-2">{t.description}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span>{t.widgetCount} widgets</span>
                  <span>•</span>
                  <span>Used {t.usageCount}x</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedDashboards;
