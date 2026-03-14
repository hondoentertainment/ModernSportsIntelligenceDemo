
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, X, ArrowRight, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  searchFeatures,
  groupByTier,
  TIER_CONFIG,
  DISCOVERABLE_FEATURE_CATALOG,
  FEATURED_FEATURE_CATALOG,
  Feature,
} from '../lib/featureCatalog';
import { useFocusTrap } from '../lib/useFocusTrap';

const FeatureSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const trapRef = useFocusTrap<HTMLDivElement>(isOpen);
  const navigate = useNavigate();

  // Global keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) {
      return FEATURED_FEATURE_CATALOG;
    }
    return searchFeatures(query);
  }, [query]);

  const grouped = useMemo(() => groupByTier(results), [results]);

  const flatResults = useMemo(() => {
    const flat: Feature[] = [];
    grouped.forEach(([, features]) => flat.push(...features));
    return flat;
  }, [grouped]);

  // Reset selection on results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [flatResults.length, query]);

  const handleSelect = useCallback((feature: Feature) => {
    setIsOpen(false);
    if (feature.path) {
      navigate(feature.path);
    }
  }, [navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && flatResults[selectedIndex]) {
      e.preventDefault();
      handleSelect(flatResults[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-feature-item]');
    const el = items[selectedIndex] as HTMLElement;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-brand-slate border border-slate-800 rounded-full text-brand-muted hover:text-white hover:border-slate-600 transition-all text-[10px] font-black uppercase tracking-widest group"
        aria-label="Search features (Ctrl+K)"
      >
        <Search size={14} className="group-hover:text-brand-lime transition-colors" />
        <span className="hidden lg:inline">Features</span>
        <kbd className="hidden md:inline text-[9px] font-mono bg-brand-charcoal px-1.5 py-0.5 rounded border border-slate-800">
          <Command size={9} className="inline" />K
        </kbd>
      </button>

      {/* Modal overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[12vh] p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
          role="dialog"
          aria-modal="true"
          aria-label="Feature search"
        >
          <div
            ref={trapRef}
            className="w-full max-w-2xl bg-brand-slate border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
              <Search size={18} className="text-brand-lime flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${DISCOVERABLE_FEATURE_CATALOG.length} verified features... (e.g. grading, live, tax, AI)`}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                aria-label="Search features"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-slate-500 hover:text-white transition-colors">
                  <X size={16} />
                </button>
              )}
              <kbd className="hidden md:inline text-[9px] font-mono text-brand-muted bg-brand-charcoal px-2 py-1 rounded-lg border border-slate-800">ESC</kbd>
            </div>

            {/* Results count */}
            <div className="px-5 py-2 border-b border-slate-800/50">
              <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">
                {query.trim() ? `${flatResults.length} result${flatResults.length !== 1 ? 's' : ''}` : 'Popular Features'}
              </p>
            </div>

            {/* Results list */}
            <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2" role="listbox">
              {flatResults.length === 0 && (
                <div className="px-5 py-12 text-center">
                  <p className="text-sm text-slate-400">No features found for &quot;{query}&quot;</p>
                  <p className="text-[10px] text-brand-muted mt-2">Try searching by category (Analytics, Trading, AI) or tier (Differentiated, Industry-First)</p>
                </div>
              )}

              {grouped.map(([tier, features]) => {
                const config = TIER_CONFIG[tier];
                return (
                  <div key={tier}>
                    <div className="flex items-center gap-2 px-5 pt-3 pb-1">
                      <span className={`text-[9px] font-black uppercase tracking-widest ${config.color}`}>
                        {config.label}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${config.bgColor} ${config.color} font-bold`}>
                        {features.length}
                      </span>
                    </div>
                    {features.map(feature => {
                      const globalIdx = flatResults.indexOf(feature);
                      const isSelected = globalIdx === selectedIndex;
                      return (
                        <button
                          key={feature.id}
                          data-feature-item
                          onClick={() => handleSelect(feature)}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          role="option"
                          aria-selected={isSelected}
                          className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors ${
                            isSelected
                              ? 'bg-brand-lime/10 text-brand-lime'
                              : 'text-slate-300 hover:bg-brand-charcoal/50'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium truncate">{feature.name}</p>
                              <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${config.bgColor} ${config.color} font-bold uppercase shrink-0`}>
                                {feature.category}
                              </span>
                            </div>
                            <p className="text-[10px] text-brand-muted truncate mt-0.5">{feature.description}</p>
                          </div>
                          {feature.path && (
                            <ArrowRight size={14} className={`flex-shrink-0 ${isSelected ? 'text-brand-lime' : 'text-slate-600'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 text-[9px] text-brand-muted">
              <div className="flex gap-3">
                <span><kbd className="font-mono bg-brand-charcoal px-1.5 py-0.5 rounded border border-slate-800">↑↓</kbd> navigate</span>
                <span><kbd className="font-mono bg-brand-charcoal px-1.5 py-0.5 rounded border border-slate-800">↵</kbd> go to feature</span>
              </div>
              <button
                onClick={() => { setIsOpen(false); navigate('/features'); }}
                className="text-brand-lime hover:underline font-bold uppercase tracking-wider"
              >
                View All {DISCOVERABLE_FEATURE_CATALOG.length} Features →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeatureSearch;
