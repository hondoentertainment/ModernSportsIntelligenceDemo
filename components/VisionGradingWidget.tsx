import React from 'react';
import { ScanEye, Camera, ChevronRight, Star, AlertCircle } from 'lucide-react';
import { getGradingHistory } from '../lib/visionGradingService.ts';

interface Props {
  onOpenModal?: () => void;
}

const VisionGradingWidget: React.FC<Props> = ({ onOpenModal }) => {
  const history = getGradingHistory();
  const recentScans = history.slice(0, 3);

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-purple-500/30 transition-all cursor-pointer" onClick={onOpenModal}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/20">
            <ScanEye size={16} className="text-purple-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">Vision Grading Lab</h3>
        </div>
        <ChevronRight size={14} className="text-slate-500" />
      </div>

      {recentScans.length === 0 ? (
        <div className="text-center py-4">
          <Camera size={24} className="text-slate-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Scan a card to get AI grade prediction</p>
          <button onClick={onOpenModal} className="mt-2 px-3 py-1.5 text-xs bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors">
            Start Scan
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {recentScans.map(scan => (
            <div key={scan.id} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-300 truncate">{scan.playerName}</p>
                <p className="text-[10px] text-slate-500 truncate">{scan.cardDescription}</p>
              </div>
              <div className="text-right ml-2">
                <div className="flex items-center gap-1">
                  <Star size={10} className="text-amber-400" />
                  <span className="text-xs font-bold text-slate-200">PSA {scan.predictedGrade.psa.grade}</span>
                </div>
                <p className={`text-[10px] ${scan.submissionAdvice.shouldSubmit ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {scan.submissionAdvice.shouldSubmit ? 'Submit ✓' : 'Hold Raw'}
                </p>
              </div>
            </div>
          ))}
          <div className="text-center pt-1">
            <p className="text-[10px] text-slate-500">{history.length} cards scanned total</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisionGradingWidget;
