// @ts-nocheck
import React, { useMemo } from 'react';
import { Plug, ChevronRight, Key, Activity, Download } from 'lucide-react';
import { getAPIKeys, getExportHistory, getAPIPlatformStats } from '../lib/utils/apiPlatformService';

interface APIPlatformWidgetProps {
  onClick?: () => void;
}

export const APIPlatformWidget: React.FC<APIPlatformWidgetProps> = ({ onClick }) => {
  const stats = useMemo(() => getAPIPlatformStats(), []);
  const keys = useMemo(() => getAPIKeys(), []);
  const exports = useMemo(() => getExportHistory(), []);

  const activeKeys = keys.filter(k => k.status === 'active');
  const requestsToday = activeKeys.reduce((sum, k) => sum + k.requestsToday, 0);
  const requestsLimit = activeKeys.reduce((sum, k) => sum + k.requestsLimit, 0);
  const latestExport = exports.length > 0 ? exports[0] : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-lime-500/10 rounded-xl text-lime-400">
            <Plug size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              API <span className="text-lime-400">Platform</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Programmatic data access & exports
            </p>
          </div>
        </div>
        <ChevronRight size={18} className="text-slate-600 group-hover:text-lime-400 transition-colors" />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <Key size={14} className="mx-auto text-lime-400 mb-1" />
          <p className="text-lg font-bold text-white">{activeKeys.length}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Active Keys</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <Activity size={14} className="mx-auto text-cyan-400 mb-1" />
          <p className="text-lg font-bold text-white">{requestsToday.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Reqs Today</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <Download size={14} className="mx-auto text-amber-400 mb-1" />
          <p className="text-lg font-bold text-white">{stats.exportsGenerated}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Exports</p>
        </div>
      </div>

      {/* Usage bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">API Usage</span>
          <span className="text-slate-500">{requestsToday.toLocaleString()} / {requestsLimit.toLocaleString()}</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-lime-500 rounded-full transition-all"
            style={{ width: `${Math.min((requestsToday / requestsLimit) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Latest export */}
      {latestExport && (
        <div className="flex items-center justify-between text-xs bg-slate-800/30 rounded-lg px-3 py-2">
          <span className="text-slate-400">Latest export</span>
          <span className={`font-medium ${latestExport.status === 'complete' ? 'text-green-400' : latestExport.status === 'processing' ? 'text-amber-400' : 'text-slate-500'}`}>
            {latestExport.dataType.replace('_', ' ')} — {latestExport.format.toUpperCase()} · {latestExport.status}
          </span>
        </div>
      )}
    </button>
  );
};

export default APIPlatformWidget;
