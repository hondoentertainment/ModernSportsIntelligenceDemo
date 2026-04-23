// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { X, History, Link2, ShieldCheck, FileSearch, Clock, Award, CheckCircle2 } from 'lucide-react';
import { getChains } from '../lib/analytics/vintageProvenanceService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const VintageProvenanceModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('chains');

  const chains = useMemo(() => getChains(), []);

  if (!isOpen) return null;

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified': return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' };
      case 'partial': return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' };
      case 'unverified': return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' };
      default: return { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' };
    }
  };

  const getChainStrength = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  const tabs = [
    { id: 'chains', label: 'Provenance Chains', icon: <Link2 size={16} />, count: chains.length },
    { id: 'verification', label: 'Verification', icon: <ShieldCheck size={16} />, count: chains.filter((c: any) => c.verificationStatus === 'verified').length },
  ];

  const verifiedCount = chains.filter((c: any) => c.verificationStatus === 'verified').length;
  const avgChainLength = Math.round(chains.reduce((sum: number, c: any) => sum + (c.chainLength || 0), 0) / chains.length);
  const totalValue = chains.reduce((sum: number, c: any) => sum + (c.currentValue || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/10 rounded-xl">
              <History size={24} className="text-rose-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Vintage Provenance</h2>
              <p className="text-xs text-slate-500">Ownership chain verification for vintage collectibles</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 px-6 pt-4">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Verified Chains</p>
            <p className="text-lg font-bold text-emerald-400">{verifiedCount}/{chains.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Avg Chain Length</p>
            <p className="text-lg font-bold text-rose-400">{avgChainLength} owners</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Total Value Tracked</p>
            <p className="text-lg font-bold text-white">${(totalValue / 1000).toFixed(0)}K</p>
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
                  ? 'text-rose-400 bg-slate-800/50 border-b-2 border-rose-400'
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
          {activeTab === 'chains' && (
            <div className="grid gap-4">
              {chains.map((chain: any, idx: number) => {
                const verification = getVerificationColor(chain.verificationStatus || 'partial');
                return (
                  <div key={idx} className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                          <Award size={18} className="text-rose-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{chain.itemName || `Item ${idx + 1}`}</h3>
                          <p className="text-xs text-slate-500">{chain.era || 'Vintage'} • {chain.year || '1952'} • {chain.chainLength || 0} owners</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full border ${verification.bg} ${verification.border} ${verification.text}`}>
                        {chain.verificationStatus || 'partial'}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Chain Score</p>
                        <p className={`text-sm font-bold ${getChainStrength(chain.chainScore || 0)}`}>{chain.chainScore || 0}/100</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Current Value</p>
                        <p className="text-sm font-bold text-rose-400">${(chain.currentValue || 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Documents</p>
                        <p className="text-sm font-bold text-white">{chain.documentCount || 0}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Gaps</p>
                        <p className="text-sm font-bold text-amber-400">{chain.gaps || 0}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="grid gap-4">
              {chains.map((chain: any, idx: number) => (
                <div key={idx} className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">{chain.itemName || `Item ${idx + 1}`}</h3>
                    <div className="flex items-center gap-2">
                      {chain.verificationStatus === 'verified' ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Clock size={14} className="text-amber-400" />}
                      <span className={`text-sm ${chain.verificationStatus === 'verified' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {chain.verificationStatus === 'verified' ? 'Fully Verified' : 'Pending Review'}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Verification Progress</span>
                      <span className="text-rose-400">{chain.verificationProgress || 75}%</span>
                    </div>
                    <div className="w-full bg-slate-700/30 rounded-full h-2">
                      <div className="bg-rose-500 rounded-full h-2 transition-all" style={{ width: `${chain.verificationProgress || 75}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Sources</p>
                      <p className="text-sm font-bold text-rose-400">{chain.verifiedSources || 3}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Auction Records</p>
                      <p className="text-sm font-bold text-blue-400">{chain.auctionRecords || 2}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Premium</p>
                      <p className="text-sm font-bold text-emerald-400">+{chain.provenancePremium || 15}%</p>
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

export default VintageProvenanceModal;
