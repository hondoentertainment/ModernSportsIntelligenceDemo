import React, { useMemo, useState, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceDot,
} from 'recharts';
import {
  X,
  Clock,
  GitCompare,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Plus,
  Calendar,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  PortfolioSnapshot,
  SnapshotComparison,
  DecisionJournalEntry,
  WhatIfAnalysis,
  getSnapshots,
  generateHistoricalSnapshots,
  captureSnapshot,
  compareSnapshots,
  whatIfHeld,
  getJournalEntries,
  addJournalEntry,
  generateYearlyReview,
} from '../lib/timeMachineService';

interface TimeMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: CardInventory[];
}

type TabId = 'timeline' | 'compare' | 'journal';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'timeline', label: 'Timeline', icon: <Clock size={16} /> },
  { id: 'compare', label: 'Compare', icon: <GitCompare size={16} /> },
  { id: 'journal', label: 'Journal', icon: <BookOpen size={16} /> },
];

// ---- Timeline Tab ----

const TimelineTab: React.FC<{
  snapshots: PortfolioSnapshot[];
  journalEntries: DecisionJournalEntry[];
  cards: CardInventory[];
}> = ({ snapshots, journalEntries, cards }) => {
  const [selectedSnapshot, setSelectedSnapshot] = useState<PortfolioSnapshot | null>(null);

  const chartData = useMemo(() => {
    return snapshots.map(s => {
      const hasJournal = journalEntries.some(j => j.date === s.date);
      return {
        date: s.date,
        nav: s.totalNAV,
        label: new Date(s.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        hasJournal,
        cardCount: s.cardCount,
        snapshot: s,
      };
    });
  }, [snapshots, journalEntries]);

  // Yearly review
  const yearlyReview = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return generateYearlyReview(currentYear, cards);
  }, [cards]);

  // What-if analysis
  const whatIfData = useMemo(() => whatIfHeld(cards), [cards]);

  const handleChartClick = useCallback((data: { activePayload?: Array<{ payload: { snapshot: PortfolioSnapshot } }> }) => {
    if (data?.activePayload?.[0]) {
      setSelectedSnapshot(data.activePayload[0].payload.snapshot);
    }
  }, []);

  const journalDates = useMemo(
    () => new Set(journalEntries.map(j => j.date)),
    [journalEntries]
  );
  const journalPoints = useMemo(
    () => chartData.filter(d => journalDates.has(d.date)),
    [chartData, journalDates]
  );

  return (
    <div className="space-y-6">
      {/* NAV Chart */}
      <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            Portfolio NAV Over Time
          </p>
          {snapshots.length > 0 && (
            <span className="text-xs text-slate-400">
              {snapshots.length} snapshots
            </span>
          )}
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} onClick={handleChartClick}>
              <defs>
                <linearGradient id="navGradientModal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#64748b', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#fff',
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'NAV']}
                labelFormatter={(label: string) => label}
              />
              <Area
                type="monotone"
                dataKey="nav"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#navGradientModal)"
                activeDot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2, cursor: 'pointer' }}
              />
              {/* Journal milestone markers */}
              {journalPoints.map(jp => (
                <ReferenceDot
                  key={jp.date}
                  x={jp.label}
                  y={jp.nav}
                  r={6}
                  fill="#f59e0b"
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-slate-500 text-center">
          Click a data point to view snapshot details. Gold dots indicate journal entries.
        </p>
      </div>

      {/* Selected Snapshot Details */}
      {selectedSnapshot && (
        <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-blue-400">
              Snapshot: {new Date(selectedSnapshot.date).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric'
              })}
            </p>
            <button
              onClick={() => setSelectedSnapshot(null)}
              className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X size={14} className="text-slate-400" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">NAV</p>
              <p className="text-lg font-bebas tracking-wider text-white">
                ${selectedSnapshot.totalNAV.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Cards</p>
              <p className="text-lg font-bebas tracking-wider text-white">{selectedSnapshot.cardCount}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Unrealized P/L</p>
              <p className={`text-lg font-bebas tracking-wider ${
                selectedSnapshot.unrealizedPL >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {selectedSnapshot.unrealizedPL >= 0 ? '+' : ''}${selectedSnapshot.unrealizedPL.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Avg Card</p>
              <p className="text-lg font-bebas tracking-wider text-white">
                ${selectedSnapshot.avgCardValue.toLocaleString()}
              </p>
            </div>
          </div>
          {/* Sport Allocation */}
          {Object.keys(selectedSnapshot.sportAllocation).length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Sport Allocation</p>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(selectedSnapshot.sportAllocation)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([sport, pct]) => (
                    <span
                      key={sport}
                      className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300"
                    >
                      {sport}: <span className="text-white font-bold">{pct}%</span>
                    </span>
                  ))}
              </div>
            </div>
          )}
          {/* Top Holdings */}
          {selectedSnapshot.topHoldings.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Top Holdings</p>
              <div className="space-y-1">
                {selectedSnapshot.topHoldings.map((h, i) => (
                  <div key={h.cardId} className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-400">
                      <span className="text-slate-600 font-mono mr-2">{i + 1}.</span>
                      {h.player}
                    </span>
                    <span className="text-white font-mono">${h.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Yearly Review Summary */}
      <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          {yearlyReview.year} Year in Review
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <p className="text-[10px] text-slate-500 uppercase">Total Return</p>
            <p className={`text-xl font-bebas tracking-wider ${
              yearlyReview.totalReturnPercent >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {yearlyReview.totalReturnPercent >= 0 ? '+' : ''}{yearlyReview.totalReturnPercent}%
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase">vs S&P 500</p>
            <p className="text-xl font-bebas tracking-wider text-blue-400">
              +{yearlyReview.sp500ReturnPercent}%
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase">Best Month</p>
            <p className="text-sm text-green-400 font-bold">
              {yearlyReview.bestMonth.month} ({yearlyReview.bestMonth.returnPercent >= 0 ? '+' : ''}{yearlyReview.bestMonth.returnPercent}%)
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase">Worst Month</p>
            <p className="text-sm text-red-400 font-bold">
              {yearlyReview.worstMonth.month} ({yearlyReview.worstMonth.returnPercent >= 0 ? '+' : ''}{yearlyReview.worstMonth.returnPercent}%)
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase">Cards Added</p>
            <p className="text-sm text-white font-bold">{yearlyReview.cardsAdded}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase">Cards Sold</p>
            <p className="text-sm text-white font-bold">{yearlyReview.cardsSold}</p>
          </div>
        </div>
        {yearlyReview.topGainPosition && (
          <div className="flex items-center gap-2 text-xs">
            <TrendingUp size={12} className="text-green-400" />
            <span className="text-slate-400">Top Gainer:</span>
            <span className="text-green-400 font-bold">
              {yearlyReview.topGainPosition.player} (+{yearlyReview.topGainPosition.gainPercent}%)
            </span>
          </div>
        )}
        {yearlyReview.topLossPosition && (
          <div className="flex items-center gap-2 text-xs">
            <TrendingDown size={12} className="text-red-400" />
            <span className="text-slate-400">Top Loser:</span>
            <span className="text-red-400 font-bold">
              {yearlyReview.topLossPosition.player} ({yearlyReview.topLossPosition.lossPercent}%)
            </span>
          </div>
        )}
      </div>

      {/* What-If Section */}
      {whatIfData.soldCards.length > 0 && (
        <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" />
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
              What If You Held?
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Sold For (Total)</p>
              <p className="text-lg font-bebas tracking-wider text-white">
                ${whatIfData.totalSoldFor.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase">Missed Value</p>
              <p className="text-lg font-bebas tracking-wider text-amber-400">
                ${whatIfData.totalMissedValue.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {whatIfData.soldCards.slice(0, 10).map(sc => (
              <div key={sc.cardId} className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-400 truncate flex-1">{sc.player}</span>
                <span className="text-slate-500 mx-2">sold ${sc.soldPrice.toLocaleString()}</span>
                <span className={sc.missedGain > 0 ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                  {sc.missedGain > 0 ? `+$${sc.missedGain.toLocaleString()} missed` : 'No miss'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ---- Compare Tab ----

const CompareTab: React.FC<{
  snapshots: PortfolioSnapshot[];
}> = ({ snapshots }) => {
  const availableDates = useMemo(() => snapshots.map(s => s.date), [snapshots]);

  const [dateA, setDateA] = useState(availableDates.length > 1 ? availableDates[0] : '');
  const [dateB, setDateB] = useState(
    availableDates.length > 1 ? availableDates[availableDates.length - 1] : ''
  );

  const comparison = useMemo<SnapshotComparison | null>(() => {
    if (!dateA || !dateB) return null;
    return compareSnapshots(dateA, dateB);
  }, [dateA, dateB]);

  return (
    <div className="space-y-6">
      {/* Date Pickers */}
      <div className="flex items-center gap-3">
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            From Date
          </label>
          <select
            value={dateA}
            onChange={e => setDateA(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select date...</option>
            {availableDates.map(d => (
              <option key={d} value={d}>
                {new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </option>
            ))}
          </select>
        </div>
        <ArrowRight size={20} className="text-slate-600 mt-5" />
        <div className="flex-1 space-y-1">
          <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            To Date
          </label>
          <select
            value={dateB}
            onChange={e => setDateB(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Select date...</option>
            {availableDates.map(d => (
              <option key={d} value={d}>
                {new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-4">
          {/* NAV Change */}
          <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
                  {new Date(comparison.snapshotA.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                </p>
                <p className="text-xl font-bebas tracking-wider text-white">
                  ${comparison.snapshotA.totalNAV.toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <ArrowRight size={16} className="text-slate-600 mb-1" />
                <p className={`text-lg font-bebas tracking-wider ${
                  comparison.navChange >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {comparison.navChange >= 0 ? '+' : ''}{comparison.navChangePercent}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">
                  {new Date(comparison.snapshotB.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                </p>
                <p className="text-xl font-bebas tracking-wider text-white">
                  ${comparison.snapshotB.totalNAV.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Cards Added/Removed */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-2xl text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Cards Added</p>
              <p className="text-2xl font-bebas tracking-wider text-green-400">+{comparison.cardsAdded}</p>
            </div>
            <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Cards Removed</p>
              <p className="text-2xl font-bebas tracking-wider text-red-400">-{comparison.cardsRemoved}</p>
            </div>
          </div>

          {/* Allocation Drift */}
          {Object.keys(comparison.allocationDrift).length > 0 && (
            <div className="p-5 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-3">
              <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                Allocation Drift
              </p>
              <div className="space-y-2">
                {Object.entries(comparison.allocationDrift)
                  .sort(([, a], [, b]) => Math.abs(b as number) - Math.abs(a as number))
                  .map(([sport, driftVal]) => {
                    const drift = driftVal as number;
                    const absMax = Math.max(
                      1,
                      ...Object.values(comparison.allocationDrift).map(v => Math.abs(v as number))
                    );
                    const barWidth = Math.round((Math.abs(drift) / absMax) * 100);
                    const isPositive = drift >= 0;
                    return (
                      <div key={sport} className="flex items-center gap-3 text-xs">
                        <span className="w-20 text-right text-slate-400 flex-shrink-0">{sport}</span>
                        <div className="flex-1 flex items-center">
                          <div className="w-1/2 flex justify-end">
                            {!isPositive && (
                              <div
                                className="h-3 bg-red-500/60 rounded-l"
                                style={{ width: `${barWidth}%` }}
                              />
                            )}
                          </div>
                          <div className="w-px h-4 bg-slate-600 flex-shrink-0" />
                          <div className="w-1/2">
                            {isPositive && (
                              <div
                                className="h-3 bg-green-500/60 rounded-r"
                                style={{ width: `${barWidth}%` }}
                              />
                            )}
                          </div>
                        </div>
                        <span className={`w-14 text-right font-mono ${
                          isPositive ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {isPositive ? '+' : ''}{drift}pp
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Best/Worst Performers */}
          <div className="grid grid-cols-2 gap-3">
            {comparison.bestPerformer && (
              <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-2xl">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Best Performer</p>
                <p className="text-sm text-green-400 font-bold truncate">{comparison.bestPerformer.player}</p>
                <p className="text-xs text-green-400/70">+${comparison.bestPerformer.gain.toLocaleString()}</p>
              </div>
            )}
            {comparison.worstPerformer && (
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Worst Performer</p>
                <p className="text-sm text-red-400 font-bold truncate">{comparison.worstPerformer.player}</p>
                <p className="text-xs text-red-400/70">${comparison.worstPerformer.loss.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!comparison && dateA && dateB && (
        <div className="text-center py-8 text-slate-500 text-sm">
          No snapshot data available for the selected dates.
        </div>
      )}

      {(!dateA || !dateB) && (
        <div className="text-center py-8 text-slate-500 text-sm">
          Select two dates above to compare portfolio snapshots.
        </div>
      )}
    </div>
  );
};

// ---- Journal Tab ----

const JournalTab: React.FC<{
  entries: DecisionJournalEntry[];
  cards: CardInventory[];
  onEntryAdded: () => void;
}> = ({ entries, cards, onEntryAdded }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDate, setNewDate] = useState(new Date().toISOString().slice(0, 10));
  const [newNote, setNewNote] = useState('');
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);

  const handleAddEntry = useCallback(() => {
    if (!newNote.trim()) return;
    addJournalEntry(newDate, newNote.trim(), selectedCardIds.length > 0 ? selectedCardIds : undefined);
    setNewNote('');
    setSelectedCardIds([]);
    setShowAddForm(false);
    onEntryAdded();
  }, [newDate, newNote, selectedCardIds, onEntryAdded]);

  const toggleCardSelection = useCallback((cardId: string) => {
    setSelectedCardIds(prev =>
      prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
    );
  }, []);

  const activeCards = useMemo(
    () => cards.filter(c => c.status !== 'sold').slice(0, 20),
    [cards]
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
          Decision Journal ({entries.length} entries)
        </p>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-bold hover:bg-blue-500/20 transition-colors"
        >
          <Plus size={12} />
          Add Entry
        </button>
      </div>

      {/* Add Entry Form */}
      {showAddForm && (
        <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 uppercase tracking-widest">Note</label>
            <textarea
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder="Why did you make this decision? What was your thesis?"
              rows={3}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          {/* Card Selector */}
          {activeCards.length > 0 && (
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest">
                Related Cards (optional)
              </label>
              <div className="flex gap-1.5 flex-wrap max-h-24 overflow-y-auto">
                {activeCards.map(c => (
                  <button
                    key={c.id}
                    onClick={() => toggleCardSelection(c.id)}
                    className={`px-2 py-1 rounded-lg text-[11px] transition-colors ${
                      selectedCardIds.includes(c.id)
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {c.player}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddEntry}
              disabled={!newNote.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save Entry
            </button>
          </div>
        </div>
      )}

      {/* Entries List */}
      <div className="space-y-3">
        {[...entries].reverse().map(entry => (
          <div
            key={entry.id}
            className="p-4 bg-slate-800/50 border border-slate-700 rounded-2xl space-y-2"
          >
            <div className="flex items-center gap-2">
              <Calendar size={12} className="text-blue-400" />
              <span className="text-xs text-blue-400 font-bold">
                {new Date(entry.date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span className="text-[10px] text-slate-600 ml-auto">
                {new Date(entry.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{entry.note}</p>
            {entry.cardIds && entry.cardIds.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {entry.cardIds.map(id => {
                  const card = cards.find(c => c.id === id);
                  return (
                    <span
                      key={id}
                      className="px-2 py-0.5 bg-slate-700 text-slate-400 rounded text-[10px]"
                    >
                      {card?.player ?? id}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {entries.length === 0 && !showAddForm && (
        <div className="text-center py-12 space-y-3">
          <BookOpen size={32} className="mx-auto text-slate-600" />
          <p className="text-sm text-slate-500">
            No journal entries yet. Start documenting your decisions to track your thinking over time.
          </p>
        </div>
      )}
    </div>
  );
};

// ---- Main Modal ----

export const TimeMachineModal: React.FC<TimeMachineModalProps> = ({
  isOpen,
  onClose,
  cards,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>('timeline');
  const [journalVersion, setJournalVersion] = useState(0);

  const snapshots = useMemo(() => {
    captureSnapshot(cards);
    const all = generateHistoricalSnapshots(cards);
    return all.length > 0 ? all : getSnapshots();
  }, [cards]);

  const journalEntries = useMemo(
    () => getJournalEntries(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [journalVersion]
  );

  const handleEntryAdded = useCallback(() => {
    setJournalVersion(v => v + 1);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-charcoal/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-700 flex items-center justify-between bg-blue-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/30">
              <Clock size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  <Calendar size={10} />
                  {snapshots.length} snapshots
                </span>
              </div>
              <h2 className="text-2xl font-bebas tracking-widest text-white leading-tight">
                Portfolio <span className="text-blue-400">Time Machine</span>
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
                  ? 'text-blue-400 border-blue-400 bg-blue-500/5'
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
          {activeTab === 'timeline' && (
            <TimelineTab snapshots={snapshots} journalEntries={journalEntries} cards={cards} />
          )}
          {activeTab === 'compare' && <CompareTab snapshots={snapshots} />}
          {activeTab === 'journal' && (
            <JournalTab entries={journalEntries} cards={cards} onEntryAdded={handleEntryAdded} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeMachineModal;
