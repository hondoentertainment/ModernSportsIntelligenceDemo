import React, { useState, useMemo } from 'react';
import { X, FileCheck, TrendingUp, DollarSign, Calendar, Users, Briefcase } from 'lucide-react';
import { getContractImpacts, getFreeAgents } from '../lib/contractValuationService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ContractValuationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('contracts');
  const contracts = useMemo(() => getContractImpacts(), []);
  const freeAgents = useMemo(() => getFreeAgents(), []);

  if (!isOpen) return null;

  const tabs = [
    { id: 'contracts', label: 'Contracts', count: contracts.length },
    { id: 'free-agents', label: 'Free Agents', count: freeAgents.length },
  ];

  const formatMoney = (n: number) => {
    if (n >= 1000000000) return `$${(n / 1000000000).toFixed(1)}B`;
    if (n >= 1000000) return `$${(n / 1000000).toFixed(0)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n.toLocaleString()}`;
  };

  const getSportColor = (sport: string) => {
    if (sport === 'NBA') return 'text-orange-400 bg-orange-400/10';
    if (sport === 'NFL') return 'text-blue-400 bg-blue-400/10';
    if (sport === 'MLB') return 'text-red-400 bg-red-400/10';
    if (sport === 'NHL') return 'text-cyan-400 bg-cyan-400/10';
    return 'text-violet-400 bg-violet-400/10';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/20 rounded-xl">
              <FileCheck className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Contract Valuation</h2>
              <p className="text-sm text-slate-400">Track how player contracts impact card values</p>
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
                  ? 'bg-slate-800 text-violet-400 border-b-2 border-violet-400'
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
          {activeTab === 'contracts' && (
            <div className="space-y-4">
              {contracts.map((c) => (
                <div key={c.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{c.playerName}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                        <span>{c.team}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getSportColor(c.sport)}`}>{c.sport}</span>
                        <span className="text-slate-600">|</span>
                        <span>{c.contractType}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium text-violet-400 bg-violet-400/10">
                      <TrendingUp className="w-4 h-4" />
                      +{c.cardImpact}% card impact
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Total Value</div>
                      <div className="text-violet-400 font-bold">{formatMoney(c.contractValue)}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Years</div>
                      <div className="text-white font-bold">{c.years}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Annual Avg</div>
                      <div className="text-emerald-400 font-bold">{formatMoney(c.annualAvg)}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Date</div>
                      <div className="text-slate-300 font-medium text-sm">{c.date}</div>
                    </div>
                  </div>
                  <div className="bg-violet-500/5 border border-violet-500/20 rounded-lg p-3">
                    <p className="text-sm text-violet-300">{c.analysis}</p>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    Cards: {c.affectedCards.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'free-agents' && (
            <div className="space-y-3">
              {freeAgents.map((fa) => (
                <div key={fa.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{fa.playerName}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                        <span>{fa.currentTeam}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getSportColor(fa.sport)}`}>{fa.sport}</span>
                        <span>{fa.position} — Age {fa.age}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Volatility</div>
                      <div className={`font-bold ${fa.cardVolatility > 20 ? 'text-red-400' : 'text-amber-400'}`}>{fa.cardVolatility}%</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Proj. Contract</div>
                      <div className="text-violet-400 font-bold text-sm">{formatMoney(fa.projectedContract)}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Proj. Years</div>
                      <div className="text-white font-bold">{fa.projectedYears}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Card Now</div>
                      <div className="text-slate-300 font-bold text-sm">${fa.currentCardValue}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Card Proj.</div>
                      <div className="text-emerald-400 font-bold text-sm">${fa.projectedCardValue}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Suitors</div>
                      <div className="text-blue-400 text-xs font-medium">{fa.topSuitors.join(', ')}</div>
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

export default ContractValuationModal;
