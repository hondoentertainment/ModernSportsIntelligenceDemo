import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap, BookOpen, Trophy, ShoppingBag, BookMarked, Users, Shield,
  DollarSign, HelpCircle, Flame, Target, Star, ChevronRight, CheckCircle,
  Lock, AlertTriangle, Clock, Sparkles, Award, Heart,
} from 'lucide-react';
import {
  getLearningModules,
  getAchievements,
  getStarterCollections,
  getGlossaryTerms,
  getMentorProfiles,
  getSafetyTips,
  getBudgetPlans,
  getQuizQuestions,
  getCommunityChallenges,
  getProgressTracker,
  completeModule,
  answerQuiz,
  getXpProgressData,
  getLevelLabel,
  getSkillLevelLabel,
  getSkillLevelColor,
  getTierColor,
  getTierBg,
  type LearningModule,
  type Achievement,
  type StarterCollection,
  type GlossaryTerm,
  type MentorProfile,
  type SafetyTip,
  type BudgetPlan,
  type QuizQuestion,
  type CommunityChallenge,
  type ProgressTracker,
} from '../lib/youthOnboardingService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type TabId = 'dashboard' | 'modules' | 'achievements' | 'collections' | 'glossary' | 'mentors' | 'quiz' | 'budget' | 'safety' | 'challenges';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'modules', label: 'Modules', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'achievements', label: 'Achievements', icon: <Trophy className="w-4 h-4" /> },
  { id: 'collections', label: 'Starter Kits', icon: <ShoppingBag className="w-4 h-4" /> },
  { id: 'glossary', label: 'Glossary', icon: <BookMarked className="w-4 h-4" /> },
  { id: 'mentors', label: 'Mentors', icon: <Users className="w-4 h-4" /> },
  { id: 'quiz', label: 'Quiz', icon: <HelpCircle className="w-4 h-4" /> },
  { id: 'budget', label: 'Budget', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'safety', label: 'Safety', icon: <Shield className="w-4 h-4" /> },
  { id: 'challenges', label: 'Challenges', icon: <Target className="w-4 h-4" /> },
];

const YouthOnboarding: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [collections, setCollections] = useState<StarterCollection[]>([]);
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([]);
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [safetyTips, setSafetyTips] = useState<SafetyTip[]>([]);
  const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [tracker, setTracker] = useState<ProgressTracker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [glossarySearch, setGlossarySearch] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [quizResult, setQuizResult] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<StarterCollection | null>(null);

  useEffect(() => {
    try {
      setModules(getLearningModules());
      setAchievements(getAchievements());
      setCollections(getStarterCollections());
      setGlossary(getGlossaryTerms());
      setMentors(getMentorProfiles());
      setSafetyTips(getSafetyTips());
      setBudgetPlans(getBudgetPlans());
      setQuizQuestions(getQuizQuestions());
      setChallenges(getCommunityChallenges());
      setTracker(getProgressTracker());
      setLoading(false);
    } catch {
      setError('Failed to load Youth Onboarding data');
      setLoading(false);
    }
  }, []);

  const xpProgressData = useMemo(() => getXpProgressData(), [tracker]);

  const completedModuleCount = useMemo(() => modules.filter(m => m.completed).length, [modules]);
  const unlockedAchievementCount = useMemo(() => achievements.filter(a => a.unlocked).length, [achievements]);
  const activeChallenges = useMemo(() => challenges.filter(c => c.status === 'active'), [challenges]);

  const filteredGlossary = useMemo(() => {
    if (!glossarySearch.trim()) return glossary;
    const q = glossarySearch.toLowerCase();
    return glossary.filter(t => t.term.toLowerCase().includes(q) || t.definition.toLowerCase().includes(q));
  }, [glossary, glossarySearch]);

  const currentLevelXp = useMemo(() => {
    if (!tracker) return { current: 0, needed: 100, percent: 0 };
    const data = xpProgressData.find(d => d.level === tracker.currentLevel);
    return {
      current: data?.currentXp ?? 0,
      needed: data?.nextLevelXp ?? 100,
      percent: data?.progressPercent ?? 0,
    };
  }, [tracker, xpProgressData]);

  const handleCompleteModule = (moduleId: string) => {
    const updated = completeModule(moduleId);
    setTracker(updated);
    setModules(getLearningModules());
  };

  const handleQuizSubmit = (questionId: string) => {
    if (quizAnswer === null) return;
    const result = answerQuiz(questionId, quizAnswer);
    setQuizResult({ correct: result.correct, explanation: quizQuestions.find(q => q.id === questionId)?.explanation ?? '' });
    setTracker(result.tracker);
  };

  const handleNextQuiz = () => {
    setSelectedQuiz(null);
    setQuizAnswer(null);
    setQuizResult(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading Youth Onboarding Platform...</p>
        </div>
      </div>
    );
  }

  if (error || !tracker) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Failed to Load</h2>
        <p className="text-slate-400">{error ?? 'Unknown error occurred'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <GraduationCap className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Youth & Next-Gen Onboarding</h1>
                <p className="text-xs text-slate-400">Learn, collect, and grow your hobby knowledge</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-slate-400">Level {tracker.currentLevel}</p>
                <p className="text-sm font-bold text-emerald-400">{getLevelLabel(tracker.currentLevel)}</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-amber-400">{tracker.totalXp.toLocaleString()} XP</span>
              </div>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Level {tracker.currentLevel} Progress</span>
              <span>{currentLevelXp.current} / {currentLevelXp.needed} XP</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, currentLevelXp.percent)}%` }}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ===== Dashboard Tab ===== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-center">
                <GraduationCap className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{tracker.currentLevel}</p>
                <p className="text-xs text-slate-400">Current Level</p>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-center">
                <Sparkles className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-amber-400">{tracker.totalXp.toLocaleString()}</p>
                <p className="text-xs text-slate-400">Total XP</p>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-center">
                <BookOpen className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-400">{completedModuleCount}/{modules.length}</p>
                <p className="text-xs text-slate-400">Modules Done</p>
              </div>
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-center">
                <Trophy className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-400">{unlockedAchievementCount}/{achievements.length}</p>
                <p className="text-xs text-slate-400">Achievements</p>
              </div>
            </div>

            {/* XP Progress Chart */}
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" /> XP Progress by Level
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={xpProgressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="level" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Level', position: 'insideBottom', offset: -2, fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'XP Progress %', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                      labelFormatter={(v) => `Level ${v}`}
                      formatter={(value: number, name: string) => [`${value}%`, 'Progress']}
                    />
                    <Bar dataKey="progressPercent" fill="#10b981" radius={[4, 4, 0, 0]} name="Progress" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Next Module */}
              {modules.filter(m => !m.completed).sort((a, b) => a.order - b.order)[0] && (
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" /> Next Module
                  </h3>
                  {(() => {
                    const next = modules.filter(m => !m.completed).sort((a, b) => a.order - b.order)[0];
                    return (
                      <div>
                        <p className="text-xs font-medium text-white">{next.title}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{next.description}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {next.estimatedMinutes} min
                          </span>
                          <button
                            onClick={() => setActiveTab('modules')}
                            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                          >
                            Start <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Active Challenges */}
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-400" /> Active Challenges
                </h3>
                <p className="text-2xl font-bold text-cyan-400">{activeChallenges.length}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {activeChallenges.reduce((sum, c) => sum + c.xpReward, 0)} XP available
                </p>
                <button
                  onClick={() => setActiveTab('challenges')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-2"
                >
                  View All <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Streak */}
              <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" /> Daily Streak
                </h3>
                <p className="text-2xl font-bold text-orange-400">{tracker.streakDays} days</p>
                <p className="text-[11px] text-slate-400 mt-1">Keep learning to maintain your streak!</p>
              </div>
            </div>
          </div>
        )}

        {/* ===== Modules Tab ===== */}
        {activeTab === 'modules' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" /> Learning Modules
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.sort((a, b) => a.order - b.order).map(mod => {
                const prereqsMet = mod.prerequisites.every(p => modules.find(m => m.id === p)?.completed);
                const isLocked = !prereqsMet && !mod.completed;
                return (
                  <div
                    key={mod.id}
                    className={`bg-slate-900 border rounded-xl p-4 transition-all ${
                      mod.completed
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : isLocked
                        ? 'border-slate-700/50 opacity-60'
                        : 'border-slate-700 hover:border-emerald-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {mod.completed ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : isLocked ? (
                          <Lock className="w-5 h-5 text-slate-600" />
                        ) : (
                          <BookOpen className="w-5 h-5 text-blue-400" />
                        )}
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getSkillLevelColor(mod.skillLevel)} bg-slate-800`}>
                          {getSkillLevelLabel(mod.skillLevel)}
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-400 font-bold">+{mod.xpReward} XP</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{mod.title}</h4>
                    <p className="text-[11px] text-slate-400 mb-3">{mod.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {mod.topics.slice(0, 3).map(topic => (
                        <span key={topic} className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                          {topic}
                        </span>
                      ))}
                      {mod.topics.length > 3 && (
                        <span className="text-[9px] text-slate-500">+{mod.topics.length - 3} more</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {mod.estimatedMinutes} min
                      </span>
                      {mod.completed ? (
                        <span className="text-[10px] text-emerald-400 font-bold">Completed</span>
                      ) : isLocked ? (
                        <span className="text-[10px] text-slate-500">Prerequisites needed</span>
                      ) : (
                        <button
                          onClick={() => handleCompleteModule(mod.id)}
                          className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg hover:bg-emerald-500/30 transition-colors"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== Achievements Tab ===== */}
        {activeTab === 'achievements' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-purple-400" /> Achievement Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {achievements.map(ach => (
                <div
                  key={ach.id}
                  className={`bg-slate-900 border rounded-xl p-3 text-center transition-all ${
                    ach.unlocked
                      ? `${getTierBg(ach.tier)}`
                      : 'border-slate-700/50 opacity-50'
                  }`}
                >
                  <div className={`text-2xl mb-2 ${ach.unlocked ? getTierColor(ach.tier) : 'text-slate-600'}`}>
                    {ach.unlocked ? (
                      <Award className="w-8 h-8 mx-auto" />
                    ) : (
                      <Lock className="w-8 h-8 mx-auto" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-white mb-0.5">{ach.name}</h4>
                  <p className="text-[10px] text-slate-400 mb-1">{ach.description}</p>
                  <div className="flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-400">+{ach.xpReward} XP</span>
                  </div>
                  <p className={`text-[9px] mt-1 font-bold capitalize ${getTierColor(ach.tier)}`}>{ach.tier}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== Starter Collections Tab ===== */}
        {activeTab === 'collections' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-pink-400" /> Starter Collections
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.map(col => (
                <div
                  key={col.id}
                  className={`bg-slate-900 border rounded-xl overflow-hidden transition-all cursor-pointer ${
                    selectedCollection?.id === col.id ? 'border-pink-500/50' : 'border-slate-700 hover:border-pink-500/30'
                  }`}
                  onClick={() => setSelectedCollection(selectedCollection?.id === col.id ? null : col)}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-bold text-white">{col.name}</h4>
                      <span className="text-sm font-bold text-emerald-400">${col.budget}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-3">{col.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span>{col.sport}</span>
                      <span>&middot;</span>
                      <span>{col.cardCount} cards</span>
                      <span>&middot;</span>
                      <span className={getSkillLevelColor(col.difficulty)}>{getSkillLevelLabel(col.difficulty)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[10px] text-slate-500">Est. Value: ${col.estimatedValue}</span>
                      <span className="text-[10px] text-emerald-400 font-bold">
                        +{Math.round(((col.estimatedValue - col.budget) / col.budget) * 100)}% value
                      </span>
                    </div>
                  </div>
                  {selectedCollection?.id === col.id && (
                    <div className="border-t border-slate-700 p-4 bg-slate-800/30">
                      <h5 className="text-xs font-bold text-slate-300 mb-2">What&apos;s Included:</h5>
                      <ul className="space-y-1.5">
                        {col.cards.map((card, i) => (
                          <li key={i} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-300">{card.name}</span>
                            <span className="text-slate-500">~${card.estimated}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== Glossary Tab ===== */}
        {activeTab === 'glossary' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-cyan-400" /> Collector Glossary
              </h2>
              <span className="text-xs text-slate-400">{glossary.length} terms</span>
            </div>
            <input
              type="text"
              placeholder="Search terms..."
              value={glossarySearch}
              onChange={(e) => setGlossarySearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredGlossary.map(term => (
                <div key={term.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-bold text-cyan-400">{term.term}</h4>
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">{term.category}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mb-2">{term.definition}</p>
                  <p className="text-[10px] text-slate-500 italic">Example: {term.example}</p>
                  {term.relatedTerms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {term.relatedTerms.map(rt => (
                        <span key={rt} className="text-[9px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded">{rt}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== Mentors Tab ===== */}
        {activeTab === 'mentors' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" /> Mentor Matching
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mentors.map(mentor => (
                <div key={mentor.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm font-bold text-indigo-400 shrink-0">
                      {mentor.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className="text-sm font-bold text-white truncate">{mentor.name}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="text-xs text-amber-400">{mentor.rating}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-indigo-400 font-medium">{mentor.specialty}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{mentor.bio}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {mentor.collectingFocus.map(focus => (
                          <span key={focus} className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">{focus}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[10px] text-slate-500">{mentor.experience} yrs exp &middot; {mentor.mentees} mentees</span>
                        {mentor.available ? (
                          <button className="text-xs bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-lg hover:bg-indigo-500/30 transition-colors flex items-center gap-1">
                            <Heart className="w-3 h-3" /> Connect
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-1 rounded">Unavailable</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== Quiz Tab ===== */}
        {activeTab === 'quiz' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-yellow-400" /> Knowledge Quiz
            </h2>
            {!selectedQuiz ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {quizQuestions.map(q => {
                  const passed = tracker.quizzesPassed.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      className={`bg-slate-900 border rounded-xl p-4 cursor-pointer transition-all ${
                        passed ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-700 hover:border-yellow-500/30'
                      }`}
                      onClick={() => { if (!passed) { setSelectedQuiz(q.id); setQuizAnswer(null); setQuizResult(null); } }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getSkillLevelColor(q.difficulty)} bg-slate-800`}>
                          {getSkillLevelLabel(q.difficulty)}
                        </span>
                        <span className="text-[10px] text-amber-400 font-bold">+{q.xpReward} XP</span>
                      </div>
                      <p className="text-xs text-white mb-2">{q.question}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">{q.category}</span>
                        {passed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              (() => {
                const q = quizQuestions.find(qq => qq.id === selectedQuiz);
                if (!q) return null;
                return (
                  <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${getSkillLevelColor(q.difficulty)} bg-slate-800`}>
                        {getSkillLevelLabel(q.difficulty)} &middot; {q.category}
                      </span>
                      <span className="text-xs text-amber-400 font-bold">+{q.xpReward} XP</span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-4">{q.question}</h3>
                    <div className="space-y-2 mb-4">
                      {q.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => { if (!quizResult) setQuizAnswer(i); }}
                          className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all border ${
                            quizResult
                              ? i === q.correctIndex
                                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                                : i === quizAnswer && !quizResult.correct
                                ? 'border-red-500/50 bg-red-500/10 text-red-400'
                                : 'border-slate-700 text-slate-400'
                              : quizAnswer === i
                              ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400'
                              : 'border-slate-700 text-slate-300 hover:border-slate-600'
                          }`}
                          disabled={!!quizResult}
                        >
                          <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>
                          {opt}
                        </button>
                      ))}
                    </div>
                    {quizResult ? (
                      <div className={`p-4 rounded-lg border mb-4 ${quizResult.correct ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                        <p className={`text-sm font-bold mb-1 ${quizResult.correct ? 'text-emerald-400' : 'text-red-400'}`}>
                          {quizResult.correct ? 'Correct!' : 'Incorrect'}
                        </p>
                        <p className="text-xs text-slate-300">{quizResult.explanation}</p>
                      </div>
                    ) : null}
                    <div className="flex justify-between">
                      <button
                        onClick={handleNextQuiz}
                        className="text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        Back to Questions
                      </button>
                      {!quizResult ? (
                        <button
                          onClick={() => handleQuizSubmit(q.id)}
                          disabled={quizAnswer === null}
                          className="text-xs bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg hover:bg-yellow-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Submit Answer
                        </button>
                      ) : (
                        <button
                          onClick={handleNextQuiz}
                          className="text-xs bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg hover:bg-emerald-500/30 transition-colors"
                        >
                          Next Question
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* ===== Budget Tab ===== */}
        {activeTab === 'budget' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" /> Budget Planning
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgetPlans.map(plan => (
                <div key={plan.id} className="bg-slate-900 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">{plan.name}</h4>
                      <span className={`text-[10px] font-bold ${getSkillLevelColor(plan.skillLevel)}`}>
                        {getSkillLevelLabel(plan.skillLevel)}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-green-400">${plan.monthlyBudget}<span className="text-[10px] text-slate-500">/mo</span></p>
                  </div>
                  <div className="space-y-2 mb-3">
                    {plan.breakdown.map(item => (
                      <div key={item.category}>
                        <div className="flex items-center justify-between text-[11px] mb-0.5">
                          <span className="text-slate-300">{item.category}</span>
                          <span className="text-slate-400">${item.amount} ({item.percentage}%)</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5">
                          <div
                            className="bg-green-500/60 h-1.5 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-700 pt-3">
                    <p className="text-[10px] text-slate-400 font-bold mb-1">Tips:</p>
                    <ul className="space-y-0.5">
                      {plan.tips.map((tip, i) => (
                        <li key={i} className="text-[10px] text-slate-500 flex items-start gap-1">
                          <span className="text-green-400 mt-0.5">&#8226;</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== Safety Tab ===== */}
        {activeTab === 'safety' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" /> Safety Tips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {safetyTips.map(tip => (
                <div
                  key={tip.id}
                  className={`bg-slate-900 border rounded-xl p-4 ${
                    tip.importance === 'critical'
                      ? 'border-red-500/30'
                      : tip.importance === 'high'
                      ? 'border-orange-500/30'
                      : 'border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      tip.importance === 'critical'
                        ? 'bg-red-500/10'
                        : tip.importance === 'high'
                        ? 'bg-orange-500/10'
                        : 'bg-slate-800'
                    }`}>
                      <Shield className={`w-5 h-5 ${
                        tip.importance === 'critical'
                          ? 'text-red-400'
                          : tip.importance === 'high'
                          ? 'text-orange-400'
                          : 'text-slate-400'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-white">{tip.title}</h4>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          tip.importance === 'critical'
                            ? 'bg-red-500/10 text-red-400'
                            : tip.importance === 'high'
                            ? 'bg-orange-500/10 text-orange-400'
                            : tip.importance === 'medium'
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {tip.importance}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{tip.description}</p>
                      <span className="text-[9px] text-slate-500 mt-2 inline-block">{tip.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== Challenges Tab ===== */}
        {activeTab === 'challenges' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" /> Community Challenges
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {challenges.map(ch => (
                <div
                  key={ch.id}
                  className={`bg-slate-900 border rounded-xl p-4 ${
                    ch.status === 'active'
                      ? 'border-cyan-500/30'
                      : ch.status === 'upcoming'
                      ? 'border-amber-500/30'
                      : 'border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-white">{ch.title}</h4>
                      <span className={`text-[10px] font-bold ${
                        ch.type === 'weekly' ? 'text-blue-400' : ch.type === 'monthly' ? 'text-purple-400' : 'text-amber-400'
                      }`}>
                        {ch.type.charAt(0).toUpperCase() + ch.type.slice(1)}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      ch.status === 'active'
                        ? 'bg-cyan-500/10 text-cyan-400'
                        : ch.status === 'upcoming'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {ch.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">{ch.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-2">
                    <span>{ch.participants} participants</span>
                    <span className="text-amber-400 font-bold">+{ch.xpReward} XP</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{ch.startDate} - {ch.endDate}</span>
                    {ch.status === 'active' && (
                      <button className="text-xs bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded-lg hover:bg-cyan-500/30 transition-colors">
                        Join Challenge
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouthOnboarding;
