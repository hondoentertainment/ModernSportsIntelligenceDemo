import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, LayoutDashboard, Package, TrendingUp, Star, BarChart3, Target, Bell, User, FileText, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFocusTrap } from '../lib/useFocusTrap';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  section: string;
  keywords?: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard?: () => void;
  onOpenScanner?: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onAddCard, onOpenScanner }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen);
  const navigate = useNavigate();

  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    { id: 'nav-dashboard', label: 'Go to Dashboard', icon: <LayoutDashboard size={16} />, action: () => { navigate('/'); onClose(); }, section: 'Navigate', keywords: ['home', 'overview'] },
    { id: 'nav-collection', label: 'Go to Collection', icon: <Package size={16} />, action: () => { navigate('/collection'); onClose(); }, section: 'Navigate', keywords: ['cards', 'inventory'] },
    { id: 'nav-prospects', label: 'Go to Prospects', icon: <TrendingUp size={16} />, action: () => { navigate('/prospects'); onClose(); }, section: 'Navigate', keywords: ['milb', 'minor league'] },
    { id: 'nav-favorites', label: 'Go to Favorites', icon: <Star size={16} />, action: () => { navigate('/favorites'); onClose(); }, section: 'Navigate', keywords: ['starred', 'bookmarks'] },
    { id: 'nav-stats', label: 'Go to MLB Stats', icon: <BarChart3 size={16} />, action: () => { navigate('/stats'); onClose(); }, section: 'Navigate', keywords: ['mlb', 'baseball'] },
    { id: 'nav-watchlist', label: 'Go to Watchlist', icon: <Target size={16} />, action: () => { navigate('/collection?tab=targets'); onClose(); }, section: 'Navigate', keywords: ['targets', 'watch'] },
    { id: 'nav-alerts', label: 'Go to Alerts', icon: <Bell size={16} />, action: () => { navigate('/alerts'); onClose(); }, section: 'Navigate', keywords: ['notifications'] },
    { id: 'nav-profile', label: 'Go to Profile', icon: <User size={16} />, action: () => { navigate('/profile'); onClose(); }, section: 'Navigate', keywords: ['settings', 'account'] },
    { id: 'nav-audit', label: 'Go to Portfolio Audit', icon: <FileText size={16} />, action: () => { navigate('/audit'); onClose(); }, section: 'Navigate', keywords: ['report', 'analysis'] },
    { id: 'nav-search', label: 'Go to Deep Search', icon: <Search size={16} />, action: () => { navigate('/search'); onClose(); }, section: 'Navigate', keywords: ['find', 'lookup'] },

    // Actions
    ...(onAddCard ? [{ id: 'action-add', label: 'Add New Card', description: 'Add a card to your collection', icon: <Package size={16} />, action: () => { onAddCard(); onClose(); }, section: 'Actions', keywords: ['new', 'create'] }] : []),
    ...(onOpenScanner ? [{ id: 'action-scan', label: 'Scan Card (Camera)', description: 'Use camera to identify a card', icon: <Zap size={16} />, action: () => { onOpenScanner(); onClose(); }, section: 'Actions', keywords: ['ocr', 'photo', 'vision'] }] : []),
  ], [navigate, onClose, onAddCard, onOpenScanner]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.keywords?.some(kw => kw.includes(q))
    );
  }, [commands, query]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered.length]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  if (!isOpen) return null;

  // Group by section
  const sections = new Map<string, CommandItem[]>();
  filtered.forEach(item => {
    const existing = sections.get(item.section) || [];
    existing.push(item);
    sections.set(item.section, existing);
  });

  let flatIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div ref={trapRef} className="w-full max-w-lg bg-brand-slate border border-slate-700 rounded-2xl shadow-2xl overflow-hidden" onKeyDown={handleKeyDown}>
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
          <Search size={18} className="text-brand-muted flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-brand-muted/50 outline-none"
            aria-label="Search commands"
          />
          <kbd className="hidden md:inline text-[9px] font-mono text-brand-muted bg-brand-charcoal px-2 py-1 rounded-lg border border-slate-800">ESC</kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-2" role="listbox">
          {filtered.length === 0 && (
            <p className="px-5 py-8 text-sm text-brand-muted text-center">No commands found</p>
          )}
          {[...sections.entries()].map(([section, items]) => (
            <div key={section}>
              <p className="px-5 pt-3 pb-1 text-[9px] font-black text-brand-muted uppercase tracking-widest">{section}</p>
              {items.map(item => {
                flatIndex++;
                const idx = flatIndex;
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    role="option"
                    aria-selected={idx === selectedIndex}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                      idx === selectedIndex
                        ? 'bg-brand-lime/10 text-brand-lime'
                        : 'text-slate-300 hover:bg-brand-charcoal/50'
                    }`}
                  >
                    <span className="flex-shrink-0 opacity-60">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.label}</p>
                      {item.description && (
                        <p className="text-[10px] text-brand-muted truncate">{item.description}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 text-[9px] text-brand-muted">
          <div className="flex gap-3">
            <span><kbd className="font-mono bg-brand-charcoal px-1.5 py-0.5 rounded border border-slate-800">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono bg-brand-charcoal px-1.5 py-0.5 rounded border border-slate-800">↵</kbd> select</span>
          </div>
          <span><kbd className="font-mono bg-brand-charcoal px-1.5 py-0.5 rounded border border-slate-800">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
