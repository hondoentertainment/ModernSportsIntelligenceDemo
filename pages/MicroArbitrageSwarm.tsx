// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import {
  Radio, Eye, MapPin, TrendingDown, Users, Award, Shield, CheckCircle,
  Star, Flame, Target, Filter, ChevronDown, ChevronUp, Plus, RefreshCw,
  DollarSign, BarChart3, Globe, Zap, Clock, ArrowDownRight, ArrowUpRight,
  Search, ThumbsUp, AlertTriangle, Navigation,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from 'recharts';
import {
  getSightings, getArbitrageOpportunities, getSwarmStats, getHeatMap,
  getSwarmLeaderboard, getMyReputation, getRewards, getRealWorldVsOnline,
  getNearbyDeals, getGeoClusters, verifySighting, reportSighting,
  SIGHTING_SOURCE_LABELS,
  type PriceSighting, type SightingSource, type ArbitrageOpportunity,
  type SwarmStats, type SwarmLeaderboard, type SwarmReputation,
  type ContributionReward, type RealWorldVsOnline, type PriceHeatMapData,
  type GeoPriceCluster,
} from '../lib/analytics/microArbitrageSwarmService';

type TabId = 'feed' | 'arbitrage' | 'heatmap' | 'leaderboard' | 'reputation' | 'nearby';

const SOURCE_COLORS: Record<SightingSource, string> = {
  card_show: 'bg-blue-500/20 text-blue-400',
  lcs: 'bg-purple-500/20 text-purple-400',
  flea_market: 'bg-green-500/20 text-green-400',
  garage_sale: 'bg-yellow-500/20 text-yellow-400',
  estate_sale: 'bg-orange-500/20 text-orange-400',
  antique_mall: 'bg-pink-500/20 text-pink-400',
  pawn_shop: 'bg-red-500/20 text-red-400',
  facebook_marketplace: 'bg-cyan-500/20 text-cyan-400',
};

const TIER_COLORS: Record<string, string> = {
  scout: 'text-slate-400',
  tracker: 'text-green-400',
  hunter: 'text-blue-400',
  elite: 'text-purple-400',
  legend: 'text-yellow-400',
};

const CONFIDENCE_STYLES: Record<string, string> = {
  high: 'bg-green-500/20 text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low: 'bg-red-500/20 text-red-400',
};

export default function MicroArbitrageSwarm() {
  const [activeTab, setActiveTab] = useState<TabId>('feed');
  const [loading, setLoading] = useState(true);
  const [sightings, setSightings] = useState<PriceSighting[]>([]);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [stats, setStats] = useState<SwarmStats | null>(null);
  const [heatMap, setHeatMap] = useState<PriceHeatMapData[]>([]);
  const [leaderboard, setLeaderboard] = useState<SwarmLeaderboard[]>([]);
  const [reputation, setReputation] = useState<SwarmReputation | null>(null);
  const [rewards, setRewards] = useState<ContributionReward[]>([]);
  const [comparison, setComparison] = useState<RealWorldVsOnline[]>([]);
  const [nearby, setNearby] = useState<PriceSighting[]>([]);
  const [clusters, setClusters] = useState<GeoPriceCluster[]>([]);

  // Filters
  const [sourceFilter, setSourceFilter] = useState<SightingSource | ''>('');
  const [sportFilter, setSportFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Report form
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState({
    cardDescription: '', player: '', year: 2024, grade: 'Raw', price: 0,
    source: 'card_show' as SightingSource, city: '', state: '', sport: 'Baseball',
  });

  // Live feed simulation
  const [newSightingFlash, setNewSightingFlash] = useState<string | null>(null);

  const loadData = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      const filter: Record<string, unknown> = {};
      if (sourceFilter) filter.source = sourceFilter;
      if (sportFilter) filter.sport = sportFilter;
      if (regionFilter) filter.region = regionFilter;
      setSightings(getSightings(filter as Parameters<typeof getSightings>[0]));
      setOpportunities(getArbitrageOpportunities());
      setStats(getSwarmStats());
      setHeatMap(getHeatMap());
      setLeaderboard(getSwarmLeaderboard());
      setReputation(getMyReputation());
      setRewards(getRewards());
      setComparison(getRealWorldVsOnline());
      setNearby(getNearbyDeals(41.88, -87.63, 300));
      setClusters(getGeoClusters());
      setLoading(false);
    }, 400);
  }, [sourceFilter, sportFilter, regionFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  // Simulated live feed
  useEffect(() => {
    const interval = setInterval(() => {
      const fakePlayers = ['Bryce Harper', 'Patrick Mahomes', 'LeBron James', 'Aaron Judge', 'Jayson Tatum'];
      const fakeSources: SightingSource[] = ['card_show', 'lcs', 'flea_market', 'garage_sale'];
      const fakeCities = [
        { city: 'Dallas', state: 'TX', lat: 32.78, lng: -96.80 },
        { city: 'Denver', state: 'CO', lat: 39.74, lng: -104.99 },
        { city: 'Atlanta', state: 'GA', lat: 33.75, lng: -84.39 },
        { city: 'Boston', state: 'MA', lat: 42.36, lng: -71.06 },
      ];
      const player = fakePlayers[Math.floor(Math.random() * fakePlayers.length)];
      const loc = fakeCities[Math.floor(Math.random() * fakeCities.length)];
      const price = Math.round(20 + Math.random() * 200);
      const newS = reportSighting({
        cardDescription: `2024 Topps ${player} RC`,
        player,
        year: 2024,
        price,
        source: fakeSources[Math.floor(Math.random() * fakeSources.length)],
        location: loc,
        sport: ['Baseball', 'Football', 'Basketball'][Math.floor(Math.random() * 3)],
      });
      setNewSightingFlash(newS.id);
      setSightings(prev => [newS, ...prev.slice(0, 49)]);
      setTimeout(() => setNewSightingFlash(null), 2000);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = (sightingId: string) => {
    const result = verifySighting(sightingId);
    setSightings(prev =>
      prev.map(s =>
        s.id === sightingId
          ? { ...s, verificationCount: result.newVerificationCount, verificationScore: result.newVerificationScore, isVerified: result.isNowVerified }
          : s
      )
    );
  };

  const handleSubmitSighting = () => {
    if (!reportForm.cardDescription || !reportForm.player || !reportForm.price) return;
    reportSighting({
      cardDescription: reportForm.cardDescription,
      player: reportForm.player,
      year: reportForm.year,
      grade: reportForm.grade,
      price: reportForm.price,
      source: reportForm.source,
      location: { city: reportForm.city, state: reportForm.state, lat: 39.83, lng: -98.58 },
      sport: reportForm.sport,
    });
    setReportForm({ cardDescription: '', player: '', year: 2024, grade: 'Raw', price: 0, source: 'card_show', city: '', state: '', sport: 'Baseball' });
    setShowReportForm(false);
    loadData();
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'feed', label: 'Live Feed', icon: <Radio className="w-4 h-4" /> },
    { id: 'arbitrage', label: 'Arbitrage', icon: <TrendingDown className="w-4 h-4" /> },
    { id: 'heatmap', label: 'Heat Map', icon: <Globe className="w-4 h-4" /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Award className="w-4 h-4" /> },
    { id: 'reputation', label: 'My Rep', icon: <Shield className="w-4 h-4" /> },
    { id: 'nearby', label: 'Nearby', icon: <Navigation className="w-4 h-4" /> },
  ];

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-300">Loading Swarm Network...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Radio className="w-6 h-6 text-green-400" />
                Micro-Arbitrage Swarm Network
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Crowdsourced real-world pricing from card shows, LCS visits, and more
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700 rounded-lg text-sm hover:bg-slate-600 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              <button
                onClick={() => setShowReportForm(!showReportForm)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg text-sm font-medium hover:bg-green-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Report Sighting
              </button>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-3">
              <select
                value={sourceFilter}
                onChange={e => setSourceFilter(e.target.value as SightingSource | '')}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100"
              >
                <option value="">All Sources</option>
                {Object.entries(SIGHTING_SOURCE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <select
                value={sportFilter}
                onChange={e => setSportFilter(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100"
              >
                <option value="">All Sports</option>
                <option value="Baseball">Baseball</option>
                <option value="Football">Football</option>
                <option value="Basketball">Basketball</option>
              </select>
              <select
                value={regionFilter}
                onChange={e => setRegionFilter(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100"
              >
                <option value="">All Regions</option>
                <option value="Northeast">Northeast</option>
                <option value="Southeast">Southeast</option>
                <option value="Midwest">Midwest</option>
                <option value="Southwest">Southwest</option>
                <option value="West">West</option>
              </select>
              {(sourceFilter || sportFilter || regionFilter) && (
                <button
                  onClick={() => { setSourceFilter(''); setSportFilter(''); setRegionFilter(''); }}
                  className="px-3 py-2 text-sm text-red-400 hover:text-red-300"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="bg-slate-800/50 border-b border-slate-700 px-4 sm:px-6 py-3">
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            <StatCard icon={<Eye className="w-4 h-4 text-blue-400" />} label="Total Sightings" value={stats.totalSightings.toLocaleString()} />
            <StatCard icon={<Users className="w-4 h-4 text-green-400" />} label="Active Nodes" value={stats.activeNodes.toString()} />
            <StatCard icon={<DollarSign className="w-4 h-4 text-emerald-400" />} label="Avg Savings" value={`$${stats.avgSavings}`} />
            <StatCard icon={<Zap className="w-4 h-4 text-yellow-400" />} label="Arbitrage Found" value={stats.totalArbitrageFound.toString()} />
            <StatCard icon={<Clock className="w-4 h-4 text-purple-400" />} label="Today" value={`${stats.sightingsToday} sightings`} />
            <StatCard icon={<CheckCircle className="w-4 h-4 text-cyan-400" />} label="Avg Verification" value={`${stats.avgVerificationScore}%`} />
          </div>
        </div>
      )}

      {/* Report Sighting Form */}
      {showReportForm && (
        <div className="bg-slate-800 border-b border-slate-700 px-4 sm:px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-400" />
              Report a Price Sighting
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Card description (e.g., 2023 Topps Chrome #201)"
                value={reportForm.cardDescription}
                onChange={e => setReportForm(f => ({ ...f, cardDescription: e.target.value }))}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-400 sm:col-span-2"
              />
              <input
                type="text"
                placeholder="Player name"
                value={reportForm.player}
                onChange={e => setReportForm(f => ({ ...f, player: e.target.value }))}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-400"
              />
              <input
                type="number"
                placeholder="Price ($)"
                value={reportForm.price || ''}
                onChange={e => setReportForm(f => ({ ...f, price: Number(e.target.value) }))}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-400"
              />
              <select
                value={reportForm.source}
                onChange={e => setReportForm(f => ({ ...f, source: e.target.value as SightingSource }))}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100"
              >
                {Object.entries(SIGHTING_SOURCE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <select
                value={reportForm.sport}
                onChange={e => setReportForm(f => ({ ...f, sport: e.target.value }))}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100"
              >
                <option value="Baseball">Baseball</option>
                <option value="Football">Football</option>
                <option value="Basketball">Basketball</option>
              </select>
              <input
                type="text"
                placeholder="City"
                value={reportForm.city}
                onChange={e => setReportForm(f => ({ ...f, city: e.target.value }))}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-400"
              />
              <input
                type="text"
                placeholder="State (e.g., TX)"
                value={reportForm.state}
                onChange={e => setReportForm(f => ({ ...f, state: e.target.value }))}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-400"
              />
            </div>
            <div className="flex gap-3 mt-3">
              <button
                onClick={handleSubmitSighting}
                className="px-4 py-2 bg-green-600 rounded-lg text-sm font-medium hover:bg-green-500 transition-colors"
              >
                Submit Sighting
              </button>
              <button
                onClick={() => setShowReportForm(false)}
                className="px-4 py-2 bg-slate-700 rounded-lg text-sm hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-slate-800/30 border-b border-slate-700 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex overflow-x-auto gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'feed' && <LiveFeedTab sightings={sightings} newSightingFlash={newSightingFlash} onVerify={handleVerify} />}
        {activeTab === 'arbitrage' && <ArbitrageTab opportunities={opportunities} comparison={comparison} />}
        {activeTab === 'heatmap' && <HeatMapTab heatMap={heatMap} clusters={clusters} />}
        {activeTab === 'leaderboard' && <LeaderboardTab leaderboard={leaderboard} />}
        {activeTab === 'reputation' && reputation && <ReputationTab reputation={reputation} rewards={rewards} />}
        {activeTab === 'nearby' && <NearbyTab nearby={nearby} />}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}

// ─── Live Feed Tab ───────────────────────────────────────────────────────────

function LiveFeedTab({ sightings, newSightingFlash, onVerify }: {
  sightings: PriceSighting[];
  newSightingFlash: string | null;
  onVerify: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-sm text-slate-400">Live sighting feed - updates every few seconds</span>
      </div>
      {sightings.slice(0, 20).map(s => (
        <div
          key={s.id}
          className={`bg-slate-800 rounded-lg border p-4 transition-all duration-500 ${
            newSightingFlash === s.id ? 'border-green-500 ring-1 ring-green-500/30' : 'border-slate-700'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">{s.cardDescription}</h4>
                {s.isVerified && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
                {newSightingFlash === s.id && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium">NEW</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className={`px-2 py-0.5 rounded-full text-xs ${SOURCE_COLORS[s.source]}`}>
                  {SIGHTING_SOURCE_LABELS[s.source]}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {s.location.city}, {s.location.state}
                </span>
                <span>{s.sport}</span>
                <span>{new Date(s.reportedAt).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <div className="text-lg font-bold text-green-400">${s.price}</div>
                <div className="text-xs text-slate-400">Online: ${s.onlinePrice}</div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-semibold ${s.arbitrageDelta < -30 ? 'text-emerald-400' : 'text-green-400'}`}>
                  {s.arbitrageDelta.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500">delta</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <button
                  onClick={() => onVerify(s.id)}
                  className="p-1.5 rounded-lg bg-slate-700 hover:bg-blue-600/30 transition-colors"
                  title="Verify this sighting"
                >
                  <ThumbsUp className="w-4 h-4 text-blue-400" />
                </button>
                <span className="text-xs text-slate-500">{s.verificationCount}</span>
              </div>
            </div>
          </div>
          {/* Verification bar */}
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${s.verificationScore >= 80 ? 'bg-green-500' : s.verificationScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${s.verificationScore}%` }}
                />
              </div>
              <span className="text-xs text-slate-500">{s.verificationScore}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Arbitrage Tab ───────────────────────────────────────────────────────────

function ArbitrageTab({ opportunities, comparison }: {
  opportunities: ArbitrageOpportunity[];
  comparison: RealWorldVsOnline[];
}) {
  const chartData = comparison.map(c => ({
    name: c.category,
    'Real-World': c.realWorldAvg,
    'Online': c.onlineAvg,
  }));

  return (
    <div className="space-y-6">
      {/* Chart */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          Real-World vs Online Pricing
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={v => `$${v}`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value: number) => [`$${value}`, '']}
            />
            <Legend wrapperStyle={{ color: '#94a3b8' }} />
            <Bar dataKey="Real-World" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Online" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {comparison.slice(0, 4).map(c => (
            <div key={c.category} className="bg-slate-700/50 rounded-lg p-3 text-center">
              <div className="text-xs text-slate-400">{c.category}</div>
              <div className="text-lg font-bold text-green-400">{c.deltaPercent}%</div>
              <div className="text-xs text-slate-500">{c.sampleSize} samples</div>
            </div>
          ))}
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
            Top Arbitrage Opportunities
          </h3>
          <p className="text-xs text-slate-400 mt-1">Cards priced significantly below online market value</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-700/50 text-left">
                <th className="px-4 py-3 text-slate-400 font-medium">Card</th>
                <th className="px-4 py-3 text-slate-400 font-medium">Source</th>
                <th className="px-4 py-3 text-slate-400 font-medium text-right">Real-World</th>
                <th className="px-4 py-3 text-slate-400 font-medium text-right">Online</th>
                <th className="px-4 py-3 text-slate-400 font-medium text-right">Savings</th>
                <th className="px-4 py-3 text-slate-400 font-medium text-center">Confidence</th>
                <th className="px-4 py-3 text-slate-400 font-medium">Expires</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map(opp => (
                <tr key={opp.id} className="border-t border-slate-700/50 hover:bg-slate-700/30">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-100 truncate max-w-[260px]">{opp.cardDescription}</div>
                    <div className="text-xs text-slate-400">{opp.location}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${SOURCE_COLORS[opp.source]}`}>
                      {SIGHTING_SOURCE_LABELS[opp.source]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-green-400">${opp.realWorldPrice}</td>
                  <td className="px-4 py-3 text-right text-slate-300">${opp.onlinePrice}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-bold text-emerald-400">${opp.delta}</div>
                    <div className="text-xs text-emerald-400/70">-{opp.deltaPercent.toFixed(1)}%</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${CONFIDENCE_STYLES[opp.confidence]}`}>
                      {opp.confidence}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{opp.expiresIn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Heat Map Tab ────────────────────────────────────────────────────────────

function HeatMapTab({ heatMap, clusters }: { heatMap: PriceHeatMapData[]; clusters: GeoPriceCluster[] }) {
  return (
    <div className="space-y-6">
      {/* Regional Price Grid */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-400" />
          Regional Price Heat Map
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {heatMap
            .sort((a, b) => b.intensity - a.intensity)
            .map(h => (
              <div
                key={h.state}
                className="rounded-lg p-3 border transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: `rgba(34, 197, 94, ${h.intensity * 0.25})`,
                  borderColor: `rgba(34, 197, 94, ${h.intensity * 0.4})`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold">{h.state}</span>
                  <span className="text-xs text-slate-400">{h.region}</span>
                </div>
                <div className="text-xl font-bold text-green-400">-{h.avgDiscount.toFixed(1)}%</div>
                <div className="text-xs text-slate-400 mt-1">{h.sightingCount} sightings</div>
                <div className="text-xs text-slate-300 mt-1 truncate">{h.bestDeal}</div>
              </div>
            ))}
        </div>
      </div>

      {/* Geographic Clusters */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-purple-400" />
          Geographic Price Clusters
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-700/50 text-left">
                <th className="px-4 py-3 text-slate-400 font-medium">Region</th>
                <th className="px-4 py-3 text-slate-400 font-medium text-right">Avg Price</th>
                <th className="px-4 py-3 text-slate-400 font-medium text-right">vs National</th>
                <th className="px-4 py-3 text-slate-400 font-medium text-right">Sightings</th>
                <th className="px-4 py-3 text-slate-400 font-medium">Top Player</th>
              </tr>
            </thead>
            <tbody>
              {clusters.map(c => (
                <tr key={c.id} className="border-t border-slate-700/50 hover:bg-slate-700/30">
                  <td className="px-4 py-3 font-medium">{c.region}</td>
                  <td className="px-4 py-3 text-right">${c.avgPrice}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={c.priceVsNational < 0 ? 'text-green-400' : 'text-red-400'}>
                      {c.priceVsNational > 0 ? '+' : ''}{c.priceVsNational}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{c.sightingCount}</td>
                  <td className="px-4 py-3 text-slate-300">{c.topPlayer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Leaderboard Tab ─────────────────────────────────────────────────────────

function LeaderboardTab({ leaderboard }: { leaderboard: SwarmLeaderboard[] }) {
  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" />
          Swarm Leaderboard
        </h3>
        <p className="text-xs text-slate-400 mt-1">Top contributors ranked by reputation and accuracy</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-700/50 text-left">
              <th className="px-4 py-3 text-slate-400 font-medium w-12">#</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Alias</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Tier</th>
              <th className="px-4 py-3 text-slate-400 font-medium text-right">Sightings</th>
              <th className="px-4 py-3 text-slate-400 font-medium text-right">Verified</th>
              <th className="px-4 py-3 text-slate-400 font-medium text-right">Accuracy</th>
              <th className="px-4 py-3 text-slate-400 font-medium text-right">Rewards</th>
              <th className="px-4 py-3 text-slate-400 font-medium">Region</th>
              <th className="px-4 py-3 text-slate-400 font-medium text-right">Streak</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map(entry => (
              <tr key={entry.userId} className="border-t border-slate-700/50 hover:bg-slate-700/30">
                <td className="px-4 py-3">
                  {entry.rank <= 3 ? (
                    <span className={`font-bold ${entry.rank === 1 ? 'text-yellow-400' : entry.rank === 2 ? 'text-slate-300' : 'text-orange-400'}`}>
                      {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                    </span>
                  ) : (
                    <span className="text-slate-400">{entry.rank}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{entry.alias}</td>
                <td className="px-4 py-3">
                  <span className={`capitalize font-medium ${TIER_COLORS[entry.tier]}`}>
                    {entry.tier}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">{entry.totalSightings}</td>
                <td className="px-4 py-3 text-right text-green-400">{entry.verifiedSightings}</td>
                <td className="px-4 py-3 text-right">{entry.accuracy.toFixed(0)}%</td>
                <td className="px-4 py-3 text-right text-yellow-400">{entry.rewardsEarned.toLocaleString()}</td>
                <td className="px-4 py-3 text-slate-300">{entry.region}</td>
                <td className="px-4 py-3 text-right">
                  <span className="flex items-center justify-end gap-1">
                    <Flame className="w-3 h-3 text-orange-400" />
                    {entry.streak}d
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Reputation Tab ──────────────────────────────────────────────────────────

function ReputationTab({ reputation, rewards }: { reputation: SwarmReputation; rewards: ContributionReward[] }) {
  const BADGE_ICONS: Record<string, React.ReactNode> = {
    eye: <Eye className="w-4 h-4" />,
    award: <Award className="w-4 h-4" />,
    target: <Target className="w-4 h-4" />,
    'map-pin': <MapPin className="w-4 h-4" />,
    flame: <Flame className="w-4 h-4" />,
  };

  return (
    <div className="space-y-6">
      {/* Reputation Card */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6 text-blue-400" />
              {reputation.alias}
            </h3>
            <span className={`text-sm capitalize font-medium ${TIER_COLORS[reputation.tier]}`}>
              {reputation.tier} Tier
            </span>
            <span className="text-sm text-slate-400 ml-3">Rank #{reputation.rank}</span>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-400">{reputation.overallScore}</div>
            <div className="text-xs text-slate-400">Reputation Score</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold">{reputation.totalSightings}</div>
            <div className="text-xs text-slate-400">Total Sightings</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-green-400">{reputation.verifiedSightings}</div>
            <div className="text-xs text-slate-400">Verified</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold">{(reputation.accuracyRate * 100).toFixed(0)}%</div>
            <div className="text-xs text-slate-400">Accuracy</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3 text-center">
            <div className="text-xl font-bold text-orange-400 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4" />{reputation.streakDays}
            </div>
            <div className="text-xs text-slate-400">Day Streak</div>
          </div>
        </div>

        {/* Badges */}
        <h4 className="text-sm font-semibold text-slate-300 mb-3">Badges Earned</h4>
        <div className="flex flex-wrap gap-3">
          {reputation.badges.map(badge => (
            <div key={badge.name} className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2">
              <span className="text-yellow-400">{BADGE_ICONS[badge.icon] || <Star className="w-4 h-4" />}</span>
              <div>
                <div className="text-xs font-medium">{badge.name}</div>
                <div className="text-xs text-slate-500">{badge.earnedAt}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards History */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          Rewards History
          <span className="text-sm font-normal text-slate-400 ml-2">
            Total: {rewards.reduce((s, r) => s + r.points, 0)} pts
          </span>
        </h3>
        <div className="space-y-2">
          {rewards.map(r => (
            <div key={r.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${
                  r.type === 'sighting' ? 'bg-blue-500/20 text-blue-400' :
                  r.type === 'verification' ? 'bg-green-500/20 text-green-400' :
                  r.type === 'streak' ? 'bg-orange-500/20 text-orange-400' :
                  r.type === 'milestone' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-cyan-500/20 text-cyan-400'
                }`}>
                  {r.type}
                </span>
                <span className="text-sm">{r.description}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-yellow-400">+{r.points}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  r.status === 'claimed' ? 'bg-green-500/20 text-green-400' :
                  r.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-slate-600/50 text-slate-500'
                }`}>
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Nearby Tab ──────────────────────────────────────────────────────────────

function NearbyTab({ nearby }: { nearby: PriceSighting[] }) {
  return (
    <div className="space-y-4">
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Navigation className="w-4 h-4 text-blue-400" />
          Showing deals within 300 miles of Chicago, IL (simulated location)
        </div>
      </div>
      {nearby.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <MapPin className="w-8 h-8 mx-auto mb-3 opacity-50" />
          <p>No deals found in your area. Try expanding the radius.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nearby.map(deal => (
            <div key={deal.id} className="bg-slate-800 rounded-lg border border-slate-700 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{deal.cardDescription}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                    <span className={`px-2 py-0.5 rounded-full ${SOURCE_COLORS[deal.source]}`}>
                      {SIGHTING_SOURCE_LABELS[deal.source]}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {deal.location.city}, {deal.location.state}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-green-400">${deal.price}</div>
                  <div className="text-xs text-slate-500 line-through">${deal.onlinePrice}</div>
                  <div className="text-sm font-semibold text-emerald-400">
                    Save {Math.abs(deal.arbitrageDelta).toFixed(0)}%
                  </div>
                </div>
              </div>
              {deal.isVerified && (
                <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
                  <CheckCircle className="w-3 h-3" /> Verified by {deal.verificationCount} nodes
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
