import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  AreaChart, Area, ComposedChart,
} from 'recharts';
import {
  getAllNarrativeArcs, getNarrativeValuation, compareNarrativeArcs,
  getNarrativeTrends, getCulturalMoments, getNarrativePremiumLeaderboard,
  predictNarrativeTrajectory,
  type NarrativeArc, type ArcType,
} from '../lib/narrativeArcService';

const ARC_COLORS: Record<ArcType, string> = {
  rise: '#22c55e', peak: '#eab308', decline: '#ef4444', redemption: '#a855f7',
  dynasty: '#3b82f6', tragedy: '#6b7280', comeback: '#f97316', underdog: '#14b8a6',
  rivalry: '#dc2626', legacy: '#f59e0b',
};

const TABS = ['Story Board', 'Narrative Valuation', 'Arc Comparison', 'Cultural Moments', 'Trend Watch', 'Premium Leaderboard'] as const;

export default function NarrativeArcEngine() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Story Board');
  const [selectedArcId, setSelectedArcId] = useState('arc-jordan');
  const [compareArcId1, setCompareArcId1] = useState('arc-jordan');
  const [compareArcId2, setCompareArcId2] = useState('arc-kobe');
  const [sportFilter, setSportFilter] = useState<string>('All');

  const arcs = useMemo(() => getAllNarrativeArcs(), []);
  const leaderboard = useMemo(() => getNarrativePremiumLeaderboard(), []);
  const trends = useMemo(() => getNarrativeTrends(), []);
  const moments = useMemo(() => getCulturalMoments(), []);

  const selectedArc = useMemo(() => arcs.find(a => a.id === selectedArcId) ?? arcs[0], [arcs, selectedArcId]);
  const selectedValuation = useMemo(() => getNarrativeValuation(selectedArc.playerId), [selectedArc]);

  const filteredArcs = useMemo(() => {
    if (sportFilter === 'All') return arcs;
    return arcs.filter(a => a.sport === sportFilter);
  }, [arcs, sportFilter]);

  const comparison = useMemo(() => compareNarrativeArcs(compareArcId1, compareArcId2), [compareArcId1, compareArcId2]);

  const storyChartData = useMemo(() => {
    return selectedArc.chapters.map(ch => ({
      chapter: `Ch ${ch.number}`,
      title: ch.title,
      impact: ch.cardValueImpact,
      sentiment: ch.sentiment === 'positive' ? 80 : ch.sentiment === 'negative' ? 20 : ch.sentiment === 'dramatic' ? 60 : 50,
    }));
  }, [selectedArc]);

  const valuationRadarData = useMemo(() => {
    if (!selectedValuation) return [];
    const c = selectedValuation.components;
    return [
      { metric: 'Arc Type', value: c.arcType },
      { metric: 'Emotional', value: c.emotionalIntensity },
      { metric: 'Media', value: c.mediaAmplification },
      { metric: 'Cultural', value: c.culturalRelevance },
      { metric: 'Scarcity', value: c.scarcityNarrative },
    ];
  }, [selectedValuation]);

  const comparisonChartData = useMemo(() => {
    const arc1 = arcs.find(a => a.id === compareArcId1);
    const arc2 = arcs.find(a => a.id === compareArcId2);
    if (!arc1 || !arc2) return [];
    const maxLen = Math.max(arc1.chapters.length, arc2.chapters.length);
    const data = [];
    let cum1 = 0, cum2 = 0;
    for (let i = 0; i < maxLen; i++) {
      cum1 += arc1.chapters[i]?.cardValueImpact ?? 0;
      cum2 += arc2.chapters[i]?.cardValueImpact ?? 0;
      data.push({ chapter: `Ch ${i + 1}`, [arc1.playerName]: cum1, [arc2.playerName]: cum2 });
    }
    return data;
  }, [arcs, compareArcId1, compareArcId2]);

  const sports = useMemo(() => ['All', ...Array.from(new Set(arcs.map(a => a.sport)))], [arcs]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Narrative Arc Engine
          </h1>
          <p className="text-gray-400 mt-1">Quantifying how storytelling drives collectible value</p>
        </div>
        <div className="flex gap-2">
          {sports.map(s => (
            <button key={s} onClick={() => setSportFilter(s)}
              className={`px-3 py-1 rounded text-sm ${sportFilter === s ? 'bg-amber-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${activeTab === tab ? 'bg-amber-600 text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Story Board */}
      {activeTab === 'Story Board' && (
        <div className="space-y-4">
          <div className="flex gap-4 items-center">
            <select value={selectedArcId} onChange={e => setSelectedArcId(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm">
              {filteredArcs.map(a => <option key={a.id} value={a.id}>{a.playerName} ({a.sport})</option>)}
            </select>
            <span className="px-3 py-1 rounded text-sm font-medium" style={{ backgroundColor: ARC_COLORS[selectedArc.arcType] + '30', color: ARC_COLORS[selectedArc.arcType] }}>
              {selectedArc.arcType.toUpperCase()}
            </span>
            <span className="text-gray-400 text-sm">
              Chapter {selectedArc.currentChapter}/{selectedArc.totalChapters} | Phase: {selectedArc.arcPhase}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-amber-400">{selectedArc.narrativeScore}</div>
              <div className="text-xs text-gray-500 mt-1">Narrative Score</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-400">{selectedArc.emotionalIntensity}</div>
              <div className="text-xs text-gray-500 mt-1">Emotional Intensity</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-400">{selectedArc.mediaAmplification}</div>
              <div className="text-xs text-gray-500 mt-1">Media Amplification</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold" style={{ color: ARC_COLORS[selectedArc.arcType] }}>
                {selectedArc.arcType}
              </div>
              <div className="text-xs text-gray-500 mt-1">Arc Type</div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Card Value Impact by Chapter</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={storyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="chapter" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="impact" name="Card Value Impact %" fill={ARC_COLORS[selectedArc.arcType]} radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="sentiment" name="Sentiment" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Chapter Timeline */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Chapter Timeline</h3>
            {selectedArc.chapters.map(ch => (
              <div key={ch.number} className="bg-gray-900 rounded-lg p-4 border-l-4" style={{ borderColor: ARC_COLORS[selectedArc.arcType] }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-300">Ch {ch.number}</span>
                    <span className="font-semibold text-white">{ch.title}</span>
                    <span className="text-xs text-gray-500">{ch.period}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${ch.cardValueImpact >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {ch.cardValueImpact >= 0 ? '+' : ''}{ch.cardValueImpact}%
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      ch.sentiment === 'positive' ? 'bg-green-900/50 text-green-400' :
                      ch.sentiment === 'negative' ? 'bg-red-900/50 text-red-400' :
                      ch.sentiment === 'dramatic' ? 'bg-purple-900/50 text-purple-400' :
                      'bg-gray-800 text-gray-400'
                    }`}>{ch.sentiment}</span>
                  </div>
                </div>
                <ul className="text-sm text-gray-400 space-y-1">
                  {ch.events.map((ev, i) => <li key={i}>- {ev}</li>)}
                </ul>
                {ch.keyCards.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {ch.keyCards.map((card, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-800 rounded text-xs text-amber-400">{card}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Narrative Valuation */}
      {activeTab === 'Narrative Valuation' && selectedValuation && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-900 rounded-lg p-6 text-center">
              <div className="text-sm text-gray-400">Base Value</div>
              <div className="text-2xl font-bold text-white mt-1">${selectedValuation.baseValue.toLocaleString()}</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 text-center">
              <div className="text-sm text-gray-400">Narrative Premium</div>
              <div className={`text-2xl font-bold mt-1 ${selectedValuation.narrativePremium >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {selectedValuation.narrativePremium >= 0 ? '+' : ''}{selectedValuation.narrativePremium}%
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 text-center">
              <div className="text-sm text-gray-400">Narrative-Adjusted Value</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">
                ${Math.round(selectedValuation.baseValue * (1 + selectedValuation.narrativePremium / 100)).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Premium Components (Radar)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={valuationRadarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <Radar name="Score" dataKey="value" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-gray-900 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Premium Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={valuationRadarData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" fontSize={12} />
                  <YAxis dataKey="metric" type="category" stroke="#9ca3af" fontSize={12} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trajectory prediction */}
          {(() => {
            const trajectory = predictNarrativeTrajectory(selectedArc.playerId);
            if (!trajectory) return null;
            return (
              <div className="bg-gray-900 rounded-lg p-4 border border-amber-800/50">
                <h3 className="text-sm font-semibold text-amber-400 mb-2">Investment Outlook</h3>
                <p className="text-gray-300 text-sm">{trajectory.investmentOutlook}</p>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  <span>Projected Phase: {trajectory.projectedPhase}</span>
                  <span>Projected Score: {trajectory.projectedScore}</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Arc Comparison */}
      {activeTab === 'Arc Comparison' && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <select value={compareArcId1} onChange={e => setCompareArcId1(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm flex-1">
              {arcs.map(a => <option key={a.id} value={a.id}>{a.playerName}</option>)}
            </select>
            <span className="text-gray-500 self-center">vs</span>
            <select value={compareArcId2} onChange={e => setCompareArcId2(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm flex-1">
              {arcs.map(a => <option key={a.id} value={a.id}>{a.playerName}</option>)}
            </select>
          </div>

          {comparison && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-amber-400">{comparison.arcSimilarity.toFixed(0)}%</div>
                  <div className="text-xs text-gray-500 mt-1">Arc Similarity</div>
                </div>
                <div className="bg-gray-900 rounded-lg p-4 text-center col-span-2">
                  <div className="text-sm text-gray-300">{comparison.divergencePoint}</div>
                  <div className="text-xs text-gray-500 mt-1">Divergence Analysis</div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">Cumulative Card Value Impact Overlay</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={comparisonChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="chapter" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                    <Legend />
                    {comparisonChartData[0] && Object.keys(comparisonChartData[0]).filter(k => k !== 'chapter').map((name, i) => (
                      <Area key={name} type="monotone" dataKey={name} stroke={i === 0 ? '#3b82f6' : '#f59e0b'} fill={i === 0 ? '#3b82f6' : '#f59e0b'} fillOpacity={0.15} strokeWidth={2} />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {comparison.projectedOutcomes.map((o, i) => (
                  <div key={i} className="bg-gray-900 rounded-lg p-3 text-sm text-gray-300">{o}</div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Cultural Moments */}
      {activeTab === 'Cultural Moments' && (
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Cultural Moment Impact</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={moments.slice(0, 12).map(m => ({ name: m.event.substring(0, 30) + '...', impact: m.cardImpact, year: m.date.substring(0, 4) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} angle={-20} textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                <Bar dataKey="impact" name="Card Value Impact %" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {moments.map(m => (
              <div key={m.id} className="bg-gray-900 rounded-lg p-4 flex items-start gap-4">
                <div className="text-center min-w-[80px]">
                  <div className="text-sm font-bold text-gray-300">{m.date.substring(0, 4)}</div>
                  <div className="text-xs text-gray-500">{m.date.substring(5)}</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-white">{m.event}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      m.category === 'championship' ? 'bg-green-900/50 text-green-400' :
                      m.category === 'scandal' ? 'bg-red-900/50 text-red-400' :
                      m.category === 'death' ? 'bg-gray-800 text-gray-300' :
                      m.category === 'comeback' ? 'bg-orange-900/50 text-orange-400' :
                      m.category === 'trade' ? 'bg-blue-900/50 text-blue-400' :
                      m.category === 'injury' ? 'bg-red-900/50 text-red-300' :
                      m.category === 'record-break' ? 'bg-amber-900/50 text-amber-400' :
                      'bg-gray-800 text-gray-400'
                    }`}>{m.category}</span>
                  </div>
                  <p className="text-sm text-gray-400">{m.narrativeShift}</p>
                  <div className="text-xs text-gray-500 mt-1">Players: {m.players.join(', ')}</div>
                </div>
                <div className={`text-lg font-bold ${m.cardImpact >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {m.cardImpact >= 0 ? '+' : ''}{m.cardImpact}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trend Watch */}
      {activeTab === 'Trend Watch' && (
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Trend Momentum</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trends.map(t => ({ name: t.name, momentum: t.momentum }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" domain={[0, 100]} stroke="#9ca3af" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={11} width={180} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                <Bar dataKey="momentum" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {trends.map(t => (
              <div key={t.trendId} className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-white">{t.name}</h4>
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: `${t.momentum}%` }} />
                    </div>
                    <span className="text-xs text-amber-400 ml-1">{t.momentum}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-2">{t.description}</p>
                <div className="bg-gray-800 rounded p-2 text-xs text-gray-300 mb-2">
                  <span className="text-amber-400 font-medium">Thesis:</span> {t.investmentThesis}
                </div>
                <div className="flex gap-1 flex-wrap">
                  {t.players.map(p => (
                    <span key={p} className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-300">{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Premium Leaderboard */}
      {activeTab === 'Premium Leaderboard' && (
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Narrative Premium Rankings</h3>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={leaderboard.map(v => ({ name: v.playerName, premium: v.narrativePremium }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} angle={-30} textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                <Bar dataKey="premium" name="Narrative Premium %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800 text-gray-400">
                  <th className="text-left p-3">Rank</th>
                  <th className="text-left p-3">Player</th>
                  <th className="text-left p-3">Arc Type</th>
                  <th className="text-right p-3">Base Value</th>
                  <th className="text-right p-3">Premium</th>
                  <th className="text-right p-3">Adjusted Value</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((v, i) => {
                  const arc = arcs.find(a => a.playerId === v.playerId);
                  return (
                    <tr key={v.playerId} className="border-t border-gray-800 hover:bg-gray-800/50">
                      <td className="p-3 font-bold text-gray-300">#{i + 1}</td>
                      <td className="p-3 font-semibold text-white">{v.playerName}</td>
                      <td className="p-3">
                        {arc && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: ARC_COLORS[arc.arcType] + '30', color: ARC_COLORS[arc.arcType] }}>
                            {arc.arcType}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right text-gray-300">${v.baseValue.toLocaleString()}</td>
                      <td className={`p-3 text-right font-bold ${v.narrativePremium >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {v.narrativePremium >= 0 ? '+' : ''}{v.narrativePremium}%
                      </td>
                      <td className="p-3 text-right font-bold text-amber-400">
                        ${Math.round(v.baseValue * (1 + v.narrativePremium / 100)).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
