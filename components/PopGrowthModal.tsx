import React, { useMemo, useState } from 'react';
import {
  X,
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Diamond,
  BarChart3,
  Shield,
  ChevronDown,
  Package,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { CardInventory } from '../types';
import {
  getPopGrowthRate,
  getSupplyDemandIndicator,
  getGemRateData,
  estimateSubmissionVolume,
  getCollectionPopImpact,
  getSupplyRiskAlerts,
  SupplyRiskAlert,
  CollectionPopImpact,
  SupplyDemandLabel,
  PopGrowthData,
} from '../lib/analytics/popGrowthService';

interface PopGrowthModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardInventory[];
}

type TabId = 'overview' | 'detail' | 'gems';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <Shield size={16} /> },
  { id: 'detail', label: 'Card Detail', icon: <BarChart3 size={16} /> },
  { id: 'gems', label: 'Gem Rates', icon: <Diamond size={16} /> },
];

const SUPPLY_DEMAND_LABELS: Record<SupplyDemandLabel, { label: string; color: string; bg: string; border: string }> = {
  supply_pressure: { label: 'Supply Pressure', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  demand_driven: { label: 'Demand Driven', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  scarcity_play: { label: 'Scarcity Play', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  neutral: { label: 'Neutral', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
};

const severityColors: Record<string, { text: string; bg: string; border: string }> = {
  critical: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  warning: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  watch: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
};

const riskLevelColors: Record<string, string> = {
  high: 'text-red-400',
  medium: 'text-amber-400',
  low: 'text-green-400',
};

const GRADE_LINE_COLORS: Record<string, string> = {
  'PSA 7': '#6366f1',
  'PSA 8': '#3b82f6',
  'PSA 9': '#10b981',
  'PSA 10': '#f59e0b',
};

// ---- Overview Tab ----

const OverviewTab: React.FC<{
  impacts: CollectionPopImpact[];
  alerts: SupplyRiskAlert[];
}> = ({ impacts, alerts }) => {
  const highRisk = impacts.filter(i => i.riskLevel === 'high').length;
  const medRisk = impacts.filter(i => i.riskLevel === 'medium').length;
  const lowRisk = impacts.filter(i => i.riskLevel === 'low').length;

  const avgGrowth = impacts.length > 0
    ? Math.round(impacts.reduce((s, i) => s + i.growthRate, 0) / impacts.length * 10) / 10
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Cards Tracked
          </p>
          <p className="text-2xl font-bebas tracking-wider text-white">{impacts.length}</p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Avg Growth
          </p>
          <p className={`text-2xl font-bebas tracking-wider ${avgGrowth > 15 ? 'text-amber-400' : 'text-white'}`}>
            {avgGrowth > 0 ? '+' : ''}{avgGrowth}%
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            High Risk
          </p>
          <p className={`text-2xl font-bebas tracking-wider ${highRisk > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {highRisk}
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Moderate
          </p>
          <p className="text-2xl font-bebas tracking-wider text-amber-400">{medRisk}</p>
        </div>
      </div>

      {/* Risk Distribution Bar */}
      <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Supply Risk Distribution
        </p>
        <div className="flex h-4 rounded-full overflow-hidden bg-slate-700">
          {highRisk > 0 && (
            <div
              className="bg-red-500 transition-all duration-500"
              style={{ width: `${(highRisk / impacts.length) * 100}%` }}
            />
          )}
          {medRisk > 0 && (
            <div
              className="bg-amber-500 transition-all duration-500"
              style={{ width: `${(medRisk / impacts.length) * 100}%` }}
            />
          )}
          {lowRisk > 0 && (
            <div
              className="bg-green-500 transition-all duration-500"
              style={{ width: `${(lowRisk / impacts.length) * 100}%` }}
            />
          )}
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-slate-400">High ({highRisk})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-400">Medium ({medRisk})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-slate-400">Low ({lowRisk})</span>
          </span>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Supply Risk Alerts ({alerts.length})
        </p>
        {alerts.length === 0 && (
          <div className="p-5 bg-green-500/5 border border-green-500/15 rounded-2xl text-center">
            <p className="text-sm text-green-400">No significant supply risk alerts</p>
          </div>
        )}
        {alerts.slice(0, 10).map((alert, i) => {
          const colors = severityColors[alert.severity];
          return (
            <div
              key={`${alert.cardId}-${alert.grade}-${i}`}
              className={`p-4 rounded-2xl border ${colors.bg} ${colors.border} space-y-1`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className={colors.text} />
                  <span className={`text-xs font-bold uppercase tracking-widest ${colors.text}`}>
                    {alert.severity}
                  </span>
                </div>
                <span className={`text-xs font-mono font-bold ${colors.text}`}>
                  +{alert.growthRate.toFixed(1)}%/yr
                </span>
              </div>
              <p className="text-sm text-slate-300">{alert.message}</p>
            </div>
          );
        })}
      </div>

      {/* Collection Impact Table */}
      {impacts.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            Collection Impact Summary
          </p>
          <div className="space-y-1.5">
            {impacts
              .sort((a, b) => b.growthRate - a.growthRate)
              .slice(0, 10)
              .map((impact, i) => (
                <div
                  key={impact.cardId + i}
                  className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 border border-transparent rounded-xl text-sm hover:bg-slate-800/60 transition-colors"
                >
                  <span className="text-white font-medium truncate flex-1">{impact.player}</span>
                  <span className="text-xs text-slate-500 font-mono">Pop {impact.currentPop.toLocaleString()}</span>
                  <span className={`text-xs font-mono font-bold ${riskLevelColors[impact.riskLevel]}`}>
                    +{impact.growthRate.toFixed(1)}%
                  </span>
                  <span className={`text-xs font-mono ${impact.estimatedPriceImpact >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {impact.estimatedPriceImpact >= 0 ? '+' : ''}{impact.estimatedPriceImpact.toFixed(1)}% price
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ---- Card Detail Tab ----

const CardDetailTab: React.FC<{
  cards: CardInventory[];
}> = ({ cards }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedCard = cards[selectedIdx];

  const popData: PopGrowthData | null = useMemo(() => {
    if (!selectedCard) return null;
    return getPopGrowthRate(selectedCard);
  }, [selectedCard]);

  const supplyDemand = useMemo(() => {
    if (!selectedCard) return null;
    return getSupplyDemandIndicator(selectedCard);
  }, [selectedCard]);

  // Prepare chart data: sample every 4 weeks for cleaner chart
  const chartData = useMemo(() => {
    if (!popData) return [];
    return popData.snapshots
      .filter((_, i) => i % 4 === 0 || i === popData.snapshots.length - 1)
      .map(snap => {
        const dateObj = new Date(snap.date);
        const label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return {
          date: label,
          'PSA 7': snap.grades['PSA 7'] ?? 0,
          'PSA 8': snap.grades['PSA 8'] ?? 0,
          'PSA 9': snap.grades['PSA 9'] ?? 0,
          'PSA 10': snap.grades['PSA 10'] ?? 0,
        };
      });
  }, [popData]);

  if (!selectedCard || !popData || !supplyDemand) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm">
        No cards in collection to analyze
      </div>
    );
  }

  const sdColors = SUPPLY_DEMAND_LABELS[supplyDemand.label];

  return (
    <div className="space-y-6">
      {/* Card Selector */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white hover:border-slate-600 transition-colors"
        >
          <span className="truncate">{selectedCard.player} — {selectedCard.year} {selectedCard.set}</span>
          <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
        </button>
        {showDropdown && (
          <div className="absolute z-50 top-full mt-1 w-full max-h-64 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-xl">
            {cards.map((card, i) => (
              <button
                key={card.id}
                onClick={() => {
                  setSelectedIdx(i);
                  setShowDropdown(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-700 transition-colors truncate ${
                  i === selectedIdx ? 'text-brand-lime bg-slate-700/50' : 'text-white'
                }`}
              >
                {card.player} — {card.year} {card.set}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Supply/Demand Badge + Growth Rate */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${sdColors.color} ${sdColors.bg} border ${sdColors.border}`}>
          {sdColors.label}
        </span>
        <span className={`text-xs font-mono font-bold ${popData.overallGrowthRate > 20 ? 'text-red-400' : popData.overallGrowthRate > 10 ? 'text-amber-400' : 'text-green-400'}`}>
          {popData.overallGrowthRate > 0 ? '+' : ''}{popData.overallGrowthRate}% annual pop growth
        </span>
        {popData.supplyRisk && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/30">
            <AlertTriangle size={10} />
            Supply Risk
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400">{supplyDemand.description}</p>

      {/* Growth Rate by Grade */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(popData.growthRateByGrade).map(([grade, rate]) => (
          <div key={grade} className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
              {grade}
            </p>
            <p className={`text-lg font-bebas tracking-wider ${rate > 20 ? 'text-red-400' : rate > 10 ? 'text-amber-400' : 'text-green-400'}`}>
              +{rate.toFixed(1)}%
            </p>
          </div>
        ))}
      </div>

      {/* Pop by Grade Chart */}
      <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Population by Grade (12 Months)
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px' }}
              />
              {Object.entries(GRADE_LINE_COLORS).map(([grade, color]) => (
                <Line
                  key={grade}
                  type="monotone"
                  dataKey={grade}
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// ---- Gem Rates Tab ----

const GemRatesTab: React.FC<{
  cards: CardInventory[];
}> = ({ cards }) => {
  // Compute gem rate data for all cards
  const gemData = useMemo(() => {
    return cards.slice(0, 20).map(card => {
      const data = getGemRateData(card);
      const volume = estimateSubmissionVolume(card);
      return { card, gemRate: data, volume };
    });
  }, [cards]);

  // Aggregate submission volume chart: sum across all cards per month
  const aggregateSubmissions = useMemo(() => {
    if (gemData.length === 0) return [];
    const monthMap: Record<string, number> = {};
    for (const item of gemData) {
      for (const m of item.volume.monthlySubmissions) {
        monthMap[m.month] = (monthMap[m.month] ?? 0) + m.volume;
      }
    }
    return Object.entries(monthMap).map(([month, volume]) => ({ month, volume }));
  }, [gemData]);

  // Selected card for gem rate trend chart
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const selectedItem = gemData[selectedIdx];

  return (
    <div className="space-y-6">
      {/* Gem Rate Summary Cards */}
      <div className="space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Gem Rate by Card (PSA 10 %)
        </p>
        <div className="space-y-1.5">
          {gemData.slice(0, 10).map((item, i) => {
            const trendIcon = item.gemRate.gemRateTrend === 'rising'
              ? <TrendingUp size={12} className="text-green-400" />
              : item.gemRate.gemRateTrend === 'falling'
                ? <TrendingDown size={12} className="text-red-400" />
                : <Minus size={12} className="text-slate-400" />;

            return (
              <div
                key={item.card.id + i}
                className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 border border-transparent rounded-xl text-sm hover:bg-slate-800/60 transition-colors"
              >
                <Diamond size={14} className="text-amber-400 flex-shrink-0" />
                <span className="text-white font-medium truncate flex-1">{item.card.player}</span>
                <span className="text-xs text-slate-400 font-mono">
                  {item.gemRate.gemRate.toFixed(1)}%
                </span>
                {trendIcon}
                <span className="text-xs text-slate-500 font-mono">
                  ~{item.volume.averageMonthly}/mo
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gem Rate Trend Chart for Selected Card */}
      {selectedItem && (
        <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
              Gem Rate Trend
            </p>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 border border-slate-600 rounded-lg text-xs text-white hover:border-slate-500 transition-colors"
              >
                <span className="truncate max-w-[150px]">{selectedItem.card.player}</span>
                <ChevronDown size={12} className="text-slate-400" />
              </button>
              {showDropdown && (
                <div className="absolute z-50 right-0 top-full mt-1 w-48 max-h-48 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-xl">
                  {gemData.map((item, i) => (
                    <button
                      key={item.card.id}
                      onClick={() => {
                        setSelectedIdx(i);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-700 transition-colors truncate ${
                        i === selectedIdx ? 'text-brand-lime bg-slate-700/50' : 'text-white'
                      }`}
                    >
                      {item.card.player}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedItem.gemRate.monthlyGemRates} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Gem Rate']}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Submission Volume Chart */}
      {aggregateSubmissions.length > 0 && (
        <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <Package size={14} className="text-blue-400" />
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
              Aggregate Submission Volume
            </p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={aggregateSubmissions} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#334155' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} name="New Submissions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

// ---- Main Modal ----

export const PopGrowthModal: React.FC<PopGrowthModalProps> = ({
  isOpen,
  onClose,
  cards,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const impacts = useMemo(() => getCollectionPopImpact(cards), [cards]);
  const alerts = useMemo(() => getSupplyRiskAlerts(cards), [cards]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-blue-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/30">
              <Activity size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  <BarChart3 size={10} />
                  {cards.length} cards tracked
                </span>
                {alerts.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <AlertTriangle size={10} />
                    {alerts.length} alerts
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Pop Report <span className="text-blue-400">Growth Tracker</span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-700 bg-slate-800/30">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-brand-lime border-brand-lime bg-brand-lime/5'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8 max-h-[65vh] overflow-y-auto no-scrollbar">
          {activeTab === 'overview' && <OverviewTab impacts={impacts} alerts={alerts} />}
          {activeTab === 'detail' && <CardDetailTab cards={cards} />}
          {activeTab === 'gems' && <GemRatesTab cards={cards} />}
        </div>
      </div>
    </div>
  );
};

export default PopGrowthModal;
