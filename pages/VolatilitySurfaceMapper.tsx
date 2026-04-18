import React, { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import {
  Activity, Waves, BarChart3, TrendingUp, Grid3X3,
  Layers, Filter, Clock
} from 'lucide-react';
import {
  getVolatilityPoints, getVolSkews, getVolHistory,
  getAverageVolByGrade, getPointsByGrade
} from '../lib/volatilitySurfaceService.ts';

const tabs = ['Surface View', 'Skew Analysis', 'Term Structure', 'Historical'] as const;
type Tab = typeof tabs[number];

const gradeColors: Record<string, string> = {
  'PSA 10': '#22c55e',
  'PSA 9': '#3b82f6',
  'BGS 9.5': '#8b5cf6',
  'BGS 10': '#f59e0b',
  'SGC 10': '#06b6d4',
  'Raw': '#ef4444',
};

export default function VolatilitySurfaceMapper() {
  const [activeTab, setActiveTab] = useState<Tab>('Surface View');
  const [selectedGrade, setSelectedGrade] = useState('PSA 10');
  const allPoints = getVolatilityPoints();
  const skews = getVolSkews();
  const volHistory = getVolHistory();
  const avgByGrade = getAverageVolByGrade();

  const gradePoints = allPoints.filter(p => p.grade === selectedGrade);
  const avgVol = Math.round(allPoints.reduce((s, p) => s + p.impliedVol, 0) / allPoints.length * 10) / 10;
  const maxVol = Math.round(Math.max(...allPoints.map(p => p.impliedVol)) * 10) / 10;
  const minVol = Math.round(Math.min(...allPoints.map(p => p.impliedVol)) * 10) / 10;

  const heatmapData = [2018, 2019, 2020, 2021, 2022, 2023, 2024].map(year => {
    const row: Record<string, number | string> = { year };
    ['low', 'medium', 'high', 'elite'].forEach(pop => {
      const pt = gradePoints.find(p => p.year === year && p.popularity === pop);
      row[pop] = pt ? pt.impliedVol : 0;
    });
    return row;
  });

  const stats = [
    { label: 'Avg Implied Vol', value: `${avgVol}%`, icon: Activity, color: '#3b82f6' },
    { label: 'Max Vol', value: `${maxVol}%`, icon: TrendingUp, color: '#ef4444' },
    { label: 'Min Vol', value: `${minVol}%`, icon: Waves, color: '#22c55e' },
    { label: 'Data Points', value: allPoints.length.toString(), icon: Grid3X3, color: '#a855f7' },
  ];

  const grades = ['PSA 10', 'PSA 9', 'BGS 9.5', 'BGS 10', 'SGC 10', 'Raw'];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20">
            <Waves size={24} className="text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Volatility Surface Mapper</h1>
            <p className="text-sm text-gray-400">3D volatility surface by grade, year, and player popularity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">{s.label}</span>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
              <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 border-b border-slate-800 pb-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Surface View' && (
          <div className="space-y-6">
            <div className="flex gap-2 flex-wrap">
              {grades.map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedGrade(g)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    selectedGrade === g
                      ? 'text-white border' : 'bg-slate-800 text-gray-400 hover:text-white border border-slate-700'
                  }`}
                  style={selectedGrade === g ? { backgroundColor: gradeColors[g] + '33', borderColor: gradeColors[g] + '66', color: gradeColors[g] } : {}}
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Implied Volatility - {selectedGrade} (Year x Popularity)</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={heatmapData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="low" name="Low Popularity" fill="#6366f1" />
                  <Bar dataKey="medium" name="Medium" fill="#3b82f6" />
                  <Bar dataKey="high" name="High" fill="#f59e0b" />
                  <Bar dataKey="elite" name="Elite" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Average Volatility by Grade</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={avgByGrade}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="grade" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="avgImplied" name="Implied Vol">
                    {avgByGrade.map((g, i) => (
                      <Cell key={i} fill={gradeColors[g.grade] || '#6b7280'} />
                    ))}
                  </Bar>
                  <Bar dataKey="avgHistorical" name="Historical Vol" fill="#6b7280" opacity={0.5} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'Skew Analysis' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Volatility Skew by Grade</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={skews.filter(s => s.grade === selectedGrade)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="lowPopVol" name="Low Popularity Vol" stroke="#6366f1" strokeWidth={2} />
                  <Line type="monotone" dataKey="medPopVol" name="Medium Vol" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="highPopVol" name="High Vol" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="elitePopVol" name="Elite Vol" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Skew Ratio (Elite/Low Popularity)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={skews.filter(s => s.year === 2023)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="grade" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="skewRatio" name="Skew Ratio">
                    {skews.filter(s => s.year === 2023).map((s, i) => (
                      <Cell key={i} fill={gradeColors[s.grade] || '#6b7280'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex gap-2 flex-wrap mb-4">
              {grades.map(g => (
                <button
                  key={g}
                  onClick={() => setSelectedGrade(g)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    selectedGrade === g
                      ? 'text-white border' : 'bg-slate-800 text-gray-400 hover:text-white border border-slate-700'
                  }`}
                  style={selectedGrade === g ? { backgroundColor: gradeColors[g] + '33', borderColor: gradeColors[g] + '66', color: gradeColors[g] } : {}}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Term Structure' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Volatility Term Structure by Year</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={[2018, 2019, 2020, 2021, 2022, 2023, 2024].map(year => {
                  const pts = allPoints.filter(p => p.year === year);
                  const row: Record<string, number> = { year };
                  grades.forEach(g => {
                    const gPts = pts.filter(p => p.grade === g);
                    row[g] = gPts.length > 0 ? Math.round(gPts.reduce((s, p) => s + p.impliedVol, 0) / gPts.length * 10) / 10 : 0;
                  });
                  return row;
                })}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="year" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  {grades.map(g => (
                    <Line key={g} type="monotone" dataKey={g} name={g} stroke={gradeColors[g]} strokeWidth={2} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Implied vs Historical Spread</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={avgByGrade}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="grade" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="avgImplied" name="Avg Implied Vol" fill="#3b82f6" />
                  <Bar dataKey="avgHistorical" name="Avg Historical Vol" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'Historical' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Volatility History by Grade</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={volHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="psa10Vol" name="PSA 10" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="psa9Vol" name="PSA 9" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="bgs95Vol" name="BGS 9.5" stroke="#8b5cf6" strokeWidth={2} />
                  <Line type="monotone" dataKey="rawVol" name="Raw" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Vintage vs Modern Volatility</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={volHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="modernVol" name="Modern Cards" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
                  <Area type="monotone" dataKey="vintageVol" name="Vintage Cards" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
                  <Area type="monotone" dataKey="avgVol" name="Market Avg" stroke="#a855f7" fill="#a855f7" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
