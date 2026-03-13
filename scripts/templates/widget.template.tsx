import React from 'react';
import { {{ICON_NAME}}, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { get{{PASCAL_NAME}}Stats, get{{PASCAL_NAME}}Items } from '../lib/{{CAMEL_NAME}}Service';

interface {{PASCAL_NAME}}WidgetProps {
  onOpenModal: () => void;
}

const {{PASCAL_NAME}}Widget: React.FC<{{PASCAL_NAME}}WidgetProps> = ({ onOpenModal }) => {
  const stats = get{{PASCAL_NAME}}Stats();
  const items = get{{PASCAL_NAME}}Items();
  const topItems = items.filter(i => i.status === 'active').slice(0, 3);

  return (
    <div
      className="bg-slate-900 border border-slate-700/50 rounded-2xl p-4 hover:border-blue-500/30 transition-all cursor-pointer group"
      onClick={onOpenModal}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/20">
            <{{ICON_NAME}} size={16} className="text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">{{DISPLAY_NAME}}</h3>
        </div>
        <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Total</p>
          <p className="text-lg font-bold text-slate-200">{stats.totalItems}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Active</p>
          <p className="text-lg font-bold text-emerald-400">{stats.activeCount}</p>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-2 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Value</p>
          <p className="text-lg font-bold text-blue-400">${(stats.totalValue / 1000).toFixed(1)}K</p>
        </div>
      </div>

      {/* Top items preview */}
      <div className="space-y-1.5">
        {topItems.map(item => (
          <div key={item.id} className="flex items-center justify-between bg-slate-800/30 rounded-lg px-2.5 py-1.5">
            <span className="text-xs text-slate-300 truncate max-w-[160px]">{item.name}</span>
            <div className="flex items-center gap-1">
              {item.trend >= 0 ? (
                <TrendingUp size={10} className="text-emerald-400" />
              ) : (
                <TrendingDown size={10} className="text-red-400" />
              )}
              <span className={`text-[10px] font-medium ${item.trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {item.trend > 0 ? '+' : ''}{item.trend}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-2 pt-2 border-t border-slate-800/50">
        <p className="text-[10px] text-slate-500">
          Confidence: <span className="text-slate-400 font-medium">{stats.avgConfidence}%</span>
          {' · '}
          Top: <span className="text-slate-400 font-medium">{stats.topCategory}</span>
        </p>
      </div>
    </div>
  );
};

export default React.memo({{PASCAL_NAME}}Widget);
