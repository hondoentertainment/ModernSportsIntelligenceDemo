// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  X,
  Clock,
  Thermometer,
  BookOpen,
  BarChart3,
  AlertTriangle,
  TrendingDown,
  ArrowDownRight,
  Shield,
  Droplets,
  Sun,
  Wind,
  Info,
  CheckCircle2,
} from 'lucide-react';
import {
  getAgingSimulations,
  getStorageConditions,
  getAgingStats,
} from '../lib/utils/cardAgingSimulatorService';

interface CardAgingSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'simulations' | 'conditions' | 'guide';

const tabs = [
  { id: 'simulations' as TabId, label: 'Simulations', icon: <Clock size={16} /> },
  { id: 'conditions' as TabId, label: 'Conditions', icon: <Thermometer size={16} /> },
  { id: 'guide' as TabId, label: 'Guide', icon: <BookOpen size={16} /> },
];

function getGradeChangeColor(change: number): string {
  if (change >= 0) return 'text-green-400';
  if (change > -1) return 'text-amber-400';
  if (change > -2) return 'text-orange-400';
  return 'text-red-400';
}

const CardAgingSimulatorModal: React.FC<CardAgingSimulatorModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('simulations');

  const simulations = useMemo(() => getAgingSimulations(), []);
  const conditions = useMemo(() => getStorageConditions(), []);
  const stats = useMemo(() => getAgingStats(), []);

  if (!isOpen) return null;

  const renderSimulations = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-lime-400" />
            <span className="text-xs text-slate-400">Simulations</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{stats.totalSimulations ?? simulations.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={14} className="text-red-400" />
            <span className="text-xs text-slate-400">Avg Grade Loss</span>
          </div>
          <p className="text-2xl font-bold text-red-400">{stats.avgGradeLoss ?? '-0.8'}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-amber-400" />
            <span className="text-xs text-slate-400">At Risk Cards</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{stats.atRiskCards ?? 0}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={14} className="text-green-400" />
            <span className="text-xs text-slate-400">Properly Stored</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.properlyStored ?? 0}%</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Aging Projections
        </h3>
        {simulations.map((sim: any) => (
          <div key={sim.id} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-200">{sim.cardName ?? sim.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{sim.player ?? sim.set} | {sim.year ?? ''}</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${getGradeChangeColor(sim.gradeChange ?? sim.projectedGradeLoss ?? -1)}`}>
                  {(sim.gradeChange ?? sim.projectedGradeLoss ?? -1) > 0 ? '+' : ''}{sim.gradeChange ?? sim.projectedGradeLoss ?? '-1.0'}
                </p>
                <p className="text-xs text-slate-500">Grade Change</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
              <div>
                <p className="text-xs text-slate-500">Current Grade</p>
                <p className="text-sm font-semibold text-slate-200">{sim.currentGrade ?? 'PSA 9'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Projected Grade</p>
                <p className={`text-sm font-semibold ${getGradeChangeColor(sim.gradeChange ?? -1)}`}>{sim.projectedGrade ?? 'PSA 8'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Time Horizon</p>
                <p className="text-sm font-semibold text-slate-200">{sim.timeHorizon ?? sim.years ?? '5'} years</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Value Impact</p>
                <p className="text-sm font-semibold text-red-400 flex items-center gap-1">
                  <ArrowDownRight size={12} /> {sim.valueImpact ?? sim.valueLossPercent ?? '-15'}%
                </p>
              </div>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  Math.abs(sim.gradeChange ?? sim.projectedGradeLoss ?? 1) < 0.5 ? 'bg-green-500' :
                  Math.abs(sim.gradeChange ?? sim.projectedGradeLoss ?? 1) < 1.5 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(Math.abs(sim.gradeChange ?? sim.projectedGradeLoss ?? 1) * 25, 100)}%` }}
              />
            </div>
            {sim.factors && (
              <div className="mt-3 flex flex-wrap gap-2">
                {sim.factors.map((f: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded text-xs">{f}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderConditions = () => (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
        Storage Conditions
      </h3>
      {conditions.map((condition: any) => (
        <div key={condition.id} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                (condition.riskLevel ?? condition.risk ?? 'low') === 'low' ? 'bg-green-500/20' :
                (condition.riskLevel ?? condition.risk ?? 'medium') === 'medium' ? 'bg-amber-500/20' : 'bg-red-500/20'
              }`}>
                {condition.type === 'humidity' || condition.factor === 'humidity' ? <Droplets size={16} className="text-blue-400" /> :
                 condition.type === 'light' || condition.factor === 'light' ? <Sun size={16} className="text-amber-400" /> :
                 condition.type === 'temperature' || condition.factor === 'temperature' ? <Thermometer size={16} className="text-red-400" /> :
                 <Wind size={16} className="text-slate-400" />}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">{condition.name ?? condition.condition}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{condition.description ?? ''}</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              (condition.riskLevel ?? condition.risk ?? 'low') === 'low' ? 'bg-green-500/20 text-green-400' :
              (condition.riskLevel ?? condition.risk ?? 'medium') === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {condition.riskLevel ?? condition.risk ?? 'low'} risk
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500">Ideal Range</p>
              <p className="text-sm font-semibold text-slate-200">{condition.idealRange ?? condition.optimalRange ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Current</p>
              <p className="text-sm font-semibold text-slate-200">{condition.currentValue ?? condition.current ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Impact/Year</p>
              <p className="text-sm font-semibold text-red-400">{condition.annualImpact ?? condition.gradeLossPerYear ?? 'N/A'}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderGuide = () => (
    <div className="space-y-6">
      <div className="bg-lime-500/10 rounded-xl p-5 border border-lime-500/30">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={16} className="text-lime-400" />
          <p className="text-sm font-semibold text-lime-300">Card Preservation Guide</p>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Proper storage is the single most important factor in preserving card value over time.
          Below are best practices for minimizing grade degradation.
        </p>
      </div>

      <div className="space-y-3">
        {[
          { title: 'Temperature Control', icon: <Thermometer size={16} className="text-red-400" />, tips: ['Store between 65-72°F (18-22°C)', 'Avoid attics and garages with temperature swings', 'Never expose to direct heat sources'] },
          { title: 'Humidity Management', icon: <Droplets size={16} className="text-blue-400" />, tips: ['Maintain 40-50% relative humidity', 'Use silica gel packs in storage containers', 'Monitor with a digital hygrometer'] },
          { title: 'Light Protection', icon: <Sun size={16} className="text-amber-400" />, tips: ['Store away from direct sunlight', 'Use UV-protective sleeves for display cards', 'Keep in opaque containers when not displaying'] },
          { title: 'Physical Protection', icon: <Shield size={16} className="text-green-400" />, tips: ['Use penny sleeves as first layer', 'Place in rigid top-loaders or magnetic cases', 'Store vertically to prevent warping'] },
        ].map((section, idx) => (
          <div key={idx} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-3">
              {section.icon}
              <h4 className="text-sm font-semibold text-slate-200">{section.title}</h4>
            </div>
            <ul className="space-y-2">
              {section.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 size={12} className="text-lime-400 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-amber-500/10 rounded-xl p-5 border border-amber-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Info size={16} className="text-amber-400" />
          <p className="text-sm font-semibold text-amber-300">Grade Loss Timeline</p>
        </div>
        <div className="space-y-3">
          {[
            { years: '1-2 years', loss: 'Minimal (0-0.5 grade)', color: 'text-green-400' },
            { years: '3-5 years', loss: 'Slight (0.5-1.0 grade)', color: 'text-lime-400' },
            { years: '5-10 years', loss: 'Moderate (1.0-2.0 grades)', color: 'text-amber-400' },
            { years: '10+ years', loss: 'Significant (2.0+ grades)', color: 'text-red-400' },
          ].map((tier, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-slate-300">{tier.years}</span>
              <span className={`font-medium ${tier.color}`}>{tier.loss}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-500/20">
              <Clock size={24} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Card Aging Simulator</h2>
              <p className="text-sm text-slate-400">Project grade degradation and value impact over time</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
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

        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {activeTab === 'simulations' && renderSimulations()}
          {activeTab === 'conditions' && renderConditions()}
          {activeTab === 'guide' && renderGuide()}
        </div>
      </div>
    </div>
  );
};

export default CardAgingSimulatorModal;
