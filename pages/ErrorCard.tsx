// Phase 157: Error Card & Misprint Database Page
// Route: /error-card | Icon: AlertOctagon
import React, { useState, useEffect, useMemo } from 'react';
import { AlertOctagon, AlertTriangle, TrendingUp, DollarSign, Search, Shield, Clock, Eye, Star, Award, Zap, Users, CheckCircle2, FileText } from 'lucide-react';
import {
  getErrorCards,
  getVariationGuide,
  getErrorAlerts,
  getErrorCardStats,
  searchForErrors,
  ERROR_TYPE_META,
  RARITY_META,
  DIFFICULTY_META,
  type ErrorCard as ErrorCardType,
  type VariationGuide,
  type ErrorAlert,
  type ErrorCardStats,
  type ErrorType,
} from '../lib/errorCardService';
import {
  BarChart, Bar, PieChart, Pie, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';

const ERROR_TYPE_COLORS: Record<string, string> = {
  misprint: '#ef4444',
  wrong_back: '#f97316',
  no_name: '#ec4899',
  reversed_negative: '#a855f7',
  wrong_photo: '#f59e0b',
  double_print: '#06b6d4',
  missing_foil: '#14b8a6',
  color_variation: '#84cc16',
  sp: '#3b82f6',
  ssp: '#6366f1',
  photo_variation: '#eab308',
};

function formatCurrency(value: number): string {
  if (value >= 1000) return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return '$' + value.toFixed(2);
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function urgencyColor(urgency: string): string {
  switch (urgency) {
    case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  }
}

function alertTypeLabel(type: string): string {
  switch (type) {
    case 'new_discovery': return 'New Discovery';
    case 'price_spike': return 'Price Spike';
    case 'verification_needed': return 'Verification Needed';
    case 'market_opportunity': return 'Market Opportunity';
    default: return type;
  }
}

const ErrorCard: React.FC = () => {
  const [errorCards, setErrorCards] = useState<ErrorCardType[]>([]);
  const [guides, setGuides] = useState<VariationGuide[]>([]);
  const [alerts, setAlerts] = useState<ErrorAlert[]>([]);
  const [stats, setStats] = useState<ErrorCardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    try {
      setErrorCards(getErrorCards());
      setGuides(getVariationGuide());
      setAlerts(getErrorAlerts());
      setStats(getErrorCardStats());
      setLoading(false);
    } catch (err) {
      setError('Failed to load Error Card Database');
      setLoading(false);
    }
  }, []);

  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) return errorCards;
    const q = searchQuery.toLowerCase();
    return errorCards.filter(c =>
      c.player.toLowerCase().includes(q) ||
      c.set.toLowerCase().includes(q) ||
      c.manufacturer.toLowerCase().includes(q) ||
      ERROR_TYPE_META[c.errorType]?.label.toLowerCase().includes(q)
    );
  }, [errorCards, searchQuery]);

  const multiplierChartData = useMemo(() => {
    const typeMap: Record<string, { total: number; count: number }> = {};
    errorCards.forEach(c => {
      const label = ERROR_TYPE_META[c.errorType]?.label ?? c.errorType;
      if (!typeMap[label]) typeMap[label] = { total: 0, count: 0 };
      typeMap[label].total += c.premiumMultiplier;
      typeMap[label].count += 1;
    });
    return Object.entries(typeMap).map(([type, data]) => ({
      type: type.length > 14 ? type.slice(0, 14) + '...' : type,
      avgMultiplier: Math.round((data.total / data.count) * 10) / 10,
    })).sort((a, b) => b.avgMultiplier - a.avgMultiplier);
  }, [errorCards]);

  const errorTypePieData = useMemo(() => {
    const typeCount: Record<string, number> = {};
    errorCards.forEach(c => {
      const label = ERROR_TYPE_META[c.errorType]?.label ?? c.errorType;
      typeCount[label] = (typeCount[label] || 0) + 1;
    });
    return Object.entries(typeCount).map(([name, value]) => ({
      name,
      value,
      color: ERROR_TYPE_COLORS[Object.keys(ERROR_TYPE_META).find(k => ERROR_TYPE_META[k as ErrorType]?.label === name) ?? ''] || '#64748b',
    }));
  }, [errorCards]);

  const topValueCards = useMemo(() => {
    return [...errorCards].sort((a, b) => b.errorValue - a.errorValue).slice(0, 5);
  }, [errorCards]);

  const totalErrorValue = useMemo(() => errorCards.reduce((s, c) => s + c.errorValue, 0), [errorCards]);
  const avgMultiplier = useMemo(() => {
    if (errorCards.length === 0) return 0;
    return errorCards.reduce((s, c) => s + c.premiumMultiplier, 0) / errorCards.length;
  }, [errorCards]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Error Card Database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <AlertTriangle size={32} className="text-red-400 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/20">
            <AlertOctagon size={24} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Error Card &amp; Misprint Database</h1>
            <p className="text-sm text-slate-400">Catalog, identify, and track error cards, misprints, and valuable variations &mdash; Phase 157</p>
          </div>
        </div>
        {stats && (
          <span className="px-3 py-1.5 text-sm font-bold bg-red-500/20 text-red-300 rounded-full">
            {stats.totalCataloged} Cataloged
          </span>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Error Cards</p>
          <p className="text-2xl font-bold text-white">{stats?.totalErrors ?? 0}</p>
          <p className="text-xs text-slate-600 mt-1">Documented</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Variations</p>
          <p className="text-2xl font-bold text-purple-400">{stats?.totalVariations ?? 0}</p>
          <p className="text-xs text-slate-600 mt-1">In guides</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Value</p>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalErrorValue)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg Premium</p>
          <p className="text-2xl font-bold text-amber-400">{stats?.avgPremium ?? 0}x</p>
          <p className="text-xs text-slate-600 mt-1">Multiplier</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Highest Premium</p>
          <p className="text-2xl font-bold text-red-400">{stats?.highestPremium ?? 0}x</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Recent</p>
          <p className="text-2xl font-bold text-cyan-400">{stats?.recentDiscoveries ?? 0}</p>
          <p className="text-xs text-slate-600 mt-1">Discoveries</p>
        </div>
      </div>

      {/* Error Cards Table with Type Badges */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <FileText size={18} className="text-red-400" />
            Error Cards Database
          </h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search player, set, type..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 pr-4 py-1.5 text-xs bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500/50"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Player</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Year / Set</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Error Type</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Rarity</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Normal</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Error Value</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Premium</th>
                <th className="text-right text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Pop</th>
                <th className="text-left text-[10px] text-slate-500 uppercase tracking-wider py-2 px-3">Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.map(card => {
                const typeMeta = ERROR_TYPE_META[card.errorType];
                const rarityMeta = RARITY_META[card.rarity];
                const diffMeta = DIFFICULTY_META[card.verificationDifficulty];
                return (
                  <tr key={card.id} className="border-b border-slate-700/30 hover:bg-slate-700/20">
                    <td className="py-2 px-3 text-white font-medium">{card.player}</td>
                    <td className="py-2 px-3 text-slate-400 text-xs">{card.year} {card.set}</td>
                    <td className="py-2 px-3">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${typeMeta?.bg ?? 'bg-slate-500/10'} ${typeMeta?.color ?? 'text-slate-400'} border ${typeMeta?.border ?? 'border-slate-500/30'}`}>
                        {typeMeta?.label ?? card.errorType}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${rarityMeta?.bg ?? 'bg-slate-500/10'} ${rarityMeta?.color ?? 'text-slate-400'}`}>
                        {rarityMeta?.label ?? card.rarity}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400">{formatCurrency(card.normalValue)}</td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-bold">{formatCurrency(card.errorValue)}</td>
                    <td className="py-2 px-3 text-right text-amber-400 font-bold">{card.premiumMultiplier}x</td>
                    <td className="py-2 px-3 text-right text-slate-300">{card.knownPopulation}</td>
                    <td className="py-2 px-3">
                      <span className={`text-[10px] font-bold ${diffMeta?.color ?? 'text-slate-400'}`}>{diffMeta?.label ?? card.verificationDifficulty}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* BarChart Value Multipliers + PieChart Errors by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-brand-lime" />
            Avg Value Multiplier by Error Type
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={multiplierChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis type="category" dataKey="type" tick={{ fontSize: 9, fill: '#64748b' }} width={110} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} formatter={(value: number) => [`${value}x`, 'Avg Multiplier']} />
                <Bar dataKey="avgMultiplier" fill="#ef4444" name="Avg Multiplier" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <AlertOctagon size={18} className="text-red-400" />
            Errors by Type
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={errorTypePieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {errorTypePieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Discoveries Feed */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
          <Zap size={18} className="text-amber-400" />
          Recent Discoveries &amp; Alerts
        </h2>
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className={`bg-slate-900/50 border rounded-xl p-4 ${urgencyColor(alert.urgency).split(' ').filter(c => c.startsWith('border-')).join(' ') || 'border-slate-700/30'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${urgencyColor(alert.urgency)}`}>
                    {alert.urgency}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{alertTypeLabel(alert.type)}</span>
                </div>
                <span className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Clock size={10} /> {formatDate(alert.date)}
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-2">{alert.message}</p>
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span>Player: <span className="text-white font-bold">{alert.card.player}</span></span>
                <span>Set: <span className="text-slate-300">{alert.card.year} {alert.card.set}</span></span>
                <span>Value: <span className="text-emerald-400 font-bold">{formatCurrency(alert.card.errorValue)}</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Identification Guides + Notable Historical Errors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identification Guides */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Eye size={18} className="text-cyan-400" />
            Identification Guides
          </h2>
          <div className="space-y-3">
            {guides.map(guide => (
              <div key={guide.setId} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-white">{guide.setName}</p>
                  <span className="text-[10px] text-slate-500">{guide.year}</span>
                </div>
                <div className="space-y-2">
                  {guide.variations.map((v, idx) => {
                    const vMeta = ERROR_TYPE_META[v.type];
                    return (
                      <div key={idx} className="bg-slate-800/50 rounded-lg p-2">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-mono">{v.cardNumber}</span>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${vMeta?.bg ?? 'bg-slate-500/10'} ${vMeta?.color ?? 'text-slate-400'}`}>
                              {vMeta?.label ?? v.type}
                            </span>
                          </div>
                          <span className="text-[10px] text-amber-400 font-bold">{v.valueMultiplier}x</span>
                        </div>
                        <p className="text-[10px] text-slate-400">{v.howToIdentify}</p>
                        <p className="text-[10px] text-slate-600 mt-1">Est. pop: {v.estimatedPop}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notable Historical Errors */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Award size={18} className="text-violet-400" />
            Notable Historical Errors &mdash; Top Value
          </h2>
          <div className="space-y-3">
            {topValueCards.map((card, idx) => {
              const typeMeta = ERROR_TYPE_META[card.errorType];
              const rarityMeta = RARITY_META[card.rarity];
              return (
                <div key={card.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${idx === 0 ? 'bg-amber-500/20' : idx === 1 ? 'bg-slate-400/20' : idx === 2 ? 'bg-orange-500/20' : 'bg-slate-700/50'}`}>
                      <span className={`text-xs font-bold ${idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-orange-400' : 'text-slate-500'}`}>#{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">{card.player}</p>
                      <p className="text-[10px] text-slate-500">{card.year} {card.set} &middot; {card.manufacturer}</p>
                    </div>
                    <p className="text-lg font-bold text-emerald-400">{formatCurrency(card.errorValue)}</p>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">{card.description.length > 150 ? card.description.slice(0, 150) + '...' : card.description}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${typeMeta?.bg ?? ''} ${typeMeta?.color ?? ''}`}>
                      {typeMeta?.label ?? card.errorType}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${rarityMeta?.bg ?? ''} ${rarityMeta?.color ?? ''}`}>
                      {rarityMeta?.label ?? card.rarity}
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold ml-auto">{card.premiumMultiplier}x premium</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Community Reports + Verification Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Community Reports */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Users size={18} className="text-blue-400" />
            Community Reports
          </h2>
          <div className="space-y-3">
            {alerts.filter(a => a.type === 'new_discovery' || a.type === 'verification_needed').map(alert => (
              <div key={alert.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${alert.type === 'new_discovery' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {alertTypeLabel(alert.type)}
                  </span>
                  <span className="text-[10px] text-slate-500">{formatDate(alert.date)}</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">{alert.message}</p>
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span>{alert.card.player} &middot; {alert.card.year} {alert.card.set}</span>
                  <span className={`font-bold ${RARITY_META[alert.card.rarity]?.color ?? 'text-slate-400'}`}>
                    {RARITY_META[alert.card.rarity]?.label ?? alert.card.rarity}
                  </span>
                </div>
              </div>
            ))}
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">Community Tip</span>
                <span className="text-[10px] text-slate-500">Ongoing</span>
              </div>
              <p className="text-xs text-slate-300 mb-2">Collectors report possible new SSP variation in 2024 Topps Series 2 for card #450. Multiple independent sources confirm different photo crop. Awaiting PSA confirmation.</p>
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span>Reports: <span className="text-blue-400 font-bold">7</span></span>
                <span>Confidence: <span className="text-amber-400 font-bold">Medium</span></span>
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">User Submission</span>
                <span className="text-[10px] text-slate-500">2d ago</span>
              </div>
              <p className="text-xs text-slate-300 mb-2">User submitted a possible missing foil error on 2023 Panini Select NBA. Card shows no foil on the Concourse level die-cut. Under review by verification team.</p>
              <div className="flex items-center gap-3 text-[10px] text-slate-500">
                <span>Status: <span className="text-amber-400 font-bold">Under Review</span></span>
                <span>Submitted by: <span className="text-slate-300">CardDetective42</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
            <Shield size={18} className="text-emerald-400" />
            Verification Status &amp; Authentication
          </h2>
          <div className="space-y-3">
            {errorCards.slice(0, 6).map(card => {
              const diffMeta = DIFFICULTY_META[card.verificationDifficulty];
              const isVerified = card.knownPopulation > 100;
              return (
                <div key={card.id} className={`bg-slate-900/50 border rounded-xl p-4 ${isVerified ? 'border-emerald-500/20' : 'border-amber-500/20'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isVerified ? (
                        <CheckCircle2 size={14} className="text-emerald-400" />
                      ) : (
                        <Clock size={14} className="text-amber-400" />
                      )}
                      <p className="text-sm font-bold text-white">{card.player}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${isVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{card.year} {card.set}</span>
                    <span>Difficulty: <span className={`font-bold ${diffMeta?.color ?? 'text-slate-400'}`}>{diffMeta?.label ?? card.verificationDifficulty}</span></span>
                    <span>Pop: <span className="text-blue-400 font-bold">{card.knownPopulation}</span></span>
                  </div>
                  <div className="mt-2">
                    <p className="text-[10px] text-slate-500 mb-1">Key identification tip:</p>
                    <p className="text-[10px] text-slate-400 italic">{card.identificationTips[0]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorCard;
