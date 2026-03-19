import React, { useState, useMemo } from 'react';
import {
  X,
  Map,
  BarChart,
  BookOpen,
  CheckCircle2,
  Circle,
  ChevronRight,
  GraduationCap,
  Star,
  Target,
  Rocket,
  Compass,
  Trophy,
} from 'lucide-react';
import {
  getEntryRamps,
  getRampProgress,
  getEntryStats,
} from '../lib/utils/hobbyEntryRampService';

interface HobbyEntryRampModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'pathways' | 'progress' | 'guide';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'pathways', label: 'Pathways', icon: <Map size={16} /> },
  { id: 'progress', label: 'Progress', icon: <BarChart size={16} /> },
  { id: 'guide', label: 'Guide', icon: <BookOpen size={16} /> },
];

const HobbyEntryRampModal: React.FC<HobbyEntryRampModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('pathways');

  const ramps = useMemo(() => getEntryRamps(), []);
  const progress = useMemo(() => getRampProgress(), []);
  const stats = useMemo(() => getEntryStats(), []);

  if (!isOpen) return null;

  const renderPathways = () => (
    <div className="space-y-4">
      {ramps.map((ramp: any, idx: number) => (
        <div key={ramp.id || idx} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-lime-500/20">
                <Compass size={18} className="text-lime-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">{ramp.name || ramp.title || ramp.pathway}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{ramp.description || ramp.subtitle || `${ramp.steps?.length ?? 0} steps`}</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              (ramp.difficulty || ramp.level) === 'beginner' ? 'bg-green-500/20 text-green-400' :
              (ramp.difficulty || ramp.level) === 'intermediate' ? 'bg-amber-500/20 text-amber-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {ramp.difficulty || ramp.level || 'beginner'}
            </span>
          </div>
          <div className="space-y-2">
            {(ramp.steps || ramp.milestones || []).map((step: any, sIdx: number) => {
              const completed = step.completed ?? step.done ?? false;
              return (
                <div key={sIdx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
                  {completed
                    ? <CheckCircle2 size={16} className="text-lime-400 flex-shrink-0" />
                    : <Circle size={16} className="text-slate-600 flex-shrink-0" />}
                  <span className={`text-sm ${completed ? 'text-slate-200' : 'text-slate-400'}`}>
                    {step.name || step.title || step.label || step}
                  </span>
                  <ChevronRight size={14} className="text-slate-600 ml-auto" />
                </div>
              );
            })}
          </div>
          {ramp.steps && (
            <div className="mt-3">
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-lime-500"
                  style={{ width: `${((ramp.steps || []).filter((s: any) => s.completed ?? s.done).length / Math.max((ramp.steps || []).length, 1)) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {(ramp.steps || []).filter((s: any) => s.completed ?? s.done).length}/{(ramp.steps || []).length} completed
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderProgress = () => {
    const progressData = Array.isArray(progress) ? progress : progress?.milestones || progress?.items || [];
    return (
      <div className="space-y-4">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Overall Progress</h3>
            <span className="text-lime-400 font-bold text-lg">{progress?.overall ?? stats?.completionRate ?? 42}%</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-lime-600 to-lime-400"
              style={{ width: `${progress?.overall ?? stats?.completionRate ?? 42}%` }}
            />
          </div>
          <p className="text-xs text-slate-400">Keep going! You're making great progress on your hobby journey.</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
            <GraduationCap size={20} className="text-lime-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-slate-100">{stats?.lessonsCompleted ?? 12}</p>
            <p className="text-xs text-slate-400 mt-1">Lessons Done</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
            <Star size={20} className="text-lime-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-slate-100">{stats?.skillsUnlocked ?? 8}</p>
            <p className="text-xs text-slate-400 mt-1">Skills Unlocked</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 text-center">
            <Trophy size={20} className="text-lime-400 mx-auto mb-2" />
            <p className="text-xl font-bold text-slate-100">{stats?.badges ?? 5}</p>
            <p className="text-xs text-slate-400 mt-1">Badges Earned</p>
          </div>
        </div>
        {progressData.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Milestones</h3>
            {progressData.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                {(item.completed ?? item.done) ? (
                  <CheckCircle2 size={20} className="text-lime-400" />
                ) : (
                  <Circle size={20} className="text-slate-600" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-200">{item.name || item.title}</p>
                  <p className="text-xs text-slate-400">{item.description || ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderGuide = () => (
    <div className="space-y-4">
      {[
        { icon: <Rocket size={16} className="text-lime-400" />, title: 'Getting Started', desc: 'Begin with affordable base cards from recent sets. Learn the basics of card grading, centering, and surface quality before investing in higher-value cards.' },
        { icon: <Target size={16} className="text-lime-400" />, title: 'Finding Your Focus', desc: 'Choose a collecting focus: team, player, era, or set completion. Focused collections build expertise and help identify undervalued opportunities.' },
        { icon: <BookOpen size={16} className="text-lime-400" />, title: 'Understanding Value', desc: 'Study population reports, recent sales data, and grading standards. Value comes from scarcity, condition, and player significance.' },
        { icon: <GraduationCap size={16} className="text-lime-400" />, title: 'Advanced Strategies', desc: 'Learn about arbitrage between platforms, optimal submission timing for grading, and portfolio diversification across sports and eras.' },
      ].map((guide, idx) => (
        <div key={idx} className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-lime-500/20 flex-shrink-0">{guide.icon}</div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200 mb-1">{guide.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{guide.desc}</p>
            </div>
          </div>
        </div>
      ))}
      <div className="bg-lime-500/10 rounded-xl p-5 border border-lime-500/30">
        <div className="flex items-center gap-2 mb-2">
          <Compass size={16} className="text-lime-400" />
          <p className="text-sm font-semibold text-lime-300">Pro Tip</p>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          The best collectors combine passion with patience. Set a monthly budget, track your purchases, and always buy the card, not the hype. Quality over quantity wins in the long run.
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-900 via-slate-800/50 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-lime-500/20">
              <Map size={24} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Hobby Entry Ramp</h2>
              <p className="text-sm text-slate-400">Guided pathways into sports card collecting</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 p-4 border-b border-slate-700/50">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Pathways</p>
            <p className="text-xl font-bold text-slate-100">{stats?.totalPathways ?? ramps.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Completion</p>
            <p className="text-xl font-bold text-lime-400">{stats?.completionRate ?? 42}%</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Skills</p>
            <p className="text-xl font-bold text-slate-100">{stats?.skillsUnlocked ?? 8}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 text-center">
            <p className="text-xs text-slate-400">Level</p>
            <p className="text-xl font-bold text-lime-400">{stats?.currentLevel ?? 'Intermediate'}</p>
          </div>
        </div>

        <div className="flex gap-1 p-4 border-b border-slate-700/50">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? 'bg-lime-500/20 text-lime-400'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeTab === 'pathways' && renderPathways()}
          {activeTab === 'progress' && renderProgress()}
          {activeTab === 'guide' && renderGuide()}
        </div>
      </div>
    </div>
  );
};

export default HobbyEntryRampModal;
