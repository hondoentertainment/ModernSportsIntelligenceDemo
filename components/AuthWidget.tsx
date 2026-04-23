// @ts-nocheck
import React, { useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  getCollectionAuthScore,
  getAuthAlerts,
} from '../lib/utils/authenticationService';

interface AuthWidgetProps {
  cards: CardInventory[];
  onClick?: () => void;
}

function getScoreBadge(score: number): { label: string; color: string; bg: string; border: string } {
  if (score >= 80) return { label: 'Secure', color: 'text-green-400', bg: 'bg-green-500/15', border: 'border-green-500/30' };
  if (score >= 60) return { label: 'Caution', color: 'text-amber-400', bg: 'bg-amber-500/15', border: 'border-amber-500/30' };
  return { label: 'At Risk', color: 'text-red-400', bg: 'bg-red-500/15', border: 'border-red-500/30' };
}

function getSeverityStyle(severity: string): { color: string; bg: string; border: string } {
  switch (severity) {
    case 'critical': return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' };
    case 'high': return { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
    case 'medium': return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    default: return { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' };
  }
}

export const AuthWidget: React.FC<AuthWidgetProps> = ({ cards, onClick }) => {
  const collectionScore = useMemo(() => getCollectionAuthScore(cards), [cards]);
  const alerts = useMemo(() => getAuthAlerts(cards), [cards]);
  const badge = getScoreBadge(collectionScore.overall);

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount = alerts.filter(a => a.severity === 'high').length;
  const mediumCount = alerts.filter(a => a.severity === 'medium').length;
  const topAlerts = alerts.slice(0, 3);

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Authentication <span className="text-blue-400">Center</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Counterfeit detection & verification
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {/* Score Badge */}
      <div className="flex items-center gap-3 p-4 bg-slate-800/50 border border-slate-700 rounded-2xl">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold ${badge.color} ${badge.bg} border ${badge.border}`}>
          <ShieldCheck size={14} />
          {badge.label}
        </div>
        <div className="h-5 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5 text-xs text-white font-bold">
          <span className="font-mono text-lg">{collectionScore.overall}</span>
          <span className="text-slate-500 text-[10px]">/ 100</span>
        </div>
        <div className="ml-auto text-xs text-slate-400">
          <span className="font-mono text-white">{collectionScore.totalCards}</span> card{collectionScore.totalCards !== 1 ? 's' : ''} scanned
        </div>
      </div>

      {/* Flagged Cards by Severity */}
      {(criticalCount > 0 || highCount > 0 || mediumCount > 0) && (
        <div className="flex items-center gap-2 flex-wrap">
          {criticalCount > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded-lg">
              <ShieldAlert size={12} />
              {criticalCount} critical
            </span>
          )}
          {highCount > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold rounded-lg">
              <AlertTriangle size={12} />
              {highCount} high
            </span>
          )}
          {mediumCount > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold rounded-lg">
              <AlertTriangle size={12} />
              {mediumCount} medium
            </span>
          )}
        </div>
      )}

      {/* Recent Alerts */}
      {topAlerts.length > 0 && (
        <div className="space-y-2">
          {topAlerts.map(alert => {
            const style = getSeverityStyle(alert.severity);
            return (
              <div
                key={alert.cardId}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl ${style.bg} border ${style.border}`}
              >
                <ShieldAlert size={14} className={style.color} />
                <span className="flex-1 text-xs text-slate-300 truncate">
                  {alert.cardLabel}
                </span>
                <span className={`text-xs font-bold ${style.color} uppercase`}>
                  {alert.severity}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {alerts.length === 0 && cards.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-500/5 border border-green-500/15 rounded-xl">
          <ShieldCheck size={14} className="text-green-400" />
          <span className="text-xs text-green-400 font-medium">
            No authentication concerns detected in your collection.
          </span>
        </div>
      )}
    </button>
  );
};

export default AuthWidget;
