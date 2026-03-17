import React, { useState, useMemo } from 'react';
import {
  Award, Users, DollarSign, TrendingDown, Clock, Package,
  CheckCircle, Zap, BarChart3, Shield, Truck,
} from 'lucide-react';
import {
  getGradingPools,
  getPoolHistory,
  getCollectiveGradingStats,
  getCompanyColor,
  getPoolStatusLabel,
  getPoolStatusColor,
} from '../lib/collectiveGradingService';

const CollectiveGrading: React.FC = () => {
  const pools = useMemo(() => getGradingPools(), []);
  const history = useMemo(() => getPoolHistory(), []);
  const stats = useMemo(() => getCollectiveGradingStats(), []);
  const [activeTab, setActiveTab] = useState<'pools' | 'history'>('pools');
  const [selectedPool, setSelectedPool] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Award size={22} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Collective Grading Submissions</h1>
              <p className="text-slate-400 text-sm">
                Pool grading submissions for volume discounts, shared shipping, and negotiated turnaround
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Award, color: 'text-emerald-400', label: 'Pools Joined', value: stats.totalPoolsJoined },
            { icon: DollarSign, color: 'text-green-400', label: 'Total Saved', value: `$${stats.totalMoneySaved}` },
            { icon: TrendingDown, color: 'text-cyan-400', label: 'Avg Savings', value: `${stats.avgSavingsPercent}%` },
            { icon: Clock, color: 'text-amber-400', label: 'Avg Turnaround', value: `${stats.avgTurnaroundDays}d` },
          ].map((s, i) => (
            <div key={i} className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={16} className={s.color} />
                <span className="text-slate-400 text-xs uppercase tracking-wide">{s.label}</span>
              </div>
              <p className="text-white font-bold text-3xl">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {(['pools', 'history'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                activeTab === tab ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}>{tab === 'pools' ? `Active Pools (${pools.length})` : `History (${history.length})`}</button>
          ))}
        </div>

        {activeTab === 'pools' && (
          <div className="space-y-4">
            {pools.map(pool => {
              const isSelected = selectedPool === pool.id;
              return (
                <div key={pool.id} onClick={() => setSelectedPool(isSelected ? null : pool.id)}
                  className={`bg-slate-900 rounded-xl border cursor-pointer transition-all hover:border-emerald-500/50 ${
                    isSelected ? 'border-emerald-500/70 ring-1 ring-emerald-500/30' : 'border-slate-800'
                  }`}>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-semibold text-sm">{pool.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getCompanyColor(pool.gradingCompany)}`}>{pool.gradingCompany}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getPoolStatusColor(pool.status)}`}>{getPoolStatusLabel(pool.status)}</span>
                          <span className="text-slate-500 text-xs capitalize">{pool.serviceTier}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold text-lg">-{pool.savingsPercent}%</p>
                        <p className="text-slate-500 text-xs">vs individual</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-3 mb-3">
                      <div><p className="text-slate-500 text-[10px] uppercase">Individual</p><p className="text-red-400 font-bold line-through">${pool.individualPrice}</p></div>
                      <div><p className="text-slate-500 text-[10px] uppercase">Pool Price</p><p className="text-green-400 font-bold">${pool.poolPrice}</p></div>
                      <div><p className="text-slate-500 text-[10px] uppercase">Save/Card</p><p className="text-emerald-400 font-bold">${pool.savingsPerCard}</p></div>
                      <div><p className="text-slate-500 text-[10px] uppercase">Total Saved</p><p className="text-white font-bold">${pool.totalSavings}</p></div>
                    </div>

                    {/* Fill Progress */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-500 text-[10px]">{pool.currentCards} / {pool.maxCards} cards ({pool.participants} participants)</span>
                        <span className="text-slate-500 text-[10px]">Min: {pool.minCards}</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(pool.currentCards / pool.maxCards) * 100}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span><Clock size={12} className="inline mr-1" />Deadline: {pool.deadline}</span>
                      <span><Truck size={12} className="inline mr-1" />Est. return: {pool.estimatedReturn}</span>
                      <span>Shipping: ${pool.shippingCostPerPerson}/person</span>
                    </div>
                  </div>

                  {isSelected && pool.submissions.length > 0 && (
                    <div className="border-t border-slate-800 p-5 bg-slate-900/70">
                      <h4 className="text-emerald-400 font-semibold text-xs uppercase tracking-wide mb-3">Submissions</h4>
                      <div className="space-y-2">
                        {pool.submissions.map(sub => (
                          <div key={sub.id} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3">
                            <div>
                              <p className="text-white text-xs font-semibold">{sub.cardName}</p>
                              <p className="text-slate-500 text-[10px]">@{sub.ownerHandle} • Expected: {sub.expectedGrade}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              {sub.actualGrade && <span className="text-emerald-400 text-xs font-bold">Grade: {sub.actualGrade}</span>}
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                sub.status === 'graded' ? 'bg-green-500/10 text-green-400' :
                                sub.status === 'accepted' ? 'bg-blue-500/10 text-blue-400' :
                                'bg-slate-500/10 text-slate-400'
                              }`}>{sub.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {history.map(h => (
              <div key={h.poolId} className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getCompanyColor(h.gradingCompany)}`}>{h.gradingCompany}</span>
                    <span className="text-slate-400 text-xs capitalize">{h.serviceTier}</span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">{h.completedDate} • {h.cardsSubmitted} total cards • {h.turnaroundDays}d turnaround</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right"><p className="text-white font-bold">{h.yourCards} cards</p><p className="text-slate-500 text-[10px]">Your cards</p></div>
                  <div className="text-right"><p className="text-green-400 font-bold">${h.yourSavings}</p><p className="text-slate-500 text-[10px]">Saved</p></div>
                  <div className="text-right"><p className="text-amber-400 font-bold">{h.avgGrade}</p><p className="text-slate-500 text-[10px]">Avg Grade</p></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectiveGrading;
