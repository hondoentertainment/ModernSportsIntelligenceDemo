import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  LayoutDashboard,
  Package,
  TrendingUp,
  BarChart3,
  Bell,
  FileText,
  Zap,
  Settings,
  Terminal,
  Sparkles,
  Shield,
  ShoppingBag,
  Users,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFocusTrap } from '../lib/utils/useFocusTrap';
import { COMMAND_ROUTES } from '../lib/utils/productSurface';
import {
  searchFeatures,
  FEATURED_FEATURE_CATALOG,
  Feature,
} from '../lib/utils/featureCatalog';
import { useShortcutGlyph } from '../lib/utils/useShortcutGlyph';

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

const FEATURE_RESULT_LIMIT = 8;

const SLASH_COMMANDS: Array<{
  cmd: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  keywords: string[];
}> = [
  {
    cmd: '/scan',
    label: 'Run /scan',
    description: 'Launch AI Alpha Scan',
    icon: <Sparkles size={16} />,
    path: '/',
    keywords: ['scan', 'alpha', 'ai', 'dashboard'],
  },
  {
    cmd: '/compare',
    label: 'Run /compare',
    description: 'Compare multi-asset NAV',
    icon: <Zap size={16} />,
    path: '/compare',
    keywords: ['compare', 'nav', 'side by side'],
  },
  {
    cmd: '/war-room',
    label: 'Run /war-room',
    description: 'Enter Analyst War Room',
    icon: <Shield size={16} />,
    path: '/war-room',
    keywords: ['war', 'room', 'analyst', 'committee'],
  },
  {
    cmd: '/buy',
    label: 'Run /buy',
    description: 'Search marketplace for targets',
    icon: <ShoppingBag size={16} />,
    path: '/deep-search',
    keywords: ['buy', 'marketplace', 'deal', 'deep search'],
  },
  {
    cmd: '/guilds',
    label: 'Run /guilds',
    description: 'Open Guild Dashboard',
    icon: <Users size={16} />,
    path: '/guilds',
    keywords: ['guild', 'community', 'crew'],
  },
];

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onAddCard, onOpenScanner }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen);
  const navigate = useNavigate();
  const glyph = useShortcutGlyph();

  const commands: CommandItem[] = useMemo(() => {
    const commandIcons: Record<string, React.ReactNode> = {
      'nav-dashboard': <LayoutDashboard size={16} />,
      'nav-collection': <Package size={16} />,
      'nav-prospects': <TrendingUp size={16} />,
      'nav-alerts': <Bell size={16} />,
      'nav-mlb-stats': <BarChart3 size={16} />,
      'nav-audit': <FileText size={16} />,
      'nav-search': <Search size={16} />,
      'nav-settings': <Settings size={16} />,
      'nav-dossier': <FileText size={16} />,
    };

    const navigateItems: CommandItem[] = COMMAND_ROUTES.map((command) => ({
      id: command.id,
      label: command.label,
      description: command.description,
      icon: commandIcons[command.id] || <Search size={16} />,
      action: () => {
        navigate(command.path);
        onClose();
      },
      section: 'Navigate',
      keywords: [...command.keywords],
    }));

    const runItems: CommandItem[] = SLASH_COMMANDS.map((c) => ({
      id: `run-${c.cmd}`,
      label: c.label,
      description: c.description,
      icon: c.icon,
      action: () => {
        navigate(c.path);
        onClose();
      },
      section: 'Run',
      keywords: [c.cmd.replace('/', ''), ...c.keywords, 'terminal', 'command'],
    }));

    const actionItems: CommandItem[] = [
      ...(onAddCard
        ? [
            {
              id: 'action-add',
              label: 'Add New Card',
              description: 'Add a card to your collection',
              icon: <Package size={16} />,
              action: () => {
                onAddCard();
                onClose();
              },
              section: 'Actions',
              keywords: ['new', 'create'],
            } as CommandItem,
          ]
        : []),
      ...(onOpenScanner
        ? [
            {
              id: 'action-scan',
              label: 'Scan Card (Camera)',
              description: 'Use camera to identify a card',
              icon: <Zap size={16} />,
              action: () => {
                onOpenScanner();
                onClose();
              },
              section: 'Actions',
              keywords: ['ocr', 'photo', 'vision'],
            } as CommandItem,
          ]
        : []),
    ];

    return [...navigateItems, ...runItems, ...actionItems];
  }, [navigate, onClose, onAddCard, onOpenScanner]);

  // Feature catalog results — capped to keep palette focused.
  const featureItems: CommandItem[] = useMemo(() => {
    const trimmed = query.trim();
    const features: Feature[] = trimmed
      ? searchFeatures(trimmed)
      : FEATURED_FEATURE_CATALOG;
    return features.slice(0, FEATURE_RESULT_LIMIT).map((feature) => ({
      id: `feature-${feature.id}`,
      label: feature.name,
      description: feature.description,
      icon: <Sparkles size={16} />,
      action: () => {
        if (feature.path) {
          navigate(feature.path);
        }
        onClose();
      },
      section: 'Features',
      keywords: [feature.category, feature.tier, ...feature.keywords],
    }));
  }, [query, navigate, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (c: CommandItem) =>
      !q ||
      c.label.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q) ||
      c.keywords?.some((kw) => kw.toLowerCase().includes(q));

    const filteredCommands = commands.filter(match);
    // Features are already searched/filtered by `searchFeatures`; render as-is.
    return [...filteredCommands, ...featureItems];
  }, [commands, featureItems, query]);

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
    const el = listRef.current?.querySelector(`[data-flat-index="${selectedIndex}"]`) as HTMLElement | null;
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  // Group by section, preserving the section order from `filtered`.
  const sections: Array<[string, CommandItem[]]> = [];
  const sectionIndex = new Map<string, number>();
  filtered.forEach((item) => {
    const idx = sectionIndex.get(item.section);
    if (idx === undefined) {
      sectionIndex.set(item.section, sections.length);
      sections.push([item.section, [item]]);
    } else {
      sections[idx][1].push(item);
    }
  });

  let flatIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="command-palette-title"
    >
      <div ref={trapRef} className="w-full max-w-lg bg-brand-slate border border-slate-700 rounded-2xl shadow-2xl overflow-hidden" onKeyDown={handleKeyDown}>
        <h2 id="command-palette-title" className="sr-only">Command palette</h2>
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
          {query.startsWith('/') ? (
            <Terminal size={18} className="text-brand-lime flex-shrink-0" aria-hidden />
          ) : (
            <Search size={18} className="text-brand-muted flex-shrink-0" aria-hidden />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, features, or type /scan, /buy, /compare..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-brand-muted/50 outline-none"
            aria-label="Search commands and features"
          />
          <kbd className="hidden md:inline text-[9px] font-mono text-brand-muted bg-brand-charcoal px-2 py-1 rounded-lg border border-slate-800" aria-label={`Open with ${glyph.combo('K')}`}>
            {glyph.combo('K')}
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-2" role="listbox">
          {filtered.length === 0 && (
            <p className="px-5 py-8 text-sm text-brand-muted text-center">No commands found</p>
          )}
          {sections.map(([section, items]) => (
            <div key={section}>
              <p className="px-5 pt-3 pb-1 text-[9px] font-black text-brand-muted uppercase tracking-widest">{section}</p>
              {items.map(item => {
                flatIndex++;
                const idx = flatIndex;
                return (
                  <button
                    type="button"
                    key={item.id}
                    data-flat-index={idx}
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
                    {section === 'Features' && (
                      <ArrowRight size={14} className={`flex-shrink-0 ${idx === selectedIndex ? 'text-brand-lime' : 'text-slate-600'}`} aria-hidden />
                    )}
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
