import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ChevronDown,
  Settings,
  Check,
} from 'lucide-react';
import {
  getDashboardLayouts,
  getActiveLayoutId,
  setActiveLayoutId,
  type DashboardLayout,
} from '../lib/dashboardBuilderService';

interface DashboardBuilderWidgetProps {
  onOpenBuilder?: () => void;
}

const DashboardBuilderWidget: React.FC<DashboardBuilderWidgetProps> = ({ onOpenBuilder }) => {
  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const loaded = getDashboardLayouts();
    setLayouts(loaded);
    const storedId = getActiveLayoutId();
    if (storedId && loaded.some(l => l.id === storedId)) {
      setActiveId(storedId);
    } else if (loaded.length > 0) {
      setActiveId(loaded[0].id);
    }
  }, []);

  const activeLayout = layouts.find(l => l.id === activeId);

  function handleSelect(id: string) {
    setActiveId(id);
    setActiveLayoutId(id);
    setIsOpen(false);
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <LayoutDashboard size={16} className="text-blue-400" />
          <h3 className="text-sm font-semibold text-slate-100">Dashboard Layout</h3>
        </div>
        {onOpenBuilder && (
          <button
            onClick={onOpenBuilder}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            <Settings size={12} />
            Customize
          </button>
        )}
      </div>

      {/* Current Layout Display */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-200 hover:border-slate-500 transition-colors"
        >
          <div className="flex flex-col items-start">
            <span className="font-medium">{activeLayout?.name ?? 'No Layout'}</span>
            <span className="text-[10px] text-slate-500">
              {activeLayout ? `${activeLayout.widgets.length} widgets` : 'Select a layout'}
            </span>
          </div>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-600 rounded-lg shadow-xl z-50 overflow-hidden">
            {layouts.map(layout => (
              <button
                key={layout.id}
                onClick={() => handleSelect(layout.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors"
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{layout.name}</span>
                  <span className="text-[10px] text-slate-500">{layout.widgets.length} widgets</span>
                </div>
                {layout.id === activeId && <Check size={14} className="text-emerald-400" />}
              </button>
            ))}
            {layouts.length === 0 && (
              <div className="px-3 py-4 text-center text-xs text-slate-500">No saved layouts</div>
            )}
          </div>
        )}
      </div>

      {/* Mini Layout Preview */}
      {activeLayout && (
        <div className="mt-3 bg-slate-900/50 border border-slate-700/50 rounded-lg p-2">
          <div className="grid grid-cols-4 gap-1" style={{ minHeight: 48 }}>
            {activeLayout.widgets.slice(0, 8).map(w => (
              <div
                key={w.id}
                className="bg-slate-700/40 rounded text-[8px] text-slate-500 flex items-center justify-center"
                style={{
                  gridColumn: `span ${Math.min(w.position.w, 4)}`,
                  gridRow: `span ${w.position.h}`,
                  minHeight: 16,
                }}
              >
                {w.config.title?.substring(0, 6)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBuilderWidget;
