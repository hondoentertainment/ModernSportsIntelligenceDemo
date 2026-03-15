import React, { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  GripVertical,
  Trash2,
  X,
  Edit3,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  TrendingUp,
  Trophy,
  Lock,
  Repeat,
  FolderOpen,
  Sparkles,
  Search,
  LayoutGrid,
} from 'lucide-react';
import { CardInventory } from '../types';
import { useSupabaseInventory } from '../lib/useSupabaseInventory';
import { useCardGroups, type CardGroup } from '../lib/useCardGroups';
import { getRarityTier, getTierStyles } from '../lib/rarity';
import CardImage from '../components/CardImage';

// ─── Icon resolver ──────────────────────────────────────────────────
function GroupIcon({ icon, size = 16 }: { icon: string; size?: number }) {
  switch (icon) {
    case 'trophy': return <Trophy size={size} />;
    case 'trending-up': return <TrendingUp size={size} />;
    case 'lock': return <Lock size={size} />;
    case 'repeat': return <Repeat size={size} />;
    case 'layers': return <Layers size={size} />;
    default: return <FolderOpen size={size} />;
  }
}

// ─── Sortable Card Chip ─────────────────────────────────────────────
function SortableCard({ card }: { card: CardInventory; key?: React.Key }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: 'card', card, groupId: card.group } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const tier = getRarityTier(card);
  const tierStyles = getTierStyles(tier);
  const gl = (card.currentValue ?? 0) - card.purchasePrice;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 p-3 bg-brand-charcoal/60 border ${tierStyles.border} rounded-2xl transition-shadow hover:shadow-lg hover:shadow-black/20 cursor-grab active:cursor-grabbing`}
      {...attributes}
      {...listeners}
    >
      <GripVertical size={14} className="text-brand-muted shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
      <CardImage
        src={card.image}
        playerName={card.player}
        year={card.year}
        manufacturer={card.manufacturer}
        className="w-10 h-10 rounded-lg shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-white truncate">{card.player}</p>
        <p className="text-[10px] text-brand-muted font-medium truncate">{card.year} {card.manufacturer} {card.set}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-mono font-bold text-brand-lime">{card.currentValue ? `$${Math.round(card.currentValue).toLocaleString()}` : '—'}</p>
        <p className={`text-[10px] font-mono font-bold ${gl >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
          {gl >= 0 ? '+' : ''}{Math.round(gl).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// ─── Drag Overlay Card (floating preview) ───────────────────────────
function DragOverlayCard({ card }: { card: CardInventory }) {
  const tier = getRarityTier(card);
  const tierStyles = getTierStyles(tier);
  const gl = (card.currentValue ?? 0) - card.purchasePrice;

  return (
    <div className={`flex items-center gap-3 p-3 bg-brand-slate border-2 ${tierStyles.border} rounded-2xl shadow-2xl shadow-black/40 w-[360px]`}>
      <GripVertical size={14} className="text-brand-muted shrink-0" />
      <CardImage
        src={card.image}
        playerName={card.player}
        year={card.year}
        manufacturer={card.manufacturer}
        className="w-10 h-10 rounded-lg shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-white truncate">{card.player}</p>
        <p className="text-[10px] text-brand-muted font-medium truncate">{card.year} {card.manufacturer}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-mono font-bold text-brand-lime">{card.currentValue ? `$${Math.round(card.currentValue).toLocaleString()}` : '—'}</p>
        <p className={`text-[10px] font-mono font-bold ${gl >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
          {gl >= 0 ? '+' : ''}{Math.round(gl).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// ─── Droppable Lane ─────────────────────────────────────────────────
function Lane({
  group,
  cards,
  stats,
  onRename,
  onDelete,
  isOver,
}: {
  group: CardGroup;
  cards: CardInventory[];
  stats: { count: number; totalValue: number; totalCost: number };
  onRename: (_id: string, _label: string) => void;
  onDelete: (_id: string) => void;
  isOver: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(group.label);
  const [collapsed, setCollapsed] = useState(false);

  const handleSave = () => {
    if (editLabel.trim()) {
      onRename(group.id, editLabel.trim());
    }
    setIsEditing(false);
  };

  const cardIds = useMemo(() => cards.map(c => c.id), [cards]);
  const laneGl = stats.totalValue - stats.totalCost;

  return (
    <div
      className={`flex flex-col bg-brand-slate/50 border rounded-[1.5rem] transition-all min-w-[340px] w-[340px] shrink-0 ${
        isOver ? 'border-brand-lime/60 shadow-[0_0_24px_rgba(217,249,157,0.12)]' : 'border-slate-800/60'
      }`}
    >
      {/* Lane header */}
      <div className="p-4 pb-2 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: group.color + '25', color: group.color }}
        >
          <GroupIcon icon={group.icon} size={16} />
        </div>

        {isEditing ? (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <input
              autoFocus
              value={editLabel}
              onChange={e => setEditLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setIsEditing(false); }}
              className="flex-1 bg-brand-charcoal border border-slate-700 rounded-lg px-2 py-1 text-sm font-bold text-white focus:outline-none focus:border-brand-lime/40 min-w-0"
            />
            <button onClick={handleSave} className="p-1 text-brand-green hover:bg-brand-green/10 rounded-lg transition-colors">
              <Check size={14} />
            </button>
            <button onClick={() => setIsEditing(false)} className="p-1 text-brand-muted hover:text-white rounded-lg transition-colors">
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white truncate">{group.label}</h3>
            <span className="text-[10px] font-mono font-bold text-brand-muted bg-brand-charcoal/60 px-2 py-0.5 rounded-full shrink-0">
              {stats.count}
            </span>
          </div>
        )}

        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 text-brand-muted hover:text-white rounded-lg transition-colors">
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
          {!isEditing && (
            <button onClick={() => { setEditLabel(group.label); setIsEditing(true); }} className="p-1.5 text-brand-muted hover:text-white rounded-lg transition-colors">
              <Edit3 size={14} />
            </button>
          )}
          <button
            onClick={() => { if (confirm(`Remove "${group.label}" lane? Cards will return to the pool.`)) onDelete(group.id); }}
            className="p-1.5 text-brand-muted hover:text-brand-red rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Lane summary */}
      <div className="px-4 pb-3 flex items-center gap-4 text-[10px] font-mono font-bold">
        <span className="text-brand-lime">${Math.round(stats.totalValue).toLocaleString()}</span>
        <span className={laneGl >= 0 ? 'text-brand-green' : 'text-brand-red'}>
          {laneGl >= 0 ? '+' : ''}{Math.round(laneGl).toLocaleString()} G/L
        </span>
      </div>

      {/* Card list */}
      {!collapsed && (
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          <div className="flex-1 px-3 pb-3 space-y-2 overflow-y-auto max-h-[calc(100vh-380px)] min-h-[80px]">
            {cards.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-brand-muted">
                <Layers size={24} className="mb-2 opacity-40" />
                <p className="text-xs font-medium">Drop cards here</p>
              </div>
            )}
            {cards.map(card => (
              <SortableCard key={card.id} card={card} />
            ))}
          </div>
        </SortableContext>
      )}
    </div>
  );
}

// ─── Ungrouped Pool Card ────────────────────────────────────────────
function PoolCard({ card }: { card: CardInventory; key?: React.Key }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: { type: 'card', card, groupId: '__pool__' } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const tier = getRarityTier(card);
  const tierStyles = getTierStyles(tier);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 p-2.5 bg-brand-charcoal/40 border ${tierStyles.border} rounded-xl cursor-grab active:cursor-grabbing hover:bg-brand-charcoal/70 transition-all`}
      {...attributes}
      {...listeners}
    >
      <GripVertical size={12} className="text-brand-muted shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" />
      <CardImage
        src={card.image}
        playerName={card.player}
        year={card.year}
        manufacturer={card.manufacturer}
        className="w-8 h-8 rounded-lg shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-white truncate">{card.player}</p>
        <p className="text-[9px] text-brand-muted font-medium truncate">{card.year} {card.manufacturer}</p>
      </div>
      <p className="text-[10px] font-mono font-bold text-brand-lime shrink-0">
        {card.currentValue ? `$${Math.round(card.currentValue).toLocaleString()}` : '—'}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ─── MAIN PAGE ──────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════

const PortfolioBuilder: React.FC = () => {
  const { inventory, updateCard } = useSupabaseInventory();
  const {
    groups,
    groupedCards,
    groupStats,
    addGroup,
    renameGroup,
    deleteGroup,
    moveCard,
    reorderCardInGroup,
  } = useCardGroups(inventory, updateCard);

  const [activeCard, setActiveCard] = useState<CardInventory | null>(null);
  const [overLaneId, setOverLaneId] = useState<string | null>(null);
  const [newLaneName, setNewLaneName] = useState('');
  const [isAddingLane, setIsAddingLane] = useState(false);
  const [poolSearch, setPoolSearch] = useState('');
  const [poolCollapsed, setPoolCollapsed] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  // Filter ungrouped cards by search
  const filteredPool = useMemo(() => {
    const pool = groupedCards.ungrouped;
    if (!poolSearch.trim()) return pool;
    const q = poolSearch.toLowerCase();
    return pool.filter(c =>
      c.player.toLowerCase().includes(q) ||
      c.manufacturer.toLowerCase().includes(q) ||
      c.set.toLowerCase().includes(q)
    );
  }, [groupedCards.ungrouped, poolSearch]);

  const poolIds = useMemo(() => filteredPool.map(c => c.id), [filteredPool]);

  // Find which group a card belongs to from the drag data
  const _findGroupForCard = useCallback((cardId: string): string | undefined => {
    for (const group of groups) {
      if (groupedCards.grouped[group.id]?.some(c => c.id === cardId)) {
        return group.id;
      }
    }
    return undefined;
  }, [groups, groupedCards]);

  // ─── DnD handlers ──────────────────────────────────────────────
  const handleDragStart = (event: DragStartEvent) => {
    const card = event.active.data.current?.card as CardInventory | undefined;
    if (card) setActiveCard(card);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (!over) { setOverLaneId(null); return; }

    // Determine which lane is being hovered
    const overData = over.data.current;
    if (overData?.type === 'card') {
      setOverLaneId(overData.groupId === '__pool__' ? null : overData.groupId);
    } else {
      // Over the lane container itself
      const laneId = groups.find(g => g.id === over.id)?.id;
      setOverLaneId(laneId ?? null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    setOverLaneId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeGroupId = active.data.current?.groupId as string | undefined;
    const overData = over.data.current;

    // Determine target group
    let targetGroupId: string | undefined;
    if (overData?.type === 'card') {
      targetGroupId = overData.groupId === '__pool__' ? undefined : overData.groupId;
    } else {
      // Dropped on a lane directly
      targetGroupId = groups.find(g => g.id === overId)?.id;
    }

    const sourceGroupId = activeGroupId === '__pool__' ? undefined : activeGroupId;

    // Same group reorder
    if (sourceGroupId === targetGroupId && targetGroupId) {
      const cardsInGroup = groupedCards.grouped[targetGroupId] || [];
      const oldIndex = cardsInGroup.findIndex(c => c.id === activeId);
      const overCard = cardsInGroup.findIndex(c => c.id === overId);
      if (oldIndex !== -1 && overCard !== -1 && oldIndex !== overCard) {
        reorderCardInGroup(activeId, targetGroupId, overCard);
      }
      return;
    }

    // Cross-group move
    if (sourceGroupId !== targetGroupId) {
      moveCard(activeId, targetGroupId);
    }
  };

  const handleAddLane = () => {
    if (newLaneName.trim()) {
      addGroup(newLaneName.trim());
      setNewLaneName('');
      setIsAddingLane(false);
    }
  };

  // Summary stats
  const groupStatsArray = Object.values(groupStats) as { count: number; totalValue: number; totalCost: number }[];
  const totalGrouped = groupStatsArray.reduce((s, g) => s + g.count, 0);
  const totalGroupedValue = groupStatsArray.reduce((s, g) => s + g.totalValue, 0);

  return (
    <div className="animate-in fade-in duration-700 pb-20 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 shrink-0">
        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
            Portfolio <span className="text-brand-lime">Builder</span>
          </h1>
          <p className="text-brand-muted max-w-2xl font-medium">
            Drag and drop cards into custom lanes to organize your strategy. Grade submissions, sell targets, long-term holds — your board, your rules.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="bg-brand-slate border border-slate-800 rounded-2xl px-5 py-3 flex items-center gap-6">
            <div className="text-center">
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Organized</p>
              <p className="text-lg font-mono font-bold text-brand-lime">{totalGrouped as number}</p>
            </div>
            <div className="w-px h-8 bg-slate-800"></div>
            <div className="text-center">
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Board Value</p>
              <p className="text-lg font-mono font-bold text-white">${Math.round(totalGroupedValue as number).toLocaleString()}</p>
            </div>
            <div className="w-px h-8 bg-slate-800"></div>
            <div className="text-center">
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Lanes</p>
              <p className="text-lg font-mono font-bold text-brand-muted">{groups.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 flex-1 overflow-x-auto pb-4 no-scrollbar">
          {/* Ungrouped pool */}
          <div className={`flex flex-col bg-brand-slate/30 border border-slate-800/40 rounded-[1.5rem] min-w-[300px] w-[300px] shrink-0 transition-all ${!poolCollapsed ? 'max-h-full' : ''}`}>
            <div className="p-4 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-700/40 flex items-center justify-center text-brand-muted">
                  <LayoutGrid size={16} />
                </div>
                <h3 className="text-sm font-bold text-white">Card Pool</h3>
                <span className="text-[10px] font-mono font-bold text-brand-muted bg-brand-charcoal/60 px-2 py-0.5 rounded-full">
                  {groupedCards.ungrouped.length}
                </span>
              </div>
              <button onClick={() => setPoolCollapsed(!poolCollapsed)} className="p-1.5 text-brand-muted hover:text-white rounded-lg transition-colors">
                {poolCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
            </div>

            {!poolCollapsed && (
              <>
                <div className="px-3 pb-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <input
                      type="text"
                      placeholder="Search cards..."
                      value={poolSearch}
                      onChange={e => setPoolSearch(e.target.value)}
                      className="w-full bg-brand-charcoal/50 border border-slate-800/50 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-brand-lime/30 transition-colors"
                    />
                  </div>
                </div>

                <SortableContext items={poolIds} strategy={verticalListSortingStrategy}>
                  <div className="flex-1 px-3 pb-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-380px)]">
                    {filteredPool.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-brand-muted">
                        <Sparkles size={20} className="mb-2 opacity-40" />
                        <p className="text-xs font-medium">{poolSearch ? 'No matches' : 'All cards organized'}</p>
                      </div>
                    )}
                    {filteredPool.map(card => (
                      <PoolCard key={card.id} card={card} />
                    ))}
                  </div>
                </SortableContext>
              </>
            )}
          </div>

          {/* Group lanes */}
          {groups.map(group => (
            <React.Fragment key={group.id}>
              <SortableContext
                items={(groupedCards.grouped[group.id] || []).map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <Lane
                  group={group}
                  cards={groupedCards.grouped[group.id] || []}
                  stats={groupStats[group.id] || { count: 0, totalValue: 0, totalCost: 0 }}
                  onRename={renameGroup}
                  onDelete={deleteGroup}
                  isOver={overLaneId === group.id}
                />
              </SortableContext>
            </React.Fragment>
          ))}

          {/* Add lane button */}
          <div className="min-w-[280px] w-[280px] shrink-0">
            {isAddingLane ? (
              <div className="bg-brand-slate/30 border border-dashed border-brand-lime/30 rounded-[1.5rem] p-6 space-y-4">
                <input
                  autoFocus
                  value={newLaneName}
                  onChange={e => setNewLaneName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddLane(); if (e.key === 'Escape') { setIsAddingLane(false); setNewLaneName(''); } }}
                  placeholder="Lane name..."
                  className="w-full bg-brand-charcoal border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-brand-lime/40 placeholder:text-brand-muted"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddLane}
                    disabled={!newLaneName.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-brand-lime text-brand-charcoal font-black rounded-xl text-[10px] uppercase tracking-widest transition-all disabled:opacity-40 hover:bg-white"
                  >
                    <Plus size={14} strokeWidth={3} /> Create Lane
                  </button>
                  <button
                    onClick={() => { setIsAddingLane(false); setNewLaneName(''); }}
                    className="px-4 py-3 bg-brand-charcoal border border-slate-700 text-brand-muted rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingLane(true)}
                className="w-full h-32 bg-brand-slate/20 border border-dashed border-slate-700 rounded-[1.5rem] flex flex-col items-center justify-center gap-2 text-brand-muted hover:text-brand-lime hover:border-brand-lime/30 transition-all group"
              >
                <Plus size={24} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Add Lane</span>
              </button>
            )}
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
          {activeCard ? <DragOverlayCard card={activeCard} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default PortfolioBuilder;
