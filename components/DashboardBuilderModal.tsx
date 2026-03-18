import React, { useState, useEffect } from 'react';
import {
  X,
  LayoutDashboard,
  Check,
  Trash2,
  Plus,
  Clock,
  Layers,
} from 'lucide-react';
import {
  getDashboardLayouts,
  deleteDashboardLayout,
  getActiveLayoutId,
  setActiveLayoutId,
  getDashboardPresets,
  createLayoutFromPreset,
  saveDashboardLayout,
  type DashboardLayout,
  type DashboardPreset,
} from '../lib/utils/dashboardBuilderService';

interface DashboardBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLayout: (layout: DashboardLayout) => void;
}

const DashboardBuilderModal: React.FC<DashboardBuilderModalProps> = ({
  isOpen,
  onClose,
  onSelectLayout,
}) => {
  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);
  const [presets, setPresets] = useState<DashboardPreset[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tab, setTab] = useState<'saved' | 'presets'>('saved');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLayouts(getDashboardLayouts());
      setPresets(getDashboardPresets());
      setActiveId(getActiveLayoutId());
      setConfirmDelete(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleSelectSaved(layout: DashboardLayout) {
    setActiveLayoutId(layout.id);
    setActiveId(layout.id);
    onSelectLayout(layout);
    onClose();
  }

  function handleApplyPreset(preset: DashboardPreset) {
    const newLayout = createLayoutFromPreset(preset);
    saveDashboardLayout(newLayout);
    setActiveLayoutId(newLayout.id);
    onSelectLayout(newLayout);
    onClose();
  }

  function handleDelete(id: string) {
    if (confirmDelete === id) {
      deleteDashboardLayout(id);
      setLayouts(prev => prev.filter(l => l.id !== id));
      setConfirmDelete(null);
      if (activeId === id) {
        setActiveId(null);
      }
    } else {
      setConfirmDelete(id);
    }
  }

  function formatDate(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg mx-4 shadow-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <LayoutDashboard size={18} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-slate-100">Dashboard Layouts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setTab('saved')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === 'saved'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Layers size={14} />
              Saved ({layouts.length})
            </span>
          </button>
          <button
            onClick={() => setTab('presets')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === 'presets'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Plus size={14} />
              Presets ({presets.length})
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {tab === 'saved' && (
            <>
              {layouts.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Layers size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No saved layouts yet</p>
                  <p className="text-xs mt-1">Create one from the builder or apply a preset</p>
                </div>
              ) : (
                layouts.map(layout => (
                  <div
                    key={layout.id}
                    className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      activeId === layout.id
                        ? 'bg-blue-500/10 border-blue-500/30'
                        : 'bg-slate-800/60 border-slate-700/50 hover:border-slate-600'
                    }`}
                    onClick={() => handleSelectSaved(layout)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-200 truncate">{layout.name}</span>
                        {activeId === layout.id && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">Active</span>
                        )}
                        {layout.isDefault && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded-full">Default</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                        <span>{layout.widgets.length} widgets</span>
                        <span className="flex items-center gap-0.5">
                          <Clock size={8} />
                          {formatDate(layout.updatedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {activeId === layout.id && (
                        <Check size={14} className="text-emerald-400 mr-1" />
                      )}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDelete(layout.id);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          confirmDelete === layout.id
                            ? 'bg-red-500/20 text-red-400'
                            : 'text-slate-500 hover:text-red-400 hover:bg-slate-700 opacity-0 group-hover:opacity-100'
                        }`}
                        title={confirmDelete === layout.id ? 'Click again to confirm' : 'Delete layout'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {tab === 'presets' && (
            <>
              {presets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className="w-full text-left p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-slate-200">{preset.name}</span>
                  </div>
                  <p className="text-xs text-slate-400">{preset.description}</p>
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {preset.layout.widgets.slice(0, 5).map((w, i) => (
                      <span key={i} className="text-[9px] px-1.5 py-0.5 bg-slate-700/50 text-slate-500 rounded">
                        {w.config.title}
                      </span>
                    ))}
                    {preset.layout.widgets.length > 5 && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-slate-700/50 text-slate-500 rounded">
                        +{preset.layout.widgets.length - 5} more
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardBuilderModal;
