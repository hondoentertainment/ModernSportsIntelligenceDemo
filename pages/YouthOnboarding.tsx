import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  BookOpen,
  Trophy,
  ShoppingBag,
  BookMarked,
  Users,
  Shield,
  DollarSign,
  Star,
  AlertTriangle,
  Clock,
  Flame,
  Target,
} from 'lucide-react';
import {
  getLearningModules,
  getAchievements,
  getStarterCollections,
  getGlossaryTerms,
  getMentorProfiles,
  getMilestones,
  getSafetyTips,
  getBudgetPlans,
  getQuizQuestions,
  getProgressTracker,
  getCommunityChallengers,
  getNextAchievement,
  getLevelConfig,
  calculateLevel,
  formatCurrency,
  type LearningModule,
  type Achievement,
  type StarterCollection,
  type GlossaryTerm,
  type MentorProfile,
  type CollectorMilestone,
  type SafetyTip,
  type BudgetPlan,
  type CommunityChallenge,
  type ProgressTracker,
} from '../lib/youthOnboardingService.ts';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const CHART_TOOLTIP_STYLE = { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' };
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const RARITY_COLORS: Record<string, string> = {
  common: 'text-slate-400', uncommon: 'text-emerald-400', rare: 'text-blue-400', epic: 'text-purple-400', legendary: 'text-amber-400',
};

const YouthOnboarding: React.FC = () => {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [starters, setStarters] = useState<StarterCollection[]>([]);
  const [glossary, setGlossary] = useState<GlossaryTerm[]>([]);
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [milestones, setMilestones] = useState<CollectorMilestone[]>([]);
  const [safetyTips, setSafetyTips] = useState<SafetyTip[]>([]);
  const [budgetPlans, setBudgetPlans] = useState<BudgetPlan[]>([]);
  const [challenges, setChallenges] = useState<CommunityChallenge[]>([]);
  const [progress, setProgress] = useState<ProgressTracker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  useEffect(() => {
    try {
      setModules(getLearningModules());
      setAchievements(getAchievements());
      setStarters(getStarterCollections());
      setGlossary(getGlossaryTerms());
      setMentors(getMentorProfiles());
      setMilestones(getMilestones());
      setSafetyTips(getSafetyTips());
      setBudgetPlans(getBudgetPlans());
      setChallenges(getCommunityChallengers());
      setProgress(getProgressTracker());
      setLoading(false);
    } catch {
      setError('Failed to load Youth Onboarding data');
      setLoading(false);
    }
  }, []);

  const _nextAchievement = useMemo(() => getNextAchievement(), []);
  const _quizQuestions = useMemo(() => getQuizQuestions(), []);
  const levelInfo = useMemo(() => progress ? calculateLevel(progress.totalXp) : null, [progress]);

  const filteredGlossary = useMemo(() => {
    if (!selectedLetter) return glossary;
    return glossary.filter(t => t.term.charAt(0).toUpperCase() === selectedLetter);
  }, [glossary, selectedLetter]);

  const xpChartData = useMemo(() => {
    const categories = ['Fundamentals', 'Grading', 'Collecting', 'Safety', 'Market', 'Care', 'Trading', 'Strategy'];
    return categories.map(cat => {
      const catModules = modules.filter(m => m.category === cat);
      const earned = catModules.filter(m => m.completed).reduce((sum, m) => sum + m.xpReward, 0);
      const total = catModules.reduce((sum, m) => sum + m.xpReward, 0);
      return { category: cat, earned, total, remaining: total - earned };
    }).filter(d => d.total > 0);
  }, [modules]);

  const activeChallenges = useMemo(() => challenges.filter(c => c.status === 'active'), [challenges]);
  const completedModuleCount = modules.filter(m => m.completed).length;
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const availableMentors = mentors.filter(m => m.available).length;
  const criticalTips = safetyTips.filter(t => t.importance === 'critical').length;

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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Error Loading Data</h2>
        <p className="text-slate-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-emerald-500/20">
          <GraduationCap size={24} className="text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Youth &amp; Next-Gen Collector Onboarding</h1>
          <p className="text-sm text-slate-400">
            Guided learning, achievements &amp; mentorship for new collectors &mdash; Phase 144
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Level</p>
          <p className="text-3xl font-bold text-emerald-400">{progress?.level ?? 1}</p>
          <p className="text-xs text-slate-600 mt-1">{progress?.levelName}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total XP</p>
          <p className="text-3xl font-bold text-amber-400">{progress?.totalXp ?? 0}</p>
          <p className="text-xs text-slate-600 mt-1">{progress?.xpToNextLevel} to next</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Modules</p>
          <p className="text-3xl font-bold text-blue-400">{completedModuleCount}/{modules.length}</p>
          <p className="text-xs text-slate-600 mt-1">completed</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Achievements</p>
          <p className="text-3xl font-bold text-purple-400">{unlockedAchievements}/{achievements.length}</p>
          <p className="text-xs text-slate-600 mt-1">unlocked</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Mentors</p>
          <p className="text-3xl font-bold text-cyan-400">{availableMentors}</p>
          <p className="text-xs text-slate-600 mt-1">available</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Streak</p>
          <p className="text-3xl font-bold text-orange-400">{progress?.streak ?? 0}d</p>
          <p className="text-xs text-slate-600 mt-1">active</p>
        </div>
      </div>

      {/* Progress Dashboard */}
      {progress && levelInfo && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Star size={18} className="text-amber-400" />
            Progress Dashboard
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center">
              <span className="text-2xl font-bold text-emerald-400">{levelInfo.level}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">{levelInfo.name}</p>
              <div className="w-full bg-slate-700 rounded-full h-3 mt-2">
                <div className="bg-emerald-500 h-3 rounded-full transition-all" style={{ width: `${levelInfo.progress}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>{progress.totalXp} XP</span>
                <span>{levelInfo.xpToNext} XP to Level {levelInfo.level + 1}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full">
              <Flame size={14} className="text-orange-400" />
              <span className="text-xs font-bold text-orange-400">{progress.streak}d streak</span>
            </div>
          </div>
        </div>
      )}

      {/* XP by Category Chart + Learning Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Target size={18} className="text-brand-lime" />
            XP by Category
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={xpChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 9, fill: '#64748b' }} width={80} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                <Bar dataKey="earned" stackId="xp" fill="#22c55e" radius={[0, 0, 0, 0]} name="Earned" />
                <Bar dataKey="remaining" stackId="xp" fill="#334155" radius={[0, 4, 4, 0]} name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-blue-400" />
            Learning Modules ({completedModuleCount}/{modules.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {modules.map(mod => {
              const levelCfg = getLevelConfig(mod.level);
              return (
                <div key={mod.id} className={`bg-slate-900/50 border rounded-xl p-4 ${mod.completed ? 'border-emerald-500/30' : 'border-slate-700/30'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{mod.iconEmoji}</span>
                      <span className="text-sm font-bold text-white">{mod.title}</span>
                    </div>
                    {mod.completed ? (
                      <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-bold">Done</span>
                    ) : (
                      <span className={`text-[10px] px-1.5 py-0.5 ${levelCfg.bg} ${levelCfg.text} rounded-full font-bold border ${levelCfg.border}`}>{levelCfg.label}</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mb-2 line-clamp-2">{mod.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1"><Clock size={10} />{mod.estimatedMinutes} min</span>
                    <span className="text-amber-400 font-bold">+{mod.xpReward} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Achievement Gallery */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Trophy size={18} className="text-amber-400" />
          Achievement Gallery ({unlockedAchievements}/{achievements.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {achievements.map(ach => (
            <div key={ach.id} className={`bg-slate-900/50 border rounded-xl p-3 text-center ${ach.unlocked ? 'border-amber-500/30' : 'border-slate-700/30 opacity-50'}`}>
              <span className="text-2xl block mb-1">{ach.unlocked ? ach.iconEmoji : '🔒'}</span>
              <p className="text-xs font-bold text-white truncate">{ach.name}</p>
              <p className="text-[10px] text-slate-500 line-clamp-1">{ach.description}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className={`text-[10px] font-bold ${RARITY_COLORS[ach.rarity]}`}>{ach.rarity}</span>
                <span className="text-[10px] text-amber-400 font-bold">+{ach.xpValue}</span>
              </div>
              {ach.unlockedDate && <p className="text-[9px] text-slate-600 mt-0.5">{ach.unlockedDate}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Starter Collections */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <ShoppingBag size={18} className="text-emerald-400" />
          Starter Collection Templates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {starters.map(sc => {
            const levelCfg = getLevelConfig(sc.difficulty);
            return (
              <div key={sc.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-white">{sc.name}</h3>
                  <span className="text-sm font-bold text-emerald-400">{formatCurrency(sc.budget)}</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-3">{sc.description}</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] px-1.5 py-0.5 ${levelCfg.bg} ${levelCfg.text} rounded-full border ${levelCfg.border}`}>{levelCfg.label}</span>
                  <span className="text-[10px] text-slate-500">{sc.cardCount} cards | {sc.sport}</span>
                </div>
                <div className="space-y-1 mb-3">
                  {sc.cards.slice(0, 4).map((card, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400 truncate mr-2">{card.name}</span>
                      <span className="text-slate-300 flex-shrink-0">${card.estimatedPrice}</span>
                    </div>
                  ))}
                  {sc.cards.length > 4 && <p className="text-[10px] text-slate-600">+{sc.cards.length - 4} more items</p>}
                </div>
                <div className="flex flex-wrap gap-1">
                  {sc.tips.slice(0, 2).map((tip, idx) => (
                    <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400">{tip}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Glossary */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <BookMarked size={18} className="text-cyan-400" />
          Collector Glossary ({glossary.length} terms)
        </h2>
        <div className="flex gap-1 flex-wrap mb-4">
          <button
            onClick={() => setSelectedLetter(null)}
            className={`px-2 py-1 text-[10px] rounded border transition-colors ${!selectedLetter ? 'bg-brand-lime/10 border-brand-lime/50 text-brand-lime' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
          >
            All
          </button>
          {ALPHABET.map(letter => {
            const hasTerms = glossary.some(t => t.term.charAt(0).toUpperCase() === letter);
            return (
              <button
                key={letter}
                onClick={() => setSelectedLetter(selectedLetter === letter ? null : letter)}
                disabled={!hasTerms}
                className={`px-2 py-1 text-[10px] rounded border transition-colors ${
                  selectedLetter === letter ? 'bg-brand-lime/10 border-brand-lime/50 text-brand-lime' :
                  hasTerms ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white' :
                  'bg-slate-800/50 border-slate-800 text-slate-700 cursor-not-allowed'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {filteredGlossary.map(term => (
            <div key={term.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-white">{term.term}</span>
                <span className="text-[10px] text-slate-500">{term.category}</span>
              </div>
              <p className="text-[10px] text-slate-400 mb-1">{term.definition}</p>
              {term.example && <p className="text-[10px] text-slate-500 italic">&ldquo;{term.example}&rdquo;</p>}
              <div className="flex gap-1 mt-1 flex-wrap">
                {term.relatedTerms.map(rt => (
                  <span key={rt} className="text-[9px] px-1 py-0.5 bg-slate-800 rounded text-slate-500">{rt}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mentor Matching */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Users size={18} className="text-purple-400" />
          Mentor Matching ({availableMentors} available)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {mentors.map(mentor => (
            <div key={mentor.id} className={`bg-slate-900/50 border rounded-xl p-4 ${mentor.available ? 'border-slate-700/30' : 'border-slate-700/20 opacity-60'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-400">{mentor.avatar}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{mentor.name}</p>
                  <div className="flex items-center gap-1">
                    <Star size={10} className="text-amber-400 fill-amber-400" />
                    <span className="text-[10px] text-amber-400">{mentor.rating}</span>
                    <span className="text-[10px] text-slate-500">| {mentor.menteeCount} mentees</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mb-2 line-clamp-2">{mentor.bio}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {mentor.specialties.map(sp => (
                  <span key={sp} className="text-[9px] px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded text-purple-400">{sp}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500">{mentor.responseTime}</span>
                <span className={mentor.available ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {mentor.available ? 'Available' : 'Busy'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Tips + Budget Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Safety Tips */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Shield size={18} className="text-red-400" />
            Safety Tips ({criticalTips} critical)
          </h2>
          <div className="space-y-2">
            {safetyTips.map(tip => {
              const importColor = tip.importance === 'critical' ? 'text-red-400 bg-red-500/10 border-red-500/20'
                : tip.importance === 'high' ? 'text-orange-400 bg-orange-500/10 border-orange-500/20'
                : 'text-slate-400 bg-slate-500/10 border-slate-500/20';
              return (
                <div key={tip.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{tip.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-bold ${importColor}`}>{tip.importance}</span>
                  </div>
                  <p className="text-[10px] text-slate-500">{tip.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Budget Plans */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-400" />
            Budget Plans
          </h2>
          <div className="space-y-3">
            {budgetPlans.map(plan => (
              <div key={plan.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-sm font-bold text-white">{plan.name}</span>
                    <span className="text-[10px] text-slate-500 ml-2">Ages {plan.ageRange}</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">${plan.monthlyBudget}/mo</span>
                </div>
                <div className="space-y-1 mb-2">
                  {plan.allocation.map((alloc, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${alloc.percentage}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400 w-28 truncate">{alloc.category}</span>
                      <span className="text-[10px] text-slate-300 w-10 text-right">${alloc.amount}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500">Savings goal: {formatCurrency(plan.savingsGoal)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Community Challenges */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Target size={18} className="text-brand-lime" />
          Community Challenges ({activeChallenges.length} active)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {challenges.map(ch => {
            const levelCfg = getLevelConfig(ch.difficulty);
            const statusColor = ch.status === 'active' ? 'text-emerald-400 bg-emerald-500/10' : ch.status === 'upcoming' ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 bg-slate-500/10';
            return (
              <div key={ch.id} className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">{ch.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${statusColor}`}>{ch.status}</span>
                </div>
                <p className="text-[10px] text-slate-500 mb-2">{ch.description}</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] px-1.5 py-0.5 ${levelCfg.bg} ${levelCfg.text} rounded-full border ${levelCfg.border}`}>{levelCfg.label}</span>
                  <span className="text-[10px] text-amber-400 font-bold">+{ch.xpReward} XP</span>
                  <span className="text-[10px] text-slate-500">{ch.participants} participants</span>
                </div>
                <div className="space-y-1">
                  {ch.tasks.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <div className="w-3 h-3 border border-slate-600 rounded-sm flex-shrink-0" />
                      {task}
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-slate-600 mt-2">Deadline: {ch.deadline}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestone Timeline */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Star size={18} className="text-amber-400" />
          Milestone Timeline
        </h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-700" />
          <div className="space-y-4">
            {milestones.map(ms => (
              <div key={ms.id} className="flex items-start gap-4 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${ms.completed ? 'bg-emerald-500/20 border-2 border-emerald-500' : 'bg-slate-800 border-2 border-slate-600'}`}>
                  {ms.completed ? <Star size={12} className="text-emerald-400 fill-emerald-400" /> : <span className="text-[10px] text-slate-500">{ms.order}</span>}
                </div>
                <div className={`flex-1 bg-slate-900/50 border rounded-xl p-3 ${ms.completed ? 'border-emerald-500/30' : 'border-slate-700/30'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{ms.title}</span>
                    <span className="text-[10px] text-amber-400">{ms.xpRequired} XP req.</span>
                  </div>
                  <p className="text-[10px] text-slate-500">{ms.description}</p>
                  <p className="text-[10px] text-purple-400 mt-1">Reward: {ms.reward}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouthOnboarding;
