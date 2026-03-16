import React, { useMemo, useState } from 'react';
import {
  X,
  Heart,
  BookOpen,
  BarChart3,
  Brain,
  Skull,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  Flame,
  Zap,
  ShieldAlert,
  Target,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Lightbulb,
} from 'lucide-react';
import {
  getTrades,
  getEmotionPnL,
  getInsights,
  getEmotionStats,
  getWorstEmotions,
  TradeEntry,
  EmotionPnL,
  BehaviorInsight,
  EmotionTag,
} from '../lib/emotionJournalService';

interface EmotionJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'journal' | 'pnl' | 'insights' | 'worst';

const EmotionJournalModal: React.FC<EmotionJournalModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('journal');

  const trades = useMemo(() => getTrades(), []);
  const emotionPnL = useMemo(() => getEmotionPnL(), []);
  const insights = useMemo(() => getInsights(), []);
  const emotionStats = useMemo(() => getEmotionStats(), []);
  const worstEmotions = useMemo(() => getWorstEmotions(), []);

  // Derive summary stats from available data
  const stats = useMemo(() => {
    const totalTrades = trades.length;
    const totalPnL = trades.reduce((sum, t) => sum + t.outcome, 0);
    const calculatedEntry = emotionStats.find((s) => s.emotion === 'calculated');
    const calculatedPct = calculatedEntry ? calculatedEntry.pct : 0;
    const emotionalTrades = trades.filter((t) => t.emotion !== 'calculated');
    const emotionalCost = Math.abs(
      emotionalTrades.filter((t) => t.outcome < 0).reduce((sum, t) => sum + t.outcome, 0)
    );
    const emotionalPct = totalTrades > 0
      ? Math.round(((totalTrades - (calculatedEntry?.count ?? 0)) / totalTrades) * 1000) / 10
      : 0;
    const sortedPnL = [...emotionPnL].sort((a, b) => b.avgPnL - a.avgPnL);
    const bestEmotion: EmotionTag = sortedPnL.length > 0 ? sortedPnL[0].emotion : 'calculated';
    const worstEmotion: EmotionTag = sortedPnL.length > 0 ? sortedPnL[sortedPnL.length - 1].emotion : 'calculated';
    return { totalTrades, totalPnL, calculatedPct, emotionalCost, emotionalPct, bestEmotion, worstEmotion };
  }, [trades, emotionStats, emotionPnL]);

  const tabs: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'journal', label: 'Trade Journal', icon: <BookOpen size={14} />, count: trades.length },
    { id: 'pnl', label: 'Emotion P&L', icon: <BarChart3 size={14} />, count: emotionPnL.length },
    { id: 'insights', label: 'Behavior Insights', icon: <Brain size={14} />, count: insights.length },
    { id: 'worst', label: 'Worst Emotions', icon: <Skull size={14} />, count: worstEmotions.length },
  ];

  if (!isOpen) return null;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const getEmotionColor = (emotion: EmotionTag): string => {
    switch (emotion) {
      case 'fomo': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'excitement': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'panic': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'revenge': return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
      case 'boredom': return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
      case 'calculated': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
    }
  };

  const getEmotionIcon = (emotion: EmotionTag) => {
    switch (emotion) {
      case 'fomo': return <Flame size={12} />;
      case 'excitement': return <Zap size={12} />;
      case 'panic': return <ShieldAlert size={12} />;
      case 'revenge': return <Skull size={12} />;
      case 'boredom': return <Clock size={12} />;
      case 'calculated': return <Target size={12} />;
      default: return <Activity size={12} />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'low': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
    }
  };

  const intensityBar = (val: number) => (
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className={`w-1.5 h-3 rounded-sm ${
            i < val
              ? val >= 8 ? 'bg-rose-400' : val >= 5 ? 'bg-amber-400' : 'bg-emerald-400'
              : 'bg-slate-700'
          }`}
        />
      ))}
    </div>
  );

  const renderTradeJournal = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-rose-400">{stats.totalTrades}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Total Trades</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {stats.totalPnL >= 0 ? '+' : ''}${stats.totalPnL.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Total P&L</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">{stats.calculatedPct}%</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Calculated</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-rose-400">${stats.emotionalCost}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Emotional Cost</div>
        </div>
      </div>

      <div className="space-y-3">
        {trades.map((trade: TradeEntry) => (
          <div key={trade.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-rose-500/30 transition-all">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold text-sm">{trade.player}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold ${
                    trade.action === 'buy' ? 'text-sky-400 bg-sky-400/10 border-sky-400/30' : 'text-amber-400 bg-amber-400/10 border-amber-400/30'
                  }`}>
                    {trade.action}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{trade.cardDescription}</p>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${trade.outcome >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {trade.outcome >= 0 ? '+' : ''}{trade.outcome}
                </div>
                <div className="text-[10px] text-slate-500">P&L</div>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold capitalize ${getEmotionColor(trade.emotion)}`}>
                {getEmotionIcon(trade.emotion)}
                {trade.emotion}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-500">Intensity:</span>
                {intensityBar(trade.intensity)}
              </div>
              <span className="text-xs text-slate-400">${trade.price.toLocaleString()}</span>
            </div>
            <div className="bg-slate-900/50 rounded-lg px-3 py-2 mt-2">
              <p className="text-xs text-slate-400 italic leading-relaxed">{trade.notes}</p>
            </div>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-500">
              <Clock size={10} />
              <span>{formatDate(trade.date)} at {formatTime(trade.date)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEmotionPnL = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target size={14} className="text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">Best Emotion</span>
          </div>
          <div className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full border font-bold capitalize ${getEmotionColor(stats.bestEmotion)}`}>
            {getEmotionIcon(stats.bestEmotion)}
            {stats.bestEmotion}
          </div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Skull size={14} className="text-rose-400" />
            <span className="text-xs font-semibold text-slate-300">Worst Emotion</span>
          </div>
          <div className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full border font-bold capitalize ${getEmotionColor(stats.worstEmotion)}`}>
            {getEmotionIcon(stats.worstEmotion)}
            {stats.worstEmotion}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {emotionPnL.map((ep: EmotionPnL) => (
          <div key={ep.emotion} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-rose-500/20 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border font-bold capitalize ${getEmotionColor(ep.emotion)}`}>
                  {getEmotionIcon(ep.emotion)}
                  {ep.emotion}
                </span>
                <span className="text-xs text-slate-400">{ep.tradeCount} trades</span>
              </div>
              <div className={`text-lg font-bold ${ep.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {ep.totalPnL >= 0 ? '+' : ''}${ep.totalPnL.toLocaleString()}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                <div className="text-sm font-bold text-white">{ep.winRate}%</div>
                <div className="text-[10px] text-slate-500">Win Rate</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                <div className={`text-sm font-bold ${ep.avgPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>${ep.avgPnL}</div>
                <div className="text-[10px] text-slate-500">Avg P&L</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                <div className="text-sm font-bold text-slate-300">{ep.avgIntensity}</div>
                <div className="text-[10px] text-slate-500">Avg Intensity</div>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                <div className="text-sm font-bold text-slate-300">{ep.tradeCount}</div>
                <div className="text-[10px] text-slate-500">Trades</div>
              </div>
            </div>
            <div className="mt-3 w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${ep.winRate >= 75 ? 'bg-emerald-400' : ep.winRate >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}
                style={{ width: `${ep.winRate}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBehaviorInsights = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{insights.filter((i: BehaviorInsight) => i.severity === 'high').length}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">High</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">{insights.filter((i: BehaviorInsight) => i.severity === 'medium').length}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Medium</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">{insights.filter((i: BehaviorInsight) => i.severity === 'low').length}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Low</div>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight: BehaviorInsight) => (
          <div key={insight.id} className={`bg-slate-800/40 border rounded-xl p-4 transition-all ${
            insight.severity === 'high' ? 'border-red-500/30 hover:border-red-500/50' :
            insight.severity === 'medium' ? 'border-amber-500/30 hover:border-amber-500/50' :
            'border-emerald-500/30 hover:border-emerald-500/50'
          }`}>
            <div className="flex items-start gap-3 mb-3">
              <div className={`p-2 rounded-lg ${
                insight.severity === 'high' ? 'bg-red-500/15' :
                insight.severity === 'medium' ? 'bg-amber-500/15' : 'bg-emerald-500/15'
              }`}>
                {insight.severity === 'high' ? <AlertTriangle size={16} className="text-red-400" /> :
                 insight.severity === 'medium' ? <AlertTriangle size={16} className="text-amber-400" /> :
                 <Info size={16} className="text-emerald-400" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold text-sm">{insight.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold ${getSeverityColor(insight.severity)}`}>
                    {insight.severity}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${getEmotionColor(insight.emotion)}`}>
                    {insight.emotion}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{insight.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-slate-500 border-t border-slate-700/50 pt-2">
              <span>{insight.occurrences} occurrence{insight.occurrences !== 1 ? 's' : ''}</span>
              <span>Type: {insight.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWorstEmotions = () => (
    <div className="space-y-4">
      <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Skull size={16} className="text-rose-400" />
          <h3 className="text-sm font-bold text-rose-400">Emotional Cost Summary</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your emotional trading has cost you <span className="text-rose-400 font-bold">${stats.emotionalCost}</span> in realized losses.
          {' '}{stats.emotionalPct}% of your trades are driven by emotion rather than calculation.
          Below are the emotions ranked by total financial damage.
        </p>
      </div>

      {worstEmotions.length === 0 ? (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-8 text-center">
          <Heart size={32} className="text-emerald-400 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No losing emotion categories detected</p>
          <p className="text-xs text-slate-500 mt-1">Keep up the disciplined trading</p>
        </div>
      ) : (
        <div className="space-y-3">
          {worstEmotions.map((ep: EmotionPnL, index: number) => (
            <div key={ep.emotion} className="bg-slate-800/40 border border-rose-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-rose-500/15 rounded-lg flex items-center justify-center text-sm font-bold text-rose-400">
                    #{index + 1}
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full border font-bold capitalize ${getEmotionColor(ep.emotion)}`}>
                    {getEmotionIcon(ep.emotion)}
                    {ep.emotion}
                  </span>
                </div>
                <div className="text-xl font-bold text-rose-400">${Math.abs(ep.totalPnL).toLocaleString()}</div>
              </div>
              <div className="grid grid-cols-5 gap-2 mb-3">
                <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                  <div className="text-sm font-bold text-white">{ep.tradeCount}</div>
                  <div className="text-[10px] text-slate-500">Trades</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                  <div className="text-sm font-bold text-rose-400">{ep.winRate}%</div>
                  <div className="text-[10px] text-slate-500">Win Rate</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                  <div className="text-sm font-bold text-rose-400">${Math.abs(ep.avgPnL)}</div>
                  <div className="text-[10px] text-slate-500">Avg Loss</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                  <div className="text-sm font-bold text-slate-300">{ep.avgIntensity}</div>
                  <div className="text-[10px] text-slate-500">Avg Intensity</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                  <div className="text-sm font-bold text-rose-400">{ep.worstTrade}</div>
                  <div className="text-[10px] text-slate-500">Worst</div>
                </div>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 to-rose-400"
                  style={{ width: `${Math.min(100, Math.abs(ep.totalPnL) / 3)}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 mt-1 text-right">
                {Math.round((Math.abs(ep.totalPnL) / stats.emotionalCost) * 100)}% of total emotional losses
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/30">
              <Heart size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  <Brain size={10} />
                  Behavioral Analysis
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-wide text-white">
                Emotion <span className="text-rose-400">Journal</span>
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="px-6 pt-4 border-b border-slate-700/50">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-rose-400 border-rose-400 bg-rose-400/5'
                    : 'text-slate-400 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab.id ? 'bg-rose-400/20 text-rose-400' : 'bg-slate-700 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {activeTab === 'journal' && renderTradeJournal()}
          {activeTab === 'pnl' && renderEmotionPnL()}
          {activeTab === 'insights' && renderBehaviorInsights()}
          {activeTab === 'worst' && renderWorstEmotions()}
        </div>
      </div>
    </div>
  );
};

export default EmotionJournalModal;
