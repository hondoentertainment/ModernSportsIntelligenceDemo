import React, { useState, useEffect, useMemo } from 'react';
import { Bot, Sparkles, MessageSquare, AlertTriangle, Send, ChevronRight, TrendingUp, TrendingDown, Bell } from 'lucide-react';
import {
  getAllConversations,
  getDailyBriefing,
  getProactiveNudges,
  getCopilotSuggestions,
  sendMessage,
  intentLabel,
  intentBadgeColor,
  priorityBadgeColor,
  type ConversationThread,
  type DailyBriefing,
  type ProactiveNudge,
  type CopilotSuggestion,
  type CopilotMessage,
} from '../lib/portfolioCopilotService.ts';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const PortfolioCopilot: React.FC = () => {
  const [conversations, setConversations] = useState<ConversationThread[]>([]);
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [nudges, setNudges] = useState<ProactiveNudge[]>([]);
  const [suggestions, setSuggestions] = useState<CopilotSuggestion[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      setConversations(getAllConversations());
      setBriefing(getDailyBriefing());
      setNudges(getProactiveNudges());
      setSuggestions(getCopilotSuggestions());
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }, []);

  const selectedThread = useMemo(
    () => conversations.find(t => t.id === selectedThreadId) ?? null,
    [conversations, selectedThreadId]
  );

  const unreadNudges = useMemo(() => nudges.filter(n => !n.isRead), [nudges]);

  const handleSend = () => {
    if (!selectedThreadId || !inputValue.trim()) return;
    const response = sendMessage(selectedThreadId, inputValue.trim());
    setConversations(prev =>
      prev.map(t =>
        t.id === selectedThreadId
          ? { ...t, messages: [...t.messages, { id: `usr-${Date.now()}`, threadId: t.id, role: 'user' as const, content: inputValue.trim(), timestamp: new Date().toISOString() }, response] }
          : t
      )
    );
    setInputValue('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading AI Portfolio Copilot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20">
            <Bot size={24} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">AI Portfolio Copilot</h1>
            <p className="text-sm text-slate-400">
              Conversational AI assistant for portfolio strategy &mdash; Phase 114
            </p>
          </div>
        </div>
        {unreadNudges.length > 0 && (
          <span className="px-3 py-1.5 text-sm font-bold bg-amber-500/20 text-amber-300 rounded-full">
            {unreadNudges.length} New Alerts
          </span>
        )}
      </div>

      {/* ─── Summary Cards ──────────────────────────────────────── */}
      {briefing && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Portfolio Value</p>
            <p className="text-3xl font-bold text-white">${briefing.portfolioValue.toLocaleString()}</p>
            <p className={`text-xs mt-1 ${briefing.portfolioChangePct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {briefing.portfolioChangePct >= 0 ? '+' : ''}{briefing.portfolioChangePct.toFixed(1)}% today
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">24h Change</p>
            <p className={`text-3xl font-bold ${briefing.portfolioChange24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {briefing.portfolioChange24h >= 0 ? '+' : ''}${briefing.portfolioChange24h.toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Active Threads</p>
            <p className="text-3xl font-bold text-purple-400">{conversations.filter(c => c.isActive).length}</p>
            <p className="text-xs text-slate-600 mt-1">{conversations.length} total</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Recommendations</p>
            <p className="text-3xl font-bold text-brand-lime">{briefing.recommendations.length}</p>
            <p className="text-xs text-slate-600 mt-1">action items today</p>
          </div>
        </div>
      )}

      {/* ─── Performance Chart + Daily Briefing ───────────────── */}
      {briefing && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-brand-lime" />
              Portfolio Performance (7-Day)
            </h2>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={briefing.performanceData}>
                  <defs>
                    <linearGradient id="copilotGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#84cc16" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#84cc16" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#84cc16" strokeWidth={2} fill="url(#copilotGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-amber-400" />
              Daily Briefing
            </h2>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">{briefing.summary}</p>
            <div className="space-y-2">
              {briefing.topMovers.slice(0, 4).map(mover => (
                <div key={mover.cardName} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-2 min-w-0">
                    {mover.direction === 'up' ? (
                      <TrendingUp size={12} className="text-emerald-400 flex-shrink-0" />
                    ) : (
                      <TrendingDown size={12} className="text-red-400 flex-shrink-0" />
                    )}
                    <span className="text-xs text-slate-300 truncate">{mover.cardName}</span>
                  </div>
                  <span className={`text-xs font-bold flex-shrink-0 ml-2 ${mover.changePct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {mover.changePct >= 0 ? '+' : ''}{mover.changePct.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Copilot Chat Interface ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Thread List */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <MessageSquare size={18} className="text-blue-400" />
            Conversations
          </h2>
          {conversations.map(thread => (
            <button
              key={thread.id}
              onClick={() => setSelectedThreadId(thread.id === selectedThreadId ? null : thread.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedThreadId === thread.id
                  ? 'bg-slate-800 border-brand-lime/50 shadow-lg shadow-brand-lime/5'
                  : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-white truncate">{thread.title}</span>
                <ChevronRight size={14} className="text-slate-600 flex-shrink-0" />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${intentBadgeColor(thread.intent)}`}>
                  {intentLabel(thread.intent)}
                </span>
                {thread.isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                <span className="text-[10px] text-slate-600">{thread.messages.length} msgs</span>
              </div>
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 flex flex-col">
          {selectedThread ? (
            <>
              <h3 className="text-sm font-semibold text-slate-300 mb-4">{selectedThread.title}</h3>
              <div className="flex-1 space-y-4 mb-4 max-h-96 overflow-y-auto">
                {selectedThread.messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-brand-lime/10 text-brand-lime border border-brand-lime/20'
                        : 'bg-slate-900/50 text-slate-300 border border-slate-700/30'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.suggestions.map(sug => (
                            <div key={sug.id} className="p-2 bg-slate-800/80 rounded-lg border border-slate-700/30">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${intentBadgeColor(sug.intent)}`}>
                                  {sug.type}
                                </span>
                                <span className="text-[10px] font-bold text-white">{sug.title}</span>
                              </div>
                              <p className="text-[10px] text-slate-500">{sug.description}</p>
                              {sug.actionLabel && (
                                <button className="mt-1 text-[10px] text-brand-lime hover:underline">{sug.actionLabel}</button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Ask the copilot..."
                  className="flex-1 bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-brand-lime/50"
                />
                <button onClick={handleSend} className="p-2 bg-brand-lime/20 text-brand-lime rounded-lg hover:bg-brand-lime/30 transition-colors">
                  <Send size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Bot size={40} className="text-slate-600 mb-3" />
              <p className="text-slate-400">Select a conversation to view</p>
              <p className="text-xs text-slate-600 mt-1">Your AI copilot helps with buy/sell signals, rebalancing, and grading advice</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── Proactive Nudges ─────────────────────────────────── */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Bell size={18} className="text-amber-400" />
          Proactive Nudges
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {nudges.slice(0, 6).map(nudge => (
            <div
              key={nudge.id}
              className={`p-4 rounded-xl border transition-all ${
                nudge.isRead
                  ? 'bg-slate-800/30 border-slate-700/30'
                  : 'bg-slate-800/50 border-slate-700/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${priorityBadgeColor(nudge.priority)}`}>
                  {nudge.priority}
                </span>
                {!nudge.isRead && <span className="w-2 h-2 rounded-full bg-brand-lime" />}
              </div>
              <p className="text-xs font-bold text-white mb-1">{nudge.message}</p>
              <p className="text-[10px] text-slate-500 line-clamp-2">{nudge.detail}</p>
              {nudge.actionLabel && (
                <button className="mt-2 text-[10px] text-brand-lime hover:underline flex items-center gap-1">
                  {nudge.actionLabel} <ChevronRight size={10} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Action Items / Suggestions ───────────────────────── */}
      {briefing && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-purple-400" />
            Copilot Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {briefing.recommendations.map(rec => (
              <div key={rec.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">{rec.title}</span>
                  <span className="text-[10px] text-slate-500">Conf: {rec.confidence}%</span>
                </div>
                <p className="text-xs text-slate-400">{rec.description}</p>
                <span className={`inline-block mt-2 text-[10px] px-1.5 py-0.5 rounded-full border ${intentBadgeColor(rec.intent)}`}>
                  {intentLabel(rec.intent)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioCopilot;
