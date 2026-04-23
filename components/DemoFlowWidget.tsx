// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronRight, X, Minimize2, Maximize2, Play, Layers,
} from 'lucide-react';
import type { DemoStep, DemoFlow } from '../lib/utils/demoFlowService.ts';
import { getDemoFlows, getDemoFlow, advanceStep, getDemoProgress } from '../lib/utils/demoFlowService.ts';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface DemoFlowWidgetProps {
  /** If provided, auto-starts the widget with this flow. */
  initialFlowId?: string;
  /** If provided, starts at this step index. */
  initialStep?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Widget Content (rendered inside Portal)
// ─────────────────────────────────────────────────────────────────────────────

const WidgetContent: React.FC<{
  flow: DemoFlow;
  step: DemoStep;
  stepIndex: number;
  totalSteps: number;
  isMinimized: boolean;
  onNext: () => void;
  onExit: () => void;
  onToggleMinimize: () => void;
  onLaunch: () => void;
}> = React.memo(({
  flow,
  step,
  stepIndex,
  totalSteps,
  isMinimized,
  onNext,
  onExit,
  onToggleMinimize,
  onLaunch,
}) => {
  const progressPercent = ((stepIndex + 1) / totalSteps) * 100;
  const isLastStep = stepIndex >= totalSteps - 1;

  if (isMinimized) {
    return (
      <button
        onClick={onToggleMinimize}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-lime to-emerald-500 shadow-2xl shadow-brand-lime/30 flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group"
        title={`Demo: ${step.title} (${stepIndex + 1}/${totalSteps})`}
      >
        <div className="relative">
          <Play size={20} className="text-black" />
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black text-brand-lime text-[8px] font-bold flex items-center justify-center">
            {stepIndex + 1}
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="w-80 rounded-2xl border border-slate-700/60 bg-slate-900/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700/40 flex items-center justify-between bg-slate-800/50">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-brand-lime" />
          <span className="text-xs font-semibold text-white truncate max-w-[140px]">{flow.name}</span>
          <span className="text-[10px] text-slate-500">
            {stepIndex + 1}/{totalSteps}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleMinimize}
            className="p-1.5 rounded-md hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
            title="Minimize"
          >
            <Minimize2 size={12} />
          </button>
          <button
            onClick={onExit}
            className="p-1.5 rounded-md hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
            title="Exit demo"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-brand-lime to-emerald-400 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Content */}
      <div className="px-4 py-3">
        <h4 className="text-sm font-bold text-white mb-1">{step.title}</h4>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">
          {step.description}
        </p>

        {/* Key Metric */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/40 mb-3">
          <div className="w-1.5 h-8 rounded-full bg-brand-lime/40" />
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{step.keyMetric.label}</p>
            <p className="text-sm font-bold text-brand-lime">{step.keyMetric.value}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onLaunch}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/40 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors"
          >
            Open Feature
          </button>
          <button
            onClick={onNext}
            disabled={isLastStep}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand-lime/10 border border-brand-lime/30 text-xs font-bold text-brand-lime hover:bg-brand-lime/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isLastStep ? 'Done' : 'Next Step'}
            {!isLastStep && <ChevronRight size={12} />}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-slate-700/30 bg-slate-800/30">
        <p className="text-[10px] text-slate-500 text-center">
          {formatDuration(step.duration)} per step &middot;{' '}
          <button onClick={onExit} className="text-slate-400 hover:text-red-400 transition-colors underline">
            Exit Demo
          </button>
        </p>
      </div>
    </div>
  );
});
WidgetContent.displayName = 'WidgetContent';

// ─────────────────────────────────────────────────────────────────────────────
// Main Widget (Portal-based)
// ─────────────────────────────────────────────────────────────────────────────

const DemoFlowWidget: React.FC<DemoFlowWidgetProps> = ({ initialFlowId, initialStep = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeFlowId, setActiveFlowId] = useState<string | null>(initialFlowId ?? null);
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStep);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(!!initialFlowId);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  // Create portal container on mount
  useEffect(() => {
    let container = document.getElementById('demo-flow-widget-portal');
    if (!container) {
      container = document.createElement('div');
      container.id = 'demo-flow-widget-portal';
      container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;pointer-events:auto;';
      document.body.appendChild(container);
    }
    setPortalContainer(container);

    return () => {
      // Only remove if we created it and widget is unmounting
      const el = document.getElementById('demo-flow-widget-portal');
      if (el && el.childNodes.length === 0) {
        el.remove();
      }
    };
  }, []);

  // Listen for custom events to start a demo from anywhere
  useEffect(() => {
    const handler = (e: CustomEvent<{ flowId: string; stepIndex?: number }>) => {
      setActiveFlowId(e.detail.flowId);
      setCurrentStepIndex(e.detail.stepIndex ?? 0);
      setIsMinimized(false);
      setIsVisible(true);
    };

    window.addEventListener('start-demo-flow' as any, handler);
    return () => window.removeEventListener('start-demo-flow' as any, handler);
  }, []);

  const activeFlow = useMemo(
    () => (activeFlowId ? getDemoFlow(activeFlowId) : undefined),
    [activeFlowId],
  );

  const currentStep = useMemo(
    () => activeFlow?.steps[currentStepIndex] ?? null,
    [activeFlow, currentStepIndex],
  );

  // Detect if user is already on the current step's route
  useEffect(() => {
    if (currentStep && location.pathname === currentStep.route) {
      // User navigated to the step's page — could auto-advance or highlight
    }
  }, [location.pathname, currentStep]);

  const handleNext = useCallback(() => {
    if (!activeFlow || !activeFlowId) return;
    const step = activeFlow.steps[currentStepIndex];
    if (step) advanceStep(activeFlowId, step.id, currentStepIndex + 1);

    const nextIndex = currentStepIndex + 1;
    if (nextIndex >= activeFlow.steps.length) {
      // Flow complete
      setIsVisible(false);
      setActiveFlowId(null);
      return;
    }
    setCurrentStepIndex(nextIndex);
  }, [activeFlow, activeFlowId, currentStepIndex]);

  const handleExit = useCallback(() => {
    setIsVisible(false);
    setActiveFlowId(null);
    setCurrentStepIndex(0);
    setIsMinimized(false);
  }, []);

  const handleToggleMinimize = useCallback(() => {
    setIsMinimized((prev) => !prev);
  }, []);

  const handleLaunch = useCallback(() => {
    if (currentStep) {
      navigate(currentStep.route);
    }
  }, [currentStep, navigate]);

  if (!isVisible || !activeFlow || !currentStep || !portalContainer) {
    return null;
  }

  return createPortal(
    <WidgetContent
      flow={activeFlow}
      step={currentStep}
      stepIndex={currentStepIndex}
      totalSteps={activeFlow.steps.length}
      isMinimized={isMinimized}
      onNext={handleNext}
      onExit={handleExit}
      onToggleMinimize={handleToggleMinimize}
      onLaunch={handleLaunch}
    />,
    portalContainer,
  );
};

export default DemoFlowWidget;
