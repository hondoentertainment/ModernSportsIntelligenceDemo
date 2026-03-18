import React, { useState, useMemo } from 'react';
import {
  Package, Users, DollarSign, TrendingUp, Star, Clock,
  CheckCircle, Zap, BarChart3, Award,
} from 'lucide-react';
import {
  getGroupBreaks,
  getBreakHistory,
  getGroupBreakStats,
  getFormatLabel,
  getStatusColor,
} from '../lib/social/groupBreakService';

const GroupBreaks: React.FC = () => {
  const breaks = useMemo(() => getGroupBreaks(), []);
  const history = useMemo(() => getBreakHistory(), []);
  const stats = useMemo(() => getGroupBreakStats(), []);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [selectedBreak, setSelectedBreak] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <Package size={22} className="text-pink-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Group Break Planning & Cost Splitting</h1>
              <p className="text-slate-400 text-sm">
                Organize group breaks with automated cost splitting, hit tracking, and break history
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Package, color: 'text-pink-400', label: 'Breaks Joined', value: stats.totalBreaksJoined },
            { icon: DollarSign, color: 'text-emerald-400', label: 'Total Hit Value', value: `$${stats.totalHitValue.toLocaleString()}` },
            { icon: TrendingUp, color: 'text-green-400', label: 'Overall ROI', value: `+${stats.overallROI}%` },
            { icon: Award, color: 'text-amber-400', label: 'Best Break ROI', value: `+${stats.bestBreakROI}%` },
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
          {(['active', 'history'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                activeTab === tab ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
              }`}>
              {tab === 'active' ? `Active Breaks (${breaks.length})` : `History (${history.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'active' && (
          <div className="space-y-4">
            {breaks.map(brk => {
              const isSelected = selectedBreak === brk.id;
              return (
                <div key={brk.id}
                  onClick={() => setSelectedBreak(isSelected ? null : brk.id)}
                  className={`bg-slate-900 rounded-xl border cursor-pointer transition-all hover:border-pink-500/50 ${
                    isSelected ? 'border-pink-500/70 ring-1 ring-pink-500/30' : 'border-slate-800'
                  }`}>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-semibold text-sm">{brk.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(brk.status)}`}>{brk.status}</span>
                          <span className="text-slate-500 text-xs">{getFormatLabel(brk.format)}</span>
                          <span className="text-slate-500 text-xs">Host: @{brk.hostHandle}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">${brk.costPerSlot}/slot</p>
                        <p className="text-slate-500 text-xs">{brk.filledSlots}/{brk.totalSlots} filled</p>
                      </div>
                    </div>

                    {/* Fill Progress */}
                    <div className="mb-3">
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500 rounded-full transition-all" style={{ width: `${(brk.filledSlots / brk.totalSlots) * 100}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span><Clock size={12} className="inline mr-1" />{brk.scheduledDate}</span>
                      <span>Total: ${brk.totalCost.toLocaleString()}</span>
                      {brk.totalHitValue > 0 && <span className="text-emerald-400">Hit Value: ${brk.totalHitValue.toLocaleString()}</span>}
                      {brk.streamUrl && <span className="text-pink-400">Live Stream</span>}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="border-t border-slate-800 p-5 bg-slate-900/70">
                      <h4 className="text-pink-400 font-semibold text-xs uppercase tracking-wide mb-3">Slot Details</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                        {brk.slots.map(slot => (
                          <div key={slot.slotNumber} className={`rounded-lg p-3 text-center ${
                            slot.status === 'open' ? 'bg-slate-800/50 border border-dashed border-slate-700' :
                            slot.status === 'paid' ? 'bg-slate-800/50 border border-green-500/30' :
                            'bg-slate-800/50 border border-amber-500/30'
                          }`}>
                            <p className="text-white text-xs font-semibold">{slot.team || `Slot ${slot.slotNumber}`}</p>
                            <p className="text-slate-500 text-[10px]">{slot.claimedBy ? `@${slot.claimedBy}` : 'Open'}</p>
                            {slot.hitValue > 0 && <p className="text-emerald-400 text-[10px] font-bold">${slot.hitValue}</p>}
                          </div>
                        ))}
                      </div>

                      {brk.hits.length > 0 && (
                        <>
                          <h4 className="text-pink-400 font-semibold text-xs uppercase tracking-wide mb-2">Hits</h4>
                          <div className="space-y-2">
                            {brk.hits.map(hit => (
                              <div key={hit.id} className={`flex items-center justify-between bg-slate-800/50 rounded-lg p-3 ${hit.isHighlight ? 'border border-amber-500/30' : ''}`}>
                                <div className="flex items-center gap-2">
                                  {hit.isHighlight && <Star size={14} className="text-amber-400" />}
                                  <div>
                                    <p className="text-white text-xs font-semibold">{hit.cardName}</p>
                                    <p className="text-slate-500 text-[10px]">@{hit.recipientHandle} • {hit.timestamp}</p>
                                  </div>
                                </div>
                                <p className="text-emerald-400 font-bold text-sm">${hit.estimatedValue.toLocaleString()}</p>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
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
              <div key={h.breakId} className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-semibold text-sm">{h.product}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                    <span>{getFormatLabel(h.format)}</span>
                    <span>{h.date}</span>
                    <span>Top hit: {h.topHit}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Cost</p>
                      <p className="text-white font-bold">${h.yourSlotCost}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">Hits</p>
                      <p className="text-white font-bold">${h.yourHitValue}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase">ROI</p>
                      <p className={`font-bold ${h.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {h.roi >= 0 ? '+' : ''}{h.roi}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupBreaks;
