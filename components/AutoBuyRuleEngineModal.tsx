// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  X,
  Bot,
  List,
  BarChart3,
  Play,
  Pause,
  Clock,
  DollarSign,
  Target,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Activity,
  Settings,
  Bell,
  Shield,
} from 'lucide-react';
import {
  getBuyRules,
  getTriggerLogs,
  getRuleEngineStats,
} from '../lib/trading/autoBuyRuleEngineService';

interface AutoBuyRuleEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'rules' | 'trigger_log' | 'stats';

const tabs = [
  { id: 'rules' as TabId, label: 'Rules', icon: <Settings size={16} /> },
  { id: 'trigger_log' as TabId, label: 'Trigger Log', icon: <List size={16} /> },
  { id: 'stats' as TabId, label: 'Stats', icon: <BarChart3 size={16} /> },
];

const AutoBuyRuleEngineModal: React.FC<AutoBuyRuleEngineModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('rules');

  const rules = useMemo(() => getBuyRules(), []);
  const triggerLogs = useMemo(() => getTriggerLogs(), []);
  const stats = useMemo(() => getRuleEngineStats(), []);

  if (!isOpen) return null;

  const enabledRules = rules.filter((r: any) => r.enabled !== false && r.status !== 'disabled');
  const disabledRules = rules.filter((r: any) => r.enabled === false || r.status === 'disabled');

  const renderRules = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Bot size={14} className="text-lime-400" />
            <span className="text-xs text-slate-400">Total Rules</span>
          </div>
          <p className="text-2xl font-bold text-slate-100">{stats.totalRules ?? rules.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Play size={14} className="text-green-400" />
            <span className="text-xs text-slate-400">Active</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.activeRules ?? enabledRules.length}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-amber-400" />
            <span className="text-xs text-slate-400">Triggers Today</span>
          </div>
          <p className="text-2xl font-bold text-amber-400">{stats.triggersToday ?? 0}</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={14} className="text-green-400" />
            <span className="text-xs text-slate-400">Total Spent</span>
          </div>
          <p className="text-2xl font-bold text-green-400">${(stats.totalSpent ?? 0).toLocaleString()}</p>
        </div>
      </div>

      {enabledRules.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Active Rules
          </h3>
          {enabledRules.map((rule: any) => (
            <div key={rule.id} className="bg-slate-800/50 rounded-xl p-5 border border-green-500/20">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Play size={16} className="text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-200">{rule.name ?? rule.ruleName}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{rule.description ?? ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                    Enabled
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <p className="text-xs text-slate-500">Max Price</p>
                  <p className="text-sm font-semibold text-slate-200">${(rule.maxPrice ?? rule.priceLimit ?? 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Target</p>
                  <p className="text-sm font-semibold text-slate-200">{rule.target ?? rule.cardTarget ?? rule.player ?? 'Any'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Triggers</p>
                  <p className="text-sm font-semibold text-slate-200">{rule.triggerCount ?? rule.totalTriggers ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Budget Left</p>
                  <p className="text-sm font-semibold text-amber-400">${(rule.budgetRemaining ?? rule.remainingBudget ?? 0).toLocaleString()}</p>
                </div>
              </div>
              {rule.conditions && (
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(rule.conditions) ? rule.conditions : []).map((cond: any, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded text-xs">
                      {typeof cond === 'string' ? cond : cond.label ?? cond.type ?? ''}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {disabledRules.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Disabled Rules
          </h3>
          {disabledRules.map((rule: any) => (
            <div key={rule.id} className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/30 opacity-60">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-700/50">
                    <Pause size={16} className="text-slate-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300">{rule.name ?? rule.ruleName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{rule.description ?? ''}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-500">
                  Disabled
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTriggerLog = () => (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
        Trigger History
      </h3>
      {triggerLogs.map((log: any) => (
        <div key={log.id} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                (log.status ?? log.result ?? 'success') === 'success' || (log.status ?? log.result) === 'executed'
                  ? 'bg-green-500/20' :
                (log.status ?? log.result ?? '') === 'failed' || (log.status ?? log.result) === 'error'
                  ? 'bg-red-500/20' : 'bg-amber-500/20'
              }`}>
                {(log.status ?? log.result ?? 'success') === 'success' || (log.status ?? log.result) === 'executed'
                  ? <CheckCircle2 size={16} className="text-green-400" />
                  : (log.status ?? log.result ?? '') === 'failed' || (log.status ?? log.result) === 'error'
                  ? <XCircle size={16} className="text-red-400" />
                  : <AlertTriangle size={16} className="text-amber-400" />}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">{log.ruleName ?? log.name ?? log.cardName}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{log.description ?? log.message ?? ''}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                (log.status ?? log.result ?? 'success') === 'success' || (log.status ?? log.result) === 'executed'
                  ? 'bg-green-500/20 text-green-400' :
                (log.status ?? log.result ?? '') === 'failed' || (log.status ?? log.result) === 'error'
                  ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {log.status ?? log.result ?? 'success'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-slate-500">Card</p>
              <p className="text-sm font-semibold text-slate-200">{log.cardName ?? log.card ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Price</p>
              <p className="text-sm font-semibold text-slate-200">${(log.price ?? log.amount ?? 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Platform</p>
              <p className="text-sm font-semibold text-slate-200">{log.platform ?? 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Time</p>
              <p className="text-sm font-semibold text-slate-200 flex items-center gap-1">
                <Clock size={10} /> {log.timestamp ?? log.time ?? log.date ?? 'N/A'}
              </p>
            </div>
          </div>
        </div>
      ))}

      {triggerLogs.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Bell size={32} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm">No triggers recorded yet</p>
          <p className="text-xs mt-1">Buy rule triggers will appear here when conditions are met</p>
        </div>
      )}
    </div>
  );

  const renderStats = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400 mb-2 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
            <p className="text-2xl font-bold text-slate-100">
              {typeof value === 'number'
                ? (key.toLowerCase().includes('spent') || key.toLowerCase().includes('saved') || key.toLowerCase().includes('value')
                  ? `$${value.toLocaleString()}`
                  : value % 1 !== 0 ? value.toFixed(1) : value)
                : String(value)}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
        <h3 className="text-sm font-semibold text-slate-300 mb-4">Rule Performance</h3>
        <div className="space-y-3">
          {[
            { label: 'Successful Triggers', count: stats.successfulTriggers ?? 0, total: stats.totalTriggers ?? 1, color: 'bg-green-500' },
            { label: 'Failed Triggers', count: stats.failedTriggers ?? 0, total: stats.totalTriggers ?? 1, color: 'bg-red-500' },
            { label: 'Skipped', count: stats.skippedTriggers ?? 0, total: stats.totalTriggers ?? 1, color: 'bg-amber-500' },
          ].map((tier, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-xs text-slate-400 w-32">{tier.label}</span>
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${tier.color}`}
                  style={{ width: `${tier.total > 0 ? (tier.count / tier.total) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 w-8 text-right">{tier.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-lime-500/10 rounded-xl p-5 border border-lime-500/30">
        <div className="flex items-center gap-2 mb-3">
          <Target size={16} className="text-lime-400" />
          <p className="text-sm font-semibold text-lime-300">Rule Engine Tips</p>
        </div>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-xs text-slate-300">
            <ArrowUpRight size={12} className="text-lime-400 mt-0.5 flex-shrink-0" />
            Set daily budget limits to prevent overexposure during volatile markets
          </li>
          <li className="flex items-start gap-2 text-xs text-slate-300">
            <ArrowUpRight size={12} className="text-lime-400 mt-0.5 flex-shrink-0" />
            Combine price and condition rules for the most precise targeting
          </li>
          <li className="flex items-start gap-2 text-xs text-slate-300">
            <ArrowUpRight size={12} className="text-lime-400 mt-0.5 flex-shrink-0" />
            Review trigger logs weekly to refine rules and improve hit rates
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
              <Bot size={24} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Auto-Buy Rule Engine</h2>
              <p className="text-sm text-slate-400">Configure automated purchase rules with smart triggers</p>
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
          {activeTab === 'rules' && renderRules()}
          {activeTab === 'trigger_log' && renderTriggerLog()}
          {activeTab === 'stats' && renderStats()}
        </div>
      </div>
    </div>
  );
};

export default AutoBuyRuleEngineModal;
