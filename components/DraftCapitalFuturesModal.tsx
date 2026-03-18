import React, { useState, useMemo } from 'react';
import {
  X,
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  Zap,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  DollarSign,
  Percent,
  Shield,
  GitBranch,
} from 'lucide-react';
import {
  getProspects,
  getScenarios,
  getPositions,
  getProjections,
  getDraftStats,
  type PositionGroup,
  type ProjectionConfidence,
} from '../lib/utils/draftCapitalFuturesService';

interface DraftCapitalFuturesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'prospect-board' | 'draft-scenarios' | 'futures-positions' | 'projections';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'prospect-board', label: 'Prospect Board', icon: <Users size={16} /> },
  { id: 'draft-scenarios', label: 'Draft Scenarios', icon: <GitBranch size={16} /> },
  { id: 'futures-positions', label: 'Futures Positions', icon: <DollarSign size={16} /> },
  { id: 'projections', label: 'Projections', icon: <BarChart3 size={16} /> },
];

const posColorMap: Record<PositionGroup, string> = {
  QB: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  RB: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  WR: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  TE: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  OL: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  DL: 'text-red-400 bg-red-500/10 border-red-500/30',
  LB: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  DB: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  K: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  P: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
};

const confConfig: Record<ProjectionConfidence, { label: string; color: string; bg: string; border: string }> = {
  high: { label: 'High', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  medium: { label: 'Medium', color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30' },
  low: { label: 'Low', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
};

// ---- Tab: Prospect Board ----

const ProspectBoardTab: React.FC = () => {
  const prospects = useMemo(() => getProspects(), []);
  const sorted = useMemo(() => [...prospects].sort((a, b) => a.projectedPick - b.projectedPick), [prospects]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Top Prospects</p>
        <div className="space-y-2">
          {sorted.map(p => {
            const uplift = ((p.cardPostDraftEstimate - p.cardPreDraftValue) / p.cardPreDraftValue * 100);
            return (
              <div key={p.id} className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800/60 transition-all">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bebas text-xl">
                    #{p.projectedPick}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-white font-medium">{p.name}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${posColorMap[p.position]}`}>
                        {p.position}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500">{p.school} &bull; Comp: {p.comparisonPlayer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bebas tracking-wider text-emerald-300">{p.overallGrade}</p>
                    <p className="text-[9px] text-slate-500">Grade</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-3">
                  {p.keyStats.map(stat => (
                    <div key={stat.label} className="p-2 bg-slate-800/50 rounded-lg text-center">
                      <p className="text-[8px] text-slate-500 uppercase">{stat.label}</p>
                      <p className="text-xs font-bold text-white">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-700/30">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500">Pre-Draft:</span>
                      <span className="text-xs font-mono text-white">${p.cardPreDraftValue}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500">Post-Draft Est.:</span>
                      <span className="text-xs font-mono text-emerald-400">${p.cardPostDraftEstimate}</span>
                    </div>
                    <span className={`text-xs font-mono font-bold ${uplift > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      +{uplift.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Zap size={10} className="text-amber-400" />
                      <span className="text-[10px] text-slate-500">Hype: <span className="text-white">{p.hypeScore}</span></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield size={10} className="text-red-400" />
                      <span className="text-[10px] text-slate-500">Risk: <span className="text-white">{p.riskScore}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---- Tab: Draft Scenarios ----

const DraftScenariosTab: React.FC = () => {
  const scenarios = useMemo(() => getScenarios(), []);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Scenario Modeling</p>
        <div className="space-y-3">
          {scenarios.map(s => {
            const probPct = s.probability * 100;
            return (
              <div key={s.id} className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800/60 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <GitBranch size={14} className="text-emerald-400" />
                    <p className="text-sm text-white font-medium">{s.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${probPct > 50 ? 'bg-emerald-500' : probPct > 25 ? 'bg-teal-500' : 'bg-slate-500'}`} style={{ width: `${probPct}%` }} />
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-300">{probPct.toFixed(0)}%</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">{s.description}</p>
                <div className="p-2.5 bg-slate-800/50 rounded-lg mb-3">
                  <p className="text-[9px] text-slate-500 uppercase mb-0.5">Trigger Condition</p>
                  <p className="text-xs text-emerald-300">{s.triggerCondition}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[9px] text-slate-500 uppercase">Impacted Prospects</p>
                  {s.impactedProspects.map(ip => (
                    <div key={ip.prospectId} className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg">
                      <span className="text-xs text-white">{ip.prospectName}</span>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-mono ${ip.pickChange > 0 ? 'text-green-400' : ip.pickChange < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                          Pick: {ip.pickChange > 0 ? '+' : ''}{ip.pickChange}
                        </span>
                        <span className={`text-xs font-mono font-bold ${ip.valueImpact > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {ip.valueImpact > 0 ? '+' : ''}{ip.valueImpact}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---- Tab: Futures Positions ----

const FuturesPositionsTab: React.FC = () => {
  const positions = useMemo(() => getPositions(), []);
  const draftStats = useMemo(() => getDraftStats(), []);

  const totalPnL = positions.reduce((a, b) => a + b.unrealizedPnL, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Open Positions</p>
          <p className="text-2xl font-bebas tracking-wider text-white">{draftStats.openPositions}</p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Total Exposure</p>
          <p className="text-2xl font-bebas tracking-wider text-white">${draftStats.totalExposure.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Unrealized P&L</p>
          <p className={`text-2xl font-bebas tracking-wider ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalPnL >= 0 ? '+' : '-'}${Math.abs(totalPnL).toLocaleString()}
          </p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Days to Draft</p>
          <p className="text-2xl font-bebas tracking-wider text-emerald-400">{draftStats.daysUntilDraft}</p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Position Tracker</p>
        <div className="space-y-2">
          {positions.map(pos => {
            const pnlPct = ((pos.currentPrice - pos.entryPrice) / pos.entryPrice * 100) * (pos.positionType === 'short' ? -1 : 1);
            const notionalValue = pos.currentPrice * pos.quantity * pos.leverage;
            return (
              <div key={pos.id} className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800/60 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {pos.positionType === 'long' ? (
                      <ArrowUpRight size={14} className="text-green-400" />
                    ) : (
                      <ArrowDownRight size={14} className="text-red-400" />
                    )}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${pos.positionType === 'long' ? 'text-green-400 bg-green-500/10 border-green-500/30' : 'text-red-400 bg-red-500/10 border-red-500/30'}`}>
                      {pos.positionType}
                    </span>
                    <p className="text-sm text-white font-medium">{pos.prospectName}</p>
                  </div>
                  <span className={`text-lg font-bebas tracking-wider ${pos.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {pos.unrealizedPnL >= 0 ? '+' : '-'}${Math.abs(pos.unrealizedPnL)}
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-3">
                  <div className="text-center">
                    <p className="text-[9px] text-slate-500 uppercase">Entry</p>
                    <p className="text-xs font-mono text-white">${pos.entryPrice}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-slate-500 uppercase">Current</p>
                    <p className="text-xs font-mono text-white">${pos.currentPrice}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-slate-500 uppercase">Qty</p>
                    <p className="text-xs font-mono text-white">{pos.quantity}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-slate-500 uppercase">Leverage</p>
                    <p className="text-xs font-mono text-emerald-400">{pos.leverage}x</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-slate-500 uppercase">Notional</p>
                    <p className="text-xs font-mono text-white">${notionalValue.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-slate-500 uppercase">Return</p>
                    <p className={`text-xs font-mono font-bold ${pnlPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/30">
                  <span className="text-[10px] text-slate-500">Opened: {pos.openDate}</span>
                  <span className="text-[10px] text-slate-500">Expires: {pos.expirationDate}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${pos.status === 'open' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' : 'text-slate-400 bg-slate-500/10 border border-slate-500/30'}`}>
                    {pos.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---- Tab: Projections ----

const ProjectionsTab: React.FC = () => {
  const projections = useMemo(() => getProjections(), []);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Draft Night Card Value Projections</p>
        <div className="space-y-3">
          {projections.map(proj => {
            const cCfg = confConfig[proj.confidence];
            const maxVal = proj.bestCase.cardValue;
            const bestWidth = 100;
            const baseWidth = (proj.baseCase.cardValue / maxVal) * 100;
            const worstWidth = (proj.worstCase.cardValue / maxVal) * 100;
            return (
              <div key={proj.id} className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-xl hover:bg-slate-800/60 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Trophy size={14} className="text-emerald-400" />
                    <p className="text-sm text-white font-medium">{proj.prospectName}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${cCfg.color} ${cCfg.bg} border ${cCfg.border}`}>
                      {cCfg.label} Conf.
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">Updated: {proj.lastUpdated}</span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-green-400 w-14">Best</span>
                    <span className="text-[10px] text-slate-500 w-14">Pick #{proj.bestCase.pick}</span>
                    <div className="flex-1 h-4 bg-slate-800/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500/60" style={{ width: `${bestWidth}%` }} />
                    </div>
                    <span className="text-xs font-mono text-green-400 w-16 text-right">${proj.bestCase.cardValue}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-300 w-14">Base</span>
                    <span className="text-[10px] text-slate-500 w-14">Pick #{proj.baseCase.pick}</span>
                    <div className="flex-1 h-4 bg-slate-800/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-teal-500/60" style={{ width: `${baseWidth}%` }} />
                    </div>
                    <span className="text-xs font-mono text-white w-16 text-right">${proj.baseCase.cardValue}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-red-400 w-14">Worst</span>
                    <span className="text-[10px] text-slate-500 w-14">Pick #{proj.worstCase.pick}</span>
                    <div className="flex-1 h-4 bg-slate-800/50 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-slate-500/60" style={{ width: `${worstWidth}%` }} />
                    </div>
                    <span className="text-xs font-mono text-red-400 w-16 text-right">${proj.worstCase.cardValue}</span>
                  </div>
                </div>

                <div>
                  <p className="text-[9px] text-slate-500 uppercase mb-1.5">Key Drivers</p>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.keyDrivers.map(driver => (
                      <span key={driver} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/20">
                        {driver}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Target size={16} className="text-emerald-400" />
          <p className="text-xs font-bold text-emerald-300">Expected Value Summary</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {projections.slice(0, 3).map(proj => {
            const ev = proj.baseCase.cardValue;
            const spread = proj.bestCase.cardValue - proj.worstCase.cardValue;
            return (
              <div key={proj.id} className="p-3 bg-slate-800/50 rounded-xl">
                <p className="text-xs text-white font-medium mb-1">{proj.prospectName}</p>
                <p className="text-lg font-bebas tracking-wider text-emerald-300">${ev}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] text-slate-500">Spread:</span>
                  <span className="text-[10px] font-mono text-slate-300">${spread}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ---- Main Modal ----

const DraftCapitalFuturesModal: React.FC<DraftCapitalFuturesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('prospect-board');
  const draftStats = useMemo(() => getDraftStats(), []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-700 bg-gradient-to-r from-emerald-500/10 to-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30 text-emerald-400">
                <Trophy size={24} />
              </div>
              <div>
                <h2 className="text-3xl font-bebas tracking-widest text-white leading-tight">
                  Draft Capital <span className="text-emerald-400">Futures</span> Engine
                </h2>
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
                  Pre-draft card market &bull; {draftStats.totalProspects} prospects tracked
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all">
              <X size={24} />
            </button>
          </div>
          <div className="flex items-center gap-4 mt-5 p-3 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <div className="flex items-center gap-1.5 text-xs">
              <Clock size={14} className="text-emerald-400" />
              <span className="text-slate-400">Draft In:</span>
              <span className="font-bebas text-lg text-emerald-400 tracking-wider">{draftStats.daysUntilDraft} days</span>
            </div>
            <div className="h-5 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5 text-xs">
              <Layers size={14} className="text-emerald-400" />
              <span className="text-slate-400">Positions:</span>
              <span className="font-bebas text-lg text-white tracking-wider">{draftStats.openPositions}</span>
            </div>
            <div className="h-5 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5 text-xs">
              <DollarSign size={14} className="text-emerald-400" />
              <span className="text-slate-400">Exposure:</span>
              <span className="font-bebas text-lg text-white tracking-wider">${draftStats.totalExposure.toLocaleString()}</span>
            </div>
            <div className="h-5 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5 text-xs">
              <TrendingUp size={14} className={draftStats.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'} />
              <span className="text-slate-400">P&L:</span>
              <span className={`font-bebas text-lg tracking-wider ${draftStats.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {draftStats.unrealizedPnL >= 0 ? '+' : '-'}${Math.abs(draftStats.unrealizedPnL).toLocaleString()}
              </span>
            </div>
            <div className="ml-auto text-xs text-slate-400">
              Avg Hype: <span className="text-white font-medium">{draftStats.avgHypeScore}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 px-8 pt-4 border-b border-slate-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-emerald-400 border-emerald-400'
                  : 'text-slate-500 border-transparent hover:text-white hover:border-slate-600'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-8">
          {activeTab === 'prospect-board' && <ProspectBoardTab />}
          {activeTab === 'draft-scenarios' && <DraftScenariosTab />}
          {activeTab === 'futures-positions' && <FuturesPositionsTab />}
          {activeTab === 'projections' && <ProjectionsTab />}
        </div>
      </div>
    </div>
  );
};

export default DraftCapitalFuturesModal;
