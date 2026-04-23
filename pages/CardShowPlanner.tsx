// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  Calendar,
  MapPin,
  DollarSign,
  Star,
  Users,
  ClipboardList,
  BarChart3,
  Plus,
  Tag,
  ShoppingBag,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  getAllShows,
  getUpcomingShows,
  getPastShows,
  getShowPlans,
  getShowStats,
  getPostShowReports,
  createShowPlan,
  addExpense,
  createPostShowReport,
  formatCurrency,
  getShowTypeColor,
  getShowTypeLabel,
  getPriorityColor,
  getShowsByState,
  type CardShow,
  type ShowPlan,
  type PostShowReport,
  type Priority,
} from '../lib/utils/cardShowPlannerService.ts';

type TabId = 'upcoming' | 'plans' | 'past' | 'stats';

const TABS: { id: TabId; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming Shows' },
  { id: 'plans', label: 'My Plans' },
  { id: 'past', label: 'Past Shows' },
  { id: 'stats', label: 'Stats' },
];

const PIE_COLORS = ['#8b5cf6', '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

function ShowCard({ show }: { show: CardShow }) {
  return (
    <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-slate-500 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-slate-100">{show.name}</h3>
        <span
          className={`${getShowTypeColor(show.type)} text-white text-xs font-bold px-2.5 py-1 rounded-full`}
        >
          {getShowTypeLabel(show.type)}
        </span>
      </div>
      <p className="text-sm text-slate-400 mb-3">{show.description}</p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Calendar size={14} className="text-slate-500" />
          {show.date}
          {show.endDate !== show.date && ` — ${show.endDate}`}
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <MapPin size={14} className="text-slate-500" />
          {show.city}, {show.state}
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <Users size={14} className="text-slate-500" />
          {show.vendors} vendors
        </div>
        <div className="flex items-center gap-1.5 text-slate-300">
          <DollarSign size={14} className="text-slate-500" />
          {formatCurrency(show.admissionCost)} admission
        </div>
      </div>
      {show.featured && (
        <div className="mt-3 flex items-center gap-1 text-amber-400 text-xs font-semibold">
          <Star size={12} />
          Featured Show
        </div>
      )}
    </div>
  );
}

function UpcomingTab() {
  const shows = useMemo(() => getUpcomingShows(), []);
  const states = useMemo(() => {
    const s = new Set(shows.map((sh) => sh.state));
    return Array.from(s).sort();
  }, [shows]);
  const [stateFilter, setStateFilter] = useState('');

  const filtered = stateFilter ? getShowsByState(stateFilter) : shows;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2"
        >
          <option value="">All States</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="text-sm text-slate-400">{filtered.length} shows</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((show) => (
          <ShowCard key={show.id} show={show} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-slate-500 text-center py-12">No upcoming shows found.</p>
      )}
    </div>
  );
}

function PlansTab() {
  const plans = useMemo(() => getShowPlans(), []);
  const allShows = useMemo(() => getAllShows(), []);

  const showMap = useMemo(() => {
    const m: Record<string, CardShow> = {};
    allShows.forEach((s) => {
      m[s.id] = s;
    });
    return m;
  }, [allShows]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">My Show Plans</h2>
        <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} />
          New Plan
        </button>
      </div>
      {plans.length === 0 && (
        <p className="text-slate-500 text-center py-12">
          No plans yet. Create a plan for an upcoming show!
        </p>
      )}
      {plans.map((plan) => {
        const show = showMap[plan.showId];
        const remaining = plan.budget - plan.totalSpent;
        const pct = plan.budget > 0 ? Math.min((plan.totalSpent / plan.budget) * 100, 100) : 0;
        return (
          <div
            key={plan.id}
            className="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-100">
                  {show ? show.name : plan.showId}
                </h3>
                {show && (
                  <span className="text-xs text-slate-400">
                    {show.city}, {show.state} — {show.date}
                  </span>
                )}
              </div>
              <span className="text-sm font-semibold text-slate-300">
                Budget: {formatCurrency(plan.budget)}
              </span>
            </div>
            {/* Budget bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Spent: {formatCurrency(plan.totalSpent)}</span>
                <span>Remaining: {formatCurrency(remaining)}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${pct > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            {/* Want list */}
            {plan.wantList.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Want List</h4>
                <div className="space-y-1">
                  {plan.wantList.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">
                        <Tag size={12} className="inline mr-1 text-slate-500" />
                        {item.cardName} — {item.player}
                      </span>
                      <span className="flex items-center gap-2">
                        <span className={getPriorityColor(item.priority)}>{item.priority}</span>
                        <span className="text-slate-400">max {formatCurrency(item.maxPrice)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Expenses */}
            {plan.expenses.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase mb-1">Expenses</h4>
                <div className="space-y-1">
                  {plan.expenses.map((exp, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{exp.category}</span>
                      <span className="text-slate-400">{formatCurrency(exp.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {plan.rating && (
              <div className="flex items-center gap-1 text-amber-400 text-sm">
                {Array.from({ length: plan.rating }).map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PastTab() {
  const shows = useMemo(() => getPastShows(), []);
  const reports = useMemo(() => getPostShowReports(), []);

  const reportMap = useMemo(() => {
    const m: Record<string, PostShowReport> = {};
    reports.forEach((r) => {
      m[r.showId] = r;
    });
    return m;
  }, [reports]);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-100">Past Shows</h2>
      {shows.length === 0 && (
        <p className="text-slate-500 text-center py-12">No past shows recorded yet.</p>
      )}
      {shows.map((show) => {
        const report = reportMap[show.id];
        return (
          <div
            key={show.id}
            className="bg-slate-800 rounded-xl p-5 border border-slate-700 space-y-3"
          >
            <ShowCard show={show} />
            {report && (
              <div className="bg-slate-900 rounded-lg p-4 space-y-2 mt-2 border border-slate-700">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                  <ClipboardList size={14} /> Post-Show Report
                </h4>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500">Cards Acquired</span>
                    <p className="text-slate-200 font-semibold">{report.cardsAcquired.length}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Total Spent</span>
                    <p className="text-slate-200 font-semibold">
                      {formatCurrency(report.totalSpent)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Budget Remaining</span>
                    <p className="text-slate-200 font-semibold">
                      {formatCurrency(report.budgetRemaining)}
                    </p>
                  </div>
                </div>
                {report.highlights && (
                  <p className="text-slate-400 text-sm">{report.highlights}</p>
                )}
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  {Array.from({ length: report.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="currentColor" />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatsTab() {
  const stats = useMemo(() => getShowStats(), []);
  const reports = useMemo(() => getPostShowReports(), []);
  const plans = useMemo(() => getShowPlans(), []);
  const allShows = useMemo(() => getAllShows(), []);

  const showMap = useMemo(() => {
    const m: Record<string, CardShow> = {};
    allShows.forEach((s) => {
      m[s.id] = s;
    });
    return m;
  }, [allShows]);

  // Budget vs Spent bar chart data
  const budgetVsSpent = useMemo(() => {
    return plans.map((p) => {
      const show = showMap[p.showId];
      return {
        name: show ? show.name.slice(0, 20) : p.showId,
        Budget: p.budget,
        Spent: p.totalSpent,
      };
    });
  }, [plans, showMap]);

  // Spending by category pie chart data
  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    plans.forEach((p) => {
      p.expenses.forEach((e) => {
        cats[e.category] = (cats[e.category] || 0) + e.amount;
      });
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [plans]);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Shows Attended', value: stats.totalAttended, icon: Calendar },
          { label: 'Total Spent', value: formatCurrency(stats.totalSpent), icon: DollarSign },
          { label: 'Cards Acquired', value: stats.totalCardsAcquired, icon: ShoppingBag },
          {
            label: 'Avg Spend/Show',
            value: formatCurrency(stats.avgSpendPerShow),
            icon: BarChart3,
          },
          { label: 'Upcoming', value: stats.upcomingShows, icon: Calendar },
          { label: 'Fav. Venue', value: stats.favoriteVenue, icon: MapPin },
        ].map((s, i) => (
          <div key={i} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <s.icon size={14} />
              {s.label}
            </div>
            <p className="text-slate-100 font-semibold text-sm truncate">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Budget vs Spent bar chart */}
      {budgetVsSpent.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-base font-semibold text-slate-100 mb-4">Budget vs Spent</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgetVsSpent}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Bar dataKey="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Spent" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Spending by category pie chart */}
      {categoryData.length > 0 && (
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <h3 className="text-base font-semibold text-slate-100 mb-4">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

const CardShowPlanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('upcoming');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-blue-600/20">
          <Calendar size={24} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Card Show Planner</h1>
          <p className="text-sm text-slate-400">
            Plan your card show visits, track budgets, and review past experiences
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800 rounded-lg p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'upcoming' && <UpcomingTab />}
        {activeTab === 'plans' && <PlansTab />}
        {activeTab === 'past' && <PastTab />}
        {activeTab === 'stats' && <StatsTab />}
      </div>
    </div>
  );
};

export default CardShowPlanner;
