import React, { useMemo, useState, useCallback } from 'react';
import {
  X,
  Calendar,
  MapPin,
  Package,
  DollarSign,
  History,
  Printer,
  Plus,
  ShoppingCart,
  Tag,
  ArrowRightLeft,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  CheckCircle2,
  Search,
  Trash2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { CardInventory, TargetWatchlist } from '../types';
import {
  CardEvent,
  EventType,
  EventPrepItem,
  EventBudget,
  EventDeal,
  DealType,
  EventROI,
  getUpcomingEvents,
  getAllEvents,
  getEventById,
  createPrepList,
  getPrepList,
  setBudget,
  getBudget,
  logDeal,
  getDeals,
  calculateEventROI,
  getEventHistory,
  generateWantList,
  exportPrepListHTML,
} from '../lib/eventPlannerService';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardInventory[];
  targets?: TargetWatchlist[];
}

type TabId = 'events' | 'prep' | 'budget' | 'deals' | 'roi' | 'wantlist';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'events', label: 'Events', icon: <Calendar size={16} /> },
  { id: 'prep', label: 'Prep', icon: <Package size={16} /> },
  { id: 'budget', label: 'Budget', icon: <DollarSign size={16} /> },
  { id: 'deals', label: 'Deals', icon: <Tag size={16} /> },
  { id: 'roi', label: 'ROI', icon: <TrendingUp size={16} /> },
  { id: 'wantlist', label: 'Want List', icon: <Search size={16} /> },
];

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getEventTypeStyle(type: EventType): { text: string; bg: string; border: string } {
  switch (type) {
    case 'national': return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    case 'regional': return { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' };
    case 'local': return { text: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    case 'trade_night': return { text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' };
  }
}

function formatTypeLabel(type: EventType): string {
  switch (type) {
    case 'national': return 'National';
    case 'regional': return 'Regional';
    case 'local': return 'Local';
    case 'trade_night': return 'Trade Night';
  }
}

// ---- Events Tab ----

const EventsTab: React.FC<{
  onSelectEvent: (eventId: string) => void;
  selectedEventId: string | null;
}> = ({ onSelectEvent, selectedEventId }) => {
  const [filterType, setFilterType] = useState<EventType | 'all'>('all');
  const events = useMemo(() => {
    const all = getUpcomingEvents();
    if (filterType === 'all') return all;
    return all.filter(e => e.type === filterType);
  }, [filterType]);

  const typeFilters: { value: EventType | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'national', label: 'National' },
    { value: 'regional', label: 'Regional' },
    { value: 'local', label: 'Local' },
    { value: 'trade_night', label: 'Trade Nights' },
  ];

  return (
    <div className="space-y-4">
      {/* Type Filters */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {typeFilters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilterType(f.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              filterType === f.value
                ? 'bg-brand-lime/15 text-brand-lime border border-brand-lime/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Event List */}
      <div className="space-y-2">
        {events.map(event => {
          const days = daysUntil(event.date);
          const style = getEventTypeStyle(event.type);
          const isSelected = selectedEventId === event.id;
          return (
            <button
              key={event.id}
              onClick={() => onSelectEvent(event.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all space-y-2 ${
                isSelected
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${style.bg} ${style.text} border ${style.border}`}>
                    {formatTypeLabel(event.type)}
                  </span>
                  <span className="text-sm font-bold text-white">{event.name}</span>
                </div>
                <span className={`flex items-center gap-1 text-xs font-bold flex-shrink-0 ${
                  days <= 7 ? 'text-amber-400' : days <= 30 ? 'text-blue-400' : 'text-slate-400'
                }`}>
                  <Clock size={12} />
                  {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin size={11} /> {event.location}
                </span>
                <span>
                  {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {event.endDate && ` - ${new Date(event.endDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                </span>
                {event.estimatedAttendance && (
                  <span className="flex items-center gap-1">
                    <Users size={11} /> {event.estimatedAttendance.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 line-clamp-1">{event.description}</p>
            </button>
          );
        })}
      </div>

      {events.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          No upcoming events match your filter
        </div>
      )}
    </div>
  );
};

// ---- Prep Tab ----

const PrepTab: React.FC<{
  cards: CardInventory[];
  selectedEventId: string | null;
  onSelectEvent: (eventId: string) => void;
}> = ({ cards, selectedEventId, onSelectEvent }) => {
  const [search, setSearch] = useState('');
  const [prepItems, setPrepItems] = useState<EventPrepItem[]>(() => {
    if (!selectedEventId) return [];
    const existing = getPrepList(selectedEventId);
    return existing?.items ?? [];
  });
  const [editPrices, setEditPrices] = useState<Record<string, string>>({});

  const events = useMemo(() => getUpcomingEvents(), []);
  const activeCards = useMemo(
    () => cards.filter(c => c.status !== 'sold'),
    [cards]
  );

  // Reload prep items when event changes
  const loadPrep = useCallback((eventId: string) => {
    const existing = getPrepList(eventId);
    setPrepItems(existing?.items ?? []);
  }, []);

  const handleEventSelect = useCallback((eventId: string) => {
    onSelectEvent(eventId);
    loadPrep(eventId);
  }, [onSelectEvent, loadPrep]);

  const addCard = useCallback((cardId: string, currentValue: number) => {
    if (!selectedEventId) return;
    if (prepItems.some(p => p.cardId === cardId)) return;
    const newItems = [...prepItems, {
      cardId,
      targetSalePrice: Math.round(currentValue * 1.2 * 100) / 100,
      status: 'pending' as const,
    }];
    setPrepItems(newItems);
    createPrepList(selectedEventId, newItems);
  }, [selectedEventId, prepItems]);

  const removeCard = useCallback((cardId: string) => {
    if (!selectedEventId) return;
    const newItems = prepItems.filter(p => p.cardId !== cardId);
    setPrepItems(newItems);
    createPrepList(selectedEventId, newItems);
  }, [selectedEventId, prepItems]);

  const updatePrice = useCallback((cardId: string, price: number) => {
    if (!selectedEventId) return;
    const newItems = prepItems.map(p =>
      p.cardId === cardId ? { ...p, targetSalePrice: price } : p
    );
    setPrepItems(newItems);
    createPrepList(selectedEventId, newItems);
  }, [selectedEventId, prepItems]);

  const toggleReady = useCallback((cardId: string) => {
    if (!selectedEventId) return;
    const newItems = prepItems.map(p =>
      p.cardId === cardId ? { ...p, status: (p.status === 'ready' ? 'pending' : 'ready') as 'ready' | 'pending' } : p
    );
    setPrepItems(newItems);
    createPrepList(selectedEventId, newItems);
  }, [selectedEventId, prepItems]);

  const handlePrint = useCallback(() => {
    if (!selectedEventId) return;
    const html = exportPrepListHTML(selectedEventId, cards);
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  }, [selectedEventId, cards]);

  const prepCardIds = new Set(prepItems.map(p => p.cardId));

  const filteredCards = useMemo(() => {
    if (!search.trim()) return activeCards;
    const q = search.toLowerCase();
    return activeCards.filter(c =>
      c.player.toLowerCase().includes(q) ||
      c.set.toLowerCase().includes(q) ||
      c.manufacturer.toLowerCase().includes(q)
    );
  }, [activeCards, search]);

  const selectedEvent = selectedEventId ? getEventById(selectedEventId) : null;

  return (
    <div className="space-y-4">
      {/* Event Selector */}
      <div className="flex items-center gap-3">
        <select
          value={selectedEventId ?? ''}
          onChange={e => handleEventSelect(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
        >
          <option value="">Select an event...</option>
          {events.map(e => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
        {selectedEventId && prepItems.length > 0 && (
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-500/20 transition-colors"
          >
            <Printer size={14} />
            Print
          </button>
        )}
      </div>

      {!selectedEventId && (
        <div className="text-center py-8 text-slate-500 text-sm">
          Select an event to manage your prep list
        </div>
      )}

      {selectedEventId && (
        <>
          {/* Prep List */}
          {prepItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">
                Prep List ({prepItems.length} cards)
              </p>
              {prepItems.map(item => {
                const card = cards.find(c => c.id === item.cardId);
                if (!card) return null;
                return (
                  <div
                    key={item.cardId}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      item.status === 'ready'
                        ? 'bg-green-500/5 border-green-500/20'
                        : 'bg-slate-800/50 border-slate-700'
                    }`}
                  >
                    <button
                      onClick={() => toggleReady(item.cardId)}
                      className={`flex-shrink-0 ${
                        item.status === 'ready' ? 'text-green-400' : 'text-slate-600 hover:text-slate-400'
                      }`}
                    >
                      <CheckCircle2 size={18} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{card.player}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {card.year} {card.manufacturer} {card.set} #{card.cardNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-slate-500">$</span>
                      <input
                        type="number"
                        value={editPrices[item.cardId] ?? item.targetSalePrice}
                        onChange={e => setEditPrices(prev => ({ ...prev, [item.cardId]: e.target.value }))}
                        onBlur={() => {
                          const val = parseFloat(editPrices[item.cardId] ?? '');
                          if (!isNaN(val) && val > 0) updatePrice(item.cardId, val);
                          setEditPrices(prev => { const copy = { ...prev }; delete copy[item.cardId]; return copy; });
                        }}
                        className="w-20 px-2 py-1 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white text-right focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={() => removeCard(item.cardId)}
                        className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Card Picker */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">
              Add Cards
            </p>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search cards to add..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1 no-scrollbar">
              {filteredCards.filter(c => !prepCardIds.has(c.id)).slice(0, 20).map(card => (
                <button
                  key={card.id}
                  onClick={() => addCard(card.id, card.currentValue ?? card.purchasePrice)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/30 border border-transparent hover:border-slate-600 text-left transition-colors"
                >
                  <Plus size={14} className="text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{card.player}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {card.year} {card.set} #{card.cardNumber}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-400 flex-shrink-0">
                    ${(card.currentValue ?? card.purchasePrice).toFixed(0)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ---- Budget Tab ----

const BUDGET_FIELDS: { key: keyof Omit<EventBudget, 'eventId' | 'notes'>; label: string; color: string }[] = [
  { key: 'travel', label: 'Travel', color: 'bg-blue-500' },
  { key: 'hotel', label: 'Hotel', color: 'bg-purple-500' },
  { key: 'table', label: 'Table Fee', color: 'bg-amber-500' },
  { key: 'spending', label: 'Card Spending', color: 'bg-green-500' },
  { key: 'food', label: 'Food', color: 'bg-cyan-500' },
  { key: 'other', label: 'Other', color: 'bg-slate-500' },
];

const BudgetTab: React.FC<{
  selectedEventId: string | null;
  onSelectEvent: (eventId: string) => void;
}> = ({ selectedEventId, onSelectEvent }) => {
  const events = useMemo(() => getUpcomingEvents(), []);

  const [budgetValues, setBudgetValues] = useState<Record<string, string>>(() => {
    if (!selectedEventId) return {};
    const existing = getBudget(selectedEventId);
    if (!existing) return {};
    const result: Record<string, string> = {};
    BUDGET_FIELDS.forEach(f => { result[f.key] = String(existing[f.key] ?? 0); });
    result['notes'] = existing.notes ?? '';
    return result;
  });

  const loadBudget = useCallback((eventId: string) => {
    const existing = getBudget(eventId);
    if (existing) {
      const result: Record<string, string> = {};
      BUDGET_FIELDS.forEach(f => { result[f.key] = String(existing[f.key] ?? 0); });
      result['notes'] = existing.notes ?? '';
      setBudgetValues(result);
    } else {
      setBudgetValues({});
    }
  }, []);

  const handleEventSelect = useCallback((eventId: string) => {
    onSelectEvent(eventId);
    loadBudget(eventId);
  }, [onSelectEvent, loadBudget]);

  const saveBudgetValues = useCallback(() => {
    if (!selectedEventId) return;
    setBudget(selectedEventId, {
      travel: parseFloat(budgetValues['travel'] ?? '0') || 0,
      hotel: parseFloat(budgetValues['hotel'] ?? '0') || 0,
      table: parseFloat(budgetValues['table'] ?? '0') || 0,
      spending: parseFloat(budgetValues['spending'] ?? '0') || 0,
      food: parseFloat(budgetValues['food'] ?? '0') || 0,
      other: parseFloat(budgetValues['other'] ?? '0') || 0,
      notes: budgetValues['notes'] ?? '',
    });
  }, [selectedEventId, budgetValues]);

  const totalBudget = BUDGET_FIELDS.reduce(
    (sum, f) => sum + (parseFloat(budgetValues[f.key] ?? '0') || 0),
    0
  );

  return (
    <div className="space-y-4">
      {/* Event Selector */}
      <select
        value={selectedEventId ?? ''}
        onChange={e => handleEventSelect(e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
      >
        <option value="">Select an event...</option>
        {events.map(e => (
          <option key={e.id} value={e.id}>{e.name}</option>
        ))}
      </select>

      {!selectedEventId && (
        <div className="text-center py-8 text-slate-500 text-sm">
          Select an event to plan your budget
        </div>
      )}

      {selectedEventId && (
        <>
          {/* Total */}
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Total Budget</p>
            <p className="text-3xl font-bebas tracking-wider text-white">
              ${totalBudget.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>

          {/* Allocation Bars */}
          {totalBudget > 0 && (
            <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-1">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2">Allocation</p>
              <div className="h-4 rounded-full overflow-hidden flex">
                {BUDGET_FIELDS.map(f => {
                  const val = parseFloat(budgetValues[f.key] ?? '0') || 0;
                  const pct = totalBudget > 0 ? (val / totalBudget) * 100 : 0;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={f.key}
                      className={`${f.color} h-full transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                      title={`${f.label}: $${val.toFixed(0)} (${pct.toFixed(0)}%)`}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-3 mt-2">
                {BUDGET_FIELDS.map(f => {
                  const val = parseFloat(budgetValues[f.key] ?? '0') || 0;
                  if (val === 0) return null;
                  return (
                    <div key={f.key} className="flex items-center gap-1.5 text-xs">
                      <div className={`w-2.5 h-2.5 rounded-sm ${f.color}`} />
                      <span className="text-slate-400">{f.label}</span>
                      <span className="text-white font-mono">${val.toFixed(0)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Budget Fields */}
          <div className="grid grid-cols-2 gap-3">
            {BUDGET_FIELDS.map(f => (
              <div key={f.key} className="space-y-1">
                <label className="text-xs text-slate-400 font-medium">{f.label}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                  <input
                    type="number"
                    value={budgetValues[f.key] ?? ''}
                    onChange={e => setBudgetValues(prev => ({ ...prev, [f.key]: e.target.value }))}
                    onBlur={saveBudgetValues}
                    placeholder="0"
                    className="w-full pl-7 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs text-slate-400 font-medium">Notes</label>
            <textarea
              value={budgetValues['notes'] ?? ''}
              onChange={e => setBudgetValues(prev => ({ ...prev, notes: e.target.value }))}
              onBlur={saveBudgetValues}
              placeholder="Budget notes..."
              rows={2}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </>
      )}
    </div>
  );
};

// ---- Deals Tab ----

const DEAL_TYPES: { value: DealType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'buy', label: 'Buy', icon: <ShoppingCart size={14} />, color: 'text-red-400' },
  { value: 'sell', label: 'Sell', icon: <Tag size={14} />, color: 'text-green-400' },
  { value: 'trade', label: 'Trade', icon: <ArrowRightLeft size={14} />, color: 'text-purple-400' },
];

const DealsTab: React.FC<{
  selectedEventId: string | null;
  onSelectEvent: (eventId: string) => void;
}> = ({ selectedEventId, onSelectEvent }) => {
  const events = useMemo(() => getUpcomingEvents(), []);
  const allEvents = useMemo(() => getAllEvents(), []);

  const [deals, setDeals] = useState<EventDeal[]>(() => {
    if (!selectedEventId) return [];
    return getDeals(selectedEventId);
  });

  const [dealType, setDealType] = useState<DealType>('buy');
  const [dealPlayer, setDealPlayer] = useState('');
  const [dealDesc, setDealDesc] = useState('');
  const [dealPrice, setDealPrice] = useState('');
  const [dealTradeValue, setDealTradeValue] = useState('');
  const [dealNotes, setDealNotes] = useState('');

  const loadDeals = useCallback((eventId: string) => {
    setDeals(getDeals(eventId));
  }, []);

  const handleEventSelect = useCallback((eventId: string) => {
    onSelectEvent(eventId);
    loadDeals(eventId);
  }, [onSelectEvent, loadDeals]);

  const handleAddDeal = useCallback(() => {
    if (!selectedEventId || !dealPlayer.trim() || !dealPrice.trim()) return;
    const newDeal = logDeal(selectedEventId, {
      type: dealType,
      player: dealPlayer.trim(),
      cardDescription: dealDesc.trim(),
      price: parseFloat(dealPrice) || 0,
      tradeValue: dealType === 'trade' ? (parseFloat(dealTradeValue) || 0) : undefined,
      notes: dealNotes.trim() || undefined,
    });
    setDeals(prev => [...prev, newDeal]);
    setDealPlayer('');
    setDealDesc('');
    setDealPrice('');
    setDealTradeValue('');
    setDealNotes('');
  }, [selectedEventId, dealType, dealPlayer, dealDesc, dealPrice, dealTradeValue, dealNotes]);

  // Use allEvents for the deal selector (can log deals for past events too)
  const eventOptions = allEvents;

  return (
    <div className="space-y-4">
      {/* Event Selector */}
      <select
        value={selectedEventId ?? ''}
        onChange={e => handleEventSelect(e.target.value)}
        className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
      >
        <option value="">Select an event...</option>
        {eventOptions.map(e => (
          <option key={e.id} value={e.id}>{e.name}</option>
        ))}
      </select>

      {!selectedEventId && (
        <div className="text-center py-8 text-slate-500 text-sm">
          Select an event to log deals
        </div>
      )}

      {selectedEventId && (
        <>
          {/* Quick-Add Form */}
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Log Deal</p>

            {/* Deal Type Buttons */}
            <div className="flex gap-2">
              {DEAL_TYPES.map(dt => (
                <button
                  key={dt.value}
                  onClick={() => setDealType(dt.value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors border ${
                    dealType === dt.value
                      ? `${dt.color} bg-slate-700 border-slate-600`
                      : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {dt.icon}
                  {dt.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={dealPlayer}
                onChange={e => setDealPlayer(e.target.value)}
                placeholder="Player name *"
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                value={dealDesc}
                onChange={e => setDealDesc(e.target.value)}
                placeholder="Card description"
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
              <input
                type="number"
                value={dealPrice}
                onChange={e => setDealPrice(e.target.value)}
                placeholder="Price *"
                className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
              {dealType === 'trade' && (
                <input
                  type="number"
                  value={dealTradeValue}
                  onChange={e => setDealTradeValue(e.target.value)}
                  placeholder="Trade value received"
                  className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                />
              )}
              <input
                type="text"
                value={dealNotes}
                onChange={e => setDealNotes(e.target.value)}
                placeholder="Notes"
                className={`px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 ${dealType !== 'trade' ? 'col-span-1' : ''}`}
              />
            </div>

            <button
              onClick={handleAddDeal}
              disabled={!dealPlayer.trim() || !dealPrice.trim()}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-bold hover:bg-blue-500/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
              Add Deal
            </button>
          </div>

          {/* Deal List */}
          {deals.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">
                Deals ({deals.length})
              </p>
              {deals.map(deal => {
                const dt = DEAL_TYPES.find(t => t.value === deal.type);
                return (
                  <div
                    key={deal.id}
                    className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl"
                  >
                    <span className={`flex-shrink-0 ${dt?.color ?? 'text-slate-400'}`}>
                      {dt?.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{deal.player}</p>
                      {deal.cardDescription && (
                        <p className="text-xs text-slate-400 truncate">{deal.cardDescription}</p>
                      )}
                    </div>
                    <span className={`text-sm font-mono font-bold flex-shrink-0 ${
                      deal.type === 'sell' ? 'text-green-400' : deal.type === 'buy' ? 'text-red-400' : 'text-purple-400'
                    }`}>
                      {deal.type === 'sell' ? '+' : deal.type === 'buy' ? '-' : ''}${deal.price.toFixed(0)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {deals.length === 0 && (
            <div className="text-center py-4 text-slate-500 text-sm">
              No deals logged yet
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ---- ROI Tab ----

const ROITab: React.FC = () => {
  const history = useMemo(() => getEventHistory(), []);

  const chartData = useMemo(() => {
    return history.map(r => ({
      name: r.eventName.length > 18 ? r.eventName.slice(0, 16) + '..' : r.eventName,
      spent: r.totalBudgetSpent + r.totalDealsSpent,
      earned: r.totalDealsEarned + r.totalTradeValue,
    }));
  }, [history]);

  const cumulativeData = useMemo(() => {
    let cumSpent = 0;
    let cumEarned = 0;
    return history.map(r => {
      cumSpent += r.totalBudgetSpent + r.totalDealsSpent;
      cumEarned += r.totalDealsEarned + r.totalTradeValue;
      return {
        name: r.eventName.length > 12 ? r.eventName.slice(0, 10) + '..' : r.eventName,
        cumROI: cumSpent > 0 ? ((cumEarned - cumSpent) / cumSpent) * 100 : 0,
      };
    });
  }, [history]);

  const totals = useMemo(() => {
    const totalSpent = history.reduce((s, r) => s + r.totalBudgetSpent + r.totalDealsSpent, 0);
    const totalEarned = history.reduce((s, r) => s + r.totalDealsEarned + r.totalTradeValue, 0);
    return {
      totalSpent,
      totalEarned,
      net: totalEarned - totalSpent,
      pct: totalSpent > 0 ? ((totalEarned - totalSpent) / totalSpent) * 100 : 0,
      events: history.length,
      deals: history.reduce((s, r) => s + r.dealCount, 0),
    };
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm">
        No event history yet. Log deals and set budgets to see ROI analytics here.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Aggregate Summary */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Events</p>
          <p className="text-2xl font-bebas tracking-wider text-white">{totals.events}</p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Total Spent</p>
          <p className="text-2xl font-bebas tracking-wider text-slate-300">${totals.totalSpent.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Total Earned</p>
          <p className="text-2xl font-bebas tracking-wider text-green-400">${totals.totalEarned.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-center">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-1">Net ROI</p>
          <p className={`text-2xl font-bebas tracking-wider ${totals.pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totals.pct >= 0 ? '+' : ''}{totals.pct.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Spent vs Earned Bar Chart */}
      <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-2xl">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Spent vs Earned by Event</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem' }}
              labelStyle={{ color: '#f8fafc' }}
              formatter={(value: number, name: string) => [
                `$${value.toLocaleString()}`,
                name === 'spent' ? 'Spent' : 'Earned',
              ]}
            />
            <Bar dataKey="spent" fill="#ef4444" radius={[4, 4, 0, 0]} />
            <Bar dataKey="earned" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cumulative ROI Line Chart */}
      {cumulativeData.length > 1 && (
        <div className="p-4 bg-slate-800/30 border border-slate-700 rounded-2xl">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">Cumulative ROI Trend</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={cumulativeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '0.75rem' }}
                labelStyle={{ color: '#f8fafc' }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'ROI']}
              />
              <Line type="monotone" dataKey="cumROI" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Event History Detail */}
      <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest px-1">
        Event History ({history.length})
      </p>

      {history.map(roi => {
        const event = getEventById(roi.eventId);
        return (
          <div
            key={roi.eventId}
            className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">{roi.eventName}</p>
                {event && (
                  <p className="text-xs text-slate-500">
                    {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    {' | '}{event.location}
                  </p>
                )}
              </div>
              <div className={`flex items-center gap-1 text-lg font-bebas tracking-wider ${
                roi.netROI >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {roi.netROI >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                {roi.netROI >= 0 ? '+' : ''}${roi.netROI.toFixed(0)}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 bg-slate-700/50 rounded-xl text-center">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Budget</p>
                <p className="text-sm font-mono text-red-400">-${roi.totalBudgetSpent.toFixed(0)}</p>
              </div>
              <div className="p-2.5 bg-slate-700/50 rounded-xl text-center">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Bought</p>
                <p className="text-sm font-mono text-red-400">-${roi.totalDealsSpent.toFixed(0)}</p>
              </div>
              <div className="p-2.5 bg-slate-700/50 rounded-xl text-center">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sold</p>
                <p className="text-sm font-mono text-green-400">+${roi.totalDealsEarned.toFixed(0)}</p>
              </div>
              <div className="p-2.5 bg-slate-700/50 rounded-xl text-center">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Trades</p>
                <p className="text-sm font-mono text-purple-400">${roi.totalTradeValue.toFixed(0)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Tag size={12} />
              {roi.dealCount} deal{roi.dealCount !== 1 ? 's' : ''} logged
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---- Want List Tab ----

const WantListTab: React.FC<{
  targets: TargetWatchlist[];
}> = ({ targets }) => {
  const wantList = useMemo(() => generateWantList(targets), [targets]);

  const handleExport = useCallback(() => {
    let text = '=== CARD SHOW WANT LIST ===\n';
    text += `Generated: ${new Date().toLocaleDateString()}\n`;
    text += `Total items: ${wantList.length}\n\n`;

    wantList.forEach((item, i) => {
      const stars = item.priority === 'High' ? '***' : item.priority === 'Medium' ? '** ' : '*  ';
      text += `${i + 1}. ${stars} ${item.player}\n`;
      text += `   ${item.cardDescription}\n`;
      text += `   Max: $${item.targetPrice.toFixed(0)}`;
      if (item.notes) text += ` | ${item.notes}`;
      text += '\n\n';
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `want-list-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [wantList]);

  const priorityColors: Record<string, string> = {
    High: 'text-red-400 bg-red-500/10 border-red-500/30',
    Medium: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    Low: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white">Show Shopping Want List</h4>
          <p className="text-xs text-slate-500">{wantList.length} items from your watchlist</p>
        </div>
        {wantList.length > 0 && (
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <Printer size={13} />
            Export
          </button>
        )}
      </div>

      <div className="space-y-2">
        {wantList.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No active watchlist items. Add targets to your watchlist to generate a show shopping list.
          </div>
        ) : (
          wantList.map(item => (
            <div key={item.id} className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700 rounded-xl">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-white truncate">{item.player}</span>
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded border ${priorityColors[item.priority] ?? priorityColors.Low}`}>
                    {item.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate">{item.cardDescription}</p>
                {item.notes && <p className="text-xs text-slate-500 mt-0.5 italic truncate">{item.notes}</p>}
              </div>
              <span className="text-sm font-bold text-green-400 flex-shrink-0">
                max ${item.targetPrice.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>

      {wantList.length > 0 && (
        <div className="p-3 bg-slate-800/30 border border-slate-700 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              {wantList.filter(w => w.priority === 'High').length} High
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {wantList.filter(w => w.priority === 'Medium').length} Medium
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              {wantList.filter(w => w.priority === 'Low').length} Low
            </span>
          </div>
          <span className="text-xs font-bold text-white">
            Total max: ${wantList.reduce((s, w) => s + w.targetPrice, 0).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
};

// ---- Main Modal ----

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  cards,
  targets = [],
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('events');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleSelectEvent = useCallback((eventId: string) => {
    setSelectedEventId(eventId);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-blue-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/30">
              <Calendar size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  <MapPin size={10} />
                  Card Shows & Events
                </span>
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Event <span className="text-blue-400">Planner</span>
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
              onClick={() => setActiveTab(tab.id)}
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
          {activeTab === 'events' && (
            <EventsTab
              onSelectEvent={handleSelectEvent}
              selectedEventId={selectedEventId}
            />
          )}
          {activeTab === 'prep' && (
            <PrepTab
              cards={cards}
              selectedEventId={selectedEventId}
              onSelectEvent={handleSelectEvent}
            />
          )}
          {activeTab === 'budget' && (
            <BudgetTab
              selectedEventId={selectedEventId}
              onSelectEvent={handleSelectEvent}
            />
          )}
          {activeTab === 'deals' && (
            <DealsTab
              selectedEventId={selectedEventId}
              onSelectEvent={handleSelectEvent}
            />
          )}
          {activeTab === 'roi' && <ROITab />}
          {activeTab === 'wantlist' && <WantListTab targets={targets} />}
        </div>
      </div>
    </div>
  );
};

export default EventModal;
