// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Play, Pause, ChevronLeft, ChevronRight, SkipForward, RotateCcw,
  ChevronDown, ExternalLink, Clock, Zap, Target, TrendingUp,
  CheckCircle2, Circle, ArrowRight, BarChart3, Radar as RadarIcon,
  Layers, Eye, Shield, DollarSign, Activity,
} from 'lucide-react';
import type {
  DemoFlow as DemoFlowType, DemoStep, DemoProgress, DemoCategory,
} from '../lib/utils/demoFlowService.ts';
import {
  getDemoFlows, getDemoFlow, getNextStep, getDemoProgress,
  advanceStep, resetProgress, getInvestorMetrics,
} from '../lib/utils/demoFlowService.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<DemoCategory, { color: string; icon: React.ElementType; label: string }> = {
  scan: { color: '#22d3ee', icon: Eye, label: 'Scan' },
  authenticate: { color: '#a78bfa', icon: Shield, label: 'Authenticate' },
  analyze: { color: '#3b82f6', icon: BarChart3, label: 'Analyze' },
  optimize: { color: '#22c55e', icon: Target, label: 'Optimize' },
  monetize: { color: '#fbbf24', icon: DollarSign, label: 'Monetize' },
  monitor: { color: '#f472b6', icon: Activity, label: 'Monitor' },
};

const AUTO_ADVANCE_DELAYS = [
  { label: '10s', value: 10 },
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
  { label: '90s', value: 90 },
];

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const StepCard: React.FC<{
  step: DemoStep;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  onSelect: () => void;
}> = React.memo(({ step, index, isActive, isCompleted, onSelect }) => {
  const config = CATEGORY_CONFIG[step.category];
  const Icon = config.icon;

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 group ${
        isActive
          ? 'border-brand-lime/50 bg-brand-lime/10 shadow-lg shadow-brand-lime/5'
          : isCompleted
          ? 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10'
          : 'border-slate-700/50 bg-slate-800/30 hover:bg-slate-700/30 hover:border-slate-600/50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
          style={{
            backgroundColor: isCompleted ? '#22c55e20' : isActive ? `${config.color}20` : '#33415520',
            color: isCompleted ? '#22c55e' : isActive ? config.color : '#64748b',
            border: `1.5px solid ${isCompleted ? '#22c55e40' : isActive ? `${config.color}60` : '#33415560'}`,
          }}
        >
          {isCompleted ? <CheckCircle2 size={14} /> : index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isActive ? 'text-white' : isCompleted ? 'text-emerald-300' : 'text-slate-300'}`}>
            {step.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <Icon size={10} style={{ color: config.color }} />
            <span className="text-[10px] uppercase tracking-wider" style={{ color: config.color }}>{config.label}</span>
            <span className="text-[10px] text-slate-500">{formatDuration(step.duration)}</span>
          </div>
        </div>
        {isActive && <ArrowRight size={14} className="text-brand-lime flex-shrink-0" />}
      </div>
    </button>
  );
});
StepCard.displayName = 'StepCard';

const MetricCallout: React.FC<{ label: string; value: string; color?: string }> = React.memo(({ label, value, color = '#84cc16' }) => (
  <div className="relative overflow-hidden rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-5">
    <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20" style={{ backgroundColor: color }} />
    <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">{label}</p>
    <p className="text-3xl font-bold" style={{ color }}>{value}</p>
  </div>
));
MetricCallout.displayName = 'MetricCallout';

// ─────────────────────────────────────────────────────────────────────────────
// Charts
// ─────────────────────────────────────────────────────────────────────────────

const FeatureCoverageRadar: React.FC<{ flow: DemoFlowType }> = React.memo(({ flow }) => {
  const data = useMemo(() => {
    const counts: Record<DemoCategory, number> = { scan: 0, authenticate: 0, analyze: 0, optimize: 0, monetize: 0, monitor: 0 };
    for (const step of flow.steps) {
      counts[step.category]++;
    }
    return Object.entries(counts).map(([cat, count]) => ({
      category: CATEGORY_CONFIG[cat as DemoCategory].label,
      count,
      fullMark: Math.max(3, ...Object.values(counts)),
    }));
  }, [flow]);

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
        <RadarIcon size={14} className="text-cyan-400" /> Feature Coverage
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 'dataMax']} />
          <Radar name="Coverage" dataKey="count" stroke="#84cc16" fill="#84cc16" fillOpacity={0.2} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
});
FeatureCoverageRadar.displayName = 'FeatureCoverageRadar';

const KeyMetricsBar: React.FC<{ flow: DemoFlowType }> = React.memo(({ flow }) => {
  const data = useMemo(() =>
    flow.steps.map((step) => ({
      name: step.featureName.length > 12 ? step.featureName.slice(0, 12) + '...' : step.featureName,
      duration: step.duration,
      fullName: step.featureName,
    })),
  [flow]);

  return (
    <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
        <BarChart3 size={14} className="text-amber-400" /> Step Duration (seconds)
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} angle={-35} textAnchor="end" height={60} />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
            labelStyle={{ color: '#e2e8f0' }}
            itemStyle={{ color: '#84cc16' }}
            formatter={(value: number, _name: string, props: any) => [`${value}s`, props.payload.fullName]}
          />
          <Bar dataKey="duration" fill="#84cc16" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});
KeyMetricsBar.displayName = 'KeyMetricsBar';

// ─────────────────────────────────────────────────────────────────────────────
// Loading State
// ─────────────────────────────────────────────────────────────────────────────

const LoadingSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-6 p-8">
    <div className="flex gap-4">
      <div className="h-10 w-48 bg-slate-700/50 rounded-lg" />
      <div className="h-10 flex-1 bg-slate-700/50 rounded-lg" />
      <div className="h-10 w-32 bg-slate-700/50 rounded-lg" />
    </div>
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-1 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-700/50 rounded-lg" />
        ))}
      </div>
      <div className="col-span-3 space-y-4">
        <div className="h-64 bg-slate-700/50 rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-48 bg-slate-700/50 rounded-xl" />
          <div className="h-48 bg-slate-700/50 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const DemoFlowPage: React.FC = () => {
  const navigate = useNavigate();
  const flows = useMemo(() => getDemoFlows(), []);
  const investorMetrics = useMemo(() => getInvestorMetrics(), []);

  const [selectedFlowId, setSelectedFlowId] = useState<string>(flows[0]?.id ?? '');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [autoAdvanceDelay, setAutoAdvanceDelay] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [showDelayPicker, setShowDelayPicker] = useState(false);

  const autoAdvanceRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedFlow = useMemo(() => getDemoFlow(selectedFlowId), [selectedFlowId]);
  const progress = useMemo(() => getDemoProgress(selectedFlowId), [selectedFlowId]);
  const currentStep = useMemo(() => selectedFlow?.steps[currentStepIndex] ?? null, [selectedFlow, currentStepIndex]);

  const completedStepIds = useMemo(() => new Set(progress.completedSteps), [progress.completedSteps]);

  const remainingTime = useMemo(() => {
    if (!selectedFlow) return 0;
    return selectedFlow.steps
      .slice(currentStepIndex)
      .reduce((sum, s) => sum + s.duration, 0);
  }, [selectedFlow, currentStepIndex]);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-advance timer
  useEffect(() => {
    if (autoAdvanceRef.current) {
      clearInterval(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }

    if (autoAdvance && selectedFlow) {
      autoAdvanceRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          const nextIndex = prev + 1;
          if (nextIndex >= (selectedFlow?.steps.length ?? 0)) {
            setAutoAdvance(false);
            return prev;
          }
          const step = selectedFlow?.steps[prev];
          if (step) advanceStep(selectedFlowId, step.id, nextIndex);
          return nextIndex;
        });
      }, autoAdvanceDelay * 1000);
    }

    return () => {
      if (autoAdvanceRef.current) {
        clearInterval(autoAdvanceRef.current);
      }
    };
  }, [autoAdvance, autoAdvanceDelay, selectedFlow, selectedFlowId]);

  const handleSelectFlow = useCallback((flowId: string) => {
    setSelectedFlowId(flowId);
    setCurrentStepIndex(0);
    setIsDropdownOpen(false);
    setAutoAdvance(false);
  }, []);

  const handlePrevStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNextStep = useCallback(() => {
    if (!selectedFlow) return;
    const step = selectedFlow.steps[currentStepIndex];
    if (step) advanceStep(selectedFlowId, step.id, currentStepIndex + 1);
    setCurrentStepIndex((prev) => Math.min((selectedFlow?.steps.length ?? 1) - 1, prev + 1));
  }, [selectedFlow, selectedFlowId, currentStepIndex]);

  const handleSkipToEnd = useCallback(() => {
    if (!selectedFlow) return;
    selectedFlow.steps.forEach((step, idx) => advanceStep(selectedFlowId, step.id, idx));
    setCurrentStepIndex(selectedFlow.steps.length - 1);
    setAutoAdvance(false);
  }, [selectedFlow, selectedFlowId]);

  const handleReset = useCallback(() => {
    resetProgress(selectedFlowId);
    setCurrentStepIndex(0);
    setAutoAdvance(false);
  }, [selectedFlowId]);

  const handleLaunchFeature = useCallback(() => {
    if (currentStep) {
      navigate(currentStep.route);
    }
  }, [currentStep, navigate]);

  const handleSelectStep = useCallback((index: number) => {
    setCurrentStepIndex(index);
  }, []);

  if (isLoading) return <LoadingSkeleton />;

  if (!selectedFlow || !currentStep) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-400">No demo flows available.</p>
      </div>
    );
  }

  const stepConfig = CATEGORY_CONFIG[currentStep.category];
  const StepIcon = stepConfig.icon;
  const progressPercent = ((currentStepIndex + 1) / selectedFlow.steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* ── Top Bar ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Flow Selector */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 transition-colors text-sm font-medium text-white"
          >
            <Layers size={16} className="text-brand-lime" />
            {selectedFlow.name}
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-72 rounded-xl border border-slate-700 bg-slate-800 shadow-2xl z-50 overflow-hidden">
              {flows.map((flow) => (
                <button
                  key={flow.id}
                  onClick={() => handleSelectFlow(flow.id)}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    flow.id === selectedFlowId
                      ? 'bg-brand-lime/10 border-l-2 border-brand-lime'
                      : 'hover:bg-slate-700/50 border-l-2 border-transparent'
                  }`}
                >
                  <p className="text-sm font-medium text-white">{flow.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {flow.steps.length} steps &middot; {formatDuration(flow.totalDuration)} &middot;{' '}
                    <span className="capitalize">{flow.targetAudience}</span>
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-1 max-w-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-slate-400">
                Step {currentStepIndex + 1} of {selectedFlow.steps.length}
              </span>
              <span className="text-xs text-slate-500">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-lime to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Time Remaining */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700/50 bg-slate-800/30">
          <Clock size={14} className="text-slate-400" />
          <span className="text-xs text-slate-300">{formatDuration(remainingTime)} remaining</span>
        </div>

        {/* Auto-advance Toggle */}
        <div className="relative flex items-center gap-2">
          <button
            onClick={() => setAutoAdvance(!autoAdvance)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
              autoAdvance
                ? 'border-brand-lime/50 bg-brand-lime/10 text-brand-lime'
                : 'border-slate-700/50 bg-slate-800/30 text-slate-400 hover:text-white'
            }`}
          >
            {autoAdvance ? <Pause size={12} /> : <Play size={12} />}
            {autoAdvance ? 'Pause' : 'Auto'}
          </button>
          <button
            onClick={() => setShowDelayPicker(!showDelayPicker)}
            className="px-2 py-2 rounded-lg border border-slate-700/50 bg-slate-800/30 text-xs text-slate-400 hover:text-white transition-colors"
          >
            {autoAdvanceDelay}s
          </button>
          {showDelayPicker && (
            <div className="absolute top-full right-0 mt-1 rounded-lg border border-slate-700 bg-slate-800 shadow-xl z-50 overflow-hidden">
              {AUTO_ADVANCE_DELAYS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => { setAutoAdvanceDelay(d.value); setShowDelayPicker(false); }}
                  className={`block w-full px-4 py-2 text-xs text-left transition-colors ${
                    d.value === autoAdvanceDelay ? 'bg-brand-lime/10 text-brand-lime' : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset */}
        <button
          onClick={handleReset}
          className="p-2 rounded-lg border border-slate-700/50 bg-slate-800/30 text-slate-400 hover:text-white transition-colors"
          title="Reset demo"
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Side Panel - Flow Overview */}
        <div className="lg:col-span-1 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1 scrollbar-thin">
          <h3 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3 sticky top-0 bg-brand-charcoal/95 backdrop-blur-sm py-1 z-10">
            Flow Steps
          </h3>
          {selectedFlow.steps.map((step, idx) => (
            <StepCard
              key={step.id}
              step={step}
              index={idx}
              isActive={idx === currentStepIndex}
              isCompleted={completedStepIds.has(step.id)}
              onSelect={() => handleSelectStep(idx)}
            />
          ))}
        </div>

        {/* Main Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Current Step Card */}
          <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-800/60 to-slate-900/80 overflow-hidden">
            {/* Step Header */}
            <div className="px-6 py-4 border-b border-slate-700/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${stepConfig.color}15`, border: `1.5px solid ${stepConfig.color}30` }}
                >
                  <StepIcon size={18} style={{ color: stepConfig.color }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{currentStep.title}</h2>
                  <p className="text-xs text-slate-400">{currentStep.description}</p>
                </div>
              </div>
              <span
                className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full"
                style={{ color: stepConfig.color, backgroundColor: `${stepConfig.color}15`, border: `1px solid ${stepConfig.color}30` }}
              >
                {stepConfig.label}
              </span>
            </div>

            {/* Investor Pitch */}
            <div className="px-6 py-5">
              <div className="flex items-start gap-3 mb-5">
                <Zap size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-1.5">Investor Pitch</p>
                  <p className="text-sm text-slate-200 leading-relaxed">{currentStep.investorPitch}</p>
                </div>
              </div>

              {/* Key Metric + Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCallout
                  label={currentStep.keyMetric.label}
                  value={currentStep.keyMetric.value}
                  color={stepConfig.color}
                />
                <div className="md:col-span-2 rounded-xl border border-slate-700/50 bg-slate-800/30 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Key Highlights</p>
                  <ul className="space-y-1.5">
                    {currentStep.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <TrendingUp size={12} className="text-brand-lime mt-0.5 flex-shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Launch Feature Button */}
              <div className="mt-5 flex items-center gap-3">
                <button
                  onClick={handleLaunchFeature}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-lime to-emerald-500 text-black font-bold text-sm hover:shadow-lg hover:shadow-brand-lime/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ExternalLink size={16} />
                  Launch {currentStep.featureName}
                </button>
                <span className="text-xs text-slate-500">
                  Estimated time: {formatDuration(currentStep.duration)}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Dots + Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700/50 bg-slate-800/30 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} /> Previous
            </button>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {selectedFlow.steps.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => handleSelectStep(idx)}
                  className="transition-all"
                  title={step.title}
                >
                  {idx === currentStepIndex ? (
                    <div className="w-6 h-2 rounded-full bg-brand-lime" />
                  ) : completedStepIds.has(step.id) ? (
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-600 hover:bg-slate-500" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSkipToEnd}
                className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <SkipForward size={12} /> Skip to End
              </button>
              <button
                onClick={handleNextStep}
                disabled={currentStepIndex >= selectedFlow.steps.length - 1}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-brand-lime/10 border border-brand-lime/30 text-sm font-medium text-brand-lime hover:bg-brand-lime/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCoverageRadar flow={selectedFlow} />
            <KeyMetricsBar flow={selectedFlow} />
          </div>

          {/* Investor Metrics Summary */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-brand-lime" /> Platform Metrics Summary
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{investorMetrics.totalFeatures}</p>
                <p className="text-xs text-slate-400 mt-1">Total Features</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-400">{formatDuration(investorMetrics.totalDemoTime)}</p>
                <p className="text-xs text-slate-400 mt-1">Total Demo Time</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-400">{formatDuration(investorMetrics.avgStepDuration)}</p>
                <p className="text-xs text-slate-400 mt-1">Avg Step Duration</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-400">{Object.keys(investorMetrics.categories).length}</p>
                <p className="text-xs text-slate-400 mt-1">Feature Categories</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoFlowPage;
