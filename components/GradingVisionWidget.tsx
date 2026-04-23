// @ts-nocheck
import React, { useState, useRef, useCallback } from 'react';
import { Eye, Upload, ChevronRight, Camera, TrendingUp, Shield, Zap } from 'lucide-react';
import { getGradingHistory, type VisionHistoryEntry } from '../lib/core/gradingVisionEngineService.ts';

interface Props {
  onOpenModal?: () => void;
  onNavigate?: () => void;
}

const GradingVisionWidget: React.FC<Props> = ({ onOpenModal, onNavigate }) => {
  const history = getGradingHistory();
  const recentScans = history.slice(0, 3);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const lastScan = recentScans[0];
  const avgConfidence = recentScans.length > 0
    ? Math.round(recentScans.reduce((s, e) => s + e.confidence, 0) / recentScans.length)
    : 0;
  const totalValue = recentScans.reduce((s, e) => s + e.gradedValue, 0);

  const handleClick = useCallback(() => {
    if (onOpenModal) {
      onOpenModal();
    } else if (onNavigate) {
      onNavigate();
    }
  }, [onOpenModal, onNavigate]);

  const handleQuickUpload = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    // In widget context, open modal/navigate when a file is dropped
    if (onOpenModal) onOpenModal();
    else if (onNavigate) onNavigate();
  }, [onOpenModal, onNavigate]);

  const gradeColor = (grade: number) => {
    if (grade >= 9.5) return 'text-emerald-400';
    if (grade >= 9) return 'text-cyan-400';
    if (grade >= 8) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <button
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      className={`w-full text-left bg-slate-900 border rounded-2xl p-6 space-y-5 transition-all duration-300 group hover:shadow-lg hover:shadow-cyan-500/5 ${
        dragActive
          ? 'border-cyan-400 bg-cyan-500/5 scale-[1.01]'
          : 'border-slate-700 hover:border-slate-600'
      }`}
    >
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={() => handleClick()} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
            <Eye size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Grading Vision Engine</h3>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">AI-Powered Grade Prediction</p>
          </div>
        </div>
        <ChevronRight
          size={16}
          className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all"
        />
      </div>

      {recentScans.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center py-6 text-center">
          <div className="p-3 bg-slate-800/50 rounded-xl mb-3">
            <Camera size={28} className="text-slate-600" />
          </div>
          <p className="text-sm text-slate-400">Scan a card for AI grade prediction</p>
          <p className="text-[10px] text-slate-600 mt-1 group-hover:text-slate-500 transition-colors">
            Drop an image or click to start
          </p>
        </div>
      ) : (
        <>
          {/* Last Grade Prediction */}
          {lastScan && (
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Last Prediction</p>
                <span className="text-[10px] text-slate-600">
                  {new Date(lastScan.analyzedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-sm font-medium text-slate-200 truncate">{lastScan.cardName}</p>
                  <p className="text-xs text-slate-400">{lastScan.playerName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-2xl font-black ${gradeColor(lastScan.predictedGrade)}`}>
                    {lastScan.predictedGrade}
                  </p>
                  <p className="text-[10px] text-slate-500">{lastScan.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-700/50 text-[10px]">
                <div className="flex items-center gap-1 text-slate-400">
                  <Shield size={10} />
                  <span>{lastScan.confidence}% confidence</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-400">
                  <TrendingUp size={10} />
                  <span>${lastScan.gradedValue.toFixed(0)} est. value</span>
                </div>
              </div>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-800/30 rounded-lg p-2 text-center">
              <p className="text-[10px] text-slate-500">Scans</p>
              <p className="text-sm font-bold text-slate-200">{history.length}</p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-2 text-center">
              <p className="text-[10px] text-slate-500">Avg Conf</p>
              <p className="text-sm font-bold text-cyan-400">{avgConfidence}%</p>
            </div>
            <div className="bg-slate-800/30 rounded-lg p-2 text-center">
              <p className="text-[10px] text-slate-500">Value</p>
              <p className="text-sm font-bold text-emerald-400">${totalValue.toFixed(0)}</p>
            </div>
          </div>

          {/* Quick Upload */}
          <div
            onClick={handleQuickUpload}
            className="flex items-center justify-center gap-2 p-2.5 border border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl text-xs text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            <Upload size={14} />
            <span>Quick Scan New Card</span>
          </div>
        </>
      )}
    </button>
  );
};

export default GradingVisionWidget;
