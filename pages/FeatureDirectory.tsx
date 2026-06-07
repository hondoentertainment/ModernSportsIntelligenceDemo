
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronRight, X, Zap, ArrowRight, Layers, LayoutGrid, List, Users } from 'lucide-react';
import {
  DISCOVERABLE_FEATURE_CATALOG,
  TIER_CONFIG,
  groupByTier,
  getCategories,
  Feature,
  FeatureTier,
} from '../lib/utils/featureCatalog';
import { isBetaSurfacesEnabled } from '../lib/productionLaunch';

/** Functional area groupings for organized browsing */
const FUNCTIONAL_AREAS: { id: string; label: string; icon: string; color: string; bgColor: string; borderColor: string; description: string; categoryMatch: string[]; keywordMatch: string[] }[] = [
  { id: 'portfolio', label: 'Portfolio Management', icon: 'briefcase', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Dashboard, collection, building, audit, and portfolio tracking tools', categoryMatch: ['Portfolio'], keywordMatch: ['portfolio', 'collection', 'nav', 'builder', 'audit', 'goal', 'sold', 'vault', 'inventory', 'rebalance'] },
  { id: 'market-intel', label: 'Market Intelligence', icon: 'chart', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', description: 'Market data, trends, pricing, demand analysis, and geographic insights', categoryMatch: ['Market Structure'], keywordMatch: ['market', 'trend', 'price', 'ticker', 'geographic', 'demand', 'heatmap', 'regional', 'psychographic', 'dealer', 'flow', 'shadow', 'microstructure', 'regime'] },
  { id: 'trading', label: 'Trading & Deals', icon: 'swap', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', description: 'Buying, selling, auctions, negotiation, and marketplace tools', categoryMatch: ['Trading'], keywordMatch: ['trade', 'deal', 'auction', 'negotiat', 'listing', 'ebay', 'buy', 'sell', 'snipe', 'arbitrage', 'venue', 'copy trading', 'market maker', 'replay'] },
  { id: 'ai-analytics', label: 'AI & Advanced Analytics', icon: 'brain', color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30', description: 'AI-powered insights, predictions, genome sequencing, and narrative analysis', categoryMatch: ['AI'], keywordMatch: ['ai', 'gemini', 'predict', 'genome', 'narrative', 'copilot', 'advisor', 'agent', 'chaos', 'contagion', 'cross hobby', 'catalyst'] },
  { id: 'risk-compliance', label: 'Risk & Compliance', icon: 'shield', color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/30', description: 'Risk management, stress testing, compliance monitoring, and safety', categoryMatch: ['Risk'], keywordMatch: ['risk', 'stress', 'compliance', 'regulatory', 'aml', 'contagion', 'crisis', 'failure', 'drill', 'biometric', 'guard', 'crowding'] },
  { id: 'finance', label: 'Financial Intelligence', icon: 'dollar', color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/30', description: 'Tax planning, insurance, estate planning, yield, and capital optimization', categoryMatch: ['Finance'], keywordMatch: ['tax', 'insurance', 'estate', 'fiscal', 'capital', 'yield', 'billing', 'break even', 'cost basis', 'k-1', 'syndicate', 'generational', 'wealth'] },
  { id: 'grading-auth', label: 'Grading & Authentication', icon: 'scan', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/30', description: 'Grading prediction, vision analysis, forensics, provenance, and material science', categoryMatch: ['Security'], keywordMatch: ['grade', 'grading', 'vision', 'forensic', 'provenance', 'counterfeit', 'auth', 'centering', 'acoustic', 'spectrometry', 'material', 'restoration'] },
  { id: 'player-intel', label: 'Player & Prospect Intel', icon: 'users', color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/30', description: 'Player tracking, prospect scouting, injury analysis, and HOF probability', categoryMatch: ['Data'], keywordMatch: ['player', 'prospect', 'mlb', 'rookie', 'injury', 'hof', 'pipeline', 'draft', 'pressbox', 'team', 'game', 'shockwave'] },
  { id: 'social', label: 'Social & Community', icon: 'globe', color: 'text-pink-400', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/30', description: 'Leaderboards, social graphs, sharing, community benchmarking, and AR', categoryMatch: ['Social'], keywordMatch: ['social', 'leaderboard', 'share', 'community', 'benchmark', 'collector', 'ar ', 'walkthrough', 'matchmaker'] },
  { id: 'behavioral', label: 'Behavioral Science', icon: 'heart', color: 'text-rose-400', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/30', description: 'Emotional analysis, dopamine tracking, decision journals, and psychology', categoryMatch: [], keywordMatch: ['emotional', 'dopamine', 'emotion', 'mood', 'memory', 'nostalgia', 'psychology', 'behavior', 'impulse', 'journal', 'thermometer'] },
  { id: 'tools', label: 'Tools & Utilities', icon: 'wrench', color: 'text-slate-300', bgColor: 'bg-slate-500/10', borderColor: 'border-slate-500/30', description: 'Calculators, planners, scanners, card show tools, and import/export', categoryMatch: ['Tools', 'UX'], keywordMatch: ['calculator', 'planner', 'scanner', 'import', 'export', 'show', 'event', 'wax', 'break', 'ocr', 'command', 'mobile', 'accessibility', 'voice'] },
  { id: 'system', label: 'Platform & System', icon: 'server', color: 'text-slate-400', bgColor: 'bg-slate-600/10', borderColor: 'border-slate-600/30', description: 'Authentication, billing, notifications, data migration, and infrastructure', categoryMatch: ['System', 'Strategy', 'Operations', 'Trust'], keywordMatch: ['auth', 'login', 'billing', 'stripe', 'notification', 'migration', 'sync', 'frontier', 'museum', 'claims'] },
];

/** User-scale groupings: Individual → Group → Enterprise */
type UserScale = 'individual' | 'group' | 'enterprise';

const SCALE_CONFIG: Record<UserScale, { label: string; color: string; bgColor: string; borderColor: string; description: string }> = {
  individual: { label: 'Individual Collector', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', borderColor: 'border-emerald-500/30', description: 'Solo collector tools — personal portfolio, analytics, trading, grading, and decision-making' },
  group: { label: 'Group & Social', color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/30', description: 'Multi-user collaboration — shared watchlists, clubs, group breaks, community, and peer-to-peer features' },
  enterprise: { label: 'Enterprise & Institutional', color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/30', description: 'Dealer operations, fund management, RBAC, API access, compliance, and institutional reporting' },
};

// Feature IDs that belong to Group scale
const GROUP_FEATURE_IDS = new Set([
  'social-alpha', 'collection-share', 'achievements', 'benchmarking', 'social-network',
  'showcase', 'public-portfolio', 'leaderboard', 'monthly-challenges', 'ar-vault-walkthrough',
  'trade-block', 'peer-lending', 'live-breaks', 'negotiation-replay',
  'collector-social-graph', 'counterparty-trust-graph', 'counterfeit-cluster-radar',
  'venue-health-oracle', 'influencer-quantifier', 'cross-hobby-contagion',
  'psychographic-demand', 'micro-geographic-demand', 'generational-demand-forecaster',
  'sentiment-seismograph', 'memetic-propagation', 'cultural-velocity', 'narrative-alpha',
  'prestige-spillover-engine',
  'shared-watchlists', 'group-breaks', 'club-management', 'collective-grading', 'shared-dashboards',
  'collaborative-set-registry', 'card-show-squad', 'group-buy-coop', 'draft-night-war-room', 'mentorship-exchange',
  'dispute-arbitration', 'group-insurance', 'crowd-pricing', 'group-vault', 'swap-meet',
]);

// Feature IDs that belong to Enterprise scale
const ENTERPRISE_FEATURE_IDS = new Set([
  'agentic-negotiation', 'liquidity-pool', 'fractional-vault', 'fractional-vault-v2',
  'fractional-syndicate', 'market-maker-arena', 'market-microstructure', 'playbook-templates',
  'mlb-stats', 'players', 'prospect-pipeline', 'prospect-trends', 'rookie-pipeline-scanner',
  'draft-night-tracker', 'contract-valuation', 'teams', 'games',
  'war-room', 'hedge-simulation', 'contagion-mapper', 'injury-shockwave',
  'live-impact', 'vision-grading', 'macro-sentinel', 'portfolio-scenario-theater',
  'claims-recovery-studio', 'venue-failure-drill', 'museum-loan-desk',
  'dealer-flow-intelligence', 'circadian-optimizer', 'multi-currency', 'estate-succession',
  'frontier-lab', 'opportunity-crowding-index', 'provenance-gap-heatmap',
  'reacquisition-radar', 'catalyst-market', 'recession-playbook',
  'card-yield-farming', 'card-loan-collateral',
  'slab-case-forensics', 'card-material-spectrometry', 'acoustic-authentication',
  'rbac-teams', 'white-label-api', 'dealer-inventory', 'fund-reporting', 'audit-trail',
]);

function assignToScale(feature: Feature): UserScale {
  if (GROUP_FEATURE_IDS.has(feature.id)) return 'group';
  if (ENTERPRISE_FEATURE_IDS.has(feature.id)) return 'enterprise';
  return 'individual';
}

function assignToArea(feature: Feature): string {
  // Check keywords first (more specific)
  for (const area of FUNCTIONAL_AREAS) {
    for (const kw of area.keywordMatch) {
      if (feature.keywords.some(fkw => fkw.includes(kw)) || feature.name.toLowerCase().includes(kw) || feature.description.toLowerCase().includes(kw)) {
        return area.id;
      }
    }
  }
  // Fallback to category match
  for (const area of FUNCTIONAL_AREAS) {
    if (area.categoryMatch.includes(feature.category)) {
      return area.id;
    }
  }
  return 'tools'; // default
}

type ViewMode = 'grouped' | 'tier' | 'scale';

const FeatureDirectory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<FeatureTier | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grouped');
  const navigate = useNavigate();

  const categories = useMemo(() => getCategories(DISCOVERABLE_FEATURE_CATALOG), []);

  const filtered = useMemo(() => {
    let features = DISCOVERABLE_FEATURE_CATALOG;

    if (selectedTier !== 'all') {
      features = features.filter(f => f.tier === selectedTier);
    }
    if (selectedCategory !== 'all') {
      features = features.filter(f => f.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      features = features.filter(f =>
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.keywords.some(kw => kw.includes(q))
      );
    }

    return features;
  }, [searchQuery, selectedTier, selectedCategory]);

  const grouped = useMemo(() => groupByTier(filtered), [filtered]);

  const groupedByScale = useMemo(() => {
    const scaleMap: Record<UserScale, Feature[]> = { individual: [], group: [], enterprise: [] };
    filtered.forEach(f => {
      scaleMap[assignToScale(f)].push(f);
    });
    return (['individual', 'group', 'enterprise'] as UserScale[]).filter(s => scaleMap[s].length > 0).map(s => ({
      scale: s,
      ...SCALE_CONFIG[s],
      features: scaleMap[s],
    }));
  }, [filtered]);

  const groupedByArea = useMemo(() => {
    const areaMap = new Map<string, Feature[]>();
    filtered.forEach(f => {
      const areaId = assignToArea(f);
      const list = areaMap.get(areaId) || [];
      list.push(f);
      areaMap.set(areaId, list);
    });
    return FUNCTIONAL_AREAS.filter(area => areaMap.has(area.id)).map(area => ({
      ...area,
      features: areaMap.get(area.id)!,
    }));
  }, [filtered]);

  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = { all: DISCOVERABLE_FEATURE_CATALOG.length };
    DISCOVERABLE_FEATURE_CATALOG.forEach(f => {
      counts[f.tier] = (counts[f.tier] || 0) + 1;
    });
    return counts;
  }, []);

  const handleFeatureClick = (feature: Feature) => {
    if (feature.path) {
      navigate(feature.path);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTier('all');
    setSelectedCategory('all');
  };

  const hasActiveFilters = searchQuery.trim() || selectedTier !== 'all' || selectedCategory !== 'all';

  const renderFeatureCard = (feature: Feature) => {
    const tierConfig = TIER_CONFIG[feature.tier];
    return (
      <button
        key={feature.id}
        onClick={() => handleFeatureClick(feature)}
        className={`group text-left p-4 rounded-xl border transition-all ${
          feature.path
            ? 'bg-brand-slate border-slate-800 hover:border-slate-600 hover:bg-brand-charcoal cursor-pointer'
            : 'bg-brand-slate/50 border-slate-800/50 cursor-default'
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-bold text-white group-hover:text-brand-lime transition-colors leading-tight">
            {feature.name}
          </h3>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`w-2 h-2 rounded-full ${
              feature.status === 'live' ? 'bg-brand-lime' :
              feature.status === 'beta' ? 'bg-amber-400' :
              feature.status === 'demo' ? 'bg-blue-400' :
              'bg-slate-600'
            }`} />
            <span className="text-[8px] font-black uppercase tracking-wider text-brand-muted">
              {feature.status}
            </span>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed mb-3 line-clamp-2">
          {feature.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${tierConfig.bgColor} ${tierConfig.color} font-bold uppercase`}>
              {feature.category}
            </span>
            <span className="text-[8px] text-brand-muted font-mono">
              Phase {feature.phase}
            </span>
          </div>
          {feature.path && (
            <ArrowRight size={12} className="text-slate-600 group-hover:text-brand-lime transition-colors" />
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {!isBetaSurfacesEnabled() ? (
        <div
          role="status"
          className="rounded-xl border border-brand-teal/30 bg-brand-teal/10 px-4 py-3 text-sm text-slate-200"
          data-testid="mvp-launch-notice"
        >
          <span className="font-semibold text-brand-lime">Subscriber beta</span>
          {' '}— discovery shows production-ready features only. Beta surfaces (fractional vault, provenance chain, vision grading, liquidity pool) are hidden unless{' '}
          <code className="text-xs text-brand-teal">VITE_FF_ENABLE_BETA_SURFACES=1</code> is set.
        </div>
      ) : null}
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-brand-lime p-2 rounded-xl shadow-lg shadow-brand-lime/20">
              <Layers className="text-brand-charcoal" size={20} />
            </div>
            <h1 className="font-bebas text-3xl md:text-4xl tracking-wider text-white">Feature Directory</h1>
          </div>
          <p className="text-sm text-brand-muted">
            All <span className="text-brand-lime font-bold">{DISCOVERABLE_FEATURE_CATALOG.length}</span> GA platform features across{' '}
            <span className="text-brand-lime font-bold">{FUNCTIONAL_AREAS.length}</span> functional areas.
            <span className="ml-2 text-slate-400">Beta and demo surfaces are hidden unless enabled.</span>
            {hasActiveFilters && (
              <span className="ml-2 text-slate-400">
                Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''}.
              </span>
            )}
          </p>
        </div>

        {/* View mode toggle + tier badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-brand-slate rounded-lg border border-slate-800 p-0.5">
            <button
              onClick={() => setViewMode('grouped')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'grouped' ? 'bg-brand-lime text-brand-charcoal' : 'text-slate-500 hover:text-white'}`}
            >
              <LayoutGrid size={12} /> By Area
            </button>
            <button
              onClick={() => setViewMode('tier')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'tier' ? 'bg-brand-lime text-brand-charcoal' : 'text-slate-500 hover:text-white'}`}
            >
              <List size={12} /> By Tier
            </button>
            <button
              onClick={() => setViewMode('scale')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'scale' ? 'bg-brand-lime text-brand-charcoal' : 'text-slate-500 hover:text-white'}`}
            >
              <Users size={12} /> By Scale
            </button>
          </div>
        </div>
      </div>

      {/* Tier filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {(Object.entries(TIER_CONFIG) as [FeatureTier, typeof TIER_CONFIG[FeatureTier]][]).sort((a, b) => a[1].order - b[1].order).map(([tier, config]) => (
          <button
            key={tier}
            onClick={() => setSelectedTier(selectedTier === tier ? 'all' : tier)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
              selectedTier === tier
                ? `${config.bgColor} ${config.color} ${config.borderColor}`
                : 'border-slate-800 text-brand-muted hover:border-slate-600'
            }`}
          >
            <span>{config.label}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[8px] ${config.bgColor} ${config.color}`}>
              {tierCounts[tier] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search and filters bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search GA features by name, description, or keyword..."
            className="w-full bg-brand-slate border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-brand-lime placeholder:text-slate-500 text-white"
            aria-label="Search features"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none bg-brand-slate border border-slate-800 rounded-xl py-2.5 pl-9 pr-8 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-lime cursor-pointer"
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted rotate-90 pointer-events-none" />
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-slate border border-slate-800 rounded-xl text-sm text-slate-400 hover:text-white hover:border-slate-600 transition-all"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Feature list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Search size={40} className="mx-auto text-slate-700 mb-4" />
          <p className="text-lg text-slate-400 font-medium">No features match your search</p>
          <p className="text-sm text-brand-muted mt-2">Try a different search term or clear your filters.</p>
          <button onClick={clearFilters} className="mt-4 px-4 py-2 bg-brand-lime text-brand-charcoal rounded-xl text-sm font-bold hover:bg-brand-lime/90 transition-colors">
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'scale' ? (
        /* ─── Grouped by User Scale ─── */
        <div className="space-y-8">
          {groupedByScale.map(group => (
            <div key={group.scale}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-px flex-1 ${group.borderColor} border-t`} />
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${group.bgColor} border ${group.borderColor}`}>
                  <Users size={12} className={group.color} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${group.color}`}>
                    {group.label}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${group.bgColor} ${group.color} font-bold`}>
                    {group.features.length}
                  </span>
                </div>
                <div className={`h-px flex-1 ${group.borderColor} border-t`} />
              </div>
              <p className="text-[10px] text-slate-500 mb-3 text-center">{group.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {group.features.map(renderFeatureCard)}
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === 'grouped' ? (
        /* ─── Grouped by Functional Area ─── */
        <div className="space-y-8">
          {groupedByArea.map(area => (
            <div key={area.id}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-px flex-1 ${area.borderColor} border-t`} />
                <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${area.bgColor} border ${area.borderColor}`}>
                  <Zap size={12} className={area.color} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${area.color}`}>
                    {area.label}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${area.bgColor} ${area.color} font-bold`}>
                    {area.features.length}
                  </span>
                </div>
                <div className={`h-px flex-1 ${area.borderColor} border-t`} />
              </div>
              <p className="text-[10px] text-slate-500 mb-3 text-center">{area.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {area.features.map(renderFeatureCard)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ─── Grouped by Tier (original) ─── */
        <div className="space-y-8">
          {grouped.map(([tier, features]) => {
            const config = TIER_CONFIG[tier];
            return (
              <div key={tier}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-px flex-1 ${config.borderColor} border-t`} />
                  <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${config.bgColor} border ${config.borderColor}`}>
                    <Zap size={12} className={config.color} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>
                      {config.label}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${config.bgColor} ${config.color} font-bold`}>
                      {features.length}
                    </span>
                  </div>
                  <div className={`h-px flex-1 ${config.borderColor} border-t`} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {features.map(renderFeatureCard)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary footer */}
      <div className="border-t border-slate-800 pt-6 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-brand-slate rounded-xl p-4 border border-slate-800">
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted mb-1">GA Features</p>
            <p className="text-2xl font-bebas tracking-wider text-brand-lime">{DISCOVERABLE_FEATURE_CATALOG.length}</p>
          </div>
          <div className="bg-brand-slate rounded-xl p-4 border border-slate-800">
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted mb-1">Functional Areas</p>
            <p className="text-2xl font-bebas tracking-wider text-white">{FUNCTIONAL_AREAS.length}</p>
          </div>
          <div className="bg-brand-slate rounded-xl p-4 border border-slate-800">
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted mb-1">Categories</p>
            <p className="text-2xl font-bebas tracking-wider text-white">{categories.length}</p>
          </div>
          <div className="bg-brand-slate rounded-xl p-4 border border-slate-800">
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted mb-1">Live GA</p>
            <p className="text-2xl font-bebas tracking-wider text-brand-lime">
              {DISCOVERABLE_FEATURE_CATALOG.filter(f => f.status === 'live').length}
            </p>
          </div>
          <div className="bg-brand-slate rounded-xl p-4 border border-slate-800">
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted mb-1">Industry Firsts</p>
            <p className="text-2xl font-bebas tracking-wider text-red-400">
              {DISCOVERABLE_FEATURE_CATALOG.filter(f => f.tier === 'Industry-First').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureDirectory;
