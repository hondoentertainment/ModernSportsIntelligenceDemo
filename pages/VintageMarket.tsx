// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Star,
  Archive,
  DollarSign,
  Layers,
  BookOpen,
} from 'lucide-react';
import {
  getEraIndices,
  getVintageCards,
  getEraPerformanceHistory,
  getEraMarketCaps,
  getNotableSets,
  getPopulationData,
  getAuctionRecords,
  getHistoricalSignificanceRatings,
  getVintageMarketSummary,
  formatCurrency,
  formatConditionGrade,
  type EraIndex,
  type VintageCard,
  type EraPerformancePoint,
  type EraMarketCap,
  type NotableSet,
  type PopulationEntry,
  type AuctionRecord,
  type SignificanceRating,
  type VintageMarketSummary,
} from '../lib/analytics/vintageMarketService';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

const VintageMarket: React.FC = () => {
  const [eraIndices, setEraIndices] = useState<EraIndex[]>([]);
  const [vintageCards, setVintageCards] = useState<VintageCard[]>([]);
  const [performanceHistory, setPerformanceHistory] = useState<EraPerformancePoint[]>([]);
  const [eraMarketCaps, setEraMarketCaps] = useState<EraMarketCap[]>([]);
  const [notableSets, setNotableSets] = useState<NotableSet[]>([]);
  const [populationData, setPopulationData] = useState<PopulationEntry[]>([]);
  const [auctionRecords, setAuctionRecords] = useState<AuctionRecord[]>([]);
  const [significanceRatings, setSignificanceRatings] = useState<SignificanceRating[]>([]);
  const [summary, setSummary] = useState<VintageMarketSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEra, setSelectedEra] = useState<string>('all');

  useEffect(() => {
    try {
      setEraIndices(getEraIndices());
      setVintageCards(getVintageCards());
      setPerformanceHistory(getEraPerformanceHistory());
      setEraMarketCaps(getEraMarketCaps());
      setNotableSets(getNotableSets());
      setPopulationData(getPopulationData());
      setAuctionRecords(getAuctionRecords());
      setSignificanceRatings(getHistoricalSignificanceRatings());
      setSummary(getVintageMarketSummary());
      setLoading(false);
    } catch {
      setError('Failed to load Vintage Card Market data');
      setLoading(false);
    }
  }, []);

  const filteredCards = useMemo(() => {
    if (selectedEra === 'all') return vintageCards;
    return vintageCards.filter(c => c.era === selectedEra);
  }, [vintageCards, selectedEra]);

  const _eraColors: Record<string, string> = {
    'pre-war': '#ef4444',
    'post-war': '#3b82f6',
    'vintage-60s': '#10b981',
    'vintage-70s': '#f59e0b',
    'early-modern': '#a855f7',
  };

  const _eraLabels: Record<string, string> = {
    'pre-war': 'Pre-War (1900-1945)',
    'post-war': 'Post-War (1946-1959)',
    'vintage-60s': 'Vintage 60s',
    'vintage-70s': 'Vintage 70s',
    'early-modern': 'Early Modern (1980s)',
  };

  const topAuctions = useMemo(() => {
    return [...auctionRecords].sort((a, b) => b.salePrice - a.salePrice).slice(0, 12);
  }, [auctionRecords]);

  const sortedSignificance = useMemo(() => {
    return [...significanceRatings].sort((a, b) => b.overallScore - a.overallScore);
  }, [significanceRatings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Vintage Card Market &amp; Pre-War Index...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-500/20">
          <Clock size={24} className="text-amber-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Vintage Card Market &amp; Pre-War Index</h1>
          <p className="text-sm text-slate-400">Era-based indices, condition-adjusted pricing &amp; historical significance &mdash; Phase 152</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Eras</p>
          <p className="text-2xl font-bold text-amber-400">{summary?.totalEras ?? 0}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Cards Tracked</p>
          <p className="text-2xl font-bold text-blue-400">{summary?.totalCardsTracked ?? 0}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Market Value</p>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(summary?.totalMarketValue ?? 0)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Avg YoY Growth</p>
          <p className={`text-2xl font-bold ${(summary?.avgYoYGrowth ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {(summary?.avgYoYGrowth ?? 0) > 0 ? '+' : ''}{summary?.avgYoYGrowth ?? 0}%
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Record Sale</p>
          <p className="text-2xl font-bold text-purple-400">{formatCurrency(summary?.highestRecordSale ?? 0)}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Notable Sets</p>
          <p className="text-2xl font-bold text-cyan-400">{summary?.notableSetsCount ?? 0}</p>
        </div>
      </div>

      {/* Era Index Cards */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Layers size={18} className="text-amber-400" />
          Era Index Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eraIndices.map(era => (
            <div key={era.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-200">{era.name}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${era.changePercent >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {era.changePercent > 0 ? '+' : ''}{era.changePercent}%
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mb-2">{era.dateRange}</p>
              <div className="space-y-1 text-[10px] text-slate-500">
                <div className="flex justify-between"><span>Index Value</span><span className="text-slate-300 font-bold">{era.indexValue.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Cards in Index</span><span className="text-slate-300">{era.cardsInIndex}</span></div>
                <div className="flex justify-between"><span>Avg Card Value</span><span className="text-emerald-400">{formatCurrency(era.avgCardValue)}</span></div>
                <div className="flex justify-between"><span>Volume (30d)</span><span className="text-slate-300">{formatCurrency(era.volume30d)}</span></div>
                <div className="flex justify-between"><span>Volatility</span><span className={`${era.volatility > 15 ? 'text-red-400' : era.volatility > 10 ? 'text-amber-400' : 'text-emerald-400'}`}>{era.volatility}%</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Era Index Performance Line Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-400" />
          Era Index Performance Over Time
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="preWar" stroke="#ef4444" strokeWidth={2} dot={false} name="Pre-War" />
              <Line type="monotone" dataKey="postWar" stroke="#3b82f6" strokeWidth={2} dot={false} name="Post-War" />
              <Line type="monotone" dataKey="vintage60s" stroke="#10b981" strokeWidth={2} dot={false} name="Vintage 60s" />
              <Line type="monotone" dataKey="vintage70s" stroke="#f59e0b" strokeWidth={2} dot={false} name="Vintage 70s" />
              <Line type="monotone" dataKey="earlyModern" stroke="#a855f7" strokeWidth={2} dot={false} name="Early Modern" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vintage Cards Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Archive size={18} className="text-cyan-400" />
            Vintage Cards with Condition-Adjusted Prices
          </h2>
          <select
            value={selectedEra}
            onChange={e => setSelectedEra(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Eras</option>
            <option value="pre-war">Pre-War</option>
            <option value="post-war">Post-War</option>
            <option value="vintage-60s">Vintage 60s</option>
            <option value="vintage-70s">Vintage 70s</option>
            <option value="early-modern">Early Modern</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700/50">
                <th className="text-left py-2 pr-2">Card</th>
                <th className="text-left py-2 px-2">Year</th>
                <th className="text-left py-2 px-2">Set</th>
                <th className="text-left py-2 px-2">Condition</th>
                <th className="text-right py-2 px-2">Raw Price</th>
                <th className="text-right py-2 px-2">Adj. Price</th>
                <th className="text-right py-2 px-2">Pop Count</th>
                <th className="text-right py-2 pl-2">Change</th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.slice(0, 20).map((card, i) => (
                <tr key={i} className="border-b border-slate-700/30">
                  <td className="py-2 pr-2 text-slate-200 font-medium">{card.playerName}</td>
                  <td className="py-2 px-2 text-slate-400">{card.year}</td>
                  <td className="py-2 px-2 text-slate-400">{card.setName}</td>
                  <td className="py-2 px-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                      {formatConditionGrade(card.condition)}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right text-slate-300">{formatCurrency(card.rawPrice)}</td>
                  <td className="py-2 px-2 text-right text-emerald-400 font-bold">{formatCurrency(card.adjustedPrice)}</td>
                  <td className="py-2 px-2 text-right text-slate-400">{card.populationCount}</td>
                  <td className="py-2 pl-2 text-right">
                    <span className={`font-bold ${card.priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {card.priceChange > 0 ? '+' : ''}{card.priceChange}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Era Market Caps Bar Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-purple-400" />
          Era Market Capitalizations
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={eraMarketCaps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="era" tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="totalMarketCap" fill="#f59e0b" name="Total Market Cap ($)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avgCardValue" fill="#3b82f6" name="Avg Card Value ($)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Notable Sets + Population Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notable Sets */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-amber-400" />
            Notable Vintage Sets
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notableSets.map((set, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-200">{set.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">{set.year}</span>
                </div>
                <p className="text-[10px] text-slate-400 mb-2">{set.description}</p>
                <div className="space-y-1 text-[10px] text-slate-500">
                  <div className="flex justify-between"><span>Cards in Set</span><span className="text-slate-300">{set.cardCount}</span></div>
                  <div className="flex justify-between"><span>Key Card</span><span className="text-cyan-400">{set.keyCard}</span></div>
                  <div className="flex justify-between"><span>Key Card Value</span><span className="text-emerald-400 font-bold">{formatCurrency(set.keyCardValue)}</span></div>
                  <div className="flex justify-between"><span>Rarity</span><span className="text-purple-400">{set.rarityTier}</span></div>
                </div>
                <p className="text-[9px] text-slate-500 mt-2 italic">{set.historicalNote}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Population Data */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Layers size={18} className="text-cyan-400" />
            Population Data by Era
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700/50">
                  <th className="text-left py-2 pr-2">Era</th>
                  <th className="text-right py-2 px-2">Total Graded</th>
                  <th className="text-right py-2 px-2">High Grade</th>
                  <th className="text-right py-2 px-2">Mid Grade</th>
                  <th className="text-right py-2 px-2">Low Grade</th>
                  <th className="text-right py-2 pl-2">Auth Only</th>
                </tr>
              </thead>
              <tbody>
                {populationData.map((pop, i) => (
                  <tr key={i} className="border-b border-slate-700/30">
                    <td className="py-2 pr-2 text-slate-200 font-medium">{pop.era}</td>
                    <td className="py-2 px-2 text-right text-slate-300">{pop.totalGraded.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right text-emerald-400 font-bold">{pop.highGradeCount.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right text-amber-400">{pop.midGradeCount.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right text-red-400">{pop.lowGradeCount.toLocaleString()}</td>
                    <td className="py-2 pl-2 text-right text-slate-400">{pop.authenticOnlyCount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 space-y-2">
            {populationData.map((pop, i) => {
              const total = pop.totalGraded || 1;
              const highPct = Math.round(pop.highGradeCount / total * 100);
              const midPct = Math.round(pop.midGradeCount / total * 100);
              const lowPct = Math.round(pop.lowGradeCount / total * 100);
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-400">{pop.era}</span>
                    <span className="text-[10px] text-slate-500">{highPct}% high / {midPct}% mid / {lowPct}% low</span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-slate-700/50">
                    <div className="bg-emerald-500" style={{ width: `${highPct}%` }} />
                    <div className="bg-amber-500" style={{ width: `${midPct}%` }} />
                    <div className="bg-red-500" style={{ width: `${lowPct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Auction Records Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <DollarSign size={18} className="text-emerald-400" />
          Top Auction Records
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-700/50">
                <th className="text-left py-2 pr-2">Card</th>
                <th className="text-left py-2 px-2">Year</th>
                <th className="text-left py-2 px-2">Grade</th>
                <th className="text-left py-2 px-2">Auction House</th>
                <th className="text-left py-2 px-2">Sale Date</th>
                <th className="text-right py-2 px-2">Sale Price</th>
                <th className="text-right py-2 px-2">Est. Value</th>
                <th className="text-right py-2 pl-2">Premium</th>
              </tr>
            </thead>
            <tbody>
              {topAuctions.map((record, i) => (
                <tr key={i} className="border-b border-slate-700/30">
                  <td className="py-2 pr-2 text-slate-200 font-medium">{record.cardName}</td>
                  <td className="py-2 px-2 text-slate-400">{record.year}</td>
                  <td className="py-2 px-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">{record.grade}</span>
                  </td>
                  <td className="py-2 px-2 text-slate-400">{record.auctionHouse}</td>
                  <td className="py-2 px-2 text-slate-500">{record.saleDate}</td>
                  <td className="py-2 px-2 text-right text-emerald-400 font-bold">{formatCurrency(record.salePrice)}</td>
                  <td className="py-2 px-2 text-right text-slate-300">{formatCurrency(record.estimatedValue)}</td>
                  <td className="py-2 pl-2 text-right">
                    <span className={`font-bold ${record.premiumPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {record.premiumPercent > 0 ? '+' : ''}{record.premiumPercent}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Significance Ratings */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Star size={18} className="text-amber-400" />
          Historical Significance Ratings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSignificance.slice(0, 9).map((rating, i) => (
            <div key={i} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-200">{rating.cardName}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  rating.overallScore >= 90 ? 'bg-amber-500/20 text-amber-400' :
                  rating.overallScore >= 75 ? 'bg-emerald-500/20 text-emerald-400' :
                  'bg-slate-700 text-slate-400'
                }`}>
                  {rating.overallScore}/100
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mb-3">{rating.year} &middot; {rating.setName}</p>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-500">Cultural Impact</span>
                    <span className="text-[10px] text-slate-300">{rating.culturalImpact}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${rating.culturalImpact}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-500">Rarity Score</span>
                    <span className="text-[10px] text-slate-300">{rating.rarityScore}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${rating.rarityScore}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-500">Demand Index</span>
                    <span className="text-[10px] text-slate-300">{rating.demandIndex}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${rating.demandIndex}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-500">Investment Grade</span>
                    <span className="text-[10px] text-slate-300">{rating.investmentGrade}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${rating.investmentGrade}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VintageMarket;
