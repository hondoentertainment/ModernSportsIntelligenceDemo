import React from 'react';
import { ScanEye, Camera, ChevronRight, Star } from 'lucide-react';
import { getGradingHistory } from '../lib/visionGradingService.ts';

interface Props {
  onOpenModal?: () => void;
}

const VisionGradingWidget: React.FC<Props> = ({ onOpenModal }) => {
  const history = getGradingHistory();
  const recentScans = history.slice(0, 3);

  return (
    <button
      onClick={onOpenModal}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-6 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
            <ScanEye size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Vision <span className="text-purple-400">Grading</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              AI-powered grade prediction lab
            </p>
          </div>
        </div>
        <ChevronRight
          size={20}
          className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
        />
      </div>

      {recentScans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
            <Camera size={32} className="text-slate-600" />
          </div>
          <p className="text-sm text-slate-400">Scan a card to get AI grade prediction</p>
          <p className="text-xs text-slate-600 mt-1 group-hover:text-slate-500 transition-colors">
            Click to start your first scan
          </p>
        </div>
      ) : (
        <>
          {/* Recent Scans */}
          <div className="space-y-2">
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Recent Scans</p>
            <div className="space-y-1.5">
              {recentScans.map(scan => (
                <div
                  key={scan.id}
                  className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-xl text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{scan.playerName}</p>
                    <p className="text-[10px] text-slate-500 truncate">{scan.cardDescription}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Star size={10} className="text-amber-400" />
                    <span className="font-mono text-white font-bold">PSA {scan.predictedGrade.psa.grade}</span>
                  </div>
                  <span className={`text-[10px] font-bold ${scan.submissionAdvice.shouldSubmit ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {scan.submissionAdvice.shouldSubmit ? 'Submit' : 'Hold Raw'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer stats */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-600 uppercase tracking-widest">
              {history.length} cards scanned
            </span>
            <span className="text-[10px] text-slate-600 group-hover:text-slate-500 transition-colors uppercase tracking-widest font-bold">
              Click to scan more cards
            </span>
          </div>
        </>
      )}
    </button>
  );
};

export default VisionGradingWidget;
