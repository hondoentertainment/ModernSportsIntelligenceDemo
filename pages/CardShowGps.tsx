import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MapPin,
  Navigation,
  Star,
  Clock,
  DollarSign,
  TrendingDown,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  ChevronRight,
  Zap,
  Users,
  ShieldCheck,
  Tag,
  ArrowDown,
  Package,
  Sparkles,
  Timer,
  Route,
  LocateFixed,
  Crosshair,
} from 'lucide-react';
import {
  getUpcomingShows,
  getShowMap,
  getOptimalRoute,
  getPriceSightings,
  getDealAlerts,
  getAllBooths,
  getSpecialtyColor,
  formatCurrency,
  formatTimeAgo,
  getAlertTypeLabel,
  getAlertTypeColor,
  type CardShow,
  type Booth,
  type PriceSighting,
  type WalkingRoute,
  type DealAlert,
  type ShowMap,
} from '../lib/utils/cardShowGpsService';

// ---- Types ----

type TabId = 'map' | 'directory' | 'sightings' | 'route' | 'alerts';

// ---- Helper Components ----

const StarRating: React.FC<{ rating: number; reviews: number }> = ({ rating, reviews }) => (
  <div className="flex items-center gap-1">
    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
    <span className="text-sm font-medium text-slate-200">{rating.toFixed(1)}</span>
    <span className="text-xs text-slate-500">({reviews})</span>
  </div>
);

const Badge: React.FC<{ label: string; color?: string }> = ({ label, color }) => (
  <span
    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
    style={{
      backgroundColor: color ? `${color}20` : 'rgba(163,230,53,0.15)',
      color: color ?? '#a3e635',
    }}
  >
    {label}
  </span>
);

const PriceLevelIndicator: React.FC<{ level: Booth['priceLevel'] }> = ({ level }) => {
  const config = {
    budget: { label: '$', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    mid: { label: '$$', color: 'text-blue-400', bg: 'bg-blue-400/10' },
    premium: { label: '$$$', color: 'text-amber-400', bg: 'bg-amber-400/10' },
    'high-end': { label: '$$$$', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  };
  const c = config[level];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${c.color} ${c.bg}`}>
      {c.label}
    </span>
  );
};

const DealQualityBar: React.FC<{ score: number }> = ({ score }) => {
  const color = score >= 85 ? 'bg-lime-400' : score >= 70 ? 'bg-amber-400' : 'bg-slate-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-7 text-right">{score}</span>
    </div>
  );
};

// ---- Tab Button ----

const TabButton: React.FC<{
  label: string;
  tabId: TabId;
  active: TabId;
  onClick: (id: TabId) => void;
  icon: React.ReactNode;
}> = ({ label, tabId, active, onClick, icon }) => (
  <button
    onClick={() => onClick(tabId)}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
      active === tabId
        ? 'bg-lime-400/15 text-lime-400 border border-lime-400/30'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
    }`}
  >
    {icon}
    {label}
  </button>
);

// ---- Show Map Tab ----

const ShowMapTab: React.FC<{ showMap: ShowMap; onSelectBooth: (b: Booth) => void; selectedBooth: Booth | null }> = ({
  showMap,
  onSelectBooth,
  selectedBooth,
}) => {
  const { rows, cols, booths } = showMap;

  const boothGrid = useMemo(() => {
    const grid: (Booth | null)[][] = Array.from({ length: rows }, () => Array(cols).fill(null));
    for (const booth of booths) {
      if (booth.row < rows && booth.col < cols) {
        grid[booth.row][booth.col] = booth;
      }
    }
    return grid;
  }, [rows, cols, booths]);

  return (
    <div className="space-y-6">
      {/* Legend */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Floor Plan Legend</h3>
        <div className="flex flex-wrap gap-3">
          {['Vintage', 'Modern', 'Graded', 'Wax', 'Autographs', 'Game-Used', 'Baseball', 'Basketball', 'Football', 'High-End', 'Bulk', 'Authentication'].map(
            (spec) => (
              <div key={spec} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: getSpecialtyColor(spec) }}
                />
                <span className="text-xs text-slate-400">{spec}</span>
              </div>
            ),
          )}
        </div>
      </div>

      {/* Floor Plan Grid */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300">Show Floor Layout</h3>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <LocateFixed className="w-3.5 h-3.5" />
            Click a booth for details
          </div>
        </div>

        {/* Entrance indicator */}
        <div className="flex justify-center mb-2">
          <div className="flex items-center gap-1 px-4 py-1 bg-lime-400/10 border border-lime-400/30 rounded-full">
            <Navigation className="w-3 h-3 text-lime-400" />
            <span className="text-xs font-medium text-lime-400">Main Entrance</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {boothGrid.flat().map((booth, i) => {
            if (!booth) {
              return (
                <div
                  key={`empty-${i}`}
                  className="aspect-square rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-center"
                >
                  <span className="text-xs text-slate-700">---</span>
                </div>
              );
            }
            const isSelected = selectedBooth?.id === booth.id;
            const specColor = getSpecialtyColor(booth.specialty);
            return (
              <button
                key={booth.id}
                onClick={() => onSelectBooth(booth)}
                className={`relative aspect-square rounded-lg border-2 p-2 flex flex-col items-center justify-center transition-all hover:scale-105 ${
                  isSelected
                    ? 'ring-2 ring-lime-400 border-lime-400/60 bg-slate-700'
                    : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                } ${!booth.isOpen ? 'opacity-40' : ''}`}
                style={{ borderColor: isSelected ? undefined : `${specColor}60` }}
              >
                <div
                  className="absolute top-1 left-1 w-2 h-2 rounded-full"
                  style={{ backgroundColor: specColor }}
                />
                <span className="text-xs font-bold text-slate-200">{booth.label}</span>
                <span className="text-[10px] text-slate-400 truncate w-full text-center mt-0.5">
                  {booth.dealer.name.length > 14
                    ? booth.dealer.name.slice(0, 12) + '...'
                    : booth.dealer.name}
                </span>
                {booth.dealQualityScore >= 85 && (
                  <Zap className="absolute top-1 right-1 w-3 h-3 text-lime-400" />
                )}
                {!booth.isOpen && (
                  <span className="absolute bottom-1 text-[8px] text-red-400 font-bold">CLOSED</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Side Amenities */}
        <div className="flex justify-end mt-3 gap-3">
          {showMap.amenities.map((a) => (
            <div key={a.label} className="flex items-center gap-1 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-slate-600" />
              {a.label}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Booth Detail */}
      {selectedBooth && (
        <div className="bg-slate-800/60 rounded-xl border border-lime-400/20 p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{ backgroundColor: getSpecialtyColor(selectedBooth.specialty) }}
                />
                <h3 className="text-lg font-bold text-slate-100">
                  {selectedBooth.dealer.name}
                </h3>
                {selectedBooth.dealer.verified && (
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                )}
              </div>
              <p className="text-sm text-slate-400">
                Booth {selectedBooth.label} &middot; {selectedBooth.specialty}
              </p>
            </div>
            <PriceLevelIndicator level={selectedBooth.priceLevel} />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <StarRating rating={selectedBooth.dealer.rating} reviews={selectedBooth.dealer.totalReviews} />
            </div>
            <div>
              <span className="text-xs text-slate-500">Deal Quality</span>
              <DealQualityBar score={selectedBooth.dealQualityScore} />
            </div>
            <div>
              <span className="text-xs text-slate-500">Years in Business</span>
              <p className="text-sm text-slate-200">{selectedBooth.dealer.yearsInBusiness} years</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Accepts Offers</span>
              <p className="text-sm text-slate-200">{selectedBooth.dealer.acceptsOffers ? 'Yes' : 'No'}</p>
            </div>
          </div>
          <div>
            <span className="text-xs text-slate-500 block mb-1.5">Inventory Highlights</span>
            <div className="space-y-1">
              {selectedBooth.inventoryHighlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                  <ChevronRight className="w-3 h-3 text-lime-400 flex-shrink-0" />
                  {h}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {selectedBooth.tags.map((tag) => (
              <Badge key={tag} label={tag} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ---- Booth Directory Tab ----

const BoothDirectoryTab: React.FC<{ booths: Booth[] }> = ({ booths }) => {
  const [search, setSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'deals' | 'name'>('rating');

  const specialties = useMemo(() => {
    const set = new Set(booths.map((b) => b.specialty));
    return ['all', ...Array.from(set).sort()];
  }, [booths]);

  const filtered = useMemo(() => {
    let result = [...booths];
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.dealer.name.toLowerCase().includes(lower) ||
          b.specialty.toLowerCase().includes(lower) ||
          b.inventoryHighlights.some((h) => h.toLowerCase().includes(lower)) ||
          b.tags.some((t) => t.toLowerCase().includes(lower)),
      );
    }
    if (specialtyFilter !== 'all') {
      result = result.filter((b) => b.specialty === specialtyFilter);
    }
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.dealer.rating - a.dealer.rating);
        break;
      case 'deals':
        result.sort((a, b) => b.dealQualityScore - a.dealQualityScore);
        break;
      case 'name':
        result.sort((a, b) => a.dealer.name.localeCompare(b.dealer.name));
        break;
    }
    return result;
  }, [booths, search, specialtyFilter, sortBy]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search dealers, cards, specialties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-lime-400/50"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-lime-400/50"
            >
              {specialties.map((s) => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All Specialties' : s}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'rating' | 'deals' | 'name')}
              className="px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-lime-400/50"
            >
              <option value="rating">Sort: Rating</option>
              <option value="deals">Sort: Deal Score</option>
              <option value="name">Sort: Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-slate-400">
          {filtered.length} dealer{filtered.length !== 1 ? 's' : ''} found
        </span>
        <span className="text-xs text-slate-600">
          <Filter className="w-3 h-3 inline mr-1" />
          {specialtyFilter !== 'all' ? specialtyFilter : 'All'} &middot;{' '}
          {sortBy === 'rating' ? 'By Rating' : sortBy === 'deals' ? 'By Deals' : 'By Name'}
        </span>
      </div>

      {/* Booth Cards */}
      <div className="space-y-3">
        {filtered.map((booth) => (
          <div
            key={booth.id}
            className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: getSpecialtyColor(booth.specialty) }}
                >
                  {booth.label}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-semibold text-slate-100">{booth.dealer.name}</h4>
                    {booth.dealer.verified && (
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Booth {booth.label} &middot; {booth.specialty} &middot;{' '}
                    {booth.dealer.yearsInBusiness}yr
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <PriceLevelIndicator level={booth.priceLevel} />
                {booth.dealer.acceptsOffers && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-400/10 text-emerald-400 rounded font-medium">
                    OFFERS OK
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-3">
              <StarRating rating={booth.dealer.rating} reviews={booth.dealer.totalReviews} />
              <div className="flex-1 max-w-[200px]">
                <DealQualityBar score={booth.dealQualityScore} />
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Users className="w-3 h-3" />
                {booth.lastVisitedCount} visits
              </div>
            </div>

            <div className="space-y-1 mb-2">
              {booth.inventoryHighlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                  <ChevronRight className="w-3 h-3 text-lime-400 flex-shrink-0" />
                  {h}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {booth.tags.map((tag) => (
                <Badge key={tag} label={tag} color={getSpecialtyColor(booth.specialty)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---- Price Sightings Tab ----

const PriceSightingsTab: React.FC<{ sightings: PriceSighting[] }> = ({ sightings }) => {
  const [filter, setFilter] = useState<'all' | 'verified' | 'deals'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    let result = [...sightings].sort((a, b) => b.timestamp - a.timestamp);
    if (filter === 'verified') result = result.filter((s) => s.verified);
    if (filter === 'deals') result = result.filter((s) => s.discountPercent >= 20);
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.cardName.toLowerCase().includes(lower) ||
          s.dealerName.toLowerCase().includes(lower) ||
          s.cardSet.toLowerCase().includes(lower),
      );
    }
    return result;
  }, [sightings, filter, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search sightings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-lime-400/50"
            />
          </div>
          <div className="flex gap-2">
            {[
              { id: 'all' as const, label: 'All' },
              { id: 'verified' as const, label: 'Verified' },
              { id: 'deals' as const, label: '20%+ Off' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f.id
                    ? 'bg-lime-400/15 text-lime-400 border border-lime-400/30'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/40 border border-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-2 px-1">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-lime-400" />
        </span>
        <span className="text-sm text-slate-400">
          Live feed &middot; {filtered.length} sighting{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Sightings List */}
      <div className="space-y-2">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-slate-100">
                    {s.cardYear} {s.cardSet} {s.cardName}
                  </h4>
                  {s.verified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" title="Verified sighting" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Booth {s.boothLabel} &middot; {s.dealerName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {s.condition}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(s.timestamp)}
                  </span>
                </div>
              </div>
              <div className="text-right ml-4">
                <div className="text-lg font-bold text-slate-100">{formatCurrency(s.askingPrice)}</div>
                <div className="flex items-center gap-1 justify-end">
                  <span className="text-xs text-slate-500 line-through">
                    {formatCurrency(s.estimatedMarketValue)}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      s.discountPercent >= 20
                        ? 'text-lime-400'
                        : s.discountPercent >= 10
                          ? 'text-amber-400'
                          : 'text-slate-400'
                    }`}
                  >
                    -{s.discountPercent}%
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50">
              <span className="text-xs text-slate-500">
                Spotted by <span className="text-slate-400">{s.reportedBy}</span>
              </span>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <TrendingDown className="w-3 h-3" />
                {s.upvotes} confirmations
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---- Route Planner Tab ----

const RoutePlannerTab: React.FC<{ showId: string }> = ({ showId }) => {
  const [priorities, setPriorities] = useState<string[]>(['Vintage', 'Rookies']);
  const [route, setRoute] = useState<WalkingRoute | null>(null);
  const [inputValue, setInputValue] = useState('');

  const availablePriorities = [
    'Vintage',
    'Modern',
    'Rookies',
    'Graded',
    'Autographs',
    'Game-Used',
    'Baseball',
    'Basketball',
    'Football',
    'High-End',
    'Wax',
    'Prospects',
    'Refractors',
    'Budget',
  ];

  useEffect(() => {
    setRoute(getOptimalRoute(showId, priorities));
  }, [showId, priorities]);

  const handleAddPriority = useCallback(
    (p: string) => {
      if (!priorities.includes(p)) {
        setPriorities([...priorities, p]);
      }
    },
    [priorities],
  );

  const handleRemovePriority = useCallback(
    (p: string) => {
      setPriorities(priorities.filter((x) => x !== p));
    },
    [priorities],
  );

  const handleCustomAdd = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed && !priorities.includes(trimmed)) {
      setPriorities([...priorities, trimmed]);
      setInputValue('');
    }
  }, [inputValue, priorities]);

  return (
    <div className="space-y-6">
      {/* Priority Selector */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-lime-400" />
          Your Want-List Priorities
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {priorities.map((p) => (
            <button
              key={p}
              onClick={() => handleRemovePriority(p)}
              className="inline-flex items-center gap-1 px-3 py-1 bg-lime-400/15 text-lime-400 border border-lime-400/30 rounded-full text-sm font-medium hover:bg-lime-400/25 transition-colors"
            >
              {p}
              <span className="ml-1 text-lime-400/60">&times;</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {availablePriorities
            .filter((p) => !priorities.includes(p))
            .map((p) => (
              <button
                key={p}
                onClick={() => handleAddPriority(p)}
                className="px-2.5 py-1 bg-slate-900/60 text-slate-400 border border-slate-700 rounded-full text-xs hover:text-slate-200 hover:border-slate-500 transition-colors"
              >
                + {p}
              </button>
            ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add custom priority..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomAdd()}
            className="flex-1 px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-lime-400/50"
          />
          <button
            onClick={handleCustomAdd}
            className="px-4 py-2 bg-lime-400/15 text-lime-400 border border-lime-400/30 rounded-lg text-sm font-medium hover:bg-lime-400/25 transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      {/* Route Summary */}
      {route && (
        <>
          <div className="bg-slate-800/60 rounded-xl border border-lime-400/20 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Route className="w-5 h-5 text-lime-400" />
              <h3 className="text-lg font-bold text-slate-100">Optimized Route</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-lime-400">{route.stops.length}</p>
                <p className="text-xs text-slate-500">Booths</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-lime-400">{route.estimatedMinutes}</p>
                <p className="text-xs text-slate-500">Minutes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-lime-400">{route.totalDistanceMeters}m</p>
                <p className="text-xs text-slate-500">Walking</p>
              </div>
            </div>
            <p className="text-sm text-slate-400">{route.description}</p>
          </div>

          {/* Route Steps */}
          <div className="space-y-0">
            {route.stops.map((stop, i) => (
              <div key={stop.boothId} className="flex gap-3">
                {/* Timeline */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      i < 3
                        ? 'bg-lime-400/20 text-lime-400 border-2 border-lime-400/40'
                        : 'bg-slate-700 text-slate-400 border-2 border-slate-600'
                    }`}
                  >
                    {stop.order}
                  </div>
                  {i < route.stops.length - 1 && (
                    <div className="w-0.5 h-full min-h-[24px] bg-slate-700" />
                  )}
                </div>

                {/* Stop Card */}
                <div className="flex-1 bg-slate-800/60 rounded-xl border border-slate-700/50 p-4 mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-200">
                        Booth {stop.boothLabel}
                      </span>
                      <span className="text-sm text-slate-400">{stop.dealerName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Timer className="w-3 h-3" />
                      ~{stop.estimatedBrowseMinutes} min
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">{stop.reasonToVisit}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ---- Deal Alerts Tab ----

const DealAlertsTab: React.FC<{ alerts: DealAlert[] }> = ({ alerts }) => {
  const sorted = useMemo(() => [...alerts].sort((a, b) => b.timestamp - a.timestamp), [alerts]);

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-lime-400" />
            <span className="text-sm font-semibold text-slate-200">
              {alerts.filter((a) => a.isActive).length} Active Deals
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-red-400" />
              {alerts.filter((a) => a.alertType === 'price_drop').length} Price Drops
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              {alerts.filter((a) => a.alertType === 'flash_sale').length} Flash Sales
            </span>
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3 text-cyan-400" />
              {alerts.filter((a) => a.alertType === 'bundle_deal').length} Bundle Deals
            </span>
          </div>
        </div>
      </div>

      {/* Alert Cards */}
      <div className="space-y-3">
        {sorted.map((alert) => {
          const typeColor = getAlertTypeColor(alert.alertType);
          const isExpiring =
            alert.expiresAt !== null && alert.expiresAt - Date.now() < 3600000;
          return (
            <div
              key={alert.id}
              className={`bg-slate-800/60 rounded-xl border p-4 transition-colors ${
                alert.isActive
                  ? 'border-slate-700/50 hover:border-slate-600'
                  : 'border-slate-800 opacity-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${typeColor}`}
                    style={{
                      backgroundColor:
                        alert.alertType === 'price_drop'
                          ? 'rgba(248,113,113,0.1)'
                          : alert.alertType === 'flash_sale'
                            ? 'rgba(251,191,36,0.1)'
                            : alert.alertType === 'new_arrival'
                              ? 'rgba(52,211,153,0.1)'
                              : alert.alertType === 'last_one'
                                ? 'rgba(251,113,133,0.1)'
                                : 'rgba(34,211,238,0.1)',
                    }}
                  >
                    {alert.alertType === 'price_drop' && <ArrowDown className="w-3 h-3" />}
                    {alert.alertType === 'flash_sale' && <Zap className="w-3 h-3" />}
                    {alert.alertType === 'new_arrival' && <Sparkles className="w-3 h-3" />}
                    {alert.alertType === 'last_one' && <AlertTriangle className="w-3 h-3" />}
                    {alert.alertType === 'bundle_deal' && <Package className="w-3 h-3" />}
                    {getAlertTypeLabel(alert.alertType)}
                  </span>
                  {isExpiring && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium animate-pulse">
                      <Timer className="w-3 h-3" />
                      Expiring soon
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500">{formatTimeAgo(alert.timestamp)}</span>
              </div>

              <p className="text-sm text-slate-200 mb-2">{alert.message}</p>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  Booth {alert.boothLabel} &middot; {alert.dealerName}
                </span>
                {alert.originalPrice > 0 && alert.newPrice > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="line-through">{formatCurrency(alert.originalPrice)}</span>
                    <span className="text-lime-400 font-bold text-sm">
                      {formatCurrency(alert.newPrice)}
                    </span>
                    <span className="text-red-400 font-bold">-{alert.dropPercent}%</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---- Main Page Component ----

const CardShowGps: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('map');
  const [selectedShowId, setSelectedShowId] = useState<string>('show1');
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const [shows, setShows] = useState<CardShow[]>([]);
  const [showMap, setShowMap] = useState<ShowMap | null>(null);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [sightings, setSightings] = useState<PriceSighting[]>([]);
  const [alerts, setAlerts] = useState<DealAlert[]>([]);

  useEffect(() => {
    setShows(getUpcomingShows());
  }, []);

  useEffect(() => {
    setShowMap(getShowMap(selectedShowId));
    setBooths(getAllBooths(selectedShowId));
    setSightings(getPriceSightings(selectedShowId));
    setAlerts(getDealAlerts(selectedShowId));
    setSelectedBooth(null);
  }, [selectedShowId]);

  // Simulated real-time sighting updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSightings((prev) => {
        const updated = [...prev];
        if (updated.length > 0) {
          const idx = Math.floor(Math.random() * updated.length);
          updated[idx] = { ...updated[idx], timestamp: Date.now(), upvotes: updated[idx].upvotes + 1 };
        }
        return updated;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const selectedShow = useMemo(
    () => shows.find((s) => s.id === selectedShowId) ?? null,
    [shows, selectedShowId],
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-lime-400/10 rounded-xl">
              <MapPin className="w-7 h-7 text-lime-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Card Show GPS Navigator</h1>
              <p className="text-sm text-slate-400">
                Booth-level intelligence &middot; Optimal routes &middot; Live price sightings
              </p>
            </div>
          </div>
        </div>

        {/* Show Selector */}
        <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Navigation className="w-4 h-4 text-lime-400" />
            <h2 className="text-sm font-semibold text-slate-300">Select a Show</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {shows.map((show) => (
              <button
                key={show.id}
                onClick={() => setSelectedShowId(show.id)}
                className={`text-left p-3 rounded-lg border transition-all ${
                  selectedShowId === show.id
                    ? 'bg-lime-400/10 border-lime-400/40 ring-1 ring-lime-400/20'
                    : 'bg-slate-900/40 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-slate-200 truncate pr-2">{show.name}</h3>
                  {show.isActive && (
                    <span className="flex-shrink-0 px-1.5 py-0.5 bg-lime-400/20 text-lime-400 rounded text-[10px] font-bold">
                      LIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {show.city}, {show.state} &middot; {show.date}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {show.totalBooths} booths &middot; ${show.admissionFee} entry
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Show Info Bar */}
        {selectedShow && (
          <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4 mb-6">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <span className="text-xs text-slate-500 block">Venue</span>
                <span className="text-sm text-slate-200">{selectedShow.venue}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Date</span>
                <span className="text-sm text-slate-200">
                  {selectedShow.date} to {selectedShow.endDate}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Hours</span>
                <span className="text-sm text-slate-200">{selectedShow.hours}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Booths</span>
                <span className="text-sm text-slate-200">{selectedShow.totalBooths}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Expected Attendance</span>
                <span className="text-sm text-slate-200">
                  {selectedShow.expectedAttendance.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Admission</span>
                <span className="text-sm text-lime-400 font-semibold">
                  ${selectedShow.admissionFee}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <TabButton label="Show Map" tabId="map" active={activeTab} onClick={setActiveTab} icon={<MapPin className="w-4 h-4" />} />
          <TabButton label="Booth Directory" tabId="directory" active={activeTab} onClick={setActiveTab} icon={<Search className="w-4 h-4" />} />
          <TabButton label="Price Sightings" tabId="sightings" active={activeTab} onClick={setActiveTab} icon={<Eye className="w-4 h-4" />} />
          <TabButton label="Route Planner" tabId="route" active={activeTab} onClick={setActiveTab} icon={<Route className="w-4 h-4" />} />
          <TabButton label="Deal Alerts" tabId="alerts" active={activeTab} onClick={setActiveTab} icon={<Zap className="w-4 h-4" />} />
        </div>

        {/* Tab Content */}
        {activeTab === 'map' && showMap && (
          <ShowMapTab showMap={showMap} onSelectBooth={setSelectedBooth} selectedBooth={selectedBooth} />
        )}
        {activeTab === 'directory' && <BoothDirectoryTab booths={booths} />}
        {activeTab === 'sightings' && <PriceSightingsTab sightings={sightings} />}
        {activeTab === 'route' && <RoutePlannerTab showId={selectedShowId} />}
        {activeTab === 'alerts' && <DealAlertsTab alerts={alerts} />}
      </div>
    </div>
  );
};

export default CardShowGps;
