import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Users,
  BookOpen,
  Calendar,
  GitBranch,
  Star,
  Clock,
  MessageCircle,
  CheckCircle,
  Lock,
  ChevronRight,
  Award,
  Target,
  TrendingUp,
  Zap,
  Video,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import {
  getMentors,
  getUpcomingSessions,
  getLearningPaths,
  getSkillTree,
  getMentorshipStats,
  getSkillLevelColor,
  getMentorStatusColor,
  type Mentor,
  type MentorSession,
  type LearningPath,
  type SkillNode,
  type MentorStatus,
  type SkillLevel,
  type SessionType,
} from '../lib/mentorshipService.ts';

type TabId = 'mentors' | 'paths' | 'sessions' | 'skills';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'mentors', label: 'Mentors', icon: <Users size={18} /> },
  { id: 'paths', label: 'Learning Paths', icon: <BookOpen size={18} /> },
  { id: 'sessions', label: 'Sessions', icon: <Calendar size={18} /> },
  { id: 'skills', label: 'Skill Tree', icon: <GitBranch size={18} /> },
];

const SESSION_TYPE_CONFIG: Record<SessionType, { label: string; color: string; icon: React.ReactNode }> = {
  'one-on-one': { label: '1-on-1', color: '#3b82f6', icon: <UserCheck size={14} /> },
  group: { label: 'Group', color: '#8b5cf6', icon: <Users size={14} /> },
  ama: { label: 'AMA', color: '#ef4444', icon: <MessageCircle size={14} /> },
  workshop: { label: 'Workshop', color: '#f59e0b', icon: <Zap size={14} /> },
  review: { label: 'Review', color: '#22c55e', icon: <Target size={14} /> },
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatCurrency(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

const MentorshipExchange: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('mentors');

  const mentors = useMemo(() => getMentors(), []);
  const sessions = useMemo(() => getUpcomingSessions(), []);
  const paths = useMemo(() => getLearningPaths(), []);
  const skillTree = useMemo(() => getSkillTree(), []);
  const stats = useMemo(() => getMentorshipStats(), []);

  // --- Stats Row ---
  const renderStatsRow = () => {
    const kpis = [
      { label: 'Active Mentors', value: stats.totalMentors.toLocaleString(), icon: <Users size={20} className="text-blue-400" /> },
      { label: 'Active Pairings', value: stats.activePairings.toLocaleString(), icon: <UserCheck size={20} className="text-green-400" /> },
      { label: 'Sessions This Month', value: stats.sessionsThisMonth.toLocaleString(), icon: <Video size={20} className="text-purple-400" /> },
      { label: 'Avg Rating', value: stats.avgRating.toFixed(2), icon: <Star size={20} className="text-yellow-400" /> },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center shrink-0">
              {kpi.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{kpi.value}</div>
              <div className="text-xs text-slate-400">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // --- Mentors Tab ---
  const renderMentorCard = (mentor: Mentor) => {
    const statusColor = getMentorStatusColor(mentor.status);
    const statusLabel = mentor.status.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase());

    return (
      <div key={mentor.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-500 transition-all">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {mentor.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-white font-semibold">{mentor.name}</h3>
              <span className="text-slate-400 text-sm">{mentor.handle}</span>
            </div>
          </div>
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ color: statusColor, backgroundColor: `${statusColor}20` }}
          >
            {statusLabel}
          </span>
        </div>

        {/* Bio */}
        <p className="text-slate-300 text-sm leading-relaxed mb-4">{mentor.bio}</p>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {mentor.specialties.map((s) => (
            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 border border-slate-600">
              {s}
            </span>
          ))}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-400 text-sm font-semibold">
              <Star size={14} />
              {mentor.rating.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500">{mentor.reviewCount} reviews</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-white">{mentor.sessionsCompleted}</div>
            <div className="text-xs text-slate-500">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-white">{mentor.yearExperience}yr</div>
            <div className="text-xs text-slate-500">Experience</div>
          </div>
        </div>

        {/* Capacity bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Mentee Capacity</span>
            <span className="text-slate-500">{mentor.menteeCount}/{mentor.maxMentees}</span>
          </div>
          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(mentor.menteeCount / mentor.maxMentees) * 100}%`,
                backgroundColor: mentor.menteeCount >= mentor.maxMentees ? '#f59e0b' : '#22c55e',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock size={12} />
            Response: {mentor.responseTime}
          </div>
          <div className="text-xs text-slate-500">
            Portfolio: {formatCurrency(mentor.portfolioValue)}
          </div>
        </div>

        {/* Action */}
        {mentor.status === 'available' && (
          <button className="w-full mt-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <MessageCircle size={14} />
            Request Mentorship
          </button>
        )}
        {mentor.status === 'at-capacity' && (
          <button className="w-full mt-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <AlertCircle size={14} />
            Join Waitlist
          </button>
        )}
      </div>
    );
  };

  const renderMentorsTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
      {mentors.map(renderMentorCard)}
    </div>
  );

  // --- Learning Paths Tab ---
  const renderPathCard = (path: LearningPath) => {
    const progressPct = Math.round((path.completedSkills / path.skillCount) * 100);
    const categoryColors: Record<string, string> = {
      Vintage: '#f59e0b',
      Modern: '#3b82f6',
      Grading: '#a855f7',
      Portfolio: '#22c55e',
    };
    const catColor = categoryColors[path.category] || '#94a3b8';

    return (
      <div key={path.id} className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-slate-500 transition-all">
        <div className="flex items-start justify-between mb-3">
          <div>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full mb-2 inline-block"
              style={{ color: catColor, backgroundColor: `${catColor}20` }}
            >
              {path.category}
            </span>
            <h3 className="text-white font-semibold text-lg">{path.name}</h3>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>{path.estimatedWeeks} weeks</div>
            <div>{path.enrolledCount.toLocaleString()} enrolled</div>
          </div>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed mb-4">{path.description}</p>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Progress</span>
            <span className="text-white font-medium">{path.completedSkills}/{path.skillCount} skills ({progressPct}%)</span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progressPct}%`, backgroundColor: catColor }}
            />
          </div>
        </div>

        {/* Skill list */}
        <div className="space-y-2">
          {path.skills.map((skill, idx) => {
            const completed = idx < path.completedSkills;
            return (
              <div key={skill.id} className="flex items-center gap-2 text-sm">
                {completed ? (
                  <CheckCircle size={16} className="text-green-400 shrink-0" />
                ) : (
                  <Lock size={16} className="text-slate-600 shrink-0" />
                )}
                <span className={completed ? 'text-slate-300' : 'text-slate-500'}>{skill.name}</span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded ml-auto shrink-0"
                  style={{ color: getSkillLevelColor(skill.level), backgroundColor: `${getSkillLevelColor(skill.level)}15` }}
                >
                  {skill.level}
                </span>
              </div>
            );
          })}
        </div>

        <button className="w-full mt-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
          Continue Path
          <ChevronRight size={14} />
        </button>
      </div>
    );
  };

  const renderPathsTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {paths.map(renderPathCard)}
    </div>
  );

  // --- Sessions Tab ---
  const renderSessionsTab = () => {
    const scheduled = sessions.filter(s => s.status === 'scheduled');
    const completed = sessions.filter(s => s.status === 'completed');

    const renderSessionRow = (session: MentorSession) => {
      const cfg = SESSION_TYPE_CONFIG[session.type];
      return (
        <div key={session.id} className="bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-slate-500 transition-all">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span
                className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ color: cfg.color, backgroundColor: `${cfg.color}20` }}
              >
                {cfg.icon}
                {cfg.label}
              </span>
              {session.status === 'completed' && (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <CheckCircle size={12} />
                  Completed
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400">
              {session.duration} min
            </div>
          </div>

          <h3 className="text-white font-semibold text-sm mb-2">{session.topic}</h3>

          <div className="flex items-center gap-4 text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-1">
              <GraduationCap size={12} />
              {session.mentorHandle}
            </span>
            <span className="flex items-center gap-1">
              <Users size={12} />
              {session.menteeHandle}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar size={12} />
              {formatDate(session.scheduledDate)} at {formatTime(session.scheduledDate)}
            </div>
            {session.rating !== null && (
              <div className="flex items-center gap-1 text-xs text-yellow-400">
                <Star size={12} />
                {session.rating.toFixed(1)}
              </div>
            )}
          </div>

          {session.notes && (
            <div className="mt-3 p-3 bg-slate-900 rounded-lg text-xs text-slate-300 italic border border-slate-700">
              {session.notes}
            </div>
          )}

          {session.status === 'scheduled' && (
            <button className="w-full mt-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <Video size={14} />
              Join Session
            </button>
          )}
        </div>
      );
    };

    return (
      <div>
        {scheduled.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Calendar size={18} className="text-blue-400" />
              Upcoming Sessions ({scheduled.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {scheduled.map(renderSessionRow)}
            </div>
          </div>
        )}
        {completed.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <CheckCircle size={18} className="text-green-400" />
              Recently Completed ({completed.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {completed.map(renderSessionRow)}
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- Skill Tree Tab ---
  const renderSkillTreeTab = () => {
    const levels: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'expert', 'master'];

    return (
      <div>
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-6">
          {levels.map((level) => (
            <span
              key={level}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full"
              style={{ color: getSkillLevelColor(level), backgroundColor: `${getSkillLevelColor(level)}15`, border: `1px solid ${getSkillLevelColor(level)}40` }}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getSkillLevelColor(level) }} />
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </span>
          ))}
        </div>

        {/* Skill cards by level */}
        {levels.map((level) => {
          const skills = skillTree.filter(s => s.level === level);
          if (skills.length === 0) return null;
          const color = getSkillLevelColor(level);

          return (
            <div key={level} className="mb-6">
              <h3
                className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2"
                style={{ color }}
              >
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                {level.charAt(0).toUpperCase() + level.slice(1)} Skills
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {skills.map((skill) => {
                  const prereqs = skill.prerequisites.length > 0
                    ? skillTree.filter(s => skill.prerequisites.includes(s.id))
                    : [];

                  return (
                    <div
                      key={skill.id}
                      className="bg-slate-800 border rounded-xl p-4 hover:border-slate-500 transition-all"
                      style={{ borderColor: `${color}30` }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white font-semibold text-sm">{skill.name}</h4>
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-2"
                          style={{ color, backgroundColor: `${color}20` }}
                        >
                          {skill.level}
                        </span>
                      </div>

                      <span className="text-xs text-slate-500 mb-2 inline-block">{skill.category}</span>

                      <p className="text-slate-300 text-xs leading-relaxed mb-3">{skill.description}</p>

                      {/* Prerequisites */}
                      {prereqs.length > 0 && (
                        <div className="mb-3">
                          <span className="text-xs text-slate-500 block mb-1">Prerequisites:</span>
                          <div className="flex flex-wrap gap-1">
                            {prereqs.map((p) => (
                              <span key={p.id} className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 flex items-center gap-1">
                                <CheckCircle size={10} className="text-green-400" />
                                {p.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Footer stats */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-700 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {skill.estimatedHours}h estimated
                        </span>
                        <span className="flex items-center gap-1">
                          <Award size={11} />
                          {skill.completedBy.toLocaleString()} completed
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <GraduationCap size={32} className="text-purple-400" />
            Mentorship & Knowledge Exchange
          </h1>
          <p className="text-slate-400 mt-2">
            Connect with expert collectors, follow guided learning paths, and level up your skills
          </p>
        </div>

        {/* Stats Row */}
        {renderStatsRow()}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-slate-700 pb-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'mentors' && renderMentorsTab()}
        {activeTab === 'paths' && renderPathsTab()}
        {activeTab === 'sessions' && renderSessionsTab()}
        {activeTab === 'skills' && renderSkillTreeTab()}
      </div>
    </div>
  );
};

export default MentorshipExchange;
