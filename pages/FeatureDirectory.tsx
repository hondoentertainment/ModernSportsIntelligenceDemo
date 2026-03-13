
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronRight, X, Zap, ArrowRight, Layers } from 'lucide-react';
import { FEATURE_CATALOG, TIER_CONFIG, groupByTier, getCategories, Feature, FeatureTier } from '../lib/featureCatalog';

const FeatureDirectory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<FeatureTier | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const navigate = useNavigate();

  const categories = useMemo(() => getCategories(), []);

  const filtered = useMemo(() => {
    let features = FEATURE_CATALOG;

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

  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = { all: FEATURE_CATALOG.length };
    FEATURE_CATALOG.forEach(f => {
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

  return (
    <div className="space-y-6">
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
            All <span className="text-brand-lime font-bold">{FEATURE_CATALOG.length}</span> platform features across{' '}
            <span className="text-brand-lime font-bold">{Object.keys(TIER_CONFIG).length}</span> tiers.
            {hasActiveFilters && (
              <span className="ml-2 text-slate-400">
                Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''}.
              </span>
            )}
          </p>
        </div>

        {/* Stats badges */}
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
      </div>

      {/* Search and filters bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search features by name, description, or keyword..."
            className="w-full bg-brand-slate border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-brand-lime placeholder:text-slate-500 text-white"
            aria-label="Search features"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category filter */}
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

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-slate border border-slate-800 rounded-xl text-sm text-slate-400 hover:text-white hover:border-slate-600 transition-all"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Feature list grouped by tier */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Search size={40} className="mx-auto text-slate-700 mb-4" />
          <p className="text-lg text-slate-400 font-medium">No features match your search</p>
          <p className="text-sm text-brand-muted mt-2">Try a different search term or clear your filters.</p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 bg-brand-lime text-brand-charcoal rounded-xl text-sm font-bold hover:bg-brand-lime/90 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([tier, features]) => {
            const config = TIER_CONFIG[tier];
            return (
              <div key={tier}>
                {/* Tier header */}
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

                {/* Feature cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {features.map(feature => (
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
                          <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${config.bgColor} ${config.color} font-bold uppercase`}>
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
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary footer */}
      <div className="border-t border-slate-800 pt-6 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-brand-slate rounded-xl p-4 border border-slate-800">
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted mb-1">Total Features</p>
            <p className="text-2xl font-bebas tracking-wider text-brand-lime">{FEATURE_CATALOG.length}</p>
          </div>
          <div className="bg-brand-slate rounded-xl p-4 border border-slate-800">
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted mb-1">Categories</p>
            <p className="text-2xl font-bebas tracking-wider text-white">{categories.length}</p>
          </div>
          <div className="bg-brand-slate rounded-xl p-4 border border-slate-800">
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted mb-1">Live Features</p>
            <p className="text-2xl font-bebas tracking-wider text-brand-lime">
              {FEATURE_CATALOG.filter(f => f.status === 'live').length}
            </p>
          </div>
          <div className="bg-brand-slate rounded-xl p-4 border border-slate-800">
            <p className="text-[9px] font-black uppercase tracking-widest text-brand-muted mb-1">Industry Firsts</p>
            <p className="text-2xl font-bebas tracking-wider text-red-400">
              {FEATURE_CATALOG.filter(f => f.tier === 'Industry-First').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureDirectory;
