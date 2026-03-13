import React, { useMemo, useState } from 'react';
import {
  X,
  AlertOctagon,
  Search,
  BookOpen,
  Bell,
  Eye,
  Info,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  getErrorCards,
  getErrorAlerts,
  getVariationGuide,
  searchForErrors,
  getErrorCardStats,
  ErrorCard,
  ErrorAlert,
  VariationGuide,
  ERROR_TYPE_META,
  RARITY_META,
  DIFFICULTY_META,
} from '../lib/errorCardService';

interface ErrorCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'database' | 'variations' | 'alerts' | 'search';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'database', label: 'Error Database', icon: <AlertOctagon size={16} /> },
  { id: 'variations', label: 'Variation Guide', icon: <BookOpen size={16} /> },
  { id: 'alerts', label: 'Alerts', icon: <Bell size={16} /> },
  { id: 'search', label: 'Search', icon: <Search size={16} /> },
];

// ---- Urgency badge helpers ----

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

// ---- Error Card Detail Row ----

const ErrorCardRow: React.FC<{ card: ErrorCard }> = ({ card }) => {
  const [expanded, setExpanded] = useState(false);
  const errorMeta = ERROR_TYPE_META[card.errorType];
  const rarityMeta = RARITY_META[card.rarity];
  const diffMeta = DIFFICULTY_META[card.verificationDifficulty];

  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl hover:border-slate-600 transition-colors overflow-hidden">
      {/* Summary */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-start gap-3"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white truncate">
            {card.year} {card.set} — {card.player}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
            {card.description}
          </p>
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
          <p className="text-lg font-bebas tracking-wider text-amber-400">
            ${card.errorValue.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500">
            Normal: ${card.normalValue.toLocaleString()}
          </p>
          <p className="px-2 py-0.5 rounded-md text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/30 inline-block">
            {card.premiumMultiplier.toLocaleString()}x premium
          </p>
        </div>
        <div className="flex-shrink-0 pt-1 text-slate-600">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-slate-700/50 space-y-3">
          <p className="text-xs text-slate-400 leading-relaxed mt-3">
            {card.description}
          </p>

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

// ---- Database Tab ----

const DatabaseTab: React.FC<{ cards: ErrorCard[] }> = ({ cards }) => {
  const [sortBy, setSortBy] = useState<'premium' | 'value' | 'rarity'>('premium');

  const sorted = useMemo(() => {
    const copy = [...cards];
    switch (sortBy) {
      case 'premium': return copy.sort((a, b) => b.premiumMultiplier - a.premiumMultiplier);
      case 'value': return copy.sort((a, b) => b.errorValue - a.errorValue);
      case 'rarity': {
        const rarityOrder: Record<string, number> = { unique: 0, extremely_rare: 1, rare: 2, scarce: 3, common_error: 4 };
        return copy.sort((a, b) => (rarityOrder[a.rarity] ?? 5) - (rarityOrder[b.rarity] ?? 5));
      }
      default: return copy;
    }
  }, [cards, sortBy]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          {cards.length} error card{cards.length !== 1 ? 's' : ''} cataloged
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
        {sorted.map(card => (
          <ErrorCardRow key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
};

// ---- Variation Guide Tab ----

const VariationGuideTab: React.FC<{ guides: VariationGuide[] }> = ({ guides }) => {
  const [expandedSet, setExpandedSet] = useState<string | null>(guides[0]?.setId ?? null);

  return (
    <div className="space-y-4">
      <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
        {guides.length} set{guides.length !== 1 ? 's' : ''} with known variations
      </p>

      {guides.map(guide => {
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
                          <p className="text-sm font-bebas tracking-wider text-green-400">
                            {v.valueMultiplier}x
                          </p>
                          <p className="text-[10px] text-slate-600">
                            ~{v.estimatedPop.toLocaleString()} pop
                          </p>
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

      {guides.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          No variation guides found for the selected criteria.
        </div>
      )}
    </div>
  );
};

// ---- Alerts Tab ----

const AlertsTab: React.FC<{ alerts: ErrorAlert[] }> = ({ alerts }) => {
  return (
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
                <p className="text-xs text-slate-300 leading-relaxed">
                  {alert.message}
                </p>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  {alert.card.year} {alert.card.set} — {alert.card.player}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {alerts.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          No error card alerts at this time.
        </div>
      )}
    </div>
  );
};

// ---- Search Tab ----

const SearchTab: React.FC = () => {
  const [player, setPlayer] = useState('');
  const [year, setYear] = useState('');
  const [set, setSet] = useState('');
  const [results, setResults] = useState<ErrorCard[] | null>(null);

  const handleSearch = () => {
    const yearNum = year ? parseInt(year, 10) : undefined;
    const found = searchForErrors(
      player || undefined,
      isNaN(yearNum as number) ? undefined : yearNum,
      set || undefined
    );
    setResults(found);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="space-y-4">
      <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
        Search Known Error Cards & Variations
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
            Player Name
          </label>
          <input
            type="text"
            value={player}
            onChange={e => setPlayer(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Ohtani"
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-600 focus:border-brand-lime/50 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
            Year
          </label>
          <input
            type="text"
            value={year}
            onChange={e => setYear(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. 2018"
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-600 focus:border-brand-lime/50 focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
            Set / Manufacturer
          </label>
          <input
            type="text"
            value={set}
            onChange={e => setSet(e.target.value)}
            onKeyDown={handleKeyDown}
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

      {results !== null && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </p>
          {results.length > 0 ? (
            results.map(card => <ErrorCardRow key={card.id} card={card} />)
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">
              No known errors found for that search. Try broader terms or check the Error Database tab for all entries.
            </div>
          )}
        </div>
      )}

      {results === null && (
        <div className="text-center py-8 text-slate-500 text-sm">
          Enter a player name, year, or set to search for known printing errors and variations.
        </div>
      )}
    </div>
  );
};

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

// ---- Main Modal ----

export const ErrorCardModal: React.FC<ErrorCardModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('database');

  const errorCards = useMemo(() => getErrorCards(), []);
  const alerts = useMemo(() => getErrorAlerts(), []);
  const variationGuides = useMemo(() => getVariationGuide(), []);
  const stats = useMemo(() => getErrorCardStats(), []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-red-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl border border-red-500/30">
              <AlertOctagon size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Sparkles size={10} />
                  {stats.totalCataloged} cataloged
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/30">
                  <TrendingUp size={10} />
                  {stats.avgPremium}x avg premium
                </span>
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Error Card <span className="text-red-400">Intelligence</span>
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
          {TABS.map(tab => {
            let badge: number | null = null;
            if (tab.id === 'database') badge = errorCards.length;
            if (tab.id === 'variations') badge = variationGuides.reduce((s, g) => s + g.variations.length, 0);
            if (tab.id === 'alerts') badge = alerts.length;

            return (
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
                {badge !== null && badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                    activeTab === tab.id
                      ? 'bg-brand-lime/20 text-brand-lime'
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-8 max-h-[65vh] overflow-y-auto no-scrollbar">
          {activeTab === 'database' && <DatabaseTab cards={errorCards} />}
          {activeTab === 'variations' && <VariationGuideTab guides={variationGuides} />}
          {activeTab === 'alerts' && <AlertsTab alerts={alerts} />}
          {activeTab === 'search' && <SearchTab />}
        </div>
      </div>
    </div>
  );
};

export default ErrorCardModal;
