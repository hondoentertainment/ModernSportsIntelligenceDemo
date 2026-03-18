import React, { useState, useMemo } from 'react';
import {
  X,
  Activity,
  Brain,
  BarChart3,
  Timer,
  TrendingUp,
  TrendingDown,
  Zap,
  Flame,
  Snowflake,
  MessageSquare,
  Radio,
} from 'lucide-react';
import {
  getSentimentEvents,
  getHalfLifeModels,
  getSentimentStats,
} from '../lib/analytics/sentimentHalfLifeService';

interface SentimentHalfLifeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'events' | 'models' | 'overview';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'events', label: 'Events', icon: <Activity size={16} /> },
  { id: 'models', label: 'Models', icon: <Brain size={16} /> },
  { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
];

const eventTypeColor = (type: string) => {
  switch (type) {
    case 'injury': return { text: 'text-red-400', bg: 'bg-red-500/20', icon: <Flame size={16} className="text-red-400" /> };
    case 'trade': return { text: 'text-amber-400', bg: 'bg-amber-500/20', icon: <TrendingUp size={16} className="text-amber-400" /> };
    case 'breakout': return { text: 'text-green-400', bg: 'bg-green-500/20', icon: <Zap size={16} className="text-green-400" /> };
    case 'scandal': return { text: 'text-red-400', bg: 'bg-red-500/20', icon: <TrendingDown size={16} className="text-red-400" /> };
    case 'award': return { text: 'text-lime-400', bg: 'bg-lime-500/20', icon: <TrendingUp size={16} className="text-lime-400" /> };
    case 'retirement': return { text: 'text-blue-400', bg: 'bg-blue-500/20', icon: <Snowflake size={16} className="text-blue-400" /> };
    default: return { text: 'text-slate-400', bg: 'bg-slate-500/20', icon: <Radio size={16} className="text-slate-400" /> };
  }
};

const SentimentHalfLifeModal: React.FC<SentimentHalfLifeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('events');

  const events = useMemo(() => getSentimentEvents(), []);
  const models = useMemo(() => getHalfLifeModels(), []);
  const stats = useMemo(() => getSentimentStats(), []);

  if (!isOpen) return null;

  const renderEvents = () => (
    <div className="space-y-4">
      {events.map((event: any, idx: number) => {
        const typeConfig = eventTypeColor(event.type || event.eventType || 'default');
        return (
          <div key={event.id || idx} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${typeConfig.bg}`}>{typeConfig.icon}</div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{event.title || event.name || event.event}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{event.player || event.subject} &middot; {event.date}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${typeConfig.bg} ${typeConfig.text}`}>
                {event.type || event.eventType || 'event'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500">Initial Impact</p>
                <p className={`text-sm font-bold ${(event.initialImpact ?? event.impact ?? 0) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(event.initialImpact ?? event.impact ?? 0) > 0 ? '+' : ''}{event.initialImpact ?? event.impact ?? 0}%
                </p>
              </div>
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500">Half-Life</p>
                <p className="text-sm font-bold text-lime-400">{event.halfLife ?? event.decayDays ?? '—'}d</p>
              </div>
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500">Current Effect</p>
                <p className="text-sm font-bold text-slate-200">{event.currentEffect ?? event.remaining ?? '—'}%</p>
              </div>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${(event.initialImpact ?? event.impact ?? 0) > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${Math.abs(event.currentEffect ?? event.remaining ?? 50)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderModels = () => (
    <div className="space-y-4">
      {models.map((model: any, idx: number) => (
        <div key={model.id || idx} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold text-slate-200">{model.name || model.eventType || model.category}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{model.description || `Decay model for ${model.name || model.eventType}`}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-lime-400">{model.halfLife ?? model.avgHalfLife ?? model.days}d</p>
              <p className="text-xs text-slate-500">half-life</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-2 bg-slate-900/50 rounded-lg">
              <p className="text-xs text-slate-500">Accuracy</p>
              <p className="text-sm font-bold text-slate-200">{model.accuracy ?? model.r2 ?? 92}%</p>
            </div>
            <div className="text-center p-2 bg-slate-900/50 rounded-lg">
              <p className="text-xs text-slate-500">Sample Size</p>
              <p className="text-sm font-bold text-slate-200">{model.sampleSize ?? model.samples ?? 150}</p>
            </div>
            <div className="text-center p-2 bg-slate-900/50 rounded-lg">
              <p className="text-xs text-slate-500">Decay Rate</p>
              <p className="text-sm font-bold text-slate-200">{model.decayRate ?? model.lambda ?? '0.05'}</p>
            </div>
            <div className="text-center p-2 bg-slate-900/50 rounded-lg">
              <p className="text-xs text-slate-500">Avg Impact</p>
              <p className="text-sm font-bold text-slate-200">{model.avgImpact ?? model.meanImpact ?? '±12'}%</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-lime-400" />
            <span className="text-sm font-semibold text-slate-200">Active Events</span>
          </div>
          <p className="text-3xl font-bold text-slate-100">{stats?.activeEvents ?? events.length}</p>
          <p className="text-xs text-slate-400 mt-1">Currently decaying</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <Timer size={16} className="text-lime-400" />
            <span className="text-sm font-semibold text-slate-200">Avg Half-Life</span>
          </div>
          <p className="text-3xl font-bold text-lime-400">{stats?.avgHalfLife ?? 14}d</p>
          <p className="text-xs text-slate-400 mt-1">Across all event types</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-lime-400" />
            <span className="text-sm font-semibold text-slate-200">Positive Events</span>
          </div>
          <p className="text-3xl font-bold text-green-400">{stats?.positiveEvents ?? 8}</p>
          <p className="text-xs text-slate-400 mt-1">Net positive sentiment</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={16} className="text-lime-400" />
            <span className="text-sm font-semibold text-slate-200">Negative Events</span>
          </div>
          <p className="text-3xl font-bold text-red-400">{stats?.negativeEvents ?? 4}</p>
          <p className="text-xs text-slate-400 mt-1">Net negative sentiment</p>
        </div>
      </div>
      <div className="bg-lime-500/10 rounded-xl p-5 border border-lime-500/30">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare size={16} className="text-lime-400" />
          <p className="text-sm font-semibold text-lime-300">Sentiment Summary</p>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Market sentiment is currently net positive with {stats?.activeEvents ?? events.length} active events
          still influencing card values. The fastest decaying events are injury reports (avg {stats?.injuryHalfLife ?? 5}d half-life),
          while award nominations sustain value longest (avg {stats?.awardHalfLife ?? 28}d half-life).
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-900 via-slate-800/50 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-500/20">
              <Timer size={24} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Sentiment Half-Life</h2>
              <p className="text-sm text-slate-400">Track how sentiment events decay over time</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 p-4 border-b border-slate-700/50">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Active Events</p>
            <p className="text-xl font-bold text-slate-100">{stats?.activeEvents ?? events.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Avg Half-Life</p>
            <p className="text-xl font-bold text-lime-400">{stats?.avgHalfLife ?? 14}d</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Net Sentiment</p>
            <p className="text-xl font-bold text-green-400">+{stats?.netSentiment ?? 12}%</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Models</p>
            <p className="text-xl font-bold text-slate-100">{stats?.modelCount ?? models.length}</p>
          </div>
        </div>

        <div className="flex gap-1 p-4 border-b border-slate-700/50">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? 'bg-lime-500/20 text-lime-400'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeTab === 'events' && renderEvents()}
          {activeTab === 'models' && renderModels()}
          {activeTab === 'overview' && renderOverview()}
        </div>
      </div>
    </div>
  );
};

export default SentimentHalfLifeModal;
