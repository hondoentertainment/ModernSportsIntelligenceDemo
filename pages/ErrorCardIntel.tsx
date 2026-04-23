// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  AlertOctagon,
  Sparkles,
  TrendingUp,
  Search,
  BookOpen,
  Bell,
  Eye,
  Info,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  getErrorCards,
  getErrorAlerts,
  getVariationGuide,
  searchForErrors,
  getErrorCardStats,
  ErrorCard,
  ErrorAlert,
  ERROR_TYPE_META,
  RARITY_META,
  DIFFICULTY_META,
} from '../lib/core/errorCardService';

// ---- Helpers ----

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

function getUrgencyMeta(urgency: ErrorAlert['urgency']): { label: string; color: string; bg: string; border: string } {
  switch (urgency) {
    case 'critical': return { label: 'Critical', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
    case 'high': return { label: 'High', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    case 'medium': return { label: 'Medium', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
    case 'low': return { label: 'Low', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' };
  }
}

function getAlertTypeMeta(type: ErrorAlert['type']): { label: string; icon: React.ReactNode; color: string } {
  switch (type) {
    case 'new_discovery': return { label: 'New Discovery', icon: <Sparkles size={12} />, color: 'text-purple-400' };
    case 'price_spike': return { label: 'Price Spike', icon: <TrendingUp size={12} />, color: 'text-green-400' };
    case 'verification_needed': return { label: 'Verification', icon: <ShieldCheck size={12} />, color: 'text-amber-400' };
    case 'market_opportunity': return { label: 'Opportunity', icon: <Zap size={12} />, color: 'text-cyan-400' };
  }
}

// ---- Expandable Error Card Row ----

const ErrorCardRow: React.FC<{ card: ErrorCard }> = ({ card }) => {
  const [expanded, setExpanded] = useState(false);
  const errorMeta = ERROR_TYPE_META[card.errorType];
  const rarityMeta = RARITY_META[card.rarity];
  const diffMeta = DIFFICULTY_META[card.verificationDifficulty];

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl hover:border-slate-600 transition-colors overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left p-4 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">
            {card.year} {card.set} — {card.player}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{card.description}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${errorMeta.color} ${errorMeta.bg} border ${errorMeta.border}`}>
              {errorMeta.label}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${rarityMeta.color} ${rarityMeta.bg} border ${rarityMeta.border}`}>
              {rarityMeta.label}
            </span>
            <span className={`text-[10px] font-bold ${diffMeta.color}`}>
              <Eye size={10} className="inline mr-0.5" />
              {diffMeta.label}
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0 space-y-1">
          <p className="text-lg font-bebas tracking-wider text-amber-400">${card.errorValue.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500">Normal: ${card.normalValue.toLocaleString()}</p>
          <p className="px-2 py-0.5 rounded-md text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/30 inline-block">
            {card.premiumMultiplier.toLocaleString()}x premium
          </p>
        </div>
        <div className="flex-shrink-0 pt-1 text-slate-600">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-700/50 space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed mt-3">{card.description}</p>
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-600">Known Pop:</span>{' '}
              <span className="text-white font-bold">{card.knownPopulation.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-600">Manufacturer:</span>{' '}
              <span className="text-white font-bold">{card.manufacturer}</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">
              <Info size={10} className="inline mr-1" />
              Identification Tips
            </p>
            <ul className="space-y-1.5">
              {card.identificationTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-full bg-slate-800 text-[9px] font-bold text-slate-500 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

// ---- Page Component ----

const ErrorCardIntel: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'database' | 'variations' | 'alerts' | 'search'>('database');

  const errorCards = useMemo(() => getErrorCards(), []);
  const alerts = useMemo(() => getErrorAlerts(), []);
  const variationGuides = useMemo(() => getVariationGuide(), []);
  const stats = useMemo(() => getErrorCardStats(), []);

  // Database sort
  const [sortBy, setSortBy] = useState<'premium' | 'value' | 'rarity'>('premium');
  const sortedCards = useMemo(() => {
    const copy = [...errorCards];
    switch (sortBy) {
      case 'premium': return copy.sort((a, b) => b.premiumMultiplier - a.premiumMultiplier);
      case 'value': return copy.sort((a, b) => b.errorValue - a.errorValue);
      case 'rarity': {
        const order: Record<string, number> = { unique: 0, extremely_rare: 1, rare: 2, scarce: 3, common_error: 4 };
        return copy.sort((a, b) => (order[a.rarity] ?? 5) - (order[b.rarity] ?? 5));
      }
      default: return copy;
    }
  }, [errorCards, sortBy]);

  // Search state
  const [searchPlayer, setSearchPlayer] = useState('');
  const [searchYear, setSearchYear] = useState('');
  const [searchSet, setSearchSet] = useState('');
  const [searchResults, setSearchResults] = useState<ErrorCard[] | null>(null);

  const handleSearch = () => {
    const yearNum = searchYear ? parseInt(searchYear, 10) : undefined;
    const found = searchForErrors(
      searchPlayer || undefined,
      isNaN(yearNum as number) ? undefined : yearNum,
      searchSet || undefined
    );
    setSearchResults(found);
  };

  // Variation guide expand
  const [expandedSet, setExpandedSet] = useState<string | null>(variationGuides[0]?.setId ?? null);

  const sections = [
    { id: 'database' as const, label: 'Error Database', icon: <AlertOctagon size={16} /> },
    { id: 'variations' as const, label: 'Variation Guide', icon: <BookOpen size={16} /> },
    { id: 'alerts' as const, label: 'Alerts', icon: <Bell size={16} /> },
    { id: 'search' as const, label: 'Search', icon: <Search size={16} /> },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full mb-2">
            <Sparkles size={12} className="text-red-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Phase 102</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bebas tracking-widest text-white leading-none">
            Error Card <span className="text-red-400">Intelligence</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            The Hidden Goldmine of the Hobby — Identify, catalog, and value printing errors,
            unreported variations, SP/SSP identification, and error card market intelligence.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Cataloged', value: stats.totalCataloged, color: 'text-white' },
          { label: 'Error Cards', value: stats.totalErrors, color: 'text-red-400' },
          { label: 'Variations', value: stats.totalVariations, color: 'text-blue-400' },
          { label: 'Avg Premium', value: `${stats.avgPremium}x`, color: 'text-amber-400' },
          { label: 'Highest Premium', value: `${stats.highestPremium.toLocaleString()}x`, color: 'text-green-400' },
        ].map((stat, i) => (
          <div key={i} className="p-4 bg-brand-slate border border-slate-800 rounded-2xl text-center">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={`text-2xl font-bebas tracking-wider ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Section Nav */}
      <div className="flex gap-2 flex-wrap">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${
              activeSection === s.id
                ? 'bg-brand-lime/15 text-brand-lime border-brand-lime/30'
                : 'text-slate-500 border-slate-800 hover:text-white hover:bg-slate-800/50 hover:border-slate-700'
            }`}
          >
            {s.icon}
            {s.label}
            {s.id === 'alerts' && alerts.length > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                activeSection === s.id ? 'bg-brand-lime/20 text-brand-lime' : 'bg-slate-700 text-slate-400'
              }`}>
                {alerts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error Database Section */}
      {activeSection === 'database' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
              {errorCards.length} error card{errorCards.length !== 1 ? 's' : ''} cataloged
            </p>
            <div className="flex items-center gap-1">
              {(['premium', 'value', 'rarity'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors ${
                    sortBy === s
                      ? 'bg-brand-lime/15 text-brand-lime border border-brand-lime/30'
                      : 'text-slate-500 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {sortedCards.map(card => (
              <ErrorCardRow key={card.id} card={card} />
            ))}
          </div>
        </div>
      )}

      {/* Variation Guide Section */}
      {activeSection === 'variations' && (
        <div className="space-y-4">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            {variationGuides.length} set{variationGuides.length !== 1 ? 's' : ''} with known variations
          </p>
          {variationGuides.map(guide => {
            const isExpanded = expandedSet === guide.setId;
            return (
              <div key={guide.setId} className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setExpandedSet(isExpanded ? null : guide.setId)}
                  className="w-full text-left p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-bold text-white">{guide.setName}</p>
                    <p className="text-[11px] text-slate-500">
                      {guide.year} — {guide.variations.length} variation{guide.variations.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30">
                      {guide.variations.length} cards
                    </span>
                    {isExpanded ? <ChevronUp size={16} className="text-slate-600" /> : <ChevronDown size={16} className="text-slate-600" />}
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2 border-t border-slate-700/50">
                    {guide.variations.map((v, i) => {
                      const typeMeta = ERROR_TYPE_META[v.type];
                      return (
                        <div key={i} className="p-3 bg-slate-800/50 border border-slate-700/30 rounded-xl mt-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-white">{v.cardNumber}</span>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${typeMeta.color} ${typeMeta.bg} border ${typeMeta.border}`}>
                                  {typeMeta.label}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400">{v.description}</p>
                              <div className="mt-2 flex items-start gap-1.5">
                                <Eye size={10} className="text-slate-600 mt-0.5 flex-shrink-0" />
                                <p className="text-[10px] text-slate-500 italic">{v.howToIdentify}</p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bebas tracking-wider text-green-400">{v.valueMultiplier}x</p>
                              <p className="text-[10px] text-slate-600">~{v.estimatedPop.toLocaleString()} pop</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Alerts Section */}
      {activeSection === 'alerts' && (
        <div className="space-y-4">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            {alerts.length} active alert{alerts.length !== 1 ? 's' : ''}
          </p>
          {alerts.map(alert => {
            const urgMeta = getUrgencyMeta(alert.urgency);
            const typeMeta = getAlertTypeMeta(alert.type);
            const timeAgo = getTimeAgo(alert.date);
            return (
              <div
                key={alert.id}
                className={`p-4 bg-slate-800/30 border rounded-2xl space-y-3 ${
                  alert.urgency === 'critical' ? 'border-red-500/30' :
                  alert.urgency === 'high' ? 'border-amber-500/20' :
                  'border-slate-700/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 p-2 rounded-xl ${
                    alert.urgency === 'critical' ? 'bg-red-500/10 text-red-400' :
                    alert.urgency === 'high' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    <AlertTriangle size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`flex items-center gap-1 text-[10px] font-bold ${typeMeta.color}`}>
                        {typeMeta.icon}
                        {typeMeta.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${urgMeta.color} ${urgMeta.bg} border ${urgMeta.border}`}>
                        {urgMeta.label}
                      </span>
                      <span className="text-[10px] text-slate-600">{timeAgo}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      {alert.card.year} {alert.card.set} — {alert.card.player}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          {alerts.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">No error card alerts at this time.</div>
          )}
        </div>
      )}

      {/* Search Section */}
      {activeSection === 'search' && (
        <div className="space-y-4">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            Search Known Error Cards & Variations
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Player Name</label>
              <input
                type="text"
                value={searchPlayer}
                onChange={e => setSearchPlayer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. Ohtani"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-600 focus:border-brand-lime/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Year</label>
              <input
                type="text"
                value={searchYear}
                onChange={e => setSearchYear(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. 2018"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-600 focus:border-brand-lime/50 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Set / Manufacturer</label>
              <input
                type="text"
                value={searchSet}
                onChange={e => setSearchSet(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="e.g. Topps"
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-600 focus:border-brand-lime/50 focus:outline-none transition-colors"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-lime/15 text-brand-lime border border-brand-lime/30 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-lime/25 transition-colors"
          >
            <Search size={14} />
            Search Errors
          </button>
          {searchResults !== null && (
            <div className="space-y-2">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </p>
              {searchResults.length > 0 ? (
                searchResults.map(card => <ErrorCardRow key={card.id} card={card} />)
              ) : (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No known errors found for that search. Try broader terms or check the Error Database tab.
                </div>
              )}
            </div>
          )}
          {searchResults === null && (
            <div className="text-center py-8 text-slate-500 text-sm">
              Enter a player name, year, or set to search for known printing errors and variations.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorCardIntel;
