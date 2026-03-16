import React, { useState, useMemo } from 'react';
import {
  X,
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Users,
  BarChart3,
  Award,
  Sparkles,
  Search,
  ArrowUpRight,
  Crown,
  Tv,
  MessageCircle,
  ShoppingBag,
  BookOpen,
} from 'lucide-react';
import {
  getMemoryScores,
  getCulturalMetrics,
  getGenerationalViews,
  getIconicPlayers,
  getMemoryStats,
  MemoryScore,
  CulturalMetric,
  GenerationalView,
  IconicPlayer,
  CulturalTier,
} from '../lib/memoryIndexService';

interface MemoryIndexModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'scores' | 'cultural' | 'generational' | 'iconic';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'scores', label: 'Memory Scores', icon: <Brain size={16} /> },
  { id: 'cultural', label: 'Cultural Metrics', icon: <BarChart3 size={16} /> },
  { id: 'generational', label: 'Generational View', icon: <Users size={16} /> },
  { id: 'iconic', label: 'Iconic Players', icon: <Crown size={16} /> },
];

const TIER_STYLES: Record<CulturalTier, { label: string; bg: string; text: string; border: string }> = {
  iconic: { label: 'Iconic', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
  legendary: { label: 'Legendary', bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
  notable: { label: 'Notable', bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  emerging: { label: 'Emerging', bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30' },
  fading: { label: 'Fading', bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30' },
};

const GENERATION_COLORS: Record<string, string> = {
  'gen-z': 'bg-violet-500',
  millennial: 'bg-blue-500',
  'gen-x': 'bg-emerald-500',
  boomer: 'bg-amber-500',
  silent: 'bg-slate-500',
  'gen-alpha': 'bg-pink-500',
};

const GENERATION_LABELS: Record<string, string> = {
  'gen-z': 'Gen Z',
  millennial: 'Millennial',
  'gen-x': 'Gen X',
  boomer: 'Boomer',
  silent: 'Silent',
  'gen-alpha': 'Gen Alpha',
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  media: <Tv size={18} />,
  social: <MessageCircle size={18} />,
  merchandise: <ShoppingBag size={18} />,
  historical: <BookOpen size={18} />,
};

function TrendIcon({ trend }: { trend: 'rising' | 'falling' | 'stable' }) {
  if (trend === 'rising') return <TrendingUp size={14} className="text-green-400" />;
  if (trend === 'falling') return <TrendingDown size={14} className="text-red-400" />;
  return <Minus size={14} className="text-slate-400" />;
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(2)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

export default function MemoryIndexModal({ isOpen, onClose }: MemoryIndexModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('scores');
  const [searchQuery, setSearchQuery] = useState('');

  const memoryScores = useMemo(() => getMemoryScores(), []);
  const culturalMetrics = useMemo(() => getCulturalMetrics(), []);
  const generationalViews = useMemo(() => getGenerationalViews(), []);
  const iconicPlayers = useMemo(() => getIconicPlayers(), []);
  const stats = useMemo(() => getMemoryStats(), []);

  const filteredScores = useMemo(() => {
    if (!searchQuery) return memoryScores;
    const q = searchQuery.toLowerCase();
    return memoryScores.filter(
      (s) => s.playerName.toLowerCase().includes(q) || s.sport.toLowerCase().includes(q)
    );
  }, [memoryScores, searchQuery]);

  if (!isOpen) return null;

  const renderMemoryScoresTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
          <p className="text-xs text-slate-400">Players Indexed</p>
          <p className="text-xl font-bold text-indigo-400">{stats.totalPlayersIndexed}</p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-3">
          <p className="text-xs text-slate-400">Avg Memory Score</p>
          <p className="text-xl font-bold text-indigo-400">{stats.avgMemoryScore}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <p className="text-xs text-slate-400">Rising Stars</p>
          <p className="text-xl font-bold text-green-400">{stats.risingStars}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-xs text-slate-400">Fading Legends</p>
          <p className="text-xl font-bold text-red-400">{stats.fadingLegends}</p>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder="Search players or sports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
        />
      </div>

      <div className="space-y-2">
        {filteredScores.map((score) => {
          const tierStyle = TIER_STYLES[score.culturalTier];
          return (
            <div
              key={score.id}
              className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-4 hover:border-indigo-500/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                    <Star size={18} className="text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{score.playerName}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{score.sport}</span>
                      <span className="text-slate-600">|</span>
                      <span>{score.era}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
                    {tierStyle.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <TrendIcon trend={score.trend} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-900/60 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-500"
                    style={{ width: `${score.overallScore}%` }}
                  />
                </div>
                <span className="text-lg font-bold text-indigo-300 tabular-nums w-10 text-right">
                  {score.overallScore}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                <span>Peak Year: {score.peakYear}</span>
                <span>Card Value Multiplier: {score.cardValueMultiplier}x</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderCulturalMetricsTab = () => (
    <div className="space-y-4">
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-indigo-300">Cultural Pulse Overview</h3>
        </div>
        <p className="text-xs text-slate-400">
          Aggregate cultural indicators driving memory scores and card value premiums across all indexed players.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {culturalMetrics.map((metric) => {
          const pct = Math.round((metric.value / metric.maxValue) * 100);
          return (
            <div
              key={metric.id}
              className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-4 hover:border-indigo-500/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                    {CATEGORY_ICONS[metric.category] || <BarChart3 size={18} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{metric.name}</h4>
                    <span className="text-xs text-slate-500 capitalize">{metric.category}</span>
                  </div>
                </div>
                <TrendIcon trend={metric.trend} />
              </div>
              <div className="mb-2">
                <span className="text-2xl font-bold text-indigo-300">{formatNumber(metric.value)}</span>
                <span className="text-xs text-slate-500 ml-1">{metric.unit}</span>
              </div>
              <div className="w-full bg-slate-900/60 rounded-full h-2 mb-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{metric.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderGenerationalTab = () => (
    <div className="space-y-4">
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 mb-2">
        <h3 className="text-sm font-semibold text-indigo-300 mb-1">Generational Breakdown</h3>
        <p className="text-xs text-slate-400">
          How different generations perceive and value players in the memory index, along with their collecting behaviors.
        </p>
      </div>

      {generationalViews.map((gen) => (
        <div
          key={gen.generation}
          className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-4 hover:border-indigo-500/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-200">{gen.label}</h4>
              <span className="text-xs text-slate-500">Ages {gen.ageRange}</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-indigo-300">{gen.marketShare}%</span>
              <p className="text-xs text-slate-500">Market Share</p>
            </div>
          </div>

          <div className="w-full bg-slate-900/60 rounded-full h-4 mb-3 overflow-hidden">
            <div
              className={`h-full rounded-full ${GENERATION_COLORS[gen.generation] || 'bg-indigo-500'} transition-all duration-500`}
              style={{ width: `${gen.marketShare * 2.5}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-slate-900/40 rounded-md p-2">
              <p className="text-xs text-slate-500">Avg Spend/Card</p>
              <p className="text-sm font-semibold text-slate-200">${gen.avgSpendPerCard}</p>
            </div>
            <div className="bg-slate-900/40 rounded-md p-2">
              <p className="text-xs text-slate-500">Nostalgia Era</p>
              <p className="text-sm font-semibold text-slate-200">{gen.nostalgiaPeakEra}</p>
            </div>
          </div>

          <div className="mb-3">
            <p className="text-xs text-slate-500 mb-1">Top Players</p>
            <div className="flex flex-wrap gap-1.5">
              {gen.topPlayers.map((player) => (
                <span
                  key={player}
                  className="text-xs bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 rounded-full px-2.5 py-0.5"
                >
                  {player}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/40 rounded-md p-2">
            <p className="text-xs text-slate-500">Collecting Motivation</p>
            <p className="text-xs text-slate-300 mt-0.5">{gen.collectingMotivation}</p>
          </div>
        </div>
      ))}

      <div className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-slate-200 mb-3">Cross-Generational Memory Scores</h4>
        {memoryScores.slice(0, 5).map((score) => (
          <div key={score.id} className="mb-4 last:mb-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-300">{score.playerName}</span>
              <span className="text-xs text-indigo-400 font-semibold">{score.overallScore}</span>
            </div>
            <div className="flex gap-1">
              {(['gen-z', 'millennial', 'gen-x', 'boomer'] as const).map((gen) => (
                <div key={gen} className="flex-1">
                  <div className="w-full bg-slate-900/60 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${GENERATION_COLORS[gen]}`}
                      style={{ width: `${score.generationalScores[gen]}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-0.5">
                    <span className="text-[10px] text-slate-600">{GENERATION_LABELS[gen]}</span>
                    <span className="text-[10px] text-slate-500">{score.generationalScores[gen]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderIconicPlayersTab = () => (
    <div className="space-y-4">
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4 mb-2">
        <div className="flex items-center gap-2 mb-1">
          <Award size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-indigo-300">Cultural Icons Spotlight</h3>
        </div>
        <p className="text-xs text-slate-400">
          Players with the highest cultural premium -- their memory transcends sport and drives outsized card values.
        </p>
      </div>

      {iconicPlayers.map((player) => {
        const tierStyle = TIER_STYLES[player.culturalTier];
        return (
          <div
            key={player.id}
            className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-5 hover:border-indigo-500/30 transition-colors"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <Crown size={28} className="text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-slate-100">{player.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
                    {tierStyle.label}
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  {player.team} &middot; {player.sport} &middot; {player.era}
                </p>
                <p className="text-xs text-indigo-300 mt-1">{player.careerHighlight}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-2xl font-bold text-indigo-300">{player.memoryScore}</div>
                <p className="text-xs text-slate-500">Memory Score</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                <Tv size={14} className="text-indigo-400 mx-auto mb-1" />
                <p className="text-sm font-semibold text-slate-200">{formatNumber(player.mediaAppearances)}</p>
                <p className="text-[10px] text-slate-500">Media Appearances</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                <MessageCircle size={14} className="text-indigo-400 mx-auto mb-1" />
                <p className="text-sm font-semibold text-slate-200">{formatNumber(player.socialMentions)}</p>
                <p className="text-[10px] text-slate-500">Social Mentions/Mo</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                <Sparkles size={14} className="text-indigo-400 mx-auto mb-1" />
                <p className="text-sm font-semibold text-slate-200">{player.nostalgiaIndex}</p>
                <p className="text-[10px] text-slate-500">Nostalgia Index</p>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                <ArrowUpRight size={14} className="text-indigo-400 mx-auto mb-1" />
                <p className="text-sm font-semibold text-slate-200">{formatCurrency(player.signatureCardValue)}</p>
                <p className="text-[10px] text-slate-500">Signature Card Value</p>
              </div>
            </div>

            <div className="bg-slate-900/40 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Signature Card</p>
              <p className="text-sm font-medium text-slate-200">{player.signatureCard}</p>
              <div className="mt-2 flex items-start gap-2">
                <span className="text-xs text-slate-500 flex-shrink-0">Why Iconic:</span>
                <span className="text-xs text-indigo-300">
                  Memory score of {player.memoryScore} with {formatNumber(player.socialMentions)} monthly social mentions and {formatNumber(player.mediaAppearances)} lifetime media appearances create an unmatched cultural footprint.
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <Brain size={20} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Cultural Memory Index</h2>
              <p className="text-xs text-slate-400">Player nostalgia, cultural impact & generational memory analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/50 flex items-center justify-center transition-colors"
          >
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        <div className="flex border-b border-slate-700/50 bg-slate-900/80 px-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'scores' && renderMemoryScoresTab()}
          {activeTab === 'cultural' && renderCulturalMetricsTab()}
          {activeTab === 'generational' && renderGenerationalTab()}
          {activeTab === 'iconic' && renderIconicPlayersTab()}
        </div>
      </div>
    </div>
  );
}
