import React, { useMemo } from 'react';
import {
  Cog,
  Zap,
  Play,
  Pause,
  FlaskConical,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  loadRules,
  loadTriggerHistory,
  TradingRule,
  RuleTrigger,
} from '../lib/utils/rulesEngineService';

interface RulesEngineWidgetProps {
  cards: CardInventory[];
  onClick?: () => void;
}

const statusColors: Record<string, { text: string; bg: string; border: string }> = {
  active: { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  paused: { text: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' },
  dry_run: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
};

const statusIcons: Record<string, React.ReactNode> = {
  active: <Play size={10} />,
  paused: <Pause size={10} />,
  dry_run: <FlaskConical size={10} />,
};

export const RulesEngineWidget: React.FC<RulesEngineWidgetProps> = ({ _cards, onClick }) => {
  const rules = useMemo(() => loadRules(), []);
  const triggers = useMemo(() => loadTriggerHistory(), []);

  const activeCount = rules.filter((r: TradingRule) => r.status === 'active').length;
  const pausedCount = rules.filter((r: TradingRule) => r.status === 'paused').length;
  const dryRunCount = rules.filter((r: TradingRule) => r.status === 'dry_run').length;

  const recentTriggers = useMemo(() => {
    return [...triggers]
      .sort((a: RuleTrigger, b: RuleTrigger) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, 5);
  }, [triggers]);

  const pendingReview = triggers.filter((t: RuleTrigger) => t.isDryRun).length;

  const formatTimeAgo = (timestamp: string): string => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
            <Cog size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Trading <span className="text-blue-400">Rules</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Automated rules engine
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {activeCount > 0 && (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusColors.active.text} ${statusColors.active.bg} border ${statusColors.active.border}`}>
            {statusIcons.active}
            {activeCount} active
          </span>
        )}
        {dryRunCount > 0 && (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusColors.dry_run.text} ${statusColors.dry_run.bg} border ${statusColors.dry_run.border}`}>
            {statusIcons.dry_run}
            {dryRunCount} dry-run
          </span>
        )}
        {pausedCount > 0 && (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${statusColors.paused.text} ${statusColors.paused.bg} border ${statusColors.paused.border}`}>
            {statusIcons.paused}
            {pausedCount} paused
          </span>
        )}
        {rules.length === 0 && (
          <span className="text-xs text-slate-500">No rules configured</span>
        )}
      </div>

      {/* Pending Review */}
      {pendingReview > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/5 border border-amber-500/15 rounded-xl">
          <FlaskConical size={14} className="text-amber-400 flex-shrink-0" />
          <span className="text-xs text-slate-400">Pending review:</span>
          <span className="text-xs text-amber-400 font-bold">{pendingReview} dry-run triggers</span>
        </div>
      )}

      {/* Recent Triggers */}
      {recentTriggers.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">
            Recent Triggers
          </p>
          {recentTriggers.map((trigger: RuleTrigger) => (
            <div
              key={trigger.id}
              className="flex items-center gap-3 px-3 py-2 bg-slate-800/30 rounded-xl text-xs"
            >
              <Zap size={12} className={trigger.isDryRun ? 'text-amber-400' : 'text-blue-400'} />
              <span className="text-white font-medium truncate flex-1">
                {trigger.cardName}
              </span>
              <span className="text-slate-500 truncate max-w-[120px]">
                {trigger.actionLabel}
              </span>
              <span className="text-slate-600 flex items-center gap-1 flex-shrink-0">
                <Clock size={10} />
                {formatTimeAgo(trigger.timestamp)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {rules.length === 0 && recentTriggers.length === 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-500/5 border border-blue-500/15 rounded-xl">
          <Zap size={14} className="text-blue-400 flex-shrink-0" />
          <span className="text-xs text-slate-400">
            Set up automated rules to manage your portfolio
          </span>
        </div>
      )}
    </button>
  );
};

export default RulesEngineWidget;
