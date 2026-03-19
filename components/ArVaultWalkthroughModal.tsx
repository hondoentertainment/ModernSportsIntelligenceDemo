import React, { useMemo, useState } from 'react';
import {
  X,
  View,
  LayoutGrid,
  Hammer,
  Route,
  Globe,
  Eye,
  Layers,
  DollarSign,
  Share2,
  Lock,
  Users,
  GlobeLock,
  Crown,
  Trophy,
  Frame,
  Armchair,
  Landmark,
  Monitor,
  Play,
  Radio,
  Clock,
  Search,
  ArrowUpDown,
  Lightbulb,
  RotateCcw,
  Star,
  MapPin,
  Plus,
  Sparkles,
} from 'lucide-react';
import {
  getVaultRooms,
  getCardsInRoom,
  getVaultTours,
  getVaultStats,
  getSharedVaults,
  calculateRoomValue,
  calculateRoomValueChange,
  searchPublicVaults,
  sortVaults,
  VAULT_THEME_META,
  VaultRoom,
  VaultTheme,
  VaultVisibility,
  VaultTour,
} from '../lib/utils/arVaultWalkthroughService';

interface ArVaultWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalTab = 'my-vaults' | 'room-builder' | 'tours' | 'shared';

const TAB_CONFIG: { id: ModalTab; label: string; icon: React.ReactNode }[] = [
  { id: 'my-vaults', label: 'My Vaults', icon: <LayoutGrid size={15} /> },
  { id: 'room-builder', label: 'Room Builder', icon: <Hammer size={15} /> },
  { id: 'tours', label: 'Tours', icon: <Route size={15} /> },
  { id: 'shared', label: 'Shared Vaults', icon: <Globe size={15} /> },
];

const THEME_ICONS: Record<VaultTheme, React.ReactNode> = {
  'luxury-vault': <Crown size={16} />,
  'sports-hall': <Trophy size={16} />,
  'modern-gallery': <Frame size={16} />,
  'collector-den': <Armchair size={16} />,
  'museum-wing': <Landmark size={16} />,
  'skybox-suite': <Monitor size={16} />,
};

const VISIBILITY_CONFIG: Record<VaultVisibility, { icon: React.ReactNode; label: string; color: string }> = {
  private: { icon: <Lock size={10} />, label: 'Private', color: 'text-slate-400 bg-slate-700/50 border-slate-600' },
  shared: { icon: <Users size={10} />, label: 'Shared', color: 'text-blue-400 bg-blue-500/15 border-blue-500/30' },
  public: { icon: <GlobeLock size={10} />, label: 'Public', color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' },
};

export const ArVaultWalkthroughModal: React.FC<ArVaultWalkthroughModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('my-vaults');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'views' | 'value' | 'rating' | 'recent'>('views');
  const [selectedTheme, setSelectedTheme] = useState<VaultTheme>('luxury-vault');
  const [spotlightEnabled, setSpotlightEnabled] = useState(true);
  const [priceTickerOn, setPriceTickerOn] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const rooms = useMemo(() => getVaultRooms(), []);
  const tours = useMemo(() => getVaultTours(), []);
  const stats = useMemo(() => getVaultStats(), []);
  const sharedVaults = useMemo(() => {
    if (searchQuery.trim()) {
      return sortVaults(searchPublicVaults(searchQuery), sortBy);
    }
    return sortVaults(getSharedVaults(), sortBy);
  }, [searchQuery, sortBy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-5xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-purple-500/10 to-slate-900 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                <View size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-purple-500/15 text-purple-400 border border-purple-500/30">
                    <Sparkles size={10} />
                    AR Experience
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  AR Vault <span className="text-purple-400">Walkthrough</span>
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-slate-800 text-slate-500 hover:text-white rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-6 mt-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-400">
              <LayoutGrid size={13} className="text-purple-400" />
              <strong className="text-white">{stats.totalRooms}</strong> Rooms
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Layers size={13} className="text-purple-400" />
              <strong className="text-white">{stats.totalCardsDisplayed}</strong> Cards
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Eye size={13} className="text-purple-400" />
              <strong className="text-white">{stats.totalViews.toLocaleString()}</strong> Views
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <DollarSign size={13} className="text-emerald-400" />
              <strong className="text-white">
                ${stats.totalPortfolioValue >= 1000000
                  ? `${(stats.totalPortfolioValue / 1000000).toFixed(1)}M`
                  : `${(stats.totalPortfolioValue / 1000).toFixed(0)}k`}
              </strong> Portfolio
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-slate-800/50 rounded-xl p-1 w-fit">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'my-vaults' && <MyVaultsTab rooms={rooms} onSelectRoom={setSelectedRoomId} selectedRoomId={selectedRoomId} />}
          {activeTab === 'room-builder' && (
            <RoomBuilderTab
              selectedTheme={selectedTheme}
              onThemeChange={setSelectedTheme}
              spotlightEnabled={spotlightEnabled}
              onSpotlightChange={setSpotlightEnabled}
              priceTickerOn={priceTickerOn}
              onPriceTickerChange={setPriceTickerOn}
            />
          )}
          {activeTab === 'tours' && <ToursTab tours={tours} rooms={rooms} />}
          {activeTab === 'shared' && (
            <SharedVaultsTab
              vaults={sharedVaults}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ---- Tab 1: My Vaults ----

const MyVaultsTab: React.FC<{
  rooms: VaultRoom[];
  onSelectRoom: (id: string | null) => void;
  selectedRoomId: string | null;
}> = ({ rooms, onSelectRoom, selectedRoomId }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Your Vault Rooms</h3>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/15 border border-purple-500/30 text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-500/25 transition-all">
          <Plus size={13} />
          New Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => {
          const cards = getCardsInRoom(room.id);
          const roomValue = calculateRoomValue(room.id);
          const valueChange = calculateRoomValueChange(room.id);
          const themeMeta = VAULT_THEME_META[room.theme];
          const vis = VISIBILITY_CONFIG[room.visibility];
          const isSelected = selectedRoomId === room.id;

          return (
            <button
              key={room.id}
              onClick={() => onSelectRoom(isSelected ? null : room.id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/20'
                  : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
              }`}
            >
              {/* Theme header gradient */}
              <div className={`h-16 -mx-4 -mt-4 mb-3 rounded-t-xl bg-gradient-to-r ${room.thumbnailGradient} flex items-center justify-center`}>
                <div className={`p-2 rounded-lg bg-slate-900/60 ${themeMeta.color}`}>
                  {THEME_ICONS[room.theme]}
                </div>
              </div>

              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-bold text-white truncate flex-1">{room.name}</h4>
                <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${vis.color}`}>
                  {vis.icon}
                  {vis.label}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 mb-3 line-clamp-2">{room.description}</p>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="flex items-center gap-1 text-slate-400">
                  <Layers size={11} className="text-purple-400" />
                  {room.occupiedSlots}/{room.cardSlots} cards
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Eye size={11} className="text-purple-400" />
                  {room.viewCount.toLocaleString()} views
                </div>
                <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <DollarSign size={11} />
                  ${roomValue >= 1000000
                    ? `${(roomValue / 1000000).toFixed(2)}M`
                    : roomValue.toLocaleString()}
                </div>
                <div className={`flex items-center gap-1 font-semibold ${valueChange.percent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {valueChange.percent >= 0 ? '+' : ''}{valueChange.percent.toFixed(2)}%
                </div>
              </div>

              {/* Selected room detail */}
              {isSelected && cards.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-1.5">
                  <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Top Cards</p>
                  {cards
                    .sort((a, b) => b.currentValue - a.currentValue)
                    .slice(0, 3)
                    .map((card) => (
                      <div key={card.id} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-300 truncate flex-1">{card.playerName}</span>
                        <span className="text-emerald-400 font-semibold ml-2">
                          ${card.currentValue.toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ---- Tab 2: Room Builder ----

const RoomBuilderTab: React.FC<{
  selectedTheme: VaultTheme;
  onThemeChange: (t: VaultTheme) => void;
  spotlightEnabled: boolean;
  onSpotlightChange: (v: boolean) => void;
  priceTickerOn: boolean;
  onPriceTickerChange: (v: boolean) => void;
}> = ({ selectedTheme, onThemeChange, spotlightEnabled, onSpotlightChange, priceTickerOn, onPriceTickerChange }) => {
  const allThemes = Object.entries(VAULT_THEME_META) as [VaultTheme, typeof VAULT_THEME_META[VaultTheme]][];
  const meta = VAULT_THEME_META[selectedTheme];

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div>
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Select Theme</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {allThemes.map(([key, theme]) => (
            <button
              key={key}
              onClick={() => onThemeChange(key)}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                selectedTheme === key
                  ? 'bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/20'
                  : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
              }`}
            >
              <div className={`p-2 rounded-lg bg-slate-800 ${theme.color}`}>
                {THEME_ICONS[key]}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white">{theme.label}</p>
                <p className="text-[10px] text-slate-500">Theme</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Card Placement Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Card Placement</h3>
        <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
          <div className="grid grid-cols-4 gap-3 mb-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className={`aspect-[2.5/3.5] rounded-lg border-2 border-dashed flex items-center justify-center transition-all ${
                  i < 4
                    ? 'border-purple-500/40 bg-purple-500/5'
                    : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                }`}
              >
                {i < 4 ? (
                  <div className="text-center">
                    <Layers size={16} className="text-purple-400 mx-auto mb-1" />
                    <p className="text-[9px] text-purple-400 font-bold">Card {i + 1}</p>
                  </div>
                ) : (
                  <Plus size={14} className="text-slate-600" />
                )}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 text-center">
            Drag cards into slots to arrange your display. Click a slot to configure position and rotation.
          </p>
        </div>
      </div>

      {/* Lighting & Display Settings */}
      <div>
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Display Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Spotlight */}
          <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Lightbulb size={15} className="text-amber-400" />
                <span className="text-sm font-bold text-white">Spotlights</span>
              </div>
              <button
                onClick={() => onSpotlightChange(!spotlightEnabled)}
                className={`w-10 h-5 rounded-full transition-all relative ${
                  spotlightEnabled ? 'bg-purple-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                    spotlightEnabled ? 'left-5.5' : 'left-0.5'
                  }`}
                  style={{ left: spotlightEnabled ? '22px' : '2px' }}
                />
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Illuminate individual cards with focused directional lighting.
            </p>
          </div>

          {/* Price Ticker */}
          <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign size={15} className="text-emerald-400" />
                <span className="text-sm font-bold text-white">Price Tickers</span>
              </div>
              <button
                onClick={() => onPriceTickerChange(!priceTickerOn)}
                className={`w-10 h-5 rounded-full transition-all relative ${
                  priceTickerOn ? 'bg-purple-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                  style={{ left: priceTickerOn ? '22px' : '2px' }}
                />
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Show floating live price updates above each slabbed card.
            </p>
          </div>

          {/* Rotation */}
          <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <RotateCcw size={15} className="text-blue-400" />
              <span className="text-sm font-bold text-white">Auto-Rotate</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="360"
                defaultValue="0"
                className="flex-1 accent-purple-500 h-1"
              />
              <span className="text-xs text-slate-400 w-8 text-right">0&deg;</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Set default rotation angle for card display stands.
            </p>
          </div>

          {/* Room Preview */}
          <div className={`p-4 bg-gradient-to-br from-slate-800/60 to-slate-900 border border-slate-700/50 rounded-xl`}>
            <div className="flex items-center gap-2 mb-2">
              <View size={15} className="text-purple-400" />
              <span className="text-sm font-bold text-white">Preview</span>
            </div>
            <div className="aspect-video rounded-lg bg-slate-900 border border-slate-700/50 flex items-center justify-center">
              <div className="text-center">
                <div className={`p-3 rounded-xl bg-slate-800 ${meta.color} mx-auto mb-2 w-fit`}>
                  {THEME_ICONS[selectedTheme]}
                </div>
                <p className="text-xs text-slate-400">{meta.label}</p>
                <p className="text-[10px] text-slate-600 mt-1">3D preview rendering...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---- Tab 3: Tours ----

const ToursTab: React.FC<{
  tours: VaultTour[];
  rooms: VaultRoom[];
}> = ({ tours, rooms }) => {
  const getRoomName = (roomId: string) => rooms.find((r) => r.id === roomId)?.name ?? 'Unknown Room';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Virtual Tours</h3>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/15 border border-purple-500/30 text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-500/25 transition-all">
          <Plus size={13} />
          Create Tour
        </button>
      </div>

      <div className="space-y-3">
        {tours.map((tour) => {
          const room = rooms.find((r) => r.id === tour.roomId);
          const formatDuration = (seconds: number) => {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
          };

          return (
            <div
              key={tour.id}
              className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:border-slate-600 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Tour Thumbnail */}
                <div className={`w-24 h-16 rounded-lg bg-gradient-to-br ${tour.thumbnailGradient} flex items-center justify-center flex-shrink-0 border border-slate-700/50`}>
                  {tour.isLive ? (
                    <div className="flex items-center gap-1">
                      <Radio size={14} className="text-red-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-red-400">LIVE</span>
                    </div>
                  ) : (
                    <Play size={18} className="text-white/70" />
                  )}
                </div>

                {/* Tour Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-white truncate">{tour.tourName}</h4>
                    {tour.isLive ? (
                      <span className="px-1.5 py-0.5 bg-red-500/15 border border-red-500/30 rounded text-[9px] font-bold text-red-400">
                        LIVE
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-slate-700/50 border border-slate-600 rounded text-[9px] font-bold text-slate-400">
                        Recorded
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 mb-2">
                    Room: <span className="text-slate-400">{getRoomName(tour.roomId)}</span>
                  </p>

                  <div className="flex items-center gap-4 text-[10px]">
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin size={11} className="text-purple-400" />
                      {tour.waypoints.length} waypoints
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock size={11} className="text-purple-400" />
                      {formatDuration(tour.duration)}
                    </span>
                    {tour.isLive && tour.viewerCount > 0 && (
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Eye size={11} />
                        {tour.viewerCount} watching
                      </span>
                    )}
                  </div>

                  {/* Waypoint Labels */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tour.waypoints
                      .filter((wp) => wp.label)
                      .map((wp, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 bg-slate-700/40 border border-slate-700 rounded text-[9px] text-slate-500"
                        >
                          {wp.label}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Action */}
                <button className="px-3 py-2 bg-purple-500/15 border border-purple-500/30 text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-500/25 transition-all flex-shrink-0">
                  {tour.isLive ? 'Join' : 'Play'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---- Tab 4: Shared Vaults ----

const SharedVaultsTab: React.FC<{
  vaults: VaultRoom[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: 'views' | 'value' | 'rating' | 'recent';
  onSortChange: (s: 'views' | 'value' | 'rating' | 'recent') => void;
}> = ({ vaults, searchQuery, onSearchChange, sortBy, onSortChange }) => {
  const sortOptions: { id: typeof sortBy; label: string }[] = [
    { id: 'views', label: 'Most Viewed' },
    { id: 'value', label: 'Highest Value' },
    { id: 'rating', label: 'Top Rated' },
    { id: 'recent', label: 'Most Recent' },
  ];

  return (
    <div className="space-y-4">
      {/* Search & Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search public vaults..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all"
          />
        </div>
        <div className="flex gap-1 bg-slate-800/50 rounded-xl p-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSortChange(opt.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                sortBy === opt.id
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {vaults.length === 0 ? (
        <div className="text-center py-12">
          <Search size={32} className="text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No vaults found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vaults.map((vault) => {
            const roomValue = calculateRoomValue(vault.id);
            const themeMeta = VAULT_THEME_META[vault.theme];

            return (
              <div
                key={vault.id}
                className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl hover:border-purple-500/30 transition-all"
              >
                {/* Theme Gradient Header */}
                <div className={`h-12 -mx-4 -mt-4 mb-3 rounded-t-xl bg-gradient-to-r ${vault.thumbnailGradient} flex items-center justify-between px-4`}>
                  <div className={`flex items-center gap-2 ${themeMeta.color}`}>
                    {THEME_ICONS[vault.theme]}
                    <span className="text-xs font-bold">{themeMeta.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-amber-400">{vault.rating}</span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white mb-1">{vault.name}</h4>
                <p className="text-[11px] text-slate-500 mb-1">by <span className="text-purple-400">{vault.ownerAlias}</span></p>
                <p className="text-[11px] text-slate-500 mb-3 line-clamp-2">{vault.description}</p>

                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Layers size={11} className="text-purple-400" />
                    {vault.occupiedSlots} cards
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={11} className="text-purple-400" />
                    {vault.viewCount.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Share2 size={11} className="text-purple-400" />
                    {vault.shareCount}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <DollarSign size={11} />
                    ${roomValue >= 1000000
                      ? `${(roomValue / 1000000).toFixed(1)}M`
                      : roomValue.toLocaleString()}
                  </span>
                </div>

                <button className="w-full mt-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs font-bold text-purple-400 hover:bg-purple-500/20 transition-all flex items-center justify-center gap-1.5">
                  <View size={13} />
                  Enter Vault
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ArVaultWalkthroughModal;
