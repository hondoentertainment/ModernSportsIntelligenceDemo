import React, { useState, useMemo } from 'react';
import { X, Megaphone, TrendingUp, BarChart3, Users, Eye, Star } from 'lucide-react';
import { getInfluencers } from '../lib/influencerQuantifierService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const InfluencerQuantifierModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('influencers');

  const influencers = useMemo(() => getInfluencers(), []);

  if (!isOpen) return null;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'mega': return { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400' };
      case 'macro': return { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' };
      case 'micro': return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' };
      default: return { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' };
    }
  };

  const getImpactColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const tabs = [
    { id: 'influencers', label: 'Influencers', icon: <Users size={16} />, count: influencers.length },
    { id: 'impact', label: 'Impact Analysis', icon: <BarChart3 size={16} />, count: influencers.filter((i: any) => i.impactScore >= 70).length },
  ];

  const totalReach = influencers.reduce((sum: number, i: any) => sum + (i.followers || 0), 0);
  const avgImpact = Math.round(influencers.reduce((sum: number, i: any) => sum + (i.impactScore || 0), 0) / influencers.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-pink-500/10 rounded-xl">
              <Megaphone size={24} className="text-pink-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Influencer Quantifier</h2>
              <p className="text-xs text-slate-500">Track influencer impact on card market prices</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 px-6 pt-4">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Total Reach</p>
            <p className="text-lg font-bold text-pink-400">{(totalReach / 1000000).toFixed(1)}M</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Avg Impact Score</p>
            <p className="text-lg font-bold text-white">{avgImpact}/100</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Tracked Influencers</p>
            <p className="text-lg font-bold text-white">{influencers.length}</p>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-700/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-pink-400 bg-slate-800/50 border-b-2 border-pink-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-slate-700/50">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'influencers' && (
            <div className="grid gap-4">
              {influencers.map((influencer: any, idx: number) => {
                const tier = getTierColor(influencer.tier || 'micro');
                return (
                  <div key={idx} className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                          <Star size={18} className="text-pink-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{influencer.name || `Influencer ${idx + 1}`}</h3>
                          <p className="text-xs text-slate-500">{influencer.platform || 'YouTube'} • {((influencer.followers || 0) / 1000).toFixed(0)}K followers</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full border ${tier.bg} ${tier.border} ${tier.text}`}>
                        {influencer.tier || 'micro'}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Impact</p>
                        <p className={`text-sm font-bold ${getImpactColor(influencer.impactScore || 0)}`}>{influencer.impactScore || 0}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Avg Views</p>
                        <p className="text-sm font-bold text-white">{((influencer.avgViews || 0) / 1000).toFixed(0)}K</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Price Effect</p>
                        <p className="text-sm font-bold text-emerald-400">+{influencer.priceEffect || 0}%</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Mentions</p>
                        <p className="text-sm font-bold text-white">{influencer.mentions || 0}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'impact' && (
            <div className="grid gap-4">
              {influencers.filter((i: any) => i.impactScore >= 0).map((influencer: any, idx: number) => (
                <div key={idx} className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">{influencer.name || `Influencer ${idx + 1}`}</h3>
                    <div className="flex items-center gap-2">
                      <Eye size={14} className="text-slate-500" />
                      <span className="text-sm text-slate-400">{((influencer.avgViews || 0) / 1000).toFixed(0)}K avg views</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Impact Score</span>
                      <span className={getImpactColor(influencer.impactScore || 0)}>{influencer.impactScore || 0}/100</span>
                    </div>
                    <div className="w-full bg-slate-700/30 rounded-full h-2">
                      <div
                        className="bg-pink-500 rounded-full h-2 transition-all"
                        style={{ width: `${influencer.impactScore || 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Price Spike</p>
                      <p className="text-sm font-bold text-emerald-400">+{influencer.priceEffect || 0}%</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Volume Surge</p>
                      <p className="text-sm font-bold text-blue-400">{influencer.volumeSurge || '2.1'}x</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Duration</p>
                      <p className="text-sm font-bold text-amber-400">{influencer.effectDuration || '48'}h</p>
                    </div>
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

export default InfluencerQuantifierModal;
