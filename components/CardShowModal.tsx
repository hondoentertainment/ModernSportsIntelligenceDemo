// @ts-nocheck
import React, { useState, useMemo, useCallback } from 'react';
import {
  X,
  MapPin,
  Search,
  Tag,
  ListChecks,
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Circle,
  Clock,
} from 'lucide-react';
import {
  getActiveDeals,
  getWantList,
  getDealStats,
  CardShowDeal,
  CardShowWantItem,
} from '../lib/utils/cardShowService';

interface CardShowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'price-check' | 'deals' | 'want-list';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'price-check', label: 'Price Check', icon: <Search size={16} /> },
  { id: 'deals', label: 'Deal Log', icon: <Tag size={16} /> },
  { id: 'want-list', label: 'Want List', icon: <ListChecks size={16} /> },
];

function getDealScoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-400';
  if (score >= 50) return 'text-lime-400';
  if (score >= 35) return 'text-amber-400';
  return 'text-red-400';
}

function getDealScoreBg(score: number): string {
  if (score >= 75) return 'bg-emerald-500/15';
  if (score >= 50) return 'bg-lime-500/15';
  if (score >= 35) return 'bg-amber-500/15';
  return 'bg-red-500/15';
}

function getDealLabel(score: number): string {
  if (score >= 75) return 'Great Deal';
  if (score >= 50) return 'Good Deal';
  if (score >= 35) return 'Fair Price';
  return 'Overpriced';
}

function getPriorityColor(priority: string): string {
  if (priority === 'high') return 'text-red-400 bg-red-500/15';
  if (priority === 'medium') return 'text-amber-400 bg-amber-500/15';
  return 'text-slate-400 bg-slate-500/15';
}

function formatTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m ago`;
}

// Quick price lookup data
const PRICE_DATABASE: Record<string, { marketValue: number; trend: 'up' | 'down' | 'flat'; recentSales: number[] }> = {
  'ohtani psa 10': { marketValue: 425, trend: 'up', recentSales: [410, 435, 420, 450, 400] },
  'trout psa 8': { marketValue: 710, trend: 'flat', recentSales: [700, 720, 695, 730, 710] },
  'wembanyama psa 10': { marketValue: 340, trend: 'down', recentSales: [380, 360, 340, 330, 345] },
  'doncic bgs 9.5': { marketValue: 580, trend: 'up', recentSales: [550, 560, 590, 600, 575] },
  'tatum psa 9': { marketValue: 240, trend: 'up', recentSales: [220, 230, 245, 250, 240] },
  'mahomes psa 10': { marketValue: 1200, trend: 'up', recentSales: [1150, 1180, 1220, 1250, 1190] },
  'edwards prizm silver': { marketValue: 135, trend: 'up', recentSales: [120, 125, 140, 145, 130] },
  'soto psa 10': { marketValue: 210, trend: 'up', recentSales: [190, 200, 215, 220, 205] },
};

const CardShowModal: React.FC<CardShowModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('price-check');
  const [searchQuery, setSearchQuery] = useState('');
  const [deals, _setDeals] = useState<CardShowDeal[]>(() => getActiveDeals());
  const [wantList, setWantList] = useState<CardShowWantItem[]>(() => getWantList());
  const stats = useMemo(() => getDealStats(), []);

  const priceResult = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    const match = Object.entries(PRICE_DATABASE).find(([key]) => q.includes(key) || key.includes(q));
    return match ? { key: match[0], ...match[1] } : null;
  }, [searchQuery]);

  const toggleWantItem = useCallback((id: string) => {
    setWantList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, found: !item.found } : item))
    );
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-8 pb-8 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-500/20">
              <MapPin size={20} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Card Show Mode</h2>
              <p className="text-xs text-slate-500">
                {deals.length} deals tracked &middot; ${stats.totalSaved > 0 ? stats.totalSaved : 0} saved
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-lime-400 border-lime-400'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Price Check Tab */}
          {activeTab === 'price-check' && (
            <div className="space-y-5">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search player + card (e.g. 'Ohtani PSA 10')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-lime-500/50 focus:ring-1 focus:ring-lime-500/20"
                />
              </div>

              {priceResult ? (
                <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-slate-300 capitalize">{priceResult.key}</h4>
                    <div className="flex items-center gap-1.5">
                      {priceResult.trend === 'up' && <TrendingUp size={14} className="text-emerald-400" />}
                      {priceResult.trend === 'down' && <TrendingDown size={14} className="text-red-400" />}
                      <span className={`text-xs font-medium ${
                        priceResult.trend === 'up' ? 'text-emerald-400' : priceResult.trend === 'down' ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {priceResult.trend === 'up' ? 'Trending Up' : priceResult.trend === 'down' ? 'Trending Down' : 'Stable'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-100">${priceResult.marketValue}</span>
                    <span className="text-sm text-slate-500">market value</span>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-2">Recent Sales</p>
                    <div className="flex gap-2">
                      {priceResult.recentSales.map((sale, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-slate-700/50 rounded-lg text-xs font-medium text-slate-300"
                        >
                          ${sale}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600">
                    Tip: If asking price is under ${Math.round(priceResult.marketValue * 0.85)}, it&apos;s a strong buy.
                  </p>
                </div>
              ) : searchQuery.trim() ? (
                <div className="text-center py-8 text-slate-600">
                  <Search size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No match found. Try: &quot;Ohtani PSA 10&quot; or &quot;Trout PSA 8&quot;</p>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-600">
                  <DollarSign size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Quick price lookup at the show</p>
                  <p className="text-xs mt-1 text-slate-700">Search to see market values and recent sales</p>
                </div>
              )}
            </div>
          )}

          {/* Deals Tab */}
          {activeTab === 'deals' && (
            <div className="space-y-4">
              {/* Summary Bar */}
              <div className="flex gap-3">
                <div className="flex-1 bg-slate-800/40 rounded-lg p-3 border border-slate-700/40">
                  <p className="text-xs text-slate-500">Avg Score</p>
                  <p className={`text-lg font-bold ${getDealScoreColor(stats.avgDealScore)}`}>
                    {stats.avgDealScore}
                  </p>
                </div>
                <div className="flex-1 bg-slate-800/40 rounded-lg p-3 border border-slate-700/40">
                  <p className="text-xs text-slate-500">Total Spent</p>
                  <p className="text-lg font-bold text-slate-200">${stats.totalSpent.toLocaleString()}</p>
                </div>
                <div className="flex-1 bg-slate-800/40 rounded-lg p-3 border border-slate-700/40">
                  <p className="text-xs text-slate-500">Saved</p>
                  <p className={`text-lg font-bold ${stats.totalSaved >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${stats.totalSaved >= 0 ? '+' : ''}{stats.totalSaved.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Deal List */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200">{deal.player}</p>
                        <p className="text-xs text-slate-500 truncate">{deal.cardDescription}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <span
                          className={`text-xl font-bold ${getDealScoreColor(deal.dealScore)}`}
                        >
                          {deal.dealScore}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${getDealScoreBg(deal.dealScore)} ${getDealScoreColor(deal.dealScore)}`}
                        >
                          {getDealLabel(deal.dealScore)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-400">
                        Ask: <span className="text-slate-200 font-medium">${deal.askingPrice}</span>
                      </span>
                      <span className="text-slate-400">
                        Market: <span className="text-slate-200 font-medium">${deal.marketValue}</span>
                      </span>
                      <span className={deal.marketValue > deal.askingPrice ? 'text-emerald-400' : 'text-red-400'}>
                        {deal.marketValue > deal.askingPrice ? '+' : ''}${deal.marketValue - deal.askingPrice}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 text-xs text-slate-600">
                      <span>{deal.vendor}</span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {formatTime(deal.timestamp)}
                      </span>
                    </div>

                    {deal.notes && (
                      <p className="mt-2 text-xs text-slate-500 italic">{deal.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Want List Tab */}
          {activeTab === 'want-list' && (
            <div className="space-y-4">
              {/* Progress Header */}
              <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-300">Progress</span>
                  <span className="text-sm text-lime-400 font-bold">
                    {wantList.filter((w) => w.found).length} / {wantList.length}
                  </span>
                </div>
                <div className="h-2.5 bg-slate-700/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-lime-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(wantList.filter((w) => w.found).length / wantList.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Want List Items */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {wantList.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleWantItem(item.id)}
                    className={`w-full text-left flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                      item.found
                        ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70'
                        : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50'
                    }`}
                  >
                    {item.found ? (
                      <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Circle size={20} className="text-slate-600 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${item.found ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                          {item.player}
                        </p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </div>
                      <p className={`text-xs truncate ${item.found ? 'text-slate-600' : 'text-slate-500'}`}>
                        {item.cardDescription}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-slate-400 flex-shrink-0">
                      &le;${item.maxPrice}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardShowModal;
