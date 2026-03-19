import React, { useMemo, useState } from 'react';
import {
  X,
  Shield,
  Users,
  FileText,
  GraduationCap,
  Crown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  DollarSign,
  User,
  Heart,
  Lock,
  Unlock,
  Star,
  ChevronRight,
  BarChart3,
  Award,
  ScrollText,
  Landmark,
  CircleDot,
} from 'lucide-react';
import {
  getPlan,
  getHeirs,
  getWill,
  getTriggers,
  getEducationModules,
  SuccessionPlan,
  Heir,
  CollectionWill,
  LiquidationTrigger,
  EducationModule,
} from '../lib/core/estateSuccessionService';

interface EstateSuccessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'plan' | 'heirs' | 'will' | 'education';

const EstateSuccessionModal: React.FC<EstateSuccessionModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('plan');

  const plan = useMemo(() => getPlan(), []);
  const heirs = useMemo(() => getHeirs(), []);
  const will = useMemo(() => getWill(), []);
  const triggers = useMemo(() => getTriggers(), []);
  const education = useMemo(() => getEducationModules(), []);

  const tabs: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'plan', label: 'Succession Plan', icon: <Shield size={14} /> },
    { id: 'heirs', label: 'Heirs', icon: <Users size={14} />, count: heirs.length },
    { id: 'will', label: 'Collection Will', icon: <FileText size={14} />, count: will.length },
    { id: 'education', label: 'Education', icon: <GraduationCap size={14} />, count: education.length },
  ];

  if (!isOpen) return null;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'draft': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'needs_review': return 'text-rose-400 bg-rose-400/10 border-rose-400/30';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
    }
  };

  const getKnowledgeColor = (level: string) => {
    switch (level) {
      case 'advanced': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'intermediate': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'beginner': return 'text-sky-400 bg-sky-400/10 border-sky-400/30';
      case 'none': return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'keep': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'sell': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'undecided': return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'beginner': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'intermediate': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'advanced': return 'text-rose-400 bg-rose-400/10 border-rose-400/30';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'basics': return <BookOpen size={12} />;
      case 'grading': return <Award size={12} />;
      case 'market': return <BarChart3 size={12} />;
      case 'selling': return <DollarSign size={12} />;
      case 'storage': return <Lock size={12} />;
      default: return <BookOpen size={12} />;
    }
  };

  const renderSuccessionPlan = () => (
    <div className="space-y-4">
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full border uppercase font-bold ${getStatusColor(plan.status)}`}>
                {plan.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400">Created {formatDate(plan.createdAt)}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-400">${plan.totalCollectionValue.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Collection Value</div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-white">{plan.heirCount}</div>
            <div className="text-[10px] text-slate-500 uppercase">Heirs</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center">
              {plan.allocationComplete ? (
                <CheckCircle2 size={18} className="text-emerald-400" />
              ) : (
                <AlertTriangle size={18} className="text-amber-400" />
              )}
            </div>
            <div className="text-[10px] text-slate-500 uppercase mt-1">Allocation</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-lg p-3 text-center">
            <div className="text-sm font-bold text-slate-300">{formatDate(plan.lastReviewDate)}</div>
            <div className="text-[10px] text-slate-500 uppercase">Last Review</div>
          </div>
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-lg p-3 text-center">
            <div className="text-sm font-bold text-amber-400">{formatDate(plan.nextReviewDate)}</div>
            <div className="text-[10px] text-slate-500 uppercase">Next Review</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Landmark size={16} className="text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Allocation Breakdown</h3>
        </div>
        <div className="space-y-3">
          {heirs.map((heir: Heir) => (
            <div key={heir.id} className="flex items-center gap-3">
              <div className="w-24 text-xs text-slate-300 font-medium truncate">{heir.name}</div>
              <div className="flex-1">
                <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
                    style={{ width: `${heir.allocatedPercentage}%` }}
                  />
                </div>
              </div>
              <div className="w-10 text-xs font-bold text-amber-400 text-right">{heir.allocatedPercentage}%</div>
              <div className="w-24 text-xs text-slate-400 text-right">${heir.allocatedValue.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-amber-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Liquidation Triggers</h3>
        </div>
        <div className="space-y-3">
          {triggers.map((trigger: LiquidationTrigger) => (
            <div key={trigger.id} className="bg-slate-900/60 border border-slate-700/40 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CircleDot size={12} className="text-amber-400" />
                  <h4 className="text-xs font-semibold text-white">{trigger.name}</h4>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${trigger.enabled ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' : 'text-slate-500 bg-slate-700 border-slate-600'}`}>
                  {trigger.enabled ? 'Active' : 'Disabled'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-1"><span className="text-slate-500">If:</span> {trigger.condition}</p>
              <p className="text-[11px] text-slate-400"><span className="text-slate-500">Then:</span> {trigger.action}</p>
              {trigger.threshold !== null && (
                <div className="mt-1.5 text-[10px] text-amber-400">Threshold: {trigger.threshold}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHeirs = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">{heirs.length}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Total Heirs</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {Math.round(heirs.reduce((s: number, h: Heir) => s + h.educationProgress, 0) / heirs.length)}%
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Avg Education</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">{heirs.filter((h: Heir) => h.preferredAction === 'keep').length}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Keeping</div>
        </div>
      </div>

      <div className="space-y-4">
        {heirs.map((heir: Heir) => (
          <div key={heir.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:border-amber-500/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl flex items-center justify-center border border-amber-500/30">
                  <User size={20} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base">{heir.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-400">{heir.relationship}, age {heir.age}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${getKnowledgeColor(heir.knowledgeLevel)}`}>
                      {heir.knowledgeLevel}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-amber-400">${heir.allocatedValue.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500">{heir.allocatedPercentage}% allocation</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-slate-900/60 border border-slate-700/40 rounded-lg p-3">
                <div className="text-[10px] text-slate-500 uppercase mb-1">Knowledge Level</div>
                <span className={`text-xs px-2 py-0.5 rounded-full border capitalize font-semibold ${getKnowledgeColor(heir.knowledgeLevel)}`}>
                  {heir.knowledgeLevel}
                </span>
              </div>
              <div className="bg-slate-900/60 border border-slate-700/40 rounded-lg p-3">
                <div className="text-[10px] text-slate-500 uppercase mb-1">Preferred Action</div>
                <span className={`text-xs px-2 py-0.5 rounded-full border capitalize font-semibold ${getActionColor(heir.preferredAction)}`}>
                  {heir.preferredAction}
                </span>
              </div>
              <div className="bg-slate-900/60 border border-slate-700/40 rounded-lg p-3">
                <div className="text-[10px] text-slate-500 uppercase mb-1">Education</div>
                <div className="text-sm font-bold text-white">{heir.educationProgress}%</div>
              </div>
            </div>

            <div className="mb-3">
              <div className="text-[10px] text-slate-500 uppercase mb-1.5">Education Progress</div>
              <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    heir.educationProgress >= 70 ? 'bg-emerald-400' :
                    heir.educationProgress >= 40 ? 'bg-amber-400' : 'bg-sky-400'
                  }`}
                  style={{ width: `${heir.educationProgress}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-lg px-3 py-2">
              <p className="text-xs text-slate-400 italic leading-relaxed">{heir.notes}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCollectionWill = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">{will.length}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Sections</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            ${will.reduce((s: number, w: CollectionWill) => s + w.estimatedValue, 0).toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Total Value</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">{new Set(will.map((w: CollectionWill) => w.assignedHeirId)).size}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Beneficiaries</div>
        </div>
      </div>

      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <ScrollText size={14} className="text-amber-400" />
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Collection Will Document</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          This document outlines the distribution of the sports card collection upon transfer.
          Each section is assigned to a designated heir with specific handling instructions.
          Last updated: {formatDate(plan.updatedAt)}.
        </p>
      </div>

      <div className="space-y-3">
        {will.map((section: CollectionWill, index: number) => (
          <div key={section.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-amber-500/30 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-amber-500/15 rounded-lg flex items-center justify-center text-sm font-bold text-amber-400 mt-0.5">
                  {section.priority}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">{section.section}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{section.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-amber-400">${section.estimatedValue.toLocaleString()}</div>
                <div className="text-[10px] text-slate-500">estimated</div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1.5">
                <User size={12} className="text-amber-400" />
                <span className="text-xs text-slate-300">Assigned to: <span className="font-semibold text-white">{section.assignedHeirName}</span></span>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-700/40 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <FileText size={11} className="text-amber-400" />
                <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">Handling Instructions</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{section.instructions}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">{education.length}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Modules</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            {education.reduce((s: number, e: EducationModule) => s + e.durationMinutes, 0)} min
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Total Duration</div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">
            {education.filter((e: EducationModule) => e.completedBy.length === heirs.length).length}
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Completed by All</div>
        </div>
      </div>

      <div className="space-y-3">
        {education.map((mod: EducationModule) => {
          const completionRate = Math.round((mod.completedBy.length / heirs.length) * 100);
          return (
            <div key={mod.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-amber-500/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 mt-0.5">
                    {getCategoryIcon(mod.category)}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{mod.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{mod.description}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize ${getDifficultyColor(mod.difficulty)}`}>
                    {mod.difficulty}
                  </span>
                  <span className="text-[10px] text-slate-500">{mod.durationMinutes} min</span>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg px-3 py-2 mb-3">
                <p className="text-xs text-slate-400 leading-relaxed">{mod.contentSummary}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500">Completion:</span>
                  <div className="flex gap-1">
                    {heirs.map((heir: Heir) => {
                      const completed = mod.completedBy.includes(heir.id);
                      return (
                        <span
                          key={heir.id}
                          className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            completed
                              ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
                              : 'text-slate-500 bg-slate-800 border-slate-600'
                          }`}
                          title={heir.name}
                        >
                          {heir.name.split(' ')[0]}
                          {completed && <CheckCircle2 size={8} className="inline ml-1" />}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${completionRate === 100 ? 'bg-emerald-400' : completionRate >= 50 ? 'bg-amber-400' : 'bg-sky-400'}`}
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{completionRate}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 pb-8 px-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30">
              <Crown size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-700/50 text-yellow-400 border border-yellow-500/30">
                  <Shield size={10} />
                  Legacy Planning
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-wide text-white">
                Estate <span className="text-yellow-400">Succession</span> Planner
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="px-6 pt-4 border-b border-slate-700/50">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-yellow-400 border-yellow-400 bg-yellow-400/5'
                    : 'text-slate-400 border-transparent hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    activeTab === tab.id ? 'bg-yellow-400/20 text-yellow-400' : 'bg-slate-700 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {activeTab === 'plan' && renderSuccessionPlan()}
          {activeTab === 'heirs' && renderHeirs()}
          {activeTab === 'will' && renderCollectionWill()}
          {activeTab === 'education' && renderEducation()}
        </div>
      </div>
    </div>
  );
};

export default EstateSuccessionModal;
