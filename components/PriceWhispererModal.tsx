import React, { useState, useMemo } from 'react';
import { X, Bot, DollarSign, TrendingDown, Clock, CheckCircle, XCircle, MessageCircle } from 'lucide-react';
import { getQueries, getHistory } from '../lib/priceWhispererService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PriceWhispererModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('queries');
  const queries = useMemo(() => getQueries(), []);
  const history = useMemo(() => getHistory(), []);

  if (!isOpen) return null;

  const tabs = [
    { id: 'queries', label: 'Queries', count: queries.length },
    { id: 'history', label: 'History', count: history.length },
  ];

  const getStatusColor = (status: string) => {
    if (status === 'accepted') return 'text-emerald-400 bg-emerald-400/10';
    if (status === 'pending') return 'text-blue-400 bg-blue-400/10';
    if (status === 'countered') return 'text-amber-400 bg-amber-400/10';
    return 'text-red-400 bg-red-400/10';
  };

  const getOutcomeColor = (outcome: string) => {
    if (outcome === 'won') return 'text-emerald-400';
    if (outcome === 'lost') return 'text-red-400';
    return 'text-amber-400';
  };

  const formatCurrency = (n: number) => `$${n.toLocaleString()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl">
              <Bot className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Price Whisperer</h2>
              <p className="text-sm text-slate-400">AI-powered price negotiation assistant</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-700/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-slate-700">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'queries' && (
            <div className="space-y-4">
              {queries.map((q) => (
                <div key={q.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{q.cardName}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                        <span>{q.platform}</span>
                        <span className="text-slate-600">|</span>
                        <Clock className="w-3 h-3" />
                        <span>{new Date(q.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(q.status)}`}>
                      {q.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Asking Price</div>
                      <div className="text-red-400 font-bold">{formatCurrency(q.askingPrice)}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Fair Market</div>
                      <div className="text-white font-bold">{formatCurrency(q.fairMarketValue)}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Our Offer</div>
                      <div className="text-blue-400 font-bold">{formatCurrency(q.suggestedOffer)}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Confidence</div>
                      <div className="text-emerald-400 font-bold">{q.confidence}%</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-start gap-2 bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
                    <MessageCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-300">{q.reasoning}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-400">{history.filter(h => h.outcome === 'won').length}</div>
                  <div className="text-sm text-slate-400">Deals Won</div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {formatCurrency(history.reduce((sum, h) => sum + h.savings, 0))}
                  </div>
                  <div className="text-sm text-slate-400">Total Savings</div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-400">
                    {(history.filter(h => h.outcome === 'won').reduce((sum, h) => sum + h.savingsPercent, 0) / Math.max(history.filter(h => h.outcome === 'won').length, 1)).toFixed(1)}%
                  </div>
                  <div className="text-sm text-slate-400">Avg Savings</div>
                </div>
              </div>
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3">
                  <div className="flex-1">
                    <h4 className="text-white text-sm font-medium">{h.cardName}</h4>
                    <span className="text-xs text-slate-500">{h.date}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-slate-500 text-xs">Ask</div>
                      <div className="text-slate-300">{formatCurrency(h.initialAsk)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-500 text-xs">Final</div>
                      <div className="text-white font-medium">{h.finalPrice > 0 ? formatCurrency(h.finalPrice) : '—'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-500 text-xs">Saved</div>
                      <div className="text-emerald-400 font-medium">{h.savings > 0 ? formatCurrency(h.savings) : '—'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-500 text-xs">Rounds</div>
                      <div className="text-slate-300">{h.rounds}</div>
                    </div>
                    <span className={`font-medium capitalize ${getOutcomeColor(h.outcome)}`}>{h.outcome}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriceWhispererModal;
