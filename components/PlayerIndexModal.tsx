// @ts-nocheck
import React, { useMemo, useState, useCallback } from 'react';
import {
  X,
  Activity,
  Flame,
  Snowflake,
  Search,
  Users,
  Trophy,
  BarChart3,
  TrendingUp,
  TrendingDown,
  ChevronDown,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { CardInventory, Sport } from '../types';
import {
  getHotColdList,
  getPlayerIndex,
  comparePlayers,
  getRookieClassIndexes,
  getSportIndexes,
  searchPlayers,
  getAvailableRookieClasses,
  PlayerIndex,
  HotColdEntry,
  SportIndex,
} from '../lib/analytics/playerIndexService';

// ---- Types ----

interface PlayerIndexModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardInventory[];
}

type TabId = 'hotcold' | 'players' | 'compare' | 'rookies' | 'indexes';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'hotcold', label: 'Hot/Cold', icon: <Flame size={16} /> },
  { id: 'players', label: 'Players', icon: <Search size={16} /> },
  { id: 'compare', label: 'Compare', icon: <Users size={16} /> },
  { id: 'rookies', label: 'Rookies', icon: <Trophy size={16} /> },
  { id: 'indexes', label: 'Indexes', icon: <BarChart3 size={16} /> },
];

const COMPARE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

// ---- Mini sparkline SVG ----

const MiniSparkline: React.FC<{ data: number[]; color: string; width?: number; height?: number }> = ({
  data,
  color,
  width = 60,
  height = 20,
}) => {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 2) - 1;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="flex-shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// ---- Phase badge ----

const PhaseBadge: React.FC<{ phase: string }> = ({ phase }) => {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    rookie: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    breakout: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
    prime: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    decline: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  };
  const s = styles[phase] || styles.rookie;
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${s.bg} ${s.text} border ${s.border}`}>
      {phase}
    </span>
  );
};

// ---- Hot/Cold Tab ----

const HotColdTab: React.FC<{ cards: CardInventory[] }> = ({ cards }) => {
  const [period, setPeriod] = useState<'24h' | '7d' | '30d'>('7d');

  const allEntries = useMemo(() => getHotColdList(cards, period), [cards, period]);
  const hotEntries = useMemo(
    () => allEntries.filter(e => e.changePct > 0).slice(0, 10),
    [allEntries]
  );
  const coldEntries = useMemo(
    () => allEntries.filter(e => e.changePct < 0).slice(0, 10),
    [allEntries]
  );

  const renderEntry = (entry: HotColdEntry, i: number) => {
    const isHot = entry.changePct >= 0;
    return (
      <div
        key={entry.playerName}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${
          i % 2 === 0 ? 'bg-slate-800/30' : 'bg-slate-800/10'
        }`}
      >
        <span className="w-6 text-center font-bebas text-lg text-slate-500">{i + 1}</span>
        <div className="flex-1 min-w-0">
          <div className="text-white font-medium truncate">{entry.playerName}</div>
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">
            {entry.sport} &middot; {entry.team}
          </div>
        </div>
        <MiniSparkline
          data={entry.sparkline}
          color={isHot ? '#10b981' : '#ef4444'}
          width={50}
          height={16}
        />
        <span
          className={`font-mono font-bold w-16 text-right ${
            isHot ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {isHot ? '+' : ''}
          {entry.changePct.toFixed(1)}%
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Period selector */}
      <div className="flex items-center gap-2">
        {(['24h', '7d', '30d'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              period === p
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hot */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">
            <Flame size={12} className="text-orange-400" />
            Hot &mdash; Biggest Gainers
          </div>
          <div className="space-y-1">
            {hotEntries.map((e, i) => renderEntry(e, i))}
            {hotEntries.length === 0 && (
              <div className="text-xs text-slate-500 py-4 text-center">No gainers this period</div>
            )}
          </div>
        </div>

        {/* Cold */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">
            <Snowflake size={12} className="text-cyan-400" />
            Cold &mdash; Biggest Losers
          </div>
          <div className="space-y-1">
            {coldEntries.map((e, i) => renderEntry(e, i))}
            {coldEntries.length === 0 && (
              <div className="text-xs text-slate-500 py-4 text-center">No losers this period</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ---- Players Tab ----

const PlayersTab: React.FC<{ cards: CardInventory[] }> = ({ cards }) => {
  const [query, setQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerIndex | null>(null);

  const results = useMemo(() => searchPlayers(query), [query]);

  const handleSelectPlayer = useCallback(
    (name: string) => {
      const idx = getPlayerIndex(name, cards);
      setSelectedPlayer(idx);
    },
    [cards]
  );

  if (selectedPlayer) {
    return (
      <div className="space-y-5">
        <button
          onClick={() => setSelectedPlayer(null)}
          className="text-xs text-blue-400 hover:text-blue-300 font-bold"
        >
          &larr; Back to search
        </button>

        {/* Player Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bebas tracking-widest text-white">
              {selectedPlayer.playerName}
            </h3>
            <p className="text-xs text-slate-400">
              {selectedPlayer.team} &middot; {selectedPlayer.sport}
            </p>
          </div>
          <PhaseBadge phase={selectedPlayer.careerPhase} />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Index</p>
            <p className="text-lg font-bebas tracking-wider text-white">
              ${selectedPlayer.currentValue.toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">24h</p>
            <p className={`text-lg font-bebas tracking-wider ${selectedPlayer.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {selectedPlayer.change24h >= 0 ? '+' : ''}{selectedPlayer.change24h.toFixed(1)}%
            </p>
          </div>
          <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Cards</p>
            <p className="text-lg font-bebas tracking-wider text-white">{selectedPlayer.cardsOwned}</p>
          </div>
          <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Value</p>
            <p className="text-lg font-bebas tracking-wider text-white">
              ${selectedPlayer.totalCardValue.toLocaleString()}
            </p>
          </div>
        </div>

        {/* 12-month Chart */}
        <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
            12-Month Index
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={selectedPlayer.indexHistory}>
              <defs>
                <linearGradient id="playerIndexGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                tickFormatter={(v: number) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#94a3b8' }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                fill="url(#playerIndexGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search players, teams, sports..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Player List */}
      <div className="space-y-1">
        {results.map(player => (
          <button
            key={player.name}
            onClick={() => handleSelectPlayer(player.name)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-slate-800/30 border border-transparent hover:bg-slate-800/60 hover:border-slate-700 rounded-xl text-sm text-left transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium truncate">{player.name}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                {player.team} &middot; {player.sport}
              </div>
            </div>
            <PhaseBadge phase={player.phase} />
            <span className="text-slate-400 font-mono text-xs">
              ${player.baseValue}
            </span>
          </button>
        ))}
        {results.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">No players found</div>
        )}
      </div>
    </div>
  );
};

// ---- Compare Tab ----

const CompareTab: React.FC<{ cards: CardInventory[] }> = ({ cards }) => {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const searchResults = useMemo(() => {
    const results = searchPlayers(searchQuery);
    return results.filter(p => !selectedPlayers.includes(p.name));
  }, [searchQuery, selectedPlayers]);

  const comparison = useMemo(() => {
    if (selectedPlayers.length < 2) return null;
    return comparePlayers(selectedPlayers, cards);
  }, [selectedPlayers, cards]);

  const addPlayer = (name: string) => {
    if (selectedPlayers.length < 4 && !selectedPlayers.includes(name)) {
      setSelectedPlayers([...selectedPlayers, name]);
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  const removePlayer = (name: string) => {
    setSelectedPlayers(selectedPlayers.filter(n => n !== name));
  };

  return (
    <div className="space-y-5">
      {/* Player selector */}
      <div className="space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Select up to 4 players to compare
        </p>

        {/* Selected chips */}
        <div className="flex flex-wrap gap-2">
          {selectedPlayers.map((name, i) => (
            <span
              key={name}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border"
              style={{
                color: COMPARE_COLORS[i],
                backgroundColor: `${COMPARE_COLORS[i]}15`,
                borderColor: `${COMPARE_COLORS[i]}40`,
              }}
            >
              {name}
              <button onClick={() => removePlayer(name)} className="hover:opacity-70">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>

        {/* Search to add */}
        {selectedPlayers.length < 4 && (
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Add player..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-50 top-full mt-1 w-full max-h-48 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl shadow-xl">
                {searchResults.slice(0, 8).map(player => (
                  <button
                    key={player.name}
                    onClick={() => addPlayer(player.name)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-left text-white hover:bg-slate-700 transition-colors"
                  >
                    <span className="flex-1">{player.name}</span>
                    <span className="text-[10px] text-slate-500">{player.sport}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comparison Chart */}
      {comparison && comparison.data.length > 0 ? (
        <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
            Normalized Performance (Base = 100)
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={comparison.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#94a3b8' }}
              />
              {comparison.players.map((name, i) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={COMPARE_COLORS[i]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-3">
            {comparison.players.map((name, i) => (
              <div key={name} className="flex items-center gap-1.5 text-xs">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COMPARE_COLORS[i] }}
                />
                <span className="text-slate-300">{name}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500 text-sm">
          Select at least 2 players to see comparison
        </div>
      )}
    </div>
  );
};

// ---- Rookies Tab ----

const RookiesTab: React.FC<{ cards: CardInventory[] }> = ({ cards: _cards }) => {
  const available = useMemo(() => getAvailableRookieClasses(), []);
  const [selectedYear, setSelectedYear] = useState(available[0]?.year ?? 2024);
  const [selectedSport, setSelectedSport] = useState<Sport>(available[0]?.sport ?? 'Football');
  const [showDropdown, setShowDropdown] = useState(false);

  const rookieClass = useMemo(
    () => getRookieClassIndexes(selectedYear, selectedSport),
    [selectedYear, selectedSport]
  );

  const sportsForYear = useMemo(
    () => available.filter(a => a.year === selectedYear).map(a => a.sport),
    [available, selectedYear]
  );

  return (
    <div className="space-y-5">
      {/* Year/Sport selector */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white hover:border-slate-600 transition-colors"
          >
            {selectedYear} {selectedSport}
            <ChevronDown size={14} className="text-slate-400" />
          </button>
          {showDropdown && (
            <div className="absolute z-50 top-full mt-1 w-48 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
              {available.map(a => (
                <button
                  key={`${a.year}_${a.sport}`}
                  onClick={() => {
                    setSelectedYear(a.year);
                    setSelectedSport(a.sport);
                    setShowDropdown(false);
                  }}
                  className={`w-full px-4 py-2.5 text-sm text-left hover:bg-slate-700 transition-colors ${
                    a.year === selectedYear && a.sport === selectedSport
                      ? 'text-brand-lime bg-slate-700/50'
                      : 'text-white'
                  }`}
                >
                  {a.year} {a.sport}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sport sub-tabs */}
        <div className="flex items-center gap-1.5">
          {sportsForYear.map(sport => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                selectedSport === sport
                  ? 'bg-brand-lime/15 text-brand-lime border border-brand-lime/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {sport}
            </button>
          ))}
        </div>
      </div>

      {rookieClass ? (
        <>
          {/* Class summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
                Class Value
              </p>
              <p className="text-xl font-bebas tracking-wider text-white">
                ${rookieClass.aggregateValue.toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
                30d Change
              </p>
              <p className={`text-xl font-bebas tracking-wider ${rookieClass.change30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {rookieClass.change30d >= 0 ? '+' : ''}{rookieClass.change30d.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
                Top Pick
              </p>
              <p className="text-sm font-bold text-amber-400 truncate">
                {rookieClass.topPerformer}
              </p>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="space-y-1">
            {rookieClass.players.map(player => (
              <div
                key={player.name}
                className="flex items-center gap-3 px-4 py-3 bg-slate-800/30 rounded-xl text-sm hover:bg-slate-800/60 transition-colors"
              >
                <span className="w-6 text-center font-bebas text-lg text-slate-500">
                  {player.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{player.name}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {player.team}
                  </div>
                </div>
                <span className="font-mono text-slate-300 text-xs">
                  ${player.value.toLocaleString()}
                </span>
                <span
                  className={`font-mono font-bold text-xs w-14 text-right ${
                    player.change30d >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {player.change30d >= 0 ? '+' : ''}
                  {player.change30d.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-slate-500 text-sm">
          No rookie class data available for this selection
        </div>
      )}
    </div>
  );
};

// ---- Indexes Tab ----

const IndexesTab: React.FC<{ cards: CardInventory[] }> = ({ cards }) => {
  const sportIndexes = useMemo(() => getSportIndexes(cards), [cards]);

  const healthColors: Record<string, { bg: string; text: string; border: string }> = {
    strong: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
    neutral: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    weak: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  };

  const renderSportCard = (si: SportIndex) => {
    const hc = healthColors[si.health];
    return (
      <div
        key={si.sport}
        className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bebas tracking-widest text-white">{si.sport}</h4>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${hc.bg} ${hc.text} border ${hc.border}`}
          >
            {si.health}
          </span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
              Index Value
            </p>
            <p className="text-2xl font-bebas tracking-wider text-white">
              ${si.totalValue.toLocaleString()}
            </p>
          </div>
          <MiniSparkline
            data={si.sparkline}
            color={si.change30d >= 0 ? '#10b981' : '#ef4444'}
            width={80}
            height={30}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Volume: <span className="text-white font-mono">{si.volume}</span> cards
          </span>
          <span
            className={`font-mono font-bold flex items-center gap-1 ${
              si.change30d >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {si.change30d >= 0 ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            {si.change30d >= 0 ? '+' : ''}
            {si.change30d.toFixed(1)}% (30d)
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">
        Sport-Level Market Indexes
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sportIndexes.map(si => renderSportCard(si))}
      </div>
    </div>
  );
};

// ---- Main Modal ----

export const PlayerIndexModal: React.FC<PlayerIndexModalProps> = ({
  isOpen,
  onClose,
  cards,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('hotcold');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-blue-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/30">
              <Activity size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  <BarChart3 size={10} />
                  Market Intelligence
                </span>
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Player <span className="text-blue-400">Market Index</span> & Performance Tracker
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
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-blue-400 border-blue-400 bg-blue-500/5'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8 max-h-[65vh] overflow-y-auto no-scrollbar">
          {activeTab === 'hotcold' && <HotColdTab cards={cards} />}
          {activeTab === 'players' && <PlayersTab cards={cards} />}
          {activeTab === 'compare' && <CompareTab cards={cards} />}
          {activeTab === 'rookies' && <RookiesTab cards={cards} />}
          {activeTab === 'indexes' && <IndexesTab cards={cards} />}
        </div>
      </div>
    </div>
  );
};

export default PlayerIndexModal;
