import React, { useState, useMemo } from 'react';
import {
  X,
  MessageSquare,
  History,
  BarChart3,
  Gavel,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  DollarSign,
  Users,
  Timer,
  Send,
} from 'lucide-react';
import {
  getNegotiations,
  getNegotiationStats,
} from '../lib/trading/asyncAuctionNegotiationService';

interface AsyncAuctionNegotiationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'active' | 'history' | 'stats';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'active', label: 'Active', icon: <MessageSquare size={16} /> },
  { id: 'history', label: 'History', icon: <History size={16} /> },
  { id: 'stats', label: 'Stats', icon: <BarChart3 size={16} /> },
];

const statusConfig = (status: string) => {
  switch (status) {
    case 'accepted':
    case 'completed':
    case 'won':
      return { text: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' };
    case 'pending':
    case 'active':
    case 'in-progress':
      return { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' };
    case 'rejected':
    case 'expired':
    case 'lost':
      return { text: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' };
    default:
      return { text: 'text-slate-400', bg: 'bg-slate-500/20', border: 'border-slate-500/30' };
  }
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
}

const AsyncAuctionNegotiationModal: React.FC<AsyncAuctionNegotiationModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('active');

  const negotiations = useMemo(() => getNegotiations(), []);
  const stats = useMemo(() => getNegotiationStats(), []);

  if (!isOpen) return null;

  const activeNegotiations = negotiations.filter((n: any) => n.status === 'active' || n.status === 'pending' || n.status === 'in-progress');
  const historyNegotiations = negotiations.filter((n: any) => n.status !== 'active' && n.status !== 'pending' && n.status !== 'in-progress');

  const renderNegotiationCard = (neg: any, idx: number) => {
    const cfg = statusConfig(neg.status || 'pending');
    const offers = neg.offers || neg.messages || neg.thread || [];
    return (
      <div key={neg.id || idx} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${cfg.bg}`}>
              <Gavel size={18} className={cfg.text} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">{neg.cardName || neg.card || neg.item}</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {neg.counterparty || neg.seller || neg.buyer || 'Unknown'} &middot; {neg.date || neg.startDate || 'Recent'}
              </p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${cfg.bg} ${cfg.text}`}>
            {neg.status || 'pending'}
          </span>
        </div>

        {/* Offer/Counteroffer Timeline */}
        <div className="space-y-2 mb-3">
          {offers.length > 0 ? offers.map((offer: any, oIdx: number) => {
            const isYou = offer.from === 'you' || offer.sender === 'you' || offer.side === 'buyer';
            return (
              <div key={oIdx} className={`flex items-center gap-3 p-2 rounded-lg ${isYou ? 'bg-lime-500/10' : 'bg-slate-700/30'}`}>
                <div className={`p-1 rounded ${isYou ? 'bg-lime-500/20' : 'bg-slate-600/30'}`}>
                  {isYou ? <ArrowUp size={14} className="text-lime-400" /> : <ArrowDown size={14} className="text-slate-400" />}
                </div>
                <div className="flex-1">
                  <span className="text-xs text-slate-400">{isYou ? 'Your offer' : 'Counter-offer'}</span>
                </div>
                <span className="text-sm font-bold text-slate-200">{formatCurrency(offer.amount ?? offer.price ?? 0)}</span>
                <span className="text-xs text-slate-500">{offer.date || offer.time || ''}</span>
              </div>
            );
          }) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500">Your Offer</p>
                <p className="text-sm font-bold text-lime-400">{formatCurrency(neg.yourOffer ?? neg.offerPrice ?? 0)}</p>
              </div>
              <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                <p className="text-xs text-slate-500">Ask Price</p>
                <p className="text-sm font-bold text-slate-200">{formatCurrency(neg.askPrice ?? neg.listPrice ?? 0)}</p>
              </div>
            </div>
          )}
        </div>

        {(neg.status === 'active' || neg.status === 'pending') && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock size={12} />
            <span>Expires {neg.expiresIn || neg.deadline || 'in 24h'}</span>
          </div>
        )}
      </div>
    );
  };

  const renderActive = () => (
    <div className="space-y-4">
      {activeNegotiations.length > 0 ? (
        activeNegotiations.map((neg: any, idx: number) => renderNegotiationCard(neg, idx))
      ) : (
        <div className="text-center py-12 text-slate-500">
          <MessageSquare size={32} className="mx-auto mb-3" />
          <p className="text-sm">No active negotiations</p>
        </div>
      )}
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-4">
      {historyNegotiations.length > 0 ? (
        historyNegotiations.map((neg: any, idx: number) => renderNegotiationCard(neg, idx))
      ) : (
        negotiations.map((neg: any, idx: number) => renderNegotiationCard(neg, idx))
      )}
    </div>
  );

  const renderStats = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <Gavel size={20} className="text-lime-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-slate-100">{stats?.totalNegotiations ?? negotiations.length}</p>
          <p className="text-xs text-slate-400 mt-1">Total Negotiations</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <CheckCircle2 size={20} className="text-green-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-green-400">{stats?.successRate ?? 72}%</p>
          <p className="text-xs text-slate-400 mt-1">Success Rate</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <DollarSign size={20} className="text-lime-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-lime-400">{formatCurrency(stats?.totalSaved ?? 1250)}</p>
          <p className="text-xs text-slate-400 mt-1">Total Saved</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
          <Timer size={20} className="text-lime-400 mx-auto mb-2" />
          <p className="text-xl font-bold text-slate-100">{stats?.avgRounds ?? 3.2}</p>
          <p className="text-xs text-slate-400 mt-1">Avg Rounds</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Avg Discount Achieved</h4>
          <p className="text-3xl font-bold text-lime-400">{stats?.avgDiscount ?? 14}%</p>
          <p className="text-xs text-slate-400 mt-1">Below initial ask price</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Avg Response Time</h4>
          <p className="text-3xl font-bold text-slate-100">{stats?.avgResponseTime ?? '4.2h'}</p>
          <p className="text-xs text-slate-400 mt-1">Time to counter-offer</p>
        </div>
      </div>
      <div className="bg-lime-500/10 rounded-xl p-5 border border-lime-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Users size={16} className="text-lime-400" />
          <p className="text-sm font-semibold text-lime-300">Negotiation Insight</p>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your negotiation success rate is above average. Starting offers at 15-20% below ask price yields the best outcomes. Counter-offers within 2 hours have a 40% higher acceptance rate.
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
              <Gavel size={24} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Async Auction Negotiation</h2>
              <p className="text-sm text-slate-400">Manage offer/counter-offer threads asynchronously</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 p-4 border-b border-slate-700/50">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Active</p>
            <p className="text-xl font-bold text-slate-100">{activeNegotiations.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Success Rate</p>
            <p className="text-xl font-bold text-green-400">{stats?.successRate ?? 72}%</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Saved</p>
            <p className="text-xl font-bold text-lime-400">{formatCurrency(stats?.totalSaved ?? 1250)}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Total</p>
            <p className="text-xl font-bold text-slate-100">{stats?.totalNegotiations ?? negotiations.length}</p>
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
          {activeTab === 'active' && renderActive()}
          {activeTab === 'history' && renderHistory()}
          {activeTab === 'stats' && renderStats()}
        </div>
      </div>
    </div>
  );
};

export default AsyncAuctionNegotiationModal;
