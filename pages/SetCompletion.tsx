import React, { useState, useMemo } from 'react';
import {
  CheckCircle,
  Search,
  BarChart3,
  Library,
  XCircle,
  ShoppingCart,
  Target,
  TrendingUp,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  getTrackedSets,
  getMissingCards,
  getSourceRecommendations,
  getCompletionStats,
  getCheapestPath,
  getSetsByCompletion,
  getSetsBySport,
  getRarityBreakdown,
  formatCurrency,
  getCompletionColor,
  getRarityColor,
  getRarityLabel,
  CardSet,
  MissingCard,
  SourceRecommendation,
} from '../lib/core/setCompletionService';

type TabKey = 'my-sets' | 'missing-cards' | 'source-finder' | 'completion-stats';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'my-sets', label: 'My Sets', icon: <Library className="w-4 h-4" /> },
  { key: 'missing-cards', label: 'Missing Cards', icon: <XCircle className="w-4 h-4" /> },
  { key: 'source-finder', label: 'Source Finder', icon: <ShoppingCart className="w-4 h-4" /> },
  { key: 'completion-stats', label: 'Completion Stats', icon: <BarChart3 className="w-4 h-4" /> },
];

const PIE_COLORS = ['#9ca3af', '#60a5fa', '#a78bfa', '#facc15'];

function CircularProgress({ percent }: { percent: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  const color = percent >= 90 ? '#4ade80' : percent >= 70 ? '#facc15' : percent >= 50 ? '#fb923c' : '#f87171';

  return (
    <svg width="88" height="88" className="mx-auto">
      <circle cx="44" cy="44" r={radius} stroke="#334155" strokeWidth="6" fill="none" />
      <circle
        cx="44"
        cy="44"
        r={radius}
        stroke={color}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 44 44)"
      />
      <text x="44" y="48" textAnchor="middle" className="fill-white text-sm font-bold">
        {Math.round(percent)}%
      </text>
    </svg>
  );
}

function MySetsTab() {
  const [sportFilter, setSportFilter] = useState<string>('All');
  const sets = useMemo(() => getTrackedSets(), []);
  const sports = useMemo(() => ['All', ...Array.from(new Set(sets.map(s => s.sport)))], [sets]);

  const filtered = useMemo(() => {
    if (sportFilter === 'All') return getSetsByCompletion();
    return getSetsBySport(sportFilter).sort((a, b) => b.completionPercent - a.completionPercent);
  }, [sportFilter]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Filter className="w-5 h-5 text-slate-400" />
        <select
          className="bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={sportFilter}
          onChange={e => setSportFilter(e.target.value)}
        >
          {sports.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <span className="text-slate-400 text-sm">{filtered.length} sets</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(set => (
          <div key={set.id} className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-slate-500 transition-colors">
            <CircularProgress percent={set.completionPercent} />
            <h3 className="text-white font-semibold text-center mt-3 text-sm">{set.name}</h3>
            <p className="text-slate-400 text-center text-xs mt-1">{set.brand} &middot; {set.sport} &middot; {set.year}</p>
            <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
              <div className="text-slate-400">Owned</div>
              <div className="text-white text-right">{set.ownedCards}/{set.totalCards}</div>
              <div className="text-slate-400">Missing</div>
              <div className="text-white text-right">{set.missingCards.length}</div>
              <div className="text-slate-400">Set Value</div>
              <div className="text-green-400 text-right">{formatCurrency(set.totalSetValue)}</div>
              <div className="text-slate-400">Cost to Complete</div>
              <div className="text-yellow-400 text-right">{formatCurrency(set.costToComplete)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MissingCardsTab() {
  const [selectedSetId, setSelectedSetId] = useState<string>('');
  const sets = useMemo(() => getTrackedSets(), []);
  const missing = useMemo(() => {
    if (!selectedSetId) return [];
    return getCheapestPath(selectedSetId);
  }, [selectedSetId]);

  return (
    <div>
      <div className="mb-6">
        <select
          className="bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-2 text-sm w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedSetId}
          onChange={e => setSelectedSetId(e.target.value)}
        >
          <option value="">Select a set...</option>
          {sets.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.missingCards.length} missing)</option>
          ))}
        </select>
      </div>
      {selectedSetId && missing.length > 0 && (
        <>
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-700">
                <tr>
                  <th className="text-left text-slate-300 px-4 py-3 font-medium">Card</th>
                  <th className="text-left text-slate-300 px-4 py-3 font-medium">Player</th>
                  <th className="text-left text-slate-300 px-4 py-3 font-medium">Rarity</th>
                  <th className="text-right text-slate-300 px-4 py-3 font-medium">Est. Cost</th>
                </tr>
              </thead>
              <tbody>
                {missing.map((card, i) => (
                  <tr key={card.cardNumber} className={i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}>
                    <td className="px-4 py-3 text-white">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded border-slate-600 bg-slate-700" />
                        <span>#{card.cardNumber} - {card.cardName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{card.player}</td>
                    <td className={`px-4 py-3 font-medium ${getRarityColor(card.rarity)}`}>
                      {getRarityLabel(card.rarity)}
                    </td>
                    <td className="px-4 py-3 text-yellow-400 text-right">{formatCurrency(card.estimatedCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-between items-center text-sm">
            <span className="text-slate-400">{missing.length} cards remaining</span>
            <span className="text-yellow-400 font-semibold">
              Total: {formatCurrency(missing.reduce((sum, c) => sum + c.estimatedCost, 0))}
            </span>
          </div>
        </>
      )}
      {selectedSetId && missing.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
          <p className="text-green-400 font-semibold">Set Complete!</p>
        </div>
      )}
    </div>
  );
}

function SourceFinderTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recommendations, setRecommendations] = useState<SourceRecommendation[]>([]);

  const sets = useMemo(() => getTrackedSets(), []);
  const allMissing = useMemo(() => {
    const cards: (MissingCard & { setName: string })[] = [];
    for (const set of sets) {
      for (const card of set.missingCards) {
        cards.push({ ...card, setName: set.name });
      }
    }
    return cards;
  }, [sets]);

  const handleSearch = (cardName: string) => {
    setSearchQuery(cardName);
    const results = getSourceRecommendations(cardName);
    setRecommendations(results);
  };

  return (
    <div>
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="bg-slate-700 text-white border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search for a card..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchQuery && handleSearch(searchQuery)}
          />
        </div>
      </div>

      {!recommendations.length && allMissing.length > 0 && (
        <div>
          <h3 className="text-slate-300 text-sm font-medium mb-3">Quick Search - Missing Cards</h3>
          <div className="flex flex-wrap gap-2">
            {allMissing.slice(0, 12).map(card => (
              <button
                key={`${card.cardNumber}-${card.cardName}`}
                className="bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs hover:bg-slate-600 transition-colors"
                onClick={() => handleSearch(card.cardName)}
              >
                {card.cardName}
              </button>
            ))}
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="px-4 py-3 bg-slate-700 border-b border-slate-600">
            <h3 className="text-white font-medium text-sm">Results for "{searchQuery}"</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-300 px-4 py-3 font-medium">Platform</th>
                <th className="text-right text-slate-300 px-4 py-3 font-medium">Price</th>
                <th className="text-left text-slate-300 px-4 py-3 font-medium">Condition</th>
                <th className="text-right text-slate-300 px-4 py-3 font-medium">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.sort((a, b) => a.price - b.price).map((rec, i) => (
                <tr key={rec.platform} className={i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}>
                  <td className="px-4 py-3 text-blue-400">
                    <a href={rec.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {rec.platform}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-green-400 text-right font-medium">{formatCurrency(rec.price)}</td>
                  <td className="px-4 py-3 text-slate-300">{rec.condition}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      rec.confidence >= 90 ? 'bg-green-900/50 text-green-400'
                      : rec.confidence >= 80 ? 'bg-yellow-900/50 text-yellow-400'
                      : 'bg-orange-900/50 text-orange-400'
                    }`}>
                      {rec.confidence}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CompletionStatsTab() {
  const stats = useMemo(() => getCompletionStats(), []);
  const sets = useMemo(() => getSetsByCompletion(), []);
  const [selectedSetId, setSelectedSetId] = useState<string>(sets[0]?.id || '');

  const barData = useMemo(() =>
    sets.map(s => ({
      name: s.name.length > 20 ? s.name.substring(0, 18) + '...' : s.name,
      completion: Math.round(s.completionPercent),
    })), [sets]);

  const rarityData = useMemo(() => {
    if (!selectedSetId) return [];
    const breakdown = getRarityBreakdown(selectedSetId);
    return [
      { name: 'Common', value: breakdown.common },
      { name: 'Uncommon', value: breakdown.uncommon },
      { name: 'Rare', value: breakdown.rare },
      { name: 'SSP', value: breakdown.ssp },
    ].filter(d => d.value > 0);
  }, [selectedSetId]);

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Sets', value: stats.totalSets, icon: <Library className="w-5 h-5" /> },
          { label: 'Avg Completion', value: `${stats.avgCompletion.toFixed(1)}%`, icon: <Target className="w-5 h-5" /> },
          { label: 'Total Owned', value: stats.totalOwned.toLocaleString(), icon: <CheckCircle className="w-5 h-5" /> },
          { label: 'Total Missing', value: stats.totalMissing.toLocaleString(), icon: <XCircle className="w-5 h-5" /> },
          { label: 'Cost to Complete', value: formatCurrency(stats.totalCostToComplete), icon: <ShoppingCart className="w-5 h-5" /> },
          { label: 'Closest to Done', value: stats.closestToComplete.length > 15 ? stats.closestToComplete.substring(0, 13) + '...' : stats.closestToComplete, icon: <TrendingUp className="w-5 h-5" /> },
        ].map(stat => (
          <div key={stat.label} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="text-slate-400 mb-1">{stat.icon}</div>
            <div className="text-white font-bold text-lg">{stat.value}</div>
            <div className="text-slate-400 text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Completion bar chart */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <h3 className="text-white font-semibold mb-4">Completion Progress Across Sets</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 120, right: 20, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={110} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#f8fafc' }}
                formatter={(value: number) => [`${value}%`, 'Completion']}
              />
              <Bar dataKey="completion" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rarity breakdown pie chart */}
      <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Missing Cards Rarity Breakdown</h3>
          <select
            className="bg-slate-700 text-white border border-slate-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedSetId}
            onChange={e => setSelectedSetId(e.target.value)}
          >
            {sets.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        {rarityData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rarityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {rarityData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Legend wrapperStyle={{ color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-slate-400 text-sm text-center py-8">No missing cards in this set.</p>
        )}
      </div>
    </div>
  );
}

export default function SetCompletion() {
  const [activeTab, setActiveTab] = useState<TabKey>('my-sets');

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Target className="w-7 h-7 text-blue-400" />
            Set Completion Advisor
          </h1>
          <p className="text-slate-400 mt-1">Track your card set progress, find missing cards, and discover the cheapest sources.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-800 rounded-xl p-1 mb-6 w-fit">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'my-sets' && <MySetsTab />}
        {activeTab === 'missing-cards' && <MissingCardsTab />}
        {activeTab === 'source-finder' && <SourceFinderTab />}
        {activeTab === 'completion-stats' && <CompletionStatsTab />}
      </div>
    </div>
  );
}
