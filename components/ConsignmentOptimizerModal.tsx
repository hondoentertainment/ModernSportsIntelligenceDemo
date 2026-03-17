import React, { useState, useMemo } from 'react';
import { X, Scale, Star, Clock, Users, DollarSign, CheckCircle } from 'lucide-react';
import { getRoutes, getComparisons } from '../lib/consignmentOptimizerService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ConsignmentOptimizerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('routes');
  const routes = useMemo(() => getRoutes(), []);
  const comparisons = useMemo(() => getComparisons(), []);

  if (!isOpen) return null;

  const tabs = [
    { id: 'routes', label: 'Routes', count: routes.length },
    { id: 'compare', label: 'Compare', count: comparisons.length },
  ];

  const getTierColor = (tier: string) => {
    if (tier === 'premium') return 'text-amber-400 bg-amber-400/10';
    if (tier === 'standard') return 'text-blue-400 bg-blue-400/10';
    return 'text-slate-400 bg-slate-400/10';
  };

  const formatCurrency = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatAudience = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : `${(n / 1000).toFixed(0)}K`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/20 rounded-xl">
              <Scale className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Consignment Optimizer</h2>
              <p className="text-sm text-slate-400">Optimize consignment routing across platforms</p>
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
                  ? 'bg-slate-800 text-teal-400 border-b-2 border-teal-400'
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
          {activeTab === 'routes' && (
            <div className="space-y-4">
              {routes.map((r) => (
                <div key={r.id} className={`bg-slate-800/50 border rounded-xl p-4 ${r.recommended ? 'border-teal-500/50' : 'border-slate-700/50'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{r.cardName}</h3>
                      <span className="text-sm text-slate-400">{r.grade} — via {r.platform}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.recommended && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-teal-400 bg-teal-400/10">
                          <CheckCircle className="w-3 h-3" /> Recommended
                        </span>
                      )}
                      <span className="px-2 py-1 rounded-full text-sm font-bold text-amber-400 bg-amber-400/10">{r.score}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Est. Value</div>
                      <div className="text-white font-bold text-sm">${r.estimatedValue.toLocaleString()}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Commission</div>
                      <div className="text-red-400 font-bold text-sm">{r.commission}%</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Net Proceeds</div>
                      <div className="text-teal-400 font-bold text-sm">{formatCurrency(r.netProceeds)}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Time to Sell</div>
                      <div className="text-slate-300 font-medium text-sm">{r.timeToSell}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Audience</div>
                      <div className="text-blue-400 font-bold text-sm">{formatAudience(r.audienceSize)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'compare' && (
            <div className="space-y-3">
              <div className="grid grid-cols-7 gap-4 px-4 py-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
                <span>Platform</span>
                <span>Tier</span>
                <span>Commission</span>
                <span>Time to Sell</span>
                <span>Buyer Pool</span>
                <span>Rating</span>
                <span>Specialties</span>
              </div>
              {comparisons.map((p) => (
                <div key={p.platform} className="grid grid-cols-7 gap-4 items-center bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3">
                  <span className="text-white font-semibold">{p.platform}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium w-fit capitalize ${getTierColor(p.tier)}`}>{p.tier}</span>
                  <span className="text-slate-300">{p.avgCommission}%</span>
                  <span className="text-slate-300 text-sm">{p.avgTimeToSell}</span>
                  <span className="text-blue-400 font-medium">{formatAudience(p.buyerPool)}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-white text-sm">{p.sellerRating}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {p.specialties.map((s) => (
                      <span key={s} className="px-1.5 py-0.5 text-xs bg-slate-700/50 text-slate-300 rounded">{s}</span>
                    ))}
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

export default ConsignmentOptimizerModal;
