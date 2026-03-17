import React, { useState, useMemo } from 'react';
import {
  X,
  Bug,
  AlertTriangle,
  BookOpen,
  BarChart3,
  Star,
  DollarSign,
  Eye,
  Zap,
  Target,
  ArrowUpRight,
  Diamond,
  Sparkles,
  Bell,
  Info,
} from 'lucide-react';
import {
  getCardErrors,
  getErrorAlerts,
  getErrorStats,
} from '../lib/errorVarietyHunterService';

interface ErrorVarietyHunterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'catalog' | 'alerts' | 'guide';

const tabs = [
  { id: 'catalog' as TabId, label: 'Catalog', icon: <Bug size={16} /> },
  { id: 'alerts' as TabId, label: 'Alerts', icon: <Bell size={16} /> },
  { id: 'guide' as TabId, label: 'Guide', icon: <BookOpen size={16} /> },
];

const rarityStyles: Record<string, { bg: string; text: string; border: string }> = {
  'legendary': { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  'ultra_rare': { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  'rare': { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  'uncommon': { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  'common': { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
};

function getRarityStyle(rarity: string) {
  const key = rarity?.toLowerCase().replace(/[\s-]+/g, '_');
  return rarityStyles[key] ?? rarityStyles['common'];
}

const ErrorVarietyHunterModal: React.FC<ErrorVarietyHunterModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('catalog');

  const errors = useMemo(() => getCardErrors(), []);
  const alerts = useMemo(() => getErrorAlerts(), []);
  const stats = useMemo(() => getErrorStats(), []);

  if (!isOpen) return null;

  const renderCatalog = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Bug size={14} className="text-lime-400" />
            <span className="text-xs text-slate-400">Known Errors</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{stats.totalErrors ?? errors.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Diamond size={14} className="text-purple-400" />
            <span className="text-xs text-slate-400">Legendary</span>
          </div>
          <p className="text-2xl font-bold text-purple-400">{stats.legendaryCount ?? 0}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-green-400" />
            <span className="text-xs text-slate-400">Avg Premium</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.avgPremiumMultiplier ?? 0}x</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-amber-400" />
            <span className="text-xs text-slate-400">New Discoveries</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{stats.newDiscoveries ?? 0}</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          Error Card Catalog
        </h3>
        {errors.map((error: any) => {
          const rarStyle = getRarityStyle(error.rarity ?? error.rarityTier ?? 'common');
          return (
            <div key={error.id} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${rarStyle.bg}`}>
                    <Bug size={16} className={rarStyle.text} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{error.cardName ?? error.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${rarStyle.bg} ${rarStyle.text}`}>
                        {(error.rarity ?? error.rarityTier ?? 'common').replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-slate-500">{error.errorType ?? error.type ?? ''}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-400">{error.premiumMultiplier ?? error.multiplier ?? 1}x</p>
                  <p className="text-xs text-slate-500">Premium</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-3">{error.description ?? ''}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Base Value</p>
                  <p className="text-sm font-semibold text-slate-200">${(error.baseValue ?? 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Error Value</p>
                  <p className="text-sm font-semibold text-green-400">${(error.errorValue ?? error.premiumValue ?? 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Known Copies</p>
                  <p className="text-sm font-semibold text-slate-200">{error.knownCopies ?? error.population ?? 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Year</p>
                  <p className="text-sm font-semibold text-slate-200">{error.year ?? 'N/A'}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
        Error Card Alerts
      </h3>
      {alerts.map((alert: any) => (
        <div key={alert.id} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                (alert.priority ?? alert.severity ?? 'low') === 'high' ? 'bg-red-500/20' :
                (alert.priority ?? alert.severity ?? 'low') === 'medium' ? 'bg-amber-500/20' : 'bg-green-500/20'
              }`}>
                {(alert.priority ?? alert.severity ?? 'low') === 'high'
                  ? <AlertTriangle size={16} className="text-red-400" />
                  : <Bell size={16} className="text-amber-400" />}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">{alert.title ?? alert.cardName}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{alert.message ?? alert.description ?? ''}</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              (alert.priority ?? alert.severity ?? 'low') === 'high' ? 'bg-red-500/20 text-red-400' :
              (alert.priority ?? alert.severity ?? 'low') === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'
            }`}>
              {alert.priority ?? alert.severity ?? 'low'}
            </span>
          </div>
          {alert.potentialValue && (
            <div className="flex items-center gap-2 text-xs text-green-400">
              <DollarSign size={12} />
              <span>Potential value: ${alert.potentialValue.toLocaleString()}</span>
            </div>
          )}
        </div>
      ))}

      {alerts.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Bell size={32} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">No active alerts</p>
          <p className="text-xs mt-1">New error card discoveries will appear here</p>
        </div>
      )}
    </div>
  );

  const renderGuide = () => (
    <div className="space-y-6">
      <div className="bg-lime-500/10 rounded-xl p-5 border border-lime-500/30">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={16} className="text-lime-400" />
          <p className="text-sm font-semibold text-lime-300">Error Card Identification Guide</p>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Error cards are produced due to manufacturing mistakes and can command significant premiums.
          Identifying and authenticating these cards requires careful examination.
        </p>
      </div>

      <div className="space-y-3">
        {[
          { title: 'Print Errors', icon: <Bug size={16} className="text-red-400" />, examples: ['Wrong back (different player on reverse)', 'Missing foil or coating', 'Double-printed text or images', 'Miscut or off-center printing'], multiplier: '2-10x' },
          { title: 'Photo Variations', icon: <Eye size={16} className="text-purple-400" />, examples: ['Reversed negative (flipped image)', 'Wrong player photo', 'Airbrushed logos or uniforms', 'Pre-production photo used'], multiplier: '3-20x' },
          { title: 'Name/Stat Errors', icon: <Info size={16} className="text-amber-400" />, examples: ['Misspelled names', 'Wrong statistics listed', 'Incorrect team attribution', 'Wrong card number'], multiplier: '1.5-5x' },
          { title: 'Rare Varieties', icon: <Star size={16} className="text-lime-400" />, examples: ['No-name plate variations', 'Color swap parallels (unannounced)', 'Test prints and proofs', 'Blank backs or missing serial numbers'], multiplier: '5-50x' },
        ].map((section, idx) => (
          <div key={idx} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {section.icon}
                <h4 className="text-sm font-semibold text-slate-200">{section.title}</h4>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                {section.multiplier} premium
              </span>
            </div>
            <ul className="space-y-1.5">
              {section.examples.map((ex, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <Zap size={10} className="text-lime-400 mt-0.5 flex-shrink-0" />
                  {ex}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-amber-500/10 rounded-xl p-5 border border-amber-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Target size={16} className="text-amber-400" />
          <p className="text-sm font-semibold text-amber-300">Authentication Tips</p>
        </div>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-xs text-slate-300">
            <ArrowUpRight size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
            Always get suspected error cards authenticated by PSA, BGS, or SGC
          </li>
          <li className="flex items-start gap-2 text-xs text-slate-300">
            <ArrowUpRight size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
            Compare against known examples using the error card database
          </li>
          <li className="flex items-start gap-2 text-xs text-slate-300">
            <ArrowUpRight size={12} className="text-amber-400 mt-0.5 flex-shrink-0" />
            Document the error thoroughly with high-resolution photographs
          </li>
        </ul>
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
              <Bug size={24} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Error & Variety Hunter</h2>
              <p className="text-sm text-slate-400">Discover and track error cards with premium multipliers</p>
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
          {activeTab === 'catalog' && renderCatalog()}
          {activeTab === 'alerts' && renderAlerts()}
          {activeTab === 'guide' && renderGuide()}
        </div>
      </div>
    </div>
  );
};

export default ErrorVarietyHunterModal;
