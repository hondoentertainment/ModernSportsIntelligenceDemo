import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  AlertTriangle,
  Target,
  Trophy,
  BookOpen,
  Users,
  Award,
  Star,
} from 'lucide-react';
import {
  getUserProgress,
  getTrainingModules,
  getAuthConfidence,
  getCommunityReviews,
  getEraGuides,
  getLeaderboard,
  getBadges,
  getLevelProgress,
  getNextChallenge,
  submitAnswer,
  getAccuracyTrends,
  getCategoryLabel,
  getCategoryColor,
  getDifficultyColor,
  type UserProgress,
  type TrainingModule,
  type TrainingChallenge,
  type AuthConfidenceScore,
  type CommunityReview,
  type EraGuide,
  type LeaderboardEntry,
  type Badge,
} from '../lib/utils/authTrainingService.ts';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const AuthTraining: React.FC = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [confidence, setConfidence] = useState<AuthConfidenceScore | null>(null);
  const [reviews, setReviews] = useState<CommunityReview[]>([]);
  const [eraGuides, setEraGuides] = useState<EraGuide[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeChallenge, setActiveChallenge] = useState<TrainingChallenge | null>(null);
  const [challengeResult, setChallengeResult] = useState<{ correct: boolean; explanation: string } | null>(null);

  useEffect(() => {
    try {
      setProgress(getUserProgress());
      setModules(getTrainingModules());
      setConfidence(getAuthConfidence());
      setReviews(getCommunityReviews());
      setEraGuides(getEraGuides());
      setLeaderboard(getLeaderboard());
      setBadges(getBadges());
      setLoading(false);
    } catch {
      setError('Failed to load Auth Training data');
      setLoading(false);
    }
  }, []);

  const levelInfo = useMemo(() => getLevelProgress(), []);
  const accuracyTrends = useMemo(() => getAccuracyTrends(), []);
  const earnedBadges = useMemo(() => badges.filter(b => b.earnedDate !== null), [badges]);
  const unearnedBadges = useMemo(() => badges.filter(b => b.earnedDate === null), [badges]);

  const handleStartChallenge = (moduleId: string) => {
    const challenge = getNextChallenge(moduleId);
    if (challenge) {
      setActiveChallenge(challenge);
      setChallengeResult(null);
    }
  };

  const handleSubmitAnswer = (answer: boolean) => {
    if (!activeChallenge) return;
    const result = submitAnswer(activeChallenge.id, answer);
    setChallengeResult({ correct: result.correct, explanation: result.explanation });
    setProgress(getUserProgress());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-slate-600 border-t-brand-lime rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading AI Authentication Training Academy...</p>
        </div>
      </div>
    );
  }

  if (error || !progress || !confidence) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <p className="text-red-400 font-medium text-lg">{error ?? 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-violet-500/20">
          <GraduationCap size={24} className="text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">AI Authentication Training Academy</h1>
          <p className="text-sm text-slate-400">Gamified authentication training with challenges, XP &amp; community review &mdash; Phase 136</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Accuracy</p>
          <p className={`text-2xl font-bold ${progress.accuracy_score >= 85 ? 'text-emerald-400' : progress.accuracy_score >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
            {progress.accuracy_score}%
          </p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Level</p>
          <p className="text-2xl font-bold text-violet-400">{progress.level}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total XP</p>
          <p className="text-2xl font-bold text-blue-400">{progress.xp.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Streak</p>
          <p className="text-2xl font-bold text-orange-400">{progress.streak} days</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Badges</p>
          <p className="text-2xl font-bold text-amber-400">{earnedBadges.length}/{badges.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Challenges</p>
          <p className="text-2xl font-bold text-cyan-400">{progress.total_challenges}</p>
        </div>
      </div>

      {/* XP Bar */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-300 font-medium">Level {progress.level} Progress</span>
          <span className="text-xs text-violet-400">{progress.xp} / {progress.xp_to_next} XP</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-violet-600 to-violet-400 h-3 rounded-full transition-all"
            style={{ width: `${levelInfo.pct}%` }}
          />
        </div>
      </div>

      {/* Training Modules Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <BookOpen size={18} className="text-violet-400" />
          Training Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map(mod => {
            const catColor = getCategoryColor(mod.category);
            const diffColor = getDifficultyColor(mod.difficulty);
            return (
              <div key={mod.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${catColor.bg} ${catColor.text}`}>
                    {getCategoryLabel(mod.category)}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${diffColor.bg} ${diffColor.text}`}>
                    {mod.difficulty}
                  </span>
                </div>
                <p className="text-sm font-bold text-white mb-1">{mod.title}</p>
                <p className="text-[10px] text-slate-400 mb-3 line-clamp-2">{mod.description}</p>
                <div className="mb-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span>{mod.completion_pct}% complete</span>
                    <span>{mod.lessons_count} lessons</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${mod.completion_pct === 100 ? 'bg-emerald-500' : 'bg-violet-500'}`}
                      style={{ width: `${mod.completion_pct}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleStartChallenge(mod.id)}
                  className="w-full text-xs py-1.5 rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors font-medium"
                >
                  {mod.completion_pct === 100 ? 'Practice Again' : 'Start Challenge'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Challenge Panel */}
      {activeChallenge && (
        <div className="bg-slate-800/50 border border-violet-500/30 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Target size={18} className="text-violet-400" />
            Active Challenge
          </h2>
          <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-white">{activeChallenge.cardName}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${getDifficultyColor(activeChallenge.difficulty).bg} ${getDifficultyColor(activeChallenge.difficulty).text}`}>
                {activeChallenge.difficulty}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">Year: {activeChallenge.cardYear} | Reward: +{activeChallenge.xpReward} XP</p>
            <div className="bg-slate-800 rounded-xl p-8 mb-4 text-center border border-slate-700/30">
              <p className="text-slate-500 text-sm">Card Image: {activeChallenge.cardImage}</p>
              <p className="text-slate-600 text-xs mt-1">Examine this card carefully. Is it authentic or fake?</p>
            </div>
            {activeChallenge.defect_annotations.length > 0 && !challengeResult && (
              <div className="mb-3">
                <p className="text-[10px] text-slate-500 mb-1">Annotations visible at high magnification:</p>
                {activeChallenge.defect_annotations.map((ann, i) => (
                  <p key={i} className="text-[10px] text-amber-400/70">- {ann}</p>
                ))}
              </div>
            )}
            {!challengeResult ? (
              <div className="flex gap-3">
                <button
                  onClick={() => handleSubmitAnswer(true)}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors font-bold text-sm"
                >
                  Authentic
                </button>
                <button
                  onClick={() => handleSubmitAnswer(false)}
                  className="flex-1 py-2.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors font-bold text-sm"
                >
                  Fake
                </button>
              </div>
            ) : (
              <div className={`p-4 rounded-xl border ${challengeResult.correct ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <p className={`text-sm font-bold mb-1 ${challengeResult.correct ? 'text-emerald-400' : 'text-red-400'}`}>
                  {challengeResult.correct ? 'Correct! +10 XP' : 'Incorrect. -5 XP'}
                </p>
                <p className="text-xs text-slate-400">{challengeResult.explanation}</p>
                <button
                  onClick={() => { setActiveChallenge(null); setChallengeResult(null); }}
                  className="mt-3 text-xs text-violet-400 hover:text-violet-300 font-medium"
                >
                  Continue Training
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Accuracy Trend Chart + Confidence by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Target size={18} className="text-emerald-400" />
            Accuracy Trend
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} domain={[50, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Line type="monotone" dataKey="accuracy" stroke="#a78bfa" strokeWidth={2} dot={{ r: 3, fill: '#a78bfa' }} name="Accuracy %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Award size={18} className="text-amber-400" />
            Confidence by Category
          </h2>
          <div className="space-y-3">
            {confidence.byCategory.map(cat => {
              const color = getCategoryColor(cat.category);
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={color.text}>{getCategoryLabel(cat.category)}</span>
                    <span className="text-slate-400">{cat.score}% ({cat.attempts} attempts)</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${cat.score >= 85 ? 'bg-emerald-500' : cat.score >= 70 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Community Reviews + Era Guides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Users size={18} className="text-blue-400" />
            Community Review Queue
          </h2>
          <div className="space-y-3">
            {reviews.map(review => (
              <div key={review.id} className={`bg-slate-800/50 border rounded-xl p-4 ${
                review.status === 'escalated' ? 'border-amber-500/30' :
                review.status === 'resolved' ? 'border-emerald-500/20' : 'border-slate-700/50'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-bold text-white truncate mr-2">{review.cardName}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${
                    review.status === 'escalated' ? 'bg-amber-500/20 text-amber-400' :
                    review.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>{review.status}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 mb-2">
                  <span>by {review.submittedBy}</span>
                  <span>{review.submittedDate}</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] mb-2">
                  <span className="text-emerald-400">Authentic: {review.opinions.authentic}</span>
                  <span className="text-red-400">Fake: {review.opinions.fake}</span>
                  <span className="text-slate-400">Uncertain: {review.opinions.uncertain}</span>
                </div>
                {review.expertVerdict && (
                  <p className="text-[10px] text-amber-400/80 italic">Expert: {review.expertVerdict}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <BookOpen size={18} className="text-cyan-400" />
            Era Guides
          </h2>
          <div className="space-y-3">
            {eraGuides.map(guide => {
              const diffColor = getDifficultyColor(guide.difficultyLevel);
              return (
                <div key={guide.era} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-white">{guide.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${diffColor.bg} ${diffColor.text}`}>
                      {guide.difficultyLevel}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mb-2">{guide.description}</p>
                  <div className="mb-1">
                    <p className="text-[10px] text-slate-500 font-medium">Key tells:</p>
                    {guide.keyTells.slice(0, 3).map((tell, i) => (
                      <p key={i} className="text-[9px] text-cyan-400/70">- {tell}</p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Leaderboard + Badge Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            Leaderboard
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700/50">
                  <th className="text-left py-2 pr-2">#</th>
                  <th className="text-left py-2 px-2">User</th>
                  <th className="text-right py-2 px-2">Lvl</th>
                  <th className="text-right py-2 px-2">XP</th>
                  <th className="text-right py-2 px-2">Acc</th>
                  <th className="text-right py-2 pl-2">Streak</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map(entry => (
                  <tr key={entry.rank} className={`border-b border-slate-700/30 ${entry.username === 'You' ? 'bg-violet-500/10' : ''}`}>
                    <td className="py-2 pr-2">
                      <span className={`font-bold ${entry.rank <= 3 ? 'text-amber-400' : 'text-slate-500'}`}>
                        {entry.rank}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-300">
                          {entry.avatar}
                        </div>
                        <span className={`font-medium ${entry.username === 'You' ? 'text-violet-400' : 'text-slate-300'}`}>
                          {entry.username}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right text-slate-400">{entry.level}</td>
                    <td className="py-2 px-2 text-right text-slate-400">{entry.xp.toLocaleString()}</td>
                    <td className="py-2 px-2 text-right">
                      <span className={`${entry.accuracy >= 90 ? 'text-emerald-400' : entry.accuracy >= 80 ? 'text-amber-400' : 'text-slate-400'}`}>
                        {entry.accuracy}%
                      </span>
                    </td>
                    <td className="py-2 pl-2 text-right text-orange-400">{entry.streak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Star size={18} className="text-amber-400" />
            Badge Showcase
          </h2>
          <div className="space-y-2 mb-4">
            <p className="text-xs text-slate-500 font-medium">Earned ({earnedBadges.length})</p>
            <div className="grid grid-cols-2 gap-2">
              {earnedBadges.map(badge => (
                <div key={badge.id} className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <p className="text-xs font-bold text-amber-400">{badge.name}</p>
                  <p className="text-[10px] text-slate-400">{badge.description}</p>
                  <p className="text-[9px] text-slate-600 mt-1">{badge.earnedDate}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-slate-500 font-medium">Locked ({unearnedBadges.length})</p>
            <div className="grid grid-cols-2 gap-2">
              {unearnedBadges.map(badge => (
                <div key={badge.id} className="bg-slate-900/50 border border-slate-700/30 rounded-lg p-3 opacity-60">
                  <p className="text-xs font-bold text-slate-500">{badge.name}</p>
                  <p className="text-[10px] text-slate-600">{badge.requirement}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTraining;
