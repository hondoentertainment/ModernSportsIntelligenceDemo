import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  BarChart3,
  Trophy,
  Star,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Target,
  Award,
  Gem,
  PieChart as PieChartIcon,
  Grid3X3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  getParallelCards,
  getParallelSets,
  getParallelStats,
  getRarityBreakdown,
  getMostComplete,
  getMostValuable,
  getCompletionBySet,
  formatCurrency,
  formatPercent,
  getRarityColor,
  getRarityLabel,
  getCompletionColor,
  type ParallelCard,
  type ParallelSet,
  type ParallelStats,
  type RarityTier,
} from '../lib/utils/parallelUniverseService';

type TabId = 'parallels' | 'sets' | 'rarity' | 'stats';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'parallels', label: 'My Parallels', icon: <Layers className="w-4 h-4" /> },
  { id: 'sets', label: 'Sets', icon: <Grid3X3 className="w-4 h-4" /> },
  { id: 'rarity', label: 'Rarity Breakdown', icon: <Gem className="w-4 h-4" /> },
  { id: 'stats', label: 'Stats', icon: <BarChart3 className="w-4 h-4" /> },
];

const ParallelUniverse: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('parallels');
  const [cards, setCards] = useState<ParallelCard[]>([]);
  const [sets, setSets] = useState<ParallelSet[]>([]);
  const [stats, setStats] = useState<ParallelStats | null>(null);
  const [rarityTiers, setRarityTiers] = useState<RarityTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setCards(getParallelCards());
      setSets(getParallelSets());
      setStats(getParallelStats());
      setRarityTiers(getRarityBreakdown());
      setLoading(false);
    } catch {
      setError('Failed to load Parallel Universe data');
      setLoading(false);
    }
  }, []);

  const mostComplete = useMemo(() => getMostComplete(5), []);
  const mostValuable = useMemo(() => getMostValuable(5), []);
  const completionBySet = useMemo(() => getCompletionBySet(), []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-slate-400 text-lg">Loading Parallel Universe...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Layers className="w-8 h-8 text-purple-400" />
            Parallel Universe Tracker
          </h1>
          <p className="text-slate-400 mt-2">
            Track every parallel, chase the rainbow, complete the set
          </p>
        </div>

        {/* Summary Stats Bar */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm">Cards Tracked</div>
              <div className="text-2xl font-bold">{stats.totalCardsTracked}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm">Parallels Owned</div>
              <div className="text-2xl font-bold text-blue-400">{stats.totalParallelsOwned}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm">Completion Rate</div>
              <div className="text-2xl font-bold text-green-400">{formatPercent(stats.completionRate)}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm">Total Value</div>
              <div className="text-2xl font-bold text-yellow-400">{formatCurrency(stats.totalValue)}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm">Rarest Owned</div>
              <div className="text-lg font-bold text-red-400">
                {stats.rarestOwned.name} {stats.rarestOwned.numberedTo > 0 && `/${stats.rarestOwned.numberedTo}`}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-800 rounded-lg p-1 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'parallels' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Parallel Card Collection
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {cards.map((card) => (
                <div key={card.id} className="bg-slate-800 rounded-lg p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{card.player}</h3>
                      <p className="text-slate-400 text-sm">{card.baseCardName}</p>
                      <p className="text-slate-500 text-xs">{card.sport} &middot; {card.year}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold">{formatCurrency(card.totalValue)}</div>
                      <div className="text-sm" style={{ color: getCompletionColor(card.completionPercent) }}>
                        {formatPercent(card.completionPercent)} complete
                      </div>
                    </div>
                  </div>

                  {/* Rainbow Progress Bar */}
                  <div className="flex gap-1 mb-3">
                    {card.parallels.map((p) => (
                      <div
                        key={p.name}
                        className="h-2 flex-1 rounded-full"
                        style={{
                          backgroundColor: p.owned ? p.color : '#334155',
                          opacity: p.owned ? 1 : 0.4,
                        }}
                        title={`${p.name}: ${p.owned ? 'Owned' : 'Missing'}`}
                      />
                    ))}
                  </div>

                  {/* Parallel Checklist */}
                  <div className="space-y-1.5">
                    {card.parallels.map((p) => (
                      <div
                        key={p.name}
                        className={`flex items-center justify-between px-3 py-1.5 rounded text-sm ${
                          p.owned ? 'bg-slate-700' : 'bg-slate-800 border border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {p.owned ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-slate-500" />
                          )}
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: p.color }}
                          />
                          <span className={p.owned ? 'text-white' : 'text-slate-500'}>
                            {p.name}
                          </span>
                          {p.numberedTo && (
                            <span className="text-slate-500 text-xs">/{p.numberedTo}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${getRarityColor(p.rarity)}22`,
                              color: getRarityColor(p.rarity),
                            }}
                          >
                            {getRarityLabel(p.rarity)}
                          </span>
                          <span className="text-slate-400 text-sm">{formatCurrency(p.value)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sets' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Grid3X3 className="w-5 h-5 text-blue-400" />
              Parallel Sets
            </h2>

            {/* Set-level completion chart */}
            <div className="bg-slate-800 rounded-lg p-5 mb-6">
              <h3 className="font-semibold mb-4">Completion by Set</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={completionBySet}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="setName" stroke="#94A3B8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
                  />
                  <Bar dataKey="ownedCount" name="Owned" fill="#3B82F6" stackId="stack" />
                  <Bar
                    dataKey="totalCards"
                    name="Total"
                    fill="#334155"
                    stackId="stack"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Set cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sets.map((s) => (
                <div key={s.id} className="bg-slate-800 rounded-lg p-5">
                  <h3 className="font-bold text-lg">{s.setName}</h3>
                  <p className="text-slate-400 text-sm mb-3">
                    {s.brand} &middot; {s.year} &middot; {s.sport}
                  </p>
                  <div className="text-slate-400 text-sm mb-3">
                    {s.baseCards} base cards &middot; {s.totalPossibleCards} total possible
                  </div>
                  <div className="text-sm font-medium mb-2">Parallel Rainbow</div>
                  <div className="flex gap-1 mb-3">
                    {s.parallelTypes.map((pt) => (
                      <div
                        key={pt.name}
                        className="h-3 flex-1 rounded-full"
                        style={{ backgroundColor: pt.color }}
                        title={`${pt.name} (${pt.numberedTo ? `/${pt.numberedTo}` : 'Unnumbered'})`}
                      />
                    ))}
                  </div>
                  <div className="space-y-1">
                    {s.parallelTypes.map((pt) => (
                      <div key={pt.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: pt.color }}
                          />
                          <span className="text-slate-300">{pt.name}</span>
                        </div>
                        <span className="text-slate-500">
                          {pt.numberedTo ? `/${pt.numberedTo}` : 'Unnumbered'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'rarity' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Gem className="w-5 h-5 text-yellow-400" />
              Rarity Breakdown
            </h2>

            {/* Rarity pie chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-800 rounded-lg p-5">
                <h3 className="font-semibold mb-4">Distribution by Rarity</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={rarityTiers}
                      dataKey="count"
                      nameKey="rarity"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ rarity }) => getRarityLabel(rarity)}
                    >
                      {rarityTiers.map((tier) => (
                        <Cell key={tier.rarity} fill={getRarityColor(tier.rarity)} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-800 rounded-lg p-5">
                <h3 className="font-semibold mb-4">Value by Rarity</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={rarityTiers}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis
                      dataKey="rarity"
                      stroke="#94A3B8"
                      tickFormatter={(v) => getRarityLabel(v)}
                    />
                    <YAxis stroke="#94A3B8" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="totalValue" name="Total Value">
                      {rarityTiers.map((tier) => (
                        <Cell key={tier.rarity} fill={getRarityColor(tier.rarity)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rarity tier table */}
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-4 text-slate-400">Rarity</th>
                    <th className="text-right p-4 text-slate-400">Total</th>
                    <th className="text-right p-4 text-slate-400">Owned</th>
                    <th className="text-right p-4 text-slate-400">Total Value</th>
                    <th className="text-right p-4 text-slate-400">Avg Value</th>
                  </tr>
                </thead>
                <tbody>
                  {rarityTiers.map((tier) => (
                    <tr key={tier.rarity} className="border-b border-slate-700/50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: getRarityColor(tier.rarity) }}
                          />
                          <span style={{ color: getRarityColor(tier.rarity) }}>
                            {getRarityLabel(tier.rarity)}
                          </span>
                        </div>
                      </td>
                      <td className="text-right p-4">{tier.count}</td>
                      <td className="text-right p-4 text-green-400">{tier.ownedCount}</td>
                      <td className="text-right p-4 text-yellow-400">
                        {formatCurrency(tier.totalValue)}
                      </td>
                      <td className="text-right p-4 text-slate-300">
                        {formatCurrency(tier.avgValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-400" />
              Collection Statistics
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Most Valuable Parallels */}
              <div className="bg-slate-800 rounded-lg p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Most Valuable Cards
                </h3>
                <div className="space-y-3">
                  {mostValuable.map((card, i) => (
                    <div key={card.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 font-mono w-6">#{i + 1}</span>
                        <div>
                          <div className="font-medium">{card.player}</div>
                          <div className="text-slate-400 text-sm">{card.baseCardName}</div>
                        </div>
                      </div>
                      <div className="text-yellow-400 font-bold">
                        {formatCurrency(card.totalValue)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Most Complete Cards */}
              <div className="bg-slate-800 rounded-lg p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-400" />
                  Most Complete Rainbows
                </h3>
                <div className="space-y-3">
                  {mostComplete.map((card, i) => (
                    <div key={card.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 font-mono w-6">#{i + 1}</span>
                          <div>
                            <div className="font-medium">{card.player}</div>
                            <div className="text-slate-400 text-sm">
                              {card.ownedCount}/{card.totalParallels} parallels
                            </div>
                          </div>
                        </div>
                        <span
                          className="font-bold"
                          style={{ color: getCompletionColor(card.completionPercent) }}
                        >
                          {formatPercent(card.completionPercent)}
                        </span>
                      </div>
                      {/* Stacked completion bar */}
                      <div className="ml-9 flex gap-0.5">
                        {card.parallels.map((p) => (
                          <div
                            key={p.name}
                            className="h-1.5 flex-1 rounded-full"
                            style={{
                              backgroundColor: p.owned ? p.color : '#334155',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completion Progress by Set */}
              <div className="bg-slate-800 rounded-lg p-5 lg:col-span-2">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Set Completion Progress
                </h3>
                <div className="space-y-4">
                  {completionBySet.map((s) => (
                    <div key={s.setName}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{s.setName}</span>
                        <span className="text-sm text-slate-400">
                          {s.ownedCount}/{s.totalCards} &middot;{' '}
                          <span style={{ color: getCompletionColor(s.completionPercent) }}>
                            {formatPercent(s.completionPercent)}
                          </span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-3">
                        <div
                          className="h-3 rounded-full transition-all"
                          style={{
                            width: `${Math.min(s.completionPercent, 100)}%`,
                            backgroundColor: getCompletionColor(s.completionPercent),
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unique Parallels & Summary */}
              {stats && (
                <div className="bg-slate-800 rounded-lg p-5 lg:col-span-2">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-400" />
                    Collection Highlights
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-900 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-purple-400">
                        {stats.uniqueParallels}
                      </div>
                      <div className="text-slate-400 text-sm">Unique Parallel Types</div>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-4 text-center">
                      <div
                        className="text-3xl font-bold"
                        style={{ color: getCompletionColor(stats.completionRate) }}
                      >
                        {formatPercent(stats.completionRate)}
                      </div>
                      <div className="text-slate-400 text-sm">Overall Completion</div>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-4 text-center">
                      <div className="text-3xl font-bold text-yellow-400">
                        {formatCurrency(stats.totalValue)}
                      </div>
                      <div className="text-slate-400 text-sm">Portfolio Value</div>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {stats.mostComplete.cardName.split('#')[0]?.trim() || stats.mostComplete.cardName}
                      </div>
                      <div className="text-slate-400 text-sm">
                        Most Complete ({formatPercent(stats.mostComplete.percent)})
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParallelUniverse;
