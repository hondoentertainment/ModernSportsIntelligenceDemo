import React, { useState, useMemo } from 'react';
import {
  X, Bot, MessageSquare, Sparkles, Bell, Clock,
  Send, TrendingUp, TrendingDown, AlertTriangle,
  Search, Mic, Zap,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  getAllConversations,
  getDailyBriefing,
  getProactiveNudges,
  getCopilotSuggestions,
  sendMessage,
  getIntentFromQuery,
  intentLabel,
  intentColor,
  intentBadgeColor,
  priorityColor,
  priorityBadgeColor,
  type ConversationThread,
  type CopilotMessage,
  type CopilotSuggestion,
  type CopilotIntent,
} from '../lib/portfolioCopilotService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = 'chat' | 'briefing' | 'nudges' | 'history';

const PortfolioCopilotModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<TabKey>('chat');
  const [selectedThread, setSelectedThread] = useState<string>('thread-001');
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const conversations = useMemo(() => getAllConversations(), []);
  const briefing = useMemo(() => getDailyBriefing(), []);
  const nudges = useMemo(() => getProactiveNudges(), []);
  const suggestions = useMemo(() => getCopilotSuggestions(), []);

  const activeThread = useMemo(
    () => conversations.find(t => t.id === selectedThread) ?? conversations[0],
    [selectedThread, conversations],
  );

  const filteredHistory = useMemo(() => {
    if (!searchQuery) return conversations;
    const lower = searchQuery.toLowerCase();
    return conversations.filter(t =>
      t.title.toLowerCase().includes(lower) ||
      t.messages.some(m => m.content.toLowerCase().includes(lower))
    );
  }, [searchQuery, conversations]);

  if (!isOpen) return null;

  const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'chat', label: 'Chat', icon: <MessageSquare size={12} /> },
    { key: 'briefing', label: 'Daily Briefing', icon: <Sparkles size={12} /> },
    { key: 'nudges', label: 'Nudges', icon: <Bell size={12} /> },
    { key: 'history', label: 'History', icon: <Clock size={12} /> },
  ];

  const unreadNudgeCount = nudges.filter(n => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-lime/20">
              <Bot size={20} className="text-brand-lime" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">AI Portfolio Copilot</h2>
              <p className="text-xs text-slate-400">
                Your intelligent assistant for portfolio management, market signals &amp; grading advice
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
                tab === t.key
                  ? 'bg-brand-lime/20 text-brand-lime border border-brand-lime/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t.icon}
              {t.label}
              {t.key === 'nudges' && unreadNudgeCount > 0 && (
                <span className="ml-1 text-[9px] font-black bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full border border-red-500/40">
                  {unreadNudgeCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ── Chat Tab ── */}
          {tab === 'chat' && activeThread && (
            <>
              {/* Thread Title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-100">{activeThread.title}</h3>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${intentBadgeColor(activeThread.intent)}`}>
                    {intentLabel(activeThread.intent)}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {new Date(activeThread.updatedAt).toLocaleDateString()}
                </span>
              </div>

              {/* Messages */}
              <div className="space-y-4">
                {activeThread.messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl p-4 ${
                      msg.role === 'user'
                        ? 'bg-brand-lime/10 border border-brand-lime/20'
                        : 'bg-slate-800/50 border border-slate-700/50'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {msg.role === 'copilot' && <Bot size={12} className="text-brand-lime" />}
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${
                          msg.role === 'user' ? 'text-brand-lime' : 'text-slate-400'
                        }`}>
                          {msg.role === 'user' ? 'You' : 'Copilot'}
                        </span>
                        {msg.intent && (
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border ${intentBadgeColor(msg.intent)}`}>
                            {intentLabel(msg.intent)}
                          </span>
                        )}
                        <span className="text-[9px] text-slate-600">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                        {msg.content}
                      </p>

                      {/* Suggestion Cards */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.suggestions.map(sug => (
                            <div key={sug.id} className={`rounded-xl p-3 border ${
                              sug.type === 'action' ? 'bg-emerald-500/5 border-emerald-500/20' :
                              sug.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20' :
                              'bg-sky-500/5 border-sky-500/20'
                            }`}>
                              <div className="flex items-center gap-2 mb-1">
                                {sug.type === 'action' && <Zap size={10} className="text-emerald-400" />}
                                {sug.type === 'warning' && <AlertTriangle size={10} className="text-amber-400" />}
                                {sug.type === 'insight' && <Sparkles size={10} className="text-sky-400" />}
                                <span className="text-[10px] font-bold text-slate-200">{sug.title}</span>
                                <span className="text-[9px] text-slate-500">{sug.confidence}% conf</span>
                              </div>
                              <p className="text-[10px] text-slate-400">{sug.description}</p>
                              {sug.actionLabel && (
                                <button className="mt-2 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-brand-lime/20 text-brand-lime border border-brand-lime/30 hover:bg-brand-lime/30 transition-colors">
                                  {sug.actionLabel}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Bar */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex-1 flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    placeholder="Ask Copilot about your portfolio..."
                    className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none"
                  />
                  <button className="p-1 rounded-lg hover:bg-slate-700 transition-colors text-slate-500 hover:text-slate-300">
                    <Mic size={14} />
                  </button>
                </div>
                <button className="p-3 rounded-xl bg-brand-lime/20 text-brand-lime hover:bg-brand-lime/30 transition-colors border border-brand-lime/30">
                  <Send size={14} />
                </button>
              </div>

              {/* Thread Selector */}
              <div className="mt-4">
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mb-2">Active Threads</p>
                <div className="flex gap-1 flex-wrap">
                  {conversations.filter(t => t.isActive).map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedThread(t.id)}
                      className={`px-3 py-1 rounded-md text-[10px] font-bold transition-colors ${
                        selectedThread === t.id
                          ? 'bg-brand-lime/20 text-brand-lime border border-brand-lime/30'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800 border border-transparent'
                      }`}
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Briefing Tab ── */}
          {tab === 'briefing' && (
            <>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Daily Portfolio Briefing &mdash; {new Date(briefing.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h3>

              {/* Portfolio Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-1">Portfolio Value</p>
                  <p className="text-2xl font-black text-slate-100">${briefing.portfolioValue.toLocaleString()}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-1">24h Change</p>
                  <p className={`text-2xl font-black ${briefing.portfolioChangePct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {briefing.portfolioChangePct >= 0 ? '+' : ''}{briefing.portfolioChangePct}%
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {briefing.portfolioChange24h >= 0 ? '+' : ''}${briefing.portfolioChange24h.toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-1">Active Alerts</p>
                  <p className="text-2xl font-black text-amber-400">{briefing.alerts.length}</p>
                  <p className="text-[10px] text-slate-500">Requires attention</p>
                </div>
              </div>

              {/* Performance Sparkline */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold mb-3">7-Day Portfolio Performance</p>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={briefing.performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#94a3b8' }} />
                      <YAxis
                        tick={{ fontSize: 9, fill: '#94a3b8' }}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                        domain={['dataMin - 500', 'dataMax + 500']}
                      />
                      <Tooltip
                        contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 11 }}
                        formatter={(v: number) => [`$${v.toLocaleString()}`, 'Portfolio Value']}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#84cc16"
                        fill="url(#briefingGradient)"
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient id="briefingGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#84cc16" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-brand-lime/5 border border-brand-lime/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bot size={14} className="text-brand-lime" />
                  <span className="text-[10px] font-bold text-brand-lime uppercase tracking-wider">Copilot Summary</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{briefing.summary}</p>
              </div>

              {/* Top Movers */}
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Top Movers</h4>
                <div className="space-y-1">
                  {briefing.topMovers.map((mover, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-2">
                        {mover.direction === 'up' ? (
                          <TrendingUp size={12} className="text-emerald-400" />
                        ) : (
                          <TrendingDown size={12} className="text-red-400" />
                        )}
                        <span className="text-xs font-bold text-slate-200">{mover.cardName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500">${mover.currentValue.toLocaleString()}</span>
                        <span className={`text-xs font-black ${mover.direction === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {mover.direction === 'up' ? '+' : ''}{mover.changePct}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerts */}
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Alerts</h4>
                <div className="space-y-2">
                  {briefing.alerts.map(alert => (
                    <div key={alert.id} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${priorityBadgeColor(alert.priority)}`}>
                        {alert.priority}
                      </span>
                      <span className="text-xs text-slate-300 flex-1">{alert.message}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${intentBadgeColor(alert.intent)}`}>
                        {intentLabel(alert.intent)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Recommendations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {briefing.recommendations.map(rec => (
                    <div key={rec.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${intentBadgeColor(rec.intent)}`}>
                          {intentLabel(rec.intent)}
                        </span>
                        <span className="text-[9px] text-slate-500">{rec.confidence}% confidence</span>
                      </div>
                      <p className="text-xs font-bold text-slate-200 mb-1">{rec.title}</p>
                      <p className="text-[10px] text-slate-400">{rec.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Nudges Tab ── */}
          {tab === 'nudges' && (
            <>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                Proactive Nudges &amp; Alerts
              </h3>

              <div className="space-y-3">
                {nudges.map(nudge => (
                  <div
                    key={nudge.id}
                    className={`bg-slate-800/50 rounded-xl p-4 border transition-colors ${
                      !nudge.isRead
                        ? 'border-brand-lime/30 bg-brand-lime/5'
                        : 'border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${priorityBadgeColor(nudge.priority)}`}>
                          {nudge.priority}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${intentBadgeColor(nudge.intent)}`}>
                          {intentLabel(nudge.intent)}
                        </span>
                        {!nudge.isRead && (
                          <span className="w-2 h-2 rounded-full bg-brand-lime" />
                        )}
                      </div>
                      <span className="text-[9px] text-slate-600">
                        {new Date(nudge.timestamp).toLocaleDateString()} {new Date(nudge.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-100 mb-1">{nudge.message}</p>
                    {nudge.cardName && (
                      <p className="text-[10px] text-slate-500 mb-2">{nudge.cardName}</p>
                    )}
                    <p className="text-xs text-slate-400 leading-relaxed">{nudge.detail}</p>

                    {nudge.actionLabel && (
                      <button className="mt-3 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-brand-lime/20 text-brand-lime border border-brand-lime/30 hover:bg-brand-lime/30 transition-colors">
                        {nudge.actionLabel}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── History Tab ── */}
          {tab === 'history' && (
            <>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                Conversation History
              </h3>

              {/* Search */}
              <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 mb-4">
                <Search size={14} className="text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 outline-none"
                />
              </div>

              <div className="space-y-2">
                {filteredHistory.map(thread => (
                  <button
                    key={thread.id}
                    onClick={() => { setSelectedThread(thread.id); setTab('chat'); }}
                    className={`w-full text-left bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-brand-lime/30 transition-colors`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-100">{thread.title}</span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${intentBadgeColor(thread.intent)}`}>
                          {intentLabel(thread.intent)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {thread.isActive && (
                          <span className="text-[9px] font-bold text-brand-lime bg-brand-lime/20 px-1.5 py-0.5 rounded-full border border-brand-lime/30">
                            Active
                          </span>
                        )}
                        <span className="text-[9px] text-slate-600">
                          {new Date(thread.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      {thread.messages.length} messages &bull; Last: {thread.messages[thread.messages.length - 1]?.content.slice(0, 80)}...
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioCopilotModal;
