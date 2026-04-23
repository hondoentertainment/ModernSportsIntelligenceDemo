// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, CheckSquare, AlertTriangle, Box, ClipboardList, Star, Shield, Lightbulb, Package, Search } from 'lucide-react';
import {
  getGuides,
  getGuidesByCategory,
  getChecklists,
  createChecklist,
  updateChecklistItem,
  getCommonMistakes,
  getMistakesBySeverity,
  getHolderRecommendations,
  getSubmissionTips,
  getPrepStats,
  formatTime,
  getCategoryColor,
  getCategoryLabel,
  getDifficultyColor,
  getSeverityColor,
  getFrequencyLabel,
  type PrepGuide,
  type SubmissionChecklist,
  type CommonMistake,
  type HolderRecommendation,
  type PrepStats,
  type PrepCategory,
  type CardSize,
  type MistakeSeverity,
} from '../lib/core/gradingPrepService.ts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

type Tab = 'guides' | 'checklists' | 'mistakes' | 'holders';

const GradingPrep: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('guides');
  const [guides, setGuides] = useState<PrepGuide[]>([]);
  const [checklists, setChecklists] = useState<SubmissionChecklist[]>([]);
  const [mistakes, setMistakes] = useState<CommonMistake[]>([]);
  const [holderRecs, setHolderRecs] = useState<HolderRecommendation[]>([]);
  const [stats, setStats] = useState<PrepStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PrepCategory | 'all'>('all');
  const [selectedCardSize, setSelectedCardSize] = useState<CardSize>('standard');
  const [selectedSeverity, setSelectedSeverity] = useState<MistakeSeverity | 'all'>('all');
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const [tips] = useState<string[]>(getSubmissionTips());

  useEffect(() => {
    try {
      setGuides(getGuides());
      setChecklists(getChecklists());
      setMistakes(getCommonMistakes());
      setHolderRecs(getHolderRecommendations(selectedCardSize));
      setStats(getPrepStats());
      setLoading(false);
    } catch {
      setError('Failed to load Grading Prep data');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setHolderRecs(getHolderRecommendations(selectedCardSize));
  }, [selectedCardSize]);

  const filteredGuides = useMemo(() => {
    if (selectedCategory === 'all') return guides;
    return getGuidesByCategory(selectedCategory);
  }, [guides, selectedCategory]);

  const filteredMistakes = useMemo(() => {
    if (selectedSeverity === 'all') return mistakes;
    return getMistakesBySeverity(selectedSeverity);
  }, [mistakes, selectedSeverity]);

  const categoryChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    guides.forEach((g) => {
      const label = getCategoryLabel(g.category);
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [guides]);

  const handleChecklistToggle = (checklistId: string, taskIndex: number, completed: boolean) => {
    const updated = updateChecklistItem(checklistId, taskIndex, !completed);
    if (updated) {
      setChecklists(getChecklists());
    }
  };

  const handleCreateChecklist = () => {
    const newChecklist = createChecklist({
      cardName: 'New Card Submission',
      player: 'Player Name',
      items: [
        { task: 'Inspect card surface', completed: false, category: 'inspection' },
        { task: 'Check centering', completed: false, category: 'inspection' },
        { task: 'Clean card surface', completed: false, category: 'cleaning' },
        { task: 'Place in penny sleeve', completed: false, category: 'holders' },
        { task: 'Insert into card saver', completed: false, category: 'holders' },
        { task: 'Fill out submission form', completed: false, category: 'submission' },
        { task: 'Package for shipping', completed: false, category: 'shipping' },
      ],
      notes: '',
    });
    setChecklists(getChecklists());
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'guides', label: 'Prep Guides', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'checklists', label: 'My Checklists', icon: <CheckSquare className="w-4 h-4" /> },
    { key: 'mistakes', label: 'Common Mistakes', icon: <AlertTriangle className="w-4 h-4" /> },
    { key: 'holders', label: 'Holder Guide', icon: <Box className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading Grading Prep Guide...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-blue-400" />
            Card Grading Prep Guide
          </h1>
          <p className="text-slate-400 mt-2">Step-by-step guides, checklists, and tips for professional card grading preparation</p>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm">Guides Available</div>
              <div className="text-2xl font-bold text-blue-400">{stats.totalGuidesRead}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm">Checklists Done</div>
              <div className="text-2xl font-bold text-green-400">{stats.checklistsCompleted}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm">Avg Completion</div>
              <div className="text-2xl font-bold text-yellow-400">{stats.avgCompletionRate}%</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm">Top Category</div>
              <div className="text-2xl font-bold text-purple-400">{getCategoryLabel(stats.topCategory as PrepCategory)}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <div className="text-slate-400 text-sm">Mistakes Listed</div>
              <div className="text-2xl font-bold text-red-400">{stats.mistakesAvoided}</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-slate-800 rounded-lg p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'guides' && (
          <div>
            {/* Category Filter */}
            <div className="flex gap-2 mb-6 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-full text-sm ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                All
              </button>
              {(['cleaning', 'holders', 'submission', 'inspection', 'shipping'] as PrepCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-sm ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                >
                  {getCategoryLabel(cat)}
                </button>
              ))}
            </div>

            {/* Category Chart */}
            <div className="bg-slate-800 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-4">Guides by Category</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Guide Cards */}
            <div className="grid gap-4">
              {filteredGuides.map((guide) => (
                <div key={guide.id} className="bg-slate-800 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{guide.title}</h3>
                      <div className="flex gap-2 mt-1">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: getCategoryColor(guide.category) + '20', color: getCategoryColor(guide.category) }}
                        >
                          {getCategoryLabel(guide.category)}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: getDifficultyColor(guide.difficulty) + '20', color: getDifficultyColor(guide.difficulty) }}
                        >
                          {guide.difficulty}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300">
                          {guide.estimatedTime}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedGuide(expandedGuide === guide.id ? null : guide.id)}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      {expandedGuide === guide.id ? 'Collapse' : 'View Steps'}
                    </button>
                  </div>

                  {expandedGuide === guide.id && (
                    <div className="mt-4">
                      {/* Steps */}
                      <div className="space-y-3 mb-4">
                        {guide.steps.map((step) => (
                          <div key={step.stepNumber} className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                              {step.stepNumber}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{step.title}</div>
                              <div className="text-slate-400 text-sm">{step.description}</div>
                              {step.tip && (
                                <div className="flex items-center gap-1 mt-1 text-green-400 text-sm">
                                  <Lightbulb className="w-3 h-3" />
                                  <span>Tip: {step.tip}</span>
                                </div>
                              )}
                              {step.warning && (
                                <div className="flex items-center gap-1 mt-1 text-yellow-400 text-sm">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Warning: {step.warning}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Tools */}
                      <div className="bg-slate-700/50 rounded p-3">
                        <div className="text-sm font-medium text-slate-300 mb-2">Tools Needed:</div>
                        <div className="flex flex-wrap gap-2">
                          {guide.tools.map((tool) => (
                            <span key={tool} className="px-2 py-1 bg-slate-600 rounded text-xs text-slate-200">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'checklists' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Submission Checklists</h2>
              <button
                onClick={handleCreateChecklist}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
              >
                + New Checklist
              </button>
            </div>

            {/* Submission Tips */}
            <div className="bg-slate-800 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Submission Tips
              </h3>
              <div className="grid md:grid-cols-2 gap-2">
                {tips.slice(0, 6).map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                    {tip}
                  </div>
                ))}
              </div>
            </div>

            {checklists.length === 0 ? (
              <div className="bg-slate-800 rounded-lg p-8 text-center text-slate-400">
                <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No checklists yet. Create one to track your submission preparation.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {checklists.map((checklist) => (
                  <div key={checklist.id} className="bg-slate-800 rounded-lg p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{checklist.cardName}</h3>
                        <p className="text-slate-400 text-sm">{checklist.player}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: checklist.completionPercent === 100 ? '#22c55e' : '#f59e0b' }}>
                          {checklist.completionPercent}%
                        </div>
                        <div className="text-slate-400 text-xs">Complete</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${checklist.completionPercent}%`,
                          backgroundColor: checklist.completionPercent === 100 ? '#22c55e' : '#3b82f6',
                        }}
                      />
                    </div>

                    {/* Checklist Items */}
                    <div className="space-y-2">
                      {checklist.items.map((item, idx) => (
                        <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => handleChecklistToggle(checklist.id, idx, item.completed)}
                            className="w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                          />
                          <span className={`text-sm ${item.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                            {item.task}
                          </span>
                          <span className="text-xs text-slate-500 ml-auto">{item.category}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'mistakes' && (
          <div>
            {/* Severity Filter */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setSelectedSeverity('all')}
                className={`px-3 py-1 rounded-full text-sm ${selectedSeverity === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}
              >
                All
              </button>
              {(['minor', 'major', 'critical'] as MistakeSeverity[]).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSelectedSeverity(sev)}
                  className={`px-3 py-1 rounded-full text-sm`}
                  style={selectedSeverity === sev
                    ? { backgroundColor: getSeverityColor(sev), color: 'white' }
                    : { backgroundColor: '#1e293b', color: '#94a3b8' }}
                >
                  {sev.charAt(0).toUpperCase() + sev.slice(1)}
                </button>
              ))}
            </div>

            {/* Mistakes Gallery */}
            <div className="grid md:grid-cols-2 gap-4">
              {filteredMistakes.map((mistake) => (
                <div key={mistake.id} className="bg-slate-800 rounded-lg p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{mistake.title}</h3>
                    <div className="flex gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ backgroundColor: getSeverityColor(mistake.severity) + '20', color: getSeverityColor(mistake.severity) }}
                      >
                        {mistake.severity}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-slate-300">
                        {getFrequencyLabel(mistake.frequency)}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-400 text-sm mb-3">{mistake.description}</p>
                  <div className="flex items-start gap-2 bg-green-900/20 rounded p-2">
                    <Shield className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-green-300">{mistake.prevention}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Severity Distribution Chart */}
            <div className="bg-slate-800 rounded-lg p-4 mt-6">
              <h3 className="text-lg font-semibold mb-4">Mistakes by Severity</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Minor', value: getMistakesBySeverity('minor').length, fill: getSeverityColor('minor') },
                      { name: 'Major', value: getMistakesBySeverity('major').length, fill: getSeverityColor('major') },
                      { name: 'Critical', value: getMistakesBySeverity('critical').length, fill: getSeverityColor('critical') },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    <Cell fill={getSeverityColor('minor')} />
                    <Cell fill={getSeverityColor('major')} />
                    <Cell fill={getSeverityColor('critical')} />
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'holders' && (
          <div>
            {/* Card Size Selector */}
            <div className="flex gap-2 mb-6">
              {(['standard', 'thick', 'booklet', 'oversized'] as CardSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedCardSize(size)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    selectedCardSize === size ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>

            {/* Holder Recommendation Table */}
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-700">
                    <th className="text-left p-3 text-sm font-medium text-slate-300">Holder Type</th>
                    <th className="text-left p-3 text-sm font-medium text-slate-300">Brand</th>
                    <th className="text-left p-3 text-sm font-medium text-slate-300">Fits</th>
                    <th className="text-right p-3 text-sm font-medium text-slate-300">Cost</th>
                    <th className="text-center p-3 text-sm font-medium text-slate-300">Recommended</th>
                  </tr>
                </thead>
                <tbody>
                  {holderRecs.map((rec, idx) => (
                    <tr key={idx} className="border-t border-slate-700 hover:bg-slate-700/50">
                      <td className="p-3 text-sm">{rec.holderType}</td>
                      <td className="p-3 text-sm text-slate-400">{rec.brand}</td>
                      <td className="p-3 text-sm text-slate-400">{rec.fits}</td>
                      <td className="p-3 text-sm text-right">${rec.cost.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        {rec.recommended ? (
                          <span className="px-2 py-0.5 rounded text-xs bg-green-900/30 text-green-400">Yes</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs bg-slate-700 text-slate-500">No</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tools Shopping List */}
            <div className="bg-slate-800 rounded-lg p-5 mt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-400" />
                Tools Shopping List
              </h3>
              <div className="grid md:grid-cols-3 gap-3">
                {Array.from(new Set(guides.flatMap((g) => g.tools))).sort().map((tool) => (
                  <div key={tool} className="flex items-center gap-2 text-sm text-slate-300 bg-slate-700/50 rounded p-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                    {tool}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradingPrep;
