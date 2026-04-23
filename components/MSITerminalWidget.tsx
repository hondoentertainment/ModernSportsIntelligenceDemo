// @ts-nocheck
import React, { useState, useRef, useCallback } from 'react';
import { Terminal, ChevronRight, Command, Zap } from 'lucide-react';
import { executeCommand, CommandResult } from '../lib/utils/msiTerminalService';

interface MSITerminalWidgetProps {
  onOpenModal: () => void;
}

const MSITerminalWidget: React.FC<MSITerminalWidgetProps> = ({ onOpenModal }) => {
  const [input, setInput] = useState('');
  const [lastResult, setLastResult] = useState<CommandResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleExecute = useCallback(() => {
    if (!input.trim()) return;
    const result = executeCommand(input);
    setLastResult(result);
    setInput('');
  }, [input]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecute();
    }
  }, [handleExecute]);

  const resultPreview = lastResult ? (
    lastResult.resultType === 'error'
      ? lastResult.data?.message || 'Error'
      : lastResult.resultType === 'player_data'
        ? `${lastResult.data?.name || 'Player'} — $${lastResult.data?.topCardValue?.toLocaleString() || '—'}`
        : lastResult.resultType === 'help'
          ? `${lastResult.data?.total || 0} commands available`
          : lastResult.resultType === 'portfolio_summary'
            ? `Portfolio: $${lastResult.data?.totalValue?.toLocaleString() || '—'}`
            : lastResult.resultType === 'market_data'
              ? lastResult.data?.type === 'index'
                ? `MSI 500: ${lastResult.data?.level?.toLocaleString() || '—'}`
                : `Market data loaded`
              : `Result: ${lastResult.command}`
  ) : null;

  return (
    <div
      className="bg-black/90 border border-emerald-500/30 rounded-lg p-4 cursor-pointer hover:border-emerald-500/60 transition-all duration-300 group"
      onClick={onOpenModal}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <Terminal size={16} className="text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase" style={{ fontFamily: "'Courier New', monospace" }}>
                MSI Terminal
              </span>
              <Zap size={10} className="text-emerald-500 animate-pulse" />
            </div>
            <span className="text-[9px] text-emerald-600/80 tracking-wide" style={{ fontFamily: "'Courier New', monospace" }}>
              Bloomberg-Style Commands
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-emerald-600/60 group-hover:text-emerald-400 transition-colors">
          <Command size={10} />
          <span className="text-[9px]" style={{ fontFamily: "'Courier New', monospace" }}>ENTER</span>
          <ChevronRight size={12} />
        </div>
      </div>

      {/* Mini command input */}
      <div
        className="flex items-center gap-2 bg-slate-950 border border-emerald-500/20 rounded px-3 py-2 mb-2"
        onClick={(e) => { e.stopPropagation(); inputRef.current?.focus(); }}
      >
        <ChevronRight size={12} className="text-emerald-500 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder="Type command..."
          className="bg-transparent text-emerald-400 text-xs flex-1 outline-none placeholder-emerald-800/60"
          style={{ fontFamily: "'Courier New', monospace" }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Last result preview */}
      {resultPreview && (
        <div className="flex items-center gap-2 mt-2">
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${lastResult?.resultType === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`} />
          <span
            className={`text-[10px] truncate ${lastResult?.resultType === 'error' ? 'text-red-400/80' : 'text-emerald-500/80'}`}
            style={{ fontFamily: "'Courier New', monospace" }}
          >
            {resultPreview}
          </span>
          <span className="text-[9px] text-emerald-800/60 flex-shrink-0 ml-auto" style={{ fontFamily: "'Courier New', monospace" }}>
            {lastResult ? `${Math.round(lastResult.executionTime)}ms` : ''}
          </span>
        </div>
      )}

      {/* Quick commands hint */}
      {!resultPreview && (
        <div className="flex items-center gap-3 mt-1">
          {['HELP', 'PORT', 'MSI500'].map(cmd => (
            <span
              key={cmd}
              className="text-[9px] text-emerald-700/60 px-1.5 py-0.5 border border-emerald-900/30 rounded"
              style={{ fontFamily: "'Courier New', monospace" }}
            >
              {cmd}
            </span>
          ))}
          <span className="text-[9px] text-emerald-800/40 italic">click to expand</span>
        </div>
      )}
    </div>
  );
};

export default MSITerminalWidget;
