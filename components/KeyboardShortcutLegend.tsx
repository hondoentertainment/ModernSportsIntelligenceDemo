
import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

interface KeyboardShortcutLegendProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  keys: string[];
  label: string;
}

interface Section {
  title: string;
  shortcuts: Shortcut[];
}

const SECTIONS: Section[] = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['\u2318', 'K'], label: 'Search' },
      { keys: ['/'], label: 'Terminal mode' },
      { keys: ['?'], label: 'This help' },
    ],
  },
  {
    title: 'Dashboard',
    shortcuts: [
      { keys: ['Ctrl', 'D'], label: 'Dashboard' },
      { keys: ['Ctrl', 'C'], label: 'Collection' },
      { keys: ['Ctrl', 'W'], label: 'War Room' },
    ],
  },
  {
    title: 'Actions',
    shortcuts: [
      { keys: ['Ctrl', 'N'], label: 'Add Card' },
      { keys: ['Ctrl', 'E'], label: 'Export' },
      { keys: ['Ctrl', 'S'], label: 'Sync' },
    ],
  },
];

/**
 * Phase 70: App Shell Hardening — Keyboard shortcut legend modal.
 * Triggered by pressing "?" (when not focused in an input/textarea).
 * Glass-morphism dark modal with categorized shortcut sections.
 */
const KeyboardShortcutLegend: React.FC<KeyboardShortcutLegendProps> = ({ isOpen, onClose }) => {
  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800">
          <h2 className="text-sm font-black uppercase tracking-widest text-white">
            Keyboard Shortcuts
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close shortcuts"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sections */}
        <div className="px-6 py-5 space-y-6 max-h-[60vh] overflow-y-auto">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-muted mb-3">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.shortcuts.map((shortcut) => (
                  <li
                    key={shortcut.label}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-slate-300">{shortcut.label}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && (
                            <span className="text-[10px] text-slate-600 mx-0.5">+</span>
                          )}
                          <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-[11px] font-bold text-slate-300 bg-slate-800 border border-slate-700 rounded-md shadow-sm shadow-black/30">
                            {key}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/50">
          <p className="text-[10px] text-slate-500 text-center">
            Press <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-slate-400 bg-slate-800 border border-slate-700 rounded mx-0.5">Esc</kbd> to close
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutLegend;
