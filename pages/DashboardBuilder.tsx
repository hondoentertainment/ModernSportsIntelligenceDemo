import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  LayoutDashboard,
  Search,
  Save,
  FolderOpen,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Undo2,
  Redo2,
  Grid3x3,
  Maximize2,
  Minimize2,
  Settings,
  X,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Loader2,
  Layers,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import {
  getWidgetCatalog,
  getDashboardLayouts,
  saveDashboardLayout,
  getDashboardPresets,
  getDefaultLayout,
  createLayoutFromPreset,
  createWidget,
  getActiveLayoutId,
  setActiveLayoutId,
  getWidgetCategories,
  WIDGET_SIZE_MAP,
  type DashboardLayout,
  type DashboardWidget,
  type WidgetType,
  type WidgetSize,
  type WidgetCatalogItem,
  type DashboardPreset,
} from '../lib/utils/dashboardBuilderService';
import DashboardWidgetRenderer, { getWidgetIcon } from '../components/DashboardWidgetRenderer';
import DashboardBuilderModal from '../components/DashboardBuilderModal';

// ---- History for undo/redo ----
interface HistoryState {
  past: DashboardWidget[][];
  present: DashboardWidget[];
  future: DashboardWidget[][];
}

function historyReducer(
  state: HistoryState,
  action: { type: 'SET'; widgets: DashboardWidget[] } | { type: 'UNDO' } | { type: 'REDO' } | { type: 'RESET'; widgets: DashboardWidget[] }
): HistoryState {
  switch (action.type) {
    case 'SET':
      return {
        past: [...state.past, state.present],
        present: action.widgets,
        future: [],
      };
    case 'UNDO':
      if (state.past.length === 0) return state;
      return {
        past: state.past.slice(0, -1),
        present: state.past[state.past.length - 1],
        future: [state.present, ...state.future],
      };
    case 'REDO':
      if (state.future.length === 0) return state;
      return {
        past: [...state.past, state.present],
        present: state.future[0],
        future: state.future.slice(1),
      };
    case 'RESET':
      return { past: [], present: action.widgets, future: [] };
    default:
      return state;
  }
}

// ---- Sortable Grid Widget ----

interface SortableWidgetProps {
  widget: DashboardWidget;
  isPreview: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onResize: (id: string, size: WidgetSize) => void;
  catalog: WidgetCatalogItem[];
  columns: number;
}

function SortableWidget({
  widget,
  isPreview,
  isSelected,
  onSelect,
  onRemove,
  onResize,
  catalog,
  columns,
}: SortableWidgetProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, data: { type: 'grid-widget', widget } });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    gridColumn: `span ${Math.min(widget.position.w, columns)}`,
    gridRow: `span ${widget.position.h}`,
  };

  const catalogItem = catalog.find(c => c.type === widget.type);
  const [showResize, setShowResize] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-xl border transition-all overflow-hidden ${
        isSelected
          ? 'border-blue-500 shadow-lg shadow-blue-500/10 bg-slate-800'
          : 'border-slate-700/60 bg-slate-800/80 hover:border-slate-600'
      } ${isDragging ? 'ring-2 ring-blue-500/30' : ''}`}
      onClick={() => onSelect(widget.id)}
    >
      {/* Widget Header */}
      {widget.config.showHeader !== false && (
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/50 bg-slate-900/40">
          <div className="flex items-center gap-2 min-w-0">
            {!isPreview && (
              <button
                className="text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing shrink-0"
                {...attributes}
                {...listeners}
              >
                <GripVertical size={14} />
              </button>
            )}
            <span className="text-slate-400 shrink-0">{getWidgetIcon(widget.type, 13)}</span>
            <span className="text-xs font-medium text-slate-300 truncate">
              {widget.config.title ?? catalogItem?.name ?? widget.type}
            </span>
          </div>
          {!isPreview && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="relative">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setShowResize(!showResize);
                  }}
                  className="p-1 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded transition-colors"
                  title="Resize"
                >
                  <Maximize2 size={11} />
                </button>
                {showResize && (
                  <div className="absolute right-0 top-full mt-1 bg-slate-900 border border-slate-600 rounded-lg shadow-xl z-50 py-1 min-w-[100px]">
                    {(catalogItem?.availableSizes ?? ['small', 'medium', 'large']).map(s => (
                      <button
                        key={s}
                        onClick={e => {
                          e.stopPropagation();
                          onResize(widget.id, s as WidgetSize);
                          setShowResize(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                          widget.size === s
                            ? 'text-blue-400 bg-blue-500/10'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                        <span className="text-slate-600 ml-1">
                          ({WIDGET_SIZE_MAP[s as WidgetSize].w}x{WIDGET_SIZE_MAP[s as WidgetSize].h})
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={e => {
                  e.stopPropagation();
                  onRemove(widget.id);
                }}
                className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                title="Remove"
              >
                <X size={11} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Widget Content */}
      <div className="p-3 flex-1 overflow-hidden" style={{ minHeight: widget.position.h > 1 ? 120 : 60 }}>
        <DashboardWidgetRenderer widget={widget} isPreview={isPreview} />
      </div>

      {/* Selected indicator */}
      {isSelected && !isPreview && (
        <div className="absolute inset-0 border-2 border-blue-500 rounded-xl pointer-events-none" />
      )}
    </div>
  );
}

// ---- Main Page ----

const DashboardBuilder: React.FC = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [layout, setLayout] = useState<DashboardLayout>(getDefaultLayout());
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: [],
    future: [],
  });
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showCatalog, setShowCatalog] = useState(true);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    portfolio: true,
    market: true,
    social: true,
    analytics: true,
    tools: true,
  });
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveDescription, setSaveDescription] = useState('');
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [showGridLines, setShowGridLines] = useState(true);
  const [dragActiveId, setDragActiveId] = useState<string | null>(null);

  const catalog = useMemo(() => getWidgetCatalog(), []);
  const categories = useMemo(() => getWidgetCategories(), []);
  const presets = useMemo(() => getDashboardPresets(), []);

  // Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  // Load layout
  useEffect(() => {
    try {
      const layouts = getDashboardLayouts();
      const activeId = getActiveLayoutId();
      const active = layouts.find(l => l.id === activeId) ?? layouts[0] ?? getDefaultLayout();
      setLayout(active);
      setHistory({ past: [], present: active.widgets, future: [] });
    } catch {
      // fallback to default
    }
    setLoading(false);
  }, []);

  // Sync history present with layout widgets
  const widgets = history.present;

  // Update widgets with history tracking
  const updateWidgets = useCallback((newWidgets: DashboardWidget[]) => {
    setHistory(prev => historyReducer(prev, { type: 'SET', widgets: newWidgets }));
    setLayout(prev => ({ ...prev, widgets: newWidgets, updatedAt: new Date().toISOString() }));
  }, []);

  const undo = useCallback(() => {
    setHistory(prev => {
      const next = historyReducer(prev, { type: 'UNDO' });
      setLayout(l => ({ ...l, widgets: next.present }));
      return next;
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(prev => {
      const next = historyReducer(prev, { type: 'REDO' });
      setLayout(l => ({ ...l, widgets: next.present }));
      return next;
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedWidgetId && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
          e.preventDefault();
          removeWidget(selectedWidgetId);
        }
      }
      if (e.key === 'Escape') {
        setSelectedWidgetId(null);
        setShowConfigPanel(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, selectedWidgetId]);

  // Find next available position
  function findNextPosition(): { x: number; y: number } {
    if (widgets.length === 0) return { x: 0, y: 0 };
    let maxY = 0;
    for (const w of widgets) {
      const bottom = w.position.y + w.position.h;
      if (bottom > maxY) maxY = bottom;
    }
    // Try to fit in the last row first
    const lastRowWidgets = widgets.filter(w => w.position.y + w.position.h === maxY);
    let usedCols = 0;
    for (const w of lastRowWidgets) {
      usedCols += w.position.w;
    }
    if (usedCols < layout.columns) {
      return { x: usedCols, y: maxY - 1 };
    }
    return { x: 0, y: maxY };
  }

  // Add widget from catalog
  function addWidgetFromCatalog(type: WidgetType) {
    const pos = findNextPosition();
    const newWidget = createWidget(type, { x: pos.x, y: pos.y, w: 0, h: 0 });
    updateWidgets([...widgets, newWidget]);
  }

  // Remove widget
  function removeWidget(id: string) {
    updateWidgets(widgets.filter(w => w.id !== id));
    if (selectedWidgetId === id) {
      setSelectedWidgetId(null);
      setShowConfigPanel(false);
    }
  }

  // Resize widget
  function resizeWidget(id: string, newSize: WidgetSize) {
    const dims = WIDGET_SIZE_MAP[newSize];
    updateWidgets(
      widgets.map(w =>
        w.id === id ? { ...w, size: newSize, position: { ...w.position, w: dims.w, h: dims.h } } : w
      )
    );
  }

  // Update widget config
  function updateWidgetConfig(id: string, config: Partial<DashboardWidget['config']>) {
    updateWidgets(
      widgets.map(w => (w.id === id ? { ...w, config: { ...w.config, ...config } } : w))
    );
  }

  // Save layout
  function handleSave() {
    if (showSaveDialog) {
      const updatedLayout: DashboardLayout = {
        ...layout,
        name: saveName || layout.name,
        description: saveDescription || layout.description,
        widgets,
        updatedAt: new Date().toISOString(),
      };
      saveDashboardLayout(updatedLayout);
      setActiveLayoutId(updatedLayout.id);
      setLayout(updatedLayout);
      setShowSaveDialog(false);
    } else {
      setSaveName(layout.name);
      setSaveDescription(layout.description);
      setShowSaveDialog(true);
    }
  }

  // Apply preset
  function handleApplyPreset(preset: DashboardPreset) {
    const newLayout = createLayoutFromPreset(preset);
    saveDashboardLayout(newLayout);
    setActiveLayoutId(newLayout.id);
    setLayout(newLayout);
    setHistory({ past: [], present: newLayout.widgets, future: [] });
    setShowPresetMenu(false);
  }

  // DnD handlers
  function handleDragStart(event: DragStartEvent) {
    setDragActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setDragActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeIdx = widgets.findIndex(w => w.id === active.id);
    const overIdx = widgets.findIndex(w => w.id === over.id);
    if (activeIdx < 0 || overIdx < 0) return;

    const newWidgets = [...widgets];
    const [moved] = newWidgets.splice(activeIdx, 1);
    newWidgets.splice(overIdx, 0, moved);

    // Recalculate positions based on order
    let col = 0;
    let row = 0;
    const cols = layout.columns;
    for (const w of newWidgets) {
      if (col + w.position.w > cols) {
        col = 0;
        row++;
      }
      w.position = { ...w.position, x: col, y: row };
      col += w.position.w;
      if (col >= cols) {
        col = 0;
        row++;
      }
    }

    updateWidgets(newWidgets);
  }

  // Layout modal callback
  function handleLayoutSelect(selectedLayout: DashboardLayout) {
    setLayout(selectedLayout);
    setHistory({ past: [], present: selectedLayout.widgets, future: [] });
  }

  // Filtered catalog
  const filteredCatalog = useMemo(() => {
    if (!catalogSearch) return catalog;
    const q = catalogSearch.toLowerCase();
    return catalog.filter(
      c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.category.includes(q)
    );
  }, [catalog, catalogSearch]);

  const catalogByCategory = useMemo(() => {
    const grouped: Record<string, WidgetCatalogItem[]> = {};
    for (const item of filteredCatalog) {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    }
    return grouped;
  }, [filteredCatalog]);

  // Selected widget
  const selectedWidget = widgets.find(w => w.id === selectedWidgetId) ?? null;

  // Drag overlay widget
  const dragWidget = widgets.find(w => w.id === dragActiveId) ?? null;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={32} className="text-blue-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Loading Dashboard Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Top Toolbar */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Title & Layout name */}
          <div className="flex items-center gap-3">
            <LayoutDashboard size={20} className="text-blue-400" />
            <div>
              <h1 className="text-lg font-bold text-slate-100">Dashboard Builder</h1>
              <p className="text-xs text-slate-500">{layout.name} &bull; {widgets.length} widgets</p>
            </div>
          </div>

          {/* Center: Actions */}
          <div className="hidden md:flex items-center gap-1">
            <button
              onClick={undo}
              disabled={history.past.length === 0}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={16} />
            </button>
            <button
              onClick={redo}
              disabled={history.future.length === 0}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 size={16} />
            </button>

            <div className="w-px h-6 bg-slate-700 mx-1" />

            <button
              onClick={() => setShowGridLines(!showGridLines)}
              className={`p-2 rounded-lg transition-colors ${
                showGridLines ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Toggle grid lines"
            >
              <Grid3x3 size={16} />
            </button>

            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`p-2 rounded-lg transition-colors ${
                isPreviewMode ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Preview mode"
            >
              {isPreviewMode ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>

            <button
              onClick={() => setShowCatalog(!showCatalog)}
              className={`p-2 rounded-lg transition-colors ${
                showCatalog ? 'text-purple-400 bg-purple-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Toggle widget catalog"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Right: Save & Layout management */}
          <div className="flex items-center gap-2">
            {/* Presets dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowPresetMenu(!showPresetMenu)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors"
              >
                <Layers size={14} />
                <span className="hidden sm:inline">Presets</span>
                <ChevronDown size={12} />
              </button>
              {showPresetMenu && (
                <div className="absolute right-0 top-full mt-1 bg-slate-900 border border-slate-600 rounded-lg shadow-xl z-50 w-64 py-1">
                  {presets.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset)}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {preset.icon === 'TrendingUp' && <TrendingUp size={12} className="text-blue-400" />}
                        {preset.icon === 'Layers' && <Layers size={12} className="text-purple-400" />}
                        {preset.icon === 'BarChart3' && <BarChart3 size={12} className="text-emerald-400" />}
                        {preset.icon === 'Minimize2' && <Minimize2 size={12} className="text-amber-400" />}
                        <span className="text-sm text-slate-200">{preset.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 ml-5">{preset.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowLayoutModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-300 hover:text-slate-100 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors"
            >
              <FolderOpen size={14} />
              <span className="hidden sm:inline">Layouts</span>
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-medium"
            >
              <Save size={14} />
              <span className="hidden sm:inline">Save</span>
            </button>
          </div>
        </div>

        {/* Mobile actions row */}
        <div className="flex md:hidden items-center gap-1 px-4 pb-2 overflow-x-auto">
          <button onClick={undo} disabled={history.past.length === 0} className="p-2 text-slate-400 hover:text-slate-200 rounded-lg disabled:opacity-30">
            <Undo2 size={14} />
          </button>
          <button onClick={redo} disabled={history.future.length === 0} className="p-2 text-slate-400 hover:text-slate-200 rounded-lg disabled:opacity-30">
            <Redo2 size={14} />
          </button>
          <button onClick={() => setShowGridLines(!showGridLines)} className={`p-2 rounded-lg ${showGridLines ? 'text-blue-400' : 'text-slate-400'}`}>
            <Grid3x3 size={14} />
          </button>
          <button onClick={() => setIsPreviewMode(!isPreviewMode)} className={`p-2 rounded-lg ${isPreviewMode ? 'text-emerald-400' : 'text-slate-400'}`}>
            {isPreviewMode ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button onClick={() => setShowCatalog(!showCatalog)} className={`p-2 rounded-lg ${showCatalog ? 'text-purple-400' : 'text-slate-400'}`}>
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex relative">
        {/* Widget Catalog Sidebar */}
        {showCatalog && !isPreviewMode && (
          <div className="w-64 lg:w-72 shrink-0 bg-slate-900 border-r border-slate-700 overflow-y-auto sticky top-[72px] h-[calc(100vh-72px)]">
            <div className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Widget Catalog</h3>
                <button
                  onClick={() => setShowCatalog(false)}
                  className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={e => setCatalogSearch(e.target.value)}
                  placeholder="Search widgets..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Categories */}
              {categories.map(cat => {
                const items = catalogByCategory[cat.key] ?? [];
                if (items.length === 0) return null;
                const isExpanded = expandedCategories[cat.key] ?? true;

                return (
                  <div key={cat.key} className="mb-2">
                    <button
                      onClick={() =>
                        setExpandedCategories(prev => ({ ...prev, [cat.key]: !prev[cat.key] }))
                      }
                      className="flex items-center gap-1.5 w-full text-left px-2 py-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors"
                    >
                      {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                      {cat.label}
                      <span className="text-slate-600 font-normal">({items.length})</span>
                    </button>

                    {isExpanded && (
                      <div className="space-y-1 mt-1">
                        {items.map(item => {
                          const alreadyAdded = widgets.some(w => w.type === item.type);
                          return (
                            <button
                              key={item.type}
                              onClick={() => addWidgetFromCatalog(item.type)}
                              className={`w-full text-left p-2 rounded-lg border transition-all ${
                                alreadyAdded
                                  ? 'bg-slate-800/40 border-slate-700/30 opacity-60'
                                  : 'bg-slate-800/60 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span style={{ color: item.color }}>{getWidgetIcon(item.type, 14)}</span>
                                <span className="text-xs font-medium text-slate-300">{item.name}</span>
                                {alreadyAdded && (
                                  <span className="text-[8px] ml-auto text-slate-600">Added</span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-0.5 ml-6 leading-relaxed">
                                {item.description}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Grid Area */}
        <div className="flex-1 p-4 lg:p-6">
          {widgets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
                <LayoutDashboard size={28} className="text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-300 mb-2">No Widgets Yet</h3>
              <p className="text-sm text-slate-500 max-w-sm mb-4">
                Add widgets from the catalog sidebar or apply a preset to get started.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCatalog(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-colors"
                >
                  <Plus size={14} />
                  Add Widget
                </button>
                <button
                  onClick={() => setShowPresetMenu(true)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-600 transition-colors"
                >
                  <Layers size={14} />
                  Use Preset
                </button>
              </div>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div
                className={`grid gap-4 ${showGridLines && !isPreviewMode ? 'bg-[repeating-linear-gradient(90deg,transparent,transparent_calc(25%-8px),rgba(51,65,85,0.15)_calc(25%-8px),rgba(51,65,85,0.15)_calc(25%))]' : ''}`}
                style={{
                  gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
                  minHeight: 200,
                }}
              >
                {widgets.map(widget => (
                  <SortableWidget
                    key={widget.id}
                    widget={widget}
                    isPreview={isPreviewMode}
                    isSelected={selectedWidgetId === widget.id}
                    onSelect={id => {
                      setSelectedWidgetId(id);
                      setShowConfigPanel(true);
                    }}
                    onRemove={removeWidget}
                    onResize={resizeWidget}
                    catalog={catalog}
                    columns={layout.columns}
                  />
                ))}
              </div>

              <DragOverlay>
                {dragWidget && (
                  <div className="bg-slate-800 border-2 border-blue-500 rounded-xl p-3 shadow-2xl opacity-80 max-w-xs">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      {getWidgetIcon(dragWidget.type, 14)}
                      <span>{dragWidget.config.title}</span>
                    </div>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )}
        </div>

        {/* Config Panel (right sidebar) */}
        {showConfigPanel && selectedWidget && !isPreviewMode && (
          <div className="w-64 lg:w-72 shrink-0 bg-slate-900 border-l border-slate-700 overflow-y-auto sticky top-[72px] h-[calc(100vh-72px)]">
            <div className="p-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Widget Config</h3>
                <button
                  onClick={() => {
                    setShowConfigPanel(false);
                    setSelectedWidgetId(null);
                  }}
                  className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Widget info */}
              <div className="flex items-center gap-2 mb-4 p-2 bg-slate-800 rounded-lg">
                <span className="text-blue-400">{getWidgetIcon(selectedWidget.type, 16)}</span>
                <div>
                  <div className="text-sm font-medium text-slate-200">
                    {catalog.find(c => c.type === selectedWidget.type)?.name ?? selectedWidget.type}
                  </div>
                  <div className="text-[10px] text-slate-500">{selectedWidget.size} &bull; {selectedWidget.position.w}x{selectedWidget.position.h}</div>
                </div>
              </div>

              {/* Title */}
              <div className="mb-3">
                <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={selectedWidget.config.title ?? ''}
                  onChange={e => updateWidgetConfig(selectedWidget.id, { title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Show Header */}
              <div className="mb-3">
                <label className="flex items-center justify-between text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                  Show Header
                  <button
                    onClick={() =>
                      updateWidgetConfig(selectedWidget.id, {
                        showHeader: !selectedWidget.config.showHeader,
                      })
                    }
                    className={`relative w-8 h-4.5 rounded-full transition-colors ${
                      selectedWidget.config.showHeader !== false ? 'bg-blue-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                        selectedWidget.config.showHeader !== false ? 'translate-x-3.5' : ''
                      }`}
                    />
                  </button>
                </label>
              </div>

              {/* Size */}
              <div className="mb-3">
                <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Size
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(catalog.find(c => c.type === selectedWidget.type)?.availableSizes ?? ['small', 'medium', 'large']).map(s => (
                    <button
                      key={s}
                      onClick={() => resizeWidget(selectedWidget.id, s as WidgetSize)}
                      className={`px-2 py-1.5 text-[10px] rounded-lg border transition-colors ${
                        selectedWidget.size === s
                          ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Accent */}
              <div className="mb-3">
                <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Accent Color
                </label>
                <div className="flex gap-1.5">
                  {['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'].map(color => (
                    <button
                      key={color}
                      onClick={() => updateWidgetConfig(selectedWidget.id, { colorAccent: color })}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        selectedWidget.config.colorAccent === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Danger zone */}
              <div className="mt-6 pt-4 border-t border-slate-700">
                <button
                  onClick={() => removeWidget(selectedWidget.id)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 size={12} />
                  Remove Widget
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSaveDialog(false)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm mx-4 p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Save size={16} className="text-blue-400" />
              Save Layout
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Layout Name
                </label>
                <input
                  type="text"
                  value={saveName}
                  onChange={e => setSaveName(e.target.value)}
                  placeholder="My Dashboard"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={saveDescription}
                  onChange={e => setSaveDescription(e.target.value)}
                  placeholder="Optional description"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-3 py-2 text-sm text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Layout Modal */}
      <DashboardBuilderModal
        isOpen={showLayoutModal}
        onClose={() => setShowLayoutModal(false)}
        onSelectLayout={handleLayoutSelect}
      />
    </div>
  );
};

export default DashboardBuilder;
