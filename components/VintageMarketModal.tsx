// @ts-nocheck
import React, { useState } from 'react';
import {
  X,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
} from 'lucide-react';
import {
  getVintageCards,
  getRegistrySets,
  getVintageMarketTrends,
  getConditionCensus,
  getVintageStats,
} from '../lib/analytics/vintageMarketService';
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

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = 'census' | 'registry' | 'trends' | 'valuations';

const VintageMarketModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<TabKey>('census');
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  if (!isOpen) return null;

  const cards = getVintageCards();
  const registrySets = getRegistrySets();
  const trends = getVintageMarketTrends();
  const stats = getVintageStats();

  const gradeColors: Record<string, string> = {
    museum: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    investment: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    collector: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    entry: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  const trendIcons: Record<string, React.ReactNode> = {
    appreciating: <TrendingUp size={12} className="text-emerald-400" />,
    stable: <Minus size={12} className="text-blue-400" />,
    softening: <TrendingDown size={12} className="text-red-400" />,
  };

  const trendColors: Record<string, string> = {
    appreciating: 'text-emerald-400',
    stable: 'text-blue-400',
    softening: 'text-red-400',
  };

  const eraLabels: Record<string, string> = {
    pre_war: 'Pre-War',
    post_war: 'Post-War',
    golden_age: 'Golden Age',
    silver_age: 'Silver Age',
    bronze_age: 'Bronze Age',
  };

  const formatValue = (v: number) => {
    if (v >= 1000000) return `$${(v / 1000000).toFixed(2)}M`;
    if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
    return `$${v}`;
  };

  const chartData = trends.map(t => ({
    era: t.era.split('(')[0].trim(),
    '1yr Return': t.avgReturn1yr,
    '5yr Return': t.avgReturn5yr,
  }));

  const barColors = ['#f59e0b', '#3b82f6', '#eab308', '#94a3b8', '#f97316'];

  const renderCensusTab = () => {
    const censusCard = selectedCard
      ? cards.find(c => c.id === selectedCard)
      : null;
    const census = selectedCard ? getConditionCensus(selectedCard) : null;

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => setSelectedCard(selectedCard === card.id ? null : card.id)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                selectedCard === card.id
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800/50 text-slate-400 border-slate-700/30 hover:text-slate-200'
              }`}
            >
              {card.year} {card.player}
            </button>
          ))}
        </div>

        {censusCard && census ? (
          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-200">{censusCard.year} {censusCard.player}</h4>
                  <p className="text-xs text-slate-500">{censusCard.set} — {censusCard.manufacturer}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Highest Known</p>
                  <p className="text-sm font-bold text-amber-400">{censusCard.conditionCensus.highestKnown}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-500">Total Graded</p>
                  <p className="text-sm font-bold text-slate-200">{census.totalGraded.toLocaleString()}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-500">Pop at Top</p>
                  <p className="text-sm font-bold text-amber-400">{censusCard.conditionCensus.population}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                  <p className="text-[10px] text-slate-500">Significance</p>
                  <p className="text-sm font-bold text-emerald-400">{censusCard.historicalSignificance}/100</p>
                </div>
              </div>

              <h5 className="text-xs font-semibold text-slate-300 mb-2">Population Report</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-700/30">
                      <th className="text-left py-1.5 px-2">Grade</th>
                      <th className="text-right py-1.5 px-2">Count</th>
                      <th className="text-right py-1.5 px-2">Rank</th>
                      <th className="text-right py-1.5 px-2">% of Pop</th>
                    </tr>
                  </thead>
                  <tbody>
                    {census.population.map(p => (
                      <tr key={p.grade} className="border-b border-slate-700/20 hover:bg-slate-800/30">
                        <td className="py-1.5 px-2 font-semibold text-slate-300">{p.grade}</td>
                        <td className="py-1.5 px-2 text-right text-slate-200">{p.count}</td>
                        <td className="py-1.5 px-2 text-right text-amber-400">#{p.rank || '---'}</td>
                        <td className="py-1.5 px-2 text-right text-slate-400">
                          {p.count > 0 ? ((p.count / census.totalGraded) * 100).toFixed(1) : '0.0'}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {census.keyDates.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
                <h5 className="text-xs font-semibold text-slate-300 mb-3">Key Census Events</h5>
                <div className="space-y-2">
                  {census.keyDates.map((kd, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs">
                      <span className="text-[10px] text-slate-500 whitespace-nowrap mt-0.5">{kd.date}</span>
                      <div>
                        <p className="text-slate-300">{kd.event}</p>
                        <p className="text-[10px] text-amber-400">{kd.impact}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 text-sm">
            Select a card above to view its condition census data
          </div>
        )}
      </div>
    );
  };

  const renderRegistryTab = () => (
    <div className="space-y-4">
      {registrySets.map(set => (
        <div key={set.id} className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-200">{set.name}</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">{set.description}</p>
            </div>
            <div className="ml-3 text-right flex-shrink-0">
              <p className="text-xs text-slate-500">Rank</p>
              <p className="text-lg font-bold text-amber-400">#{set.rank}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="bg-slate-900/50 rounded-lg p-2 text-center">
              <p className="text-[10px] text-slate-500">Completion</p>
              <p className="text-sm font-bold text-emerald-400">{set.completion}%</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-2 text-center">
              <p className="text-[10px] text-slate-500">GPA</p>
              <p className="text-sm font-bold text-blue-400">{set.gpa.toFixed(1)}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-2 text-center">
              <p className="text-[10px] text-slate-500">Cards</p>
              <p className="text-sm font-bold text-slate-200">{set.ownedCards}/{set.totalCards}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-2 text-center">
              <p className="text-[10px] text-slate-500">Competitors</p>
              <p className="text-sm font-bold text-slate-300">{set.competitors}</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="w-full bg-slate-700/30 rounded-full h-2 mr-3">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-400 h-2 rounded-full transition-all"
                style={{ width: `${set.completion}%` }}
              />
            </div>
            <span className="text-xs font-bold text-amber-400 whitespace-nowrap">{formatValue(set.value)}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTrendsTab = () => (
    <div className="space-y-4">
      <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <BarChart3 size={14} className="text-amber-400" />
          Returns by Era (%)
        </h4>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="era" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={50} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Bar dataKey="1yr Return" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="5yr Return" radius={[4, 4, 0, 0]}>
              {chartData.map((_, index) => (
                <Cell key={index} fill={barColors[index % barColors.length]} opacity={0.6} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        {trends.map(t => (
          <div key={t.era} className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {trendIcons[t.trend]}
                <h4 className="text-sm font-semibold text-slate-200">{t.era}</h4>
              </div>
              <span className={`text-xs font-semibold uppercase ${trendColors[t.trend]}`}>
                {t.trend}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                <p className="text-[10px] text-slate-500">1yr Return</p>
                <p className={`text-sm font-bold ${t.avgReturn1yr > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {t.avgReturn1yr > 0 ? '+' : ''}{t.avgReturn1yr}%
                </p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                <p className="text-[10px] text-slate-500">5yr Return</p>
                <p className={`text-sm font-bold ${t.avgReturn5yr > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {t.avgReturn5yr > 0 ? '+' : ''}{t.avgReturn5yr}%
                </p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                <p className="text-[10px] text-slate-500">Liquidity</p>
                <p className="text-sm font-bold text-blue-400">{t.liquidityScore}/100</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                <p className="text-[10px] text-slate-500">Top Performer</p>
                <p className="text-[10px] font-semibold text-amber-400 leading-tight">{t.topPerformer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderValuationsTab = () => {
    const sorted = [...cards].sort((a, b) => b.currentValue - a.currentValue);
    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700/30">
                <th className="text-left py-2 px-2">Card</th>
                <th className="text-left py-2 px-2">Era</th>
                <th className="text-left py-2 px-2">Grade</th>
                <th className="text-right py-2 px-2">Value</th>
                <th className="text-right py-2 px-2">5yr</th>
                <th className="text-right py-2 px-2">10yr</th>
                <th className="text-right py-2 px-2">Significance</th>
                <th className="text-center py-2 px-2">Investment</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(card => (
                <tr key={card.id} className="border-b border-slate-700/20 hover:bg-slate-800/30">
                  <td className="py-2 px-2">
                    <p className="font-semibold text-slate-200">{card.year} {card.player}</p>
                    <p className="text-[10px] text-slate-500">{card.set}</p>
                  </td>
                  <td className="py-2 px-2 text-slate-400">{eraLabels[card.era]}</td>
                  <td className="py-2 px-2">
                    <span className="text-amber-400 font-semibold">{card.conditionCensus.highestKnown}</span>
                    <span className="text-slate-500 ml-1">(Pop {card.conditionCensus.population})</span>
                  </td>
                  <td className="py-2 px-2 text-right font-bold text-slate-200">{formatValue(card.currentValue)}</td>
                  <td className="py-2 px-2 text-right text-emerald-400 font-semibold">+{card.appreciation5yr}%</td>
                  <td className="py-2 px-2 text-right text-emerald-400 font-semibold">+{card.appreciation10yr}%</td>
                  <td className="py-2 px-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <div className="w-12 bg-slate-700/30 rounded-full h-1.5">
                        <div
                          className="bg-amber-400 h-1.5 rounded-full"
                          style={{ width: `${card.historicalSignificance}%` }}
                        />
                      </div>
                      <span className="text-slate-300">{card.historicalSignificance}</span>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${gradeColors[card.investmentGrade]}`}>
                      {card.investmentGrade.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const tabConfig: { key: TabKey; label: string }[] = [
    { key: 'census', label: 'Census' },
    { key: 'registry', label: 'Registry Sets' },
    { key: 'trends', label: 'Market Trends' },
    { key: 'valuations', label: 'Valuations' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-gradient-to-r from-amber-500/10 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20">
              <Clock size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Vintage Market Scanner</h2>
              <p className="text-xs text-slate-400">Pre-1980 Card Intelligence & Condition Census</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-5 gap-3 p-4 bg-slate-800/30">
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Total Value</p>
            <p className="text-xl font-bold text-amber-400">{formatValue(stats.totalVintageValue)}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Avg Age</p>
            <p className="text-xl font-bold text-blue-400">{stats.avgAge} yrs</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Oldest Card</p>
            <p className="text-sm font-bold text-slate-200">{stats.oldestCard}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Appreciation</p>
            <p className="text-xl font-bold text-emerald-400">+{stats.portfolioAppreciation}%</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Registry Sets</p>
            <p className="text-xl font-bold text-purple-400">{stats.registrySets}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-4 pb-0">
          {tabConfig.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                tab === t.key
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[45vh]">
          {tab === 'census' && renderCensusTab()}
          {tab === 'registry' && renderRegistryTab()}
          {tab === 'trends' && renderTrendsTab()}
          {tab === 'valuations' && renderValuationsTab()}
        </div>
      </div>
    </div>
  );
};

export default VintageMarketModal;
