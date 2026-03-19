import React, { useState, useMemo, useCallback } from 'react';
import {
  X,
  Cog,
  Plus,
  Trash2,
  Play,
  Pause,
  FlaskConical,
  Zap,
  Clock,
  BarChart3,
  ListFilter,
  LayoutTemplate,
  History,
  ChevronDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { CardInventory } from '../types';
import {
  TradingRule,
  RuleTrigger,
  RuleCondition,
  RuleTemplate,
  BacktestResult,
  RuleStatus,
  ConditionType,
  ActionType,
  LogicOperator,
  loadRules,
  saveRules,
  loadTriggerHistory,
  getRuleTemplates,
  backtestRule,
  evaluateRules,
  CONDITION_LABELS,
  ACTION_LABELS,
} from '../lib/utils/rulesEngineService';

interface RulesEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardInventory[];
}

type TabId = 'rules' | 'create' | 'templates' | 'history';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'rules', label: 'Rules', icon: <ListFilter size={16} /> },
  { id: 'create', label: 'Create', icon: <Plus size={16} /> },
  { id: 'templates', label: 'Templates', icon: <LayoutTemplate size={16} /> },
  { id: 'history', label: 'History', icon: <History size={16} /> },
];

const STATUS_OPTIONS: { value: RuleStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'active', label: 'Active', icon: <Play size={12} />, color: 'text-green-400' },
  { value: 'paused', label: 'Paused', icon: <Pause size={12} />, color: 'text-slate-400' },
  { value: 'dry_run', label: 'Dry Run', icon: <FlaskConical size={12} />, color: 'text-amber-400' },
];

const CONDITION_TYPES: ConditionType[] = [
  'price_above', 'price_below', 'pct_change', 'roi_above',
  'roi_below', 'holding_days_above', 'anomaly_detected', 'breakout_score_above',
];

const ACTION_TYPES: ActionType[] = [
  'move_to_trade_block', 'generate_listing', 'create_alert',
  'add_to_consignment', 'notify', 'log_journal',
];

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function conditionSummary(conditions: RuleCondition[]): string {
  return conditions.map((c, i) => {
    const prefix = i > 0 ? ` ${c.operator} ` : '';
    return `${prefix}${CONDITION_LABELS[c.type]} ${c.value}`;
  }).join('');
}

// ---- Rules Tab ----

const RulesTab: React.FC<{
  rules: TradingRule[];
  onUpdateRules: (_rules: TradingRule[]) => void;
  onBacktest: (_rule: TradingRule) => void;
  onRunRule: (_rule: TradingRule) => void;
}> = ({ rules, onUpdateRules, onBacktest, onRunRule }) => {
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null);

  const handleStatusChange = (ruleId: string, newStatus: RuleStatus) => {
    const updated = rules.map(r =>
      r.id === ruleId ? { ...r, status: newStatus } : r
    );
    onUpdateRules(updated);
    setStatusDropdown(null);
  };

  const handleDelete = (ruleId: string) => {
    const updated = rules.filter(r => r.id !== ruleId);
    onUpdateRules(updated);
  };

  if (rules.length === 0) {
    return (
      <div className="text-center py-12">
        <Cog size={40} className="mx-auto text-slate-600 mb-4" />
        <p className="text-slate-400 text-sm mb-2">No rules configured yet</p>
        <p className="text-slate-600 text-xs">Create a rule or use a template to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rules.map(rule => {
        const statusOpt = STATUS_OPTIONS.find(s => s.value === rule.status)!;
        return (
          <div
            key={rule.id}
            className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3"
          >
            {/* Header Row */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-white truncate">{rule.name}</h4>
                  <span className="text-[10px] font-mono text-slate-600 flex-shrink-0">
                    P{rule.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  {conditionSummary(rule.conditions)}
                </p>
              </div>

              {/* Status Toggle */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setStatusDropdown(statusDropdown === rule.id ? null : rule.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                    rule.status === 'active'
                      ? 'bg-green-500/10 border-green-500/30 text-green-400'
                      : rule.status === 'dry_run'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-slate-500/10 border-slate-500/30 text-slate-400'
                  }`}
                >
                  {statusOpt.icon}
                  {statusOpt.label}
                  <ChevronDown size={12} />
                </button>
                {statusDropdown === rule.id && (
                  <div className="absolute z-50 right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl min-w-[120px]">
                    {STATUS_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => handleStatusChange(rule.id, opt.value)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-slate-700 transition-colors ${
                          opt.value === rule.status ? 'bg-slate-700/50' : ''
                        } ${opt.color}`}
                      >
                        {opt.icon}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action + Stats Row */}
            <div className="flex items-center gap-3 flex-wrap text-xs">
              <span className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold rounded-md">
                {ACTION_LABELS[rule.action.type]}
              </span>
              <span className="text-slate-500 flex items-center gap-1">
                <Zap size={11} />
                {rule.triggerCount} triggers
              </span>
              {rule.lastTriggered && (
                <span className="text-slate-600 flex items-center gap-1">
                  <Clock size={11} />
                  {formatTimeAgo(rule.lastTriggered)}
                </span>
              )}
              <span className="text-slate-600">
                Max {rule.maxTriggersPerDay}/day
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onRunRule(rule)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/20 transition-colors"
              >
                <Play size={12} />
                Run Now
              </button>
              <button
                onClick={() => onBacktest(rule)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-500/20 transition-colors"
              >
                <BarChart3 size={12} />
                Backtest
              </button>
              <button
                onClick={() => handleDelete(rule.id)}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-red-400/60 rounded-lg text-xs hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <Trash2 size={12} />
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---- Create Tab ----

interface CreateFormState {
  name: string;
  conditions: { type: ConditionType; value: string; operator: LogicOperator }[];
  actionType: ActionType;
  priority: number;
  maxTriggersPerDay: number;
  isDryRun: boolean;
}

const INITIAL_FORM: CreateFormState = {
  name: '',
  conditions: [{ type: 'roi_above', value: '20', operator: 'AND' }],
  actionType: 'create_alert',
  priority: 5,
  maxTriggersPerDay: 10,
  isDryRun: true,
};

const CreateTab: React.FC<{
  formState: CreateFormState;
  onFormChange: (_form: CreateFormState) => void;
  onSave: () => void;
}> = ({ formState, onFormChange, onSave }) => {
  const form = formState;

  const updateField = <K extends keyof CreateFormState>(key: K, value: CreateFormState[K]) => {
    onFormChange({ ...form, [key]: value });
  };

  const addCondition = () => {
    onFormChange({
      ...form,
      conditions: [...form.conditions, { type: 'price_above', value: '100', operator: 'AND' }],
    });
  };

  const removeCondition = (idx: number) => {
    if (form.conditions.length <= 1) return;
    const updated = form.conditions.filter((_, i) => i !== idx);
    onFormChange({ ...form, conditions: updated });
  };

  const updateCondition = (idx: number, field: string, value: string) => {
    const updated = form.conditions.map((c, i) => {
      if (i !== idx) return c;
      return { ...c, [field]: value };
    });
    onFormChange({ ...form, conditions: updated });
  };

  const isValid = form.name.trim().length > 0 && form.conditions.every(c => c.value.trim().length > 0);

  return (
    <div className="space-y-6">
      {/* Rule Name */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Rule Name
        </label>
        <input
          type="text"
          value={form.name}
          onChange={e => updateField('name', e.target.value)}
          placeholder="e.g., Stop Loss at -20%"
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Conditions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            Conditions
          </label>
          <button
            onClick={addCondition}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
          >
            <Plus size={12} />
            Add Condition
          </button>
        </div>

        {form.conditions.map((cond, idx) => (
          <div key={idx} className="space-y-2">
            {idx > 0 && (
              <div className="flex items-center gap-2 px-2">
                <select
                  value={cond.operator}
                  onChange={e => updateCondition(idx, 'operator', e.target.value)}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-amber-400 font-bold focus:border-blue-500 focus:outline-none"
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
              </div>
            )}
            <div className="flex items-center gap-2">
              <select
                value={cond.type}
                onChange={e => updateCondition(idx, 'type', e.target.value)}
                className="flex-1 px-3 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                {CONDITION_TYPES.map(ct => (
                  <option key={ct} value={ct}>{CONDITION_LABELS[ct]}</option>
                ))}
              </select>
              <input
                type="number"
                value={cond.value}
                onChange={e => updateCondition(idx, 'value', e.target.value)}
                className="w-28 px-3 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white text-center focus:border-blue-500 focus:outline-none"
              />
              {form.conditions.length > 1 && (
                <button
                  onClick={() => removeCondition(idx)}
                  className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Action
        </label>
        <select
          value={form.actionType}
          onChange={e => updateField('actionType', e.target.value as ActionType)}
          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:border-blue-500 focus:outline-none"
        >
          {ACTION_TYPES.map(at => (
            <option key={at} value={at}>{ACTION_LABELS[at]}</option>
          ))}
        </select>
      </div>

      {/* Priority + Max Triggers */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            Priority (1-10)
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={form.priority}
            onChange={e => updateField('priority', Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white text-center focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            Max Triggers/Day
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={form.maxTriggersPerDay}
            onChange={e => updateField('maxTriggersPerDay', Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white text-center focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Dry Run Toggle */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl">
        <div className="flex items-center gap-2">
          <FlaskConical size={16} className="text-amber-400" />
          <span className="text-sm text-white font-medium">Start as Dry Run</span>
        </div>
        <button
          onClick={() => updateField('isDryRun', !form.isDryRun)}
          className={`w-11 h-6 rounded-full transition-colors relative ${
            form.isDryRun ? 'bg-amber-500' : 'bg-slate-600'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              form.isDryRun ? 'translate-x-[22px]' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      {/* Save Button */}
      <button
        onClick={onSave}
        disabled={!isValid}
        className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
          isValid
            ? 'bg-blue-500 text-white hover:bg-blue-400'
            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
        }`}
      >
        Create Rule
      </button>
    </div>
  );
};

// ---- Templates Tab ----

const TemplatesTab: React.FC<{
  onUseTemplate: (_template: RuleTemplate) => void;
}> = ({ onUseTemplate }) => {
  const templates = useMemo(() => getRuleTemplates(), []);

  const categoryColors: Record<string, { text: string; bg: string; border: string }> = {
    'Risk Management': { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    'Profit Taking': { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
    'Tax Strategy': { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
    'Opportunity': { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
    'Portfolio Health': { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    'Monitoring': { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {templates.map(template => {
        const catColor = categoryColors[template.category] ?? { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' };
        return (
          <div
            key={template.id}
            className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-bold text-white">{template.name}</h4>
              <span className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${catColor.text} ${catColor.bg} border ${catColor.border}`}>
                {template.category}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {template.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{template.conditions.length} condition{template.conditions.length !== 1 ? 's' : ''}</span>
              <span className="text-slate-700">|</span>
              <span>{ACTION_LABELS[template.action.type]}</span>
            </div>
            <button
              onClick={() => onUseTemplate(template)}
              className="w-full py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-500/20 transition-colors"
            >
              Use Template
            </button>
          </div>
        );
      })}
    </div>
  );
};

// ---- History Tab ----

const HistoryTab: React.FC<{
  triggers: RuleTrigger[];
}> = ({ triggers }) => {
  const sorted = useMemo(() => {
    return [...triggers].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [triggers]);

  if (sorted.length === 0) {
    return (
      <div className="text-center py-12">
        <History size={40} className="mx-auto text-slate-600 mb-4" />
        <p className="text-slate-400 text-sm mb-2">No trigger history yet</p>
        <p className="text-slate-600 text-xs">Triggers will appear here when rules fire</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1 mb-3">
        {sorted.length} trigger{sorted.length !== 1 ? 's' : ''} recorded
      </p>
      {sorted.map(trigger => (
        <div
          key={trigger.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-xs ${
            trigger.isDryRun
              ? 'bg-amber-500/5 border-amber-500/15'
              : 'bg-slate-800/30 border-slate-700'
          }`}
        >
          <Zap size={14} className={trigger.isDryRun ? 'text-amber-400' : 'text-blue-400'} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-white font-medium truncate">{trigger.cardName}</span>
              {trigger.isDryRun && (
                <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-bold rounded uppercase">
                  Dry Run
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="truncate">{trigger.ruleName}</span>
              <span className="text-slate-700">-</span>
              <span className="text-blue-400">{trigger.actionLabel}</span>
            </div>
          </div>
          <span className="text-slate-600 flex items-center gap-1 flex-shrink-0">
            <Clock size={11} />
            {formatTimeAgo(trigger.timestamp)}
          </span>
        </div>
      ))}
    </div>
  );
};

// ---- Backtest Modal ----

const BacktestPanel: React.FC<{
  result: BacktestResult;
  onClose: () => void;
}> = ({ result, onClose }) => {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-purple-400" />
          <h3 className="text-sm font-bold text-white">Backtest: {result.ruleName}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-800 text-slate-500 hover:text-white rounded-lg transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Triggers
          </p>
          <p className="text-xl font-bebas tracking-wider text-white">{result.triggerCount}</p>
        </div>
        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Sim P/L
          </p>
          <p className={`text-xl font-bebas tracking-wider ${result.simulatedPL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {result.simulatedPL >= 0 ? '+' : ''}${result.simulatedPL.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">
            Hit Rate
          </p>
          <p className="text-xl font-bebas tracking-wider text-blue-400">{result.hitRate}%</p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
          Monthly Triggers (12 months)
        </p>
        <div style={{ width: '100%', height: 180 }}>
          <ResponsiveContainer>
            <BarChart data={result.monthlyTriggers}>
              <XAxis
                dataKey="month"
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#fff',
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'pl') return [`$${value.toFixed(0)}`, 'P/L'];
                  return [value, 'Triggers'];
                }}
              />
              <Bar dataKey="triggers" radius={[4, 4, 0, 0]}>
                {result.monthlyTriggers.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.pl >= 0 ? '#10b981' : '#ef4444'}
                    fillOpacity={0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* P/L breakdown */}
      <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3">
          Monthly P/L
        </p>
        <div className="space-y-1.5">
          {result.monthlyTriggers.map((m, i) => (
            <div key={i} className="flex items-center gap-3 text-xs">
              <span className="w-16 text-slate-500 font-mono">{m.month}</span>
              <div className="flex-1 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${m.pl >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{
                    width: `${Math.min(100, Math.abs(m.pl) / (Math.max(1, ...result.monthlyTriggers.map(x => Math.abs(x.pl))) || 1) * 100)}%`,
                  }}
                />
              </div>
              <span className={`w-16 text-right font-mono ${m.pl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {m.pl >= 0 ? '+' : ''}${m.pl.toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ---- Main Modal ----

export const RulesEngineModal: React.FC<RulesEngineModalProps> = ({
  isOpen,
  onClose,
  cards,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('rules');
  const [rules, setRules] = useState<TradingRule[]>(() => loadRules());
  const [triggers, setTriggers] = useState<RuleTrigger[]>(() => loadTriggerHistory());
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [createForm, setCreateForm] = useState<CreateFormState>({ ...INITIAL_FORM });

  const handleUpdateRules = useCallback((updated: TradingRule[]) => {
    setRules(updated);
    saveRules(updated);
  }, []);

  const handleBacktest = useCallback((rule: TradingRule) => {
    const result = backtestRule(rule, cards);
    setBacktestResult(result);
  }, [cards]);

  const handleRunRule = useCallback((rule: TradingRule) => {
    const newTriggers = evaluateRules(cards, [rule]);
    if (newTriggers.length > 0) {
      setTriggers(prev => [...prev, ...newTriggers]);
      // Reload rules to get updated trigger counts
      setRules(loadRules());
    }
  }, [cards]);

  const handleSaveRule = useCallback(() => {
    const newRule: TradingRule = {
      id: `rule_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: createForm.name.trim(),
      description: '',
      conditions: createForm.conditions.map((c, i) => ({
        id: `cond_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
        type: c.type,
        value: parseFloat(c.value) || 0,
        operator: c.operator,
      })),
      action: {
        type: createForm.actionType,
        label: ACTION_LABELS[createForm.actionType],
      },
      status: createForm.isDryRun ? 'dry_run' : 'active',
      priority: createForm.priority,
      maxTriggersPerDay: createForm.maxTriggersPerDay,
      triggerCount: 0,
      lastTriggered: null,
      createdAt: new Date().toISOString(),
    };

    const updated = [...rules, newRule];
    handleUpdateRules(updated);
    setCreateForm({ ...INITIAL_FORM });
    setActiveTab('rules');
  }, [createForm, rules, handleUpdateRules]);

  const handleUseTemplate = useCallback((template: RuleTemplate) => {
    setCreateForm({
      name: template.name,
      conditions: template.conditions.map(c => ({
        type: c.type,
        value: String(c.value),
        operator: c.operator,
      })),
      actionType: template.action.type,
      priority: template.priority,
      maxTriggersPerDay: template.maxTriggersPerDay,
      isDryRun: true,
    });
    setActiveTab('create');
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-blue-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/30">
              <Cog size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  <Zap size={10} />
                  {rules.length} rule{rules.length !== 1 ? 's' : ''}
                </span>
                {rules.filter(r => r.status === 'active').length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/30">
                    <Play size={10} />
                    {rules.filter(r => r.status === 'active').length} active
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Trading <span className="text-blue-400">Rules Engine</span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-800 text-brand-muted hover:text-white rounded-xl transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-700 bg-slate-800/30">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setBacktestResult(null); }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-brand-lime border-brand-lime bg-brand-lime/5'
                  : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8 max-h-[65vh] overflow-y-auto no-scrollbar">
          {backtestResult ? (
            <BacktestPanel result={backtestResult} onClose={() => setBacktestResult(null)} />
          ) : (
            <>
              {activeTab === 'rules' && (
                <RulesTab
                  rules={rules}
                  onUpdateRules={handleUpdateRules}
                  onBacktest={handleBacktest}
                  onRunRule={handleRunRule}
                />
              )}
              {activeTab === 'create' && (
                <CreateTab
                  formState={createForm}
                  onFormChange={setCreateForm}
                  onSave={handleSaveRule}
                />
              )}
              {activeTab === 'templates' && (
                <TemplatesTab onUseTemplate={handleUseTemplate} />
              )}
              {activeTab === 'history' && (
                <HistoryTab triggers={triggers} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RulesEngineModal;
