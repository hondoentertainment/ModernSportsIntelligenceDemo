// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  X,
  BookOpen,
  Link2,
  Layers,
  Archive,
  Share2,
  Star,
  Calendar,
  MessageSquare,
  Plus,
  FileText,
  Globe,
  Image,
  Download,
} from 'lucide-react';
import {
  generateNarrative,
  getMomentLinks,
  analyzeThemes,
  getLegacyMemos,
  saveLegacyMemo,
  exportNarrative,
  type MomentLink,
  type CollectionTheme,
  type LegacyMemo,
  type NarrativeExport,
} from '../lib/core/collectionNarrativeService';

interface CollectionNarrativeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'heritage' | 'moments' | 'themes' | 'legacy' | 'export';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'heritage', label: 'Heritage Story', icon: <BookOpen size={16} /> },
  { id: 'moments', label: 'Moment Links', icon: <Link2 size={16} /> },
  { id: 'themes', label: 'Themes', icon: <Layers size={16} /> },
  { id: 'legacy', label: 'Legacy Vault', icon: <Archive size={16} /> },
  { id: 'export', label: 'Export', icon: <Share2 size={16} /> },
];

function significanceBadge(sig: MomentLink['significance']) {
  const map = {
    iconic: { label: 'Iconic', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    major: { label: 'Major', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    notable: { label: 'Notable', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  };
  const { label, color } = map[sig];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${color}`}>{label}</span>
  );
}

const CollectionNarrativeModal: React.FC<CollectionNarrativeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('heritage');
  const [memoText, setMemoText] = useState('');
  const [memoCardId, setMemoCardId] = useState('card-1');
  const [memoCardLabel, setMemoCardLabel] = useState('1986 Fleer Michael Jordan #57 RC');
  const [exportResult, setExportResult] = useState<NarrativeExport | null>(null);

  const narrative = useMemo(() => generateNarrative([]), []);
  const momentLinks = useMemo(() => getMomentLinks([]), []);
  const themeAnalysis = useMemo(() => analyzeThemes([]), []);
  const [memos, setMemos] = useState<LegacyMemo[]>(() => getLegacyMemos());

  const handleSaveMemo = () => {
    if (!memoText.trim()) return;
    const newMemo = saveLegacyMemo(memoCardId, {
      cardId: memoCardId,
      cardLabel: memoCardLabel,
      text: memoText,
      type: 'text',
    });
    setMemos((prev) => [...prev, newMemo]);
    setMemoText('');
  };

  const handleExport = (format: 'pdf' | 'social' | 'web') => {
    const result = exportNarrative(format);
    setExportResult(result);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <BookOpen size={24} className="text-brand-lime" />
            <div>
              <h2 className="text-lg font-bold text-white">Collection Narrative Engine</h2>
              <p className="text-xs text-slate-400">AI-generated museum catalog of your collection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-700 shrink-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-brand-lime border-b-2 border-brand-lime'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Heritage Story Tab */}
          {activeTab === 'heritage' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {narrative.heritageStory.title}
                </h3>
                <p className="text-slate-400 italic">{narrative.heritageStory.subtitle}</p>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-6 border-l-4 border-brand-lime">
                <p className="text-slate-200 leading-relaxed text-sm">
                  {narrative.heritageStory.openingParagraph}
                </p>
              </div>

              {narrative.heritageStory.chapters.map((chapter, idx) => (
                <div key={idx} className="space-y-3">
                  <h4 className="text-lg font-semibold text-white">{chapter.heading}</h4>
                  <p className="text-slate-300 leading-relaxed text-sm">{chapter.body}</p>
                  <div className="flex gap-2 flex-wrap">
                    {chapter.cardIds.map((id) => {
                      const link = momentLinks.find((ml) => ml.cardId === id);
                      return (
                        <span
                          key={id}
                          className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full"
                        >
                          {link?.cardLabel ?? id}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700 mt-8">
                <p className="text-slate-200 italic leading-relaxed text-sm">
                  &ldquo;{narrative.heritageStory.closingReflection}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* Moment Links Tab */}
          {activeTab === 'moments' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400 mb-4">
                Each card in your collection is connected to a specific sports moment that defined its legacy.
              </p>
              {momentLinks.map((ml) => (
                <div
                  key={ml.cardId}
                  className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{ml.cardLabel}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar size={12} className="text-slate-500" />
                        <span className="text-xs text-slate-500">{ml.momentDate}</span>
                      </div>
                    </div>
                    {significanceBadge(ml.significance)}
                  </div>
                  <h5 className="text-brand-lime font-medium text-sm mb-2">{ml.momentTitle}</h5>
                  <p className="text-xs text-slate-300 leading-relaxed">{ml.momentDescription}</p>
                </div>
              ))}
            </div>
          )}

          {/* Themes Tab */}
          {activeTab === 'themes' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Star size={16} className="text-amber-400" />
                  <span className="text-sm font-medium text-white">
                    Collector Persona: {themeAnalysis.collectorPersona}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {themeAnalysis.narrativeSummary}
                </p>
              </div>

              {/* Theme Bars */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-white">Collection Themes</h4>
                {themeAnalysis.themes.map((theme: CollectionTheme) => (
                  <div key={theme.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white font-medium">{theme.label}</span>
                      <span className="text-xs text-slate-400">{theme.percentage}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-brand-lime transition-all duration-500"
                        style={{ width: `${theme.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{theme.insight}</p>
                  </div>
                ))}
              </div>

              {/* Unconscious Patterns */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-white mb-3">Unconscious Patterns</h4>
                <div className="space-y-2">
                  {themeAnalysis.unconsciousPatterns.map((pattern, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 bg-slate-800/30 rounded-lg p-3"
                    >
                      <div className="w-5 h-5 rounded-full bg-brand-lime/20 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs text-brand-lime font-bold">{idx + 1}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{pattern}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Legacy Vault Tab */}
          {activeTab === 'legacy' && (
            <div className="space-y-6">
              <p className="text-sm text-slate-400">
                Record why each card matters to you. Build a personal legacy vault for future generations.
              </p>

              {/* Add Memo Form */}
              <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Plus size={14} className="text-brand-lime" />
                  Add Legacy Memo
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={memoCardId}
                      onChange={(e) => setMemoCardId(e.target.value)}
                      placeholder="Card ID"
                      className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime"
                    />
                    <input
                      type="text"
                      value={memoCardLabel}
                      onChange={(e) => setMemoCardLabel(e.target.value)}
                      placeholder="Card label"
                      className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime"
                    />
                  </div>
                  <textarea
                    value={memoText}
                    onChange={(e) => setMemoText(e.target.value)}
                    placeholder="Why does this card matter to you? Tell its story..."
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime resize-none"
                  />
                  <button
                    onClick={handleSaveMemo}
                    disabled={!memoText.trim()}
                    className="bg-brand-lime text-black font-semibold text-sm px-4 py-2 rounded-lg hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Save Memo
                  </button>
                </div>
              </div>

              {/* Memos List */}
              <div className="space-y-3">
                {memos.map((memo) => (
                  <div
                    key={memo.id}
                    className="bg-slate-800/30 rounded-xl p-4 border border-slate-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={14} className="text-brand-lime" />
                        <span className="text-sm font-medium text-white">{memo.cardLabel}</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(memo.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      &ldquo;{memo.text}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <p className="text-sm text-slate-400">
                Share your collection&apos;s story in multiple formats.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleExport('pdf')}
                  className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-brand-lime transition-colors text-left group"
                >
                  <FileText
                    size={32}
                    className="text-red-400 mb-3 group-hover:text-brand-lime transition-colors"
                  />
                  <h4 className="text-sm font-semibold text-white mb-1">PDF Catalog</h4>
                  <p className="text-xs text-slate-400">
                    Museum-quality 12-page catalog with curatorial notes and full narrative.
                  </p>
                </button>

                <button
                  onClick={() => handleExport('social')}
                  className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-brand-lime transition-colors text-left group"
                >
                  <Image
                    size={32}
                    className="text-purple-400 mb-3 group-hover:text-brand-lime transition-colors"
                  />
                  <h4 className="text-sm font-semibold text-white mb-1">Social Carousel</h4>
                  <p className="text-xs text-slate-400">
                    10-slide Instagram carousel featuring top cards and moment links.
                  </p>
                </button>

                <button
                  onClick={() => handleExport('web')}
                  className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-brand-lime transition-colors text-left group"
                >
                  <Globe
                    size={32}
                    className="text-cyan-400 mb-3 group-hover:text-brand-lime transition-colors"
                  />
                  <h4 className="text-sm font-semibold text-white mb-1">Web Showcase</h4>
                  <p className="text-xs text-slate-400">
                    Embeddable web page with interactive exhibition sections.
                  </p>
                </button>
              </div>

              {exportResult && (
                <div className="bg-slate-800/50 rounded-xl p-5 border border-brand-lime/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Download size={16} className="text-brand-lime" />
                    <span className="text-sm font-semibold text-white">Export Ready</span>
                  </div>
                  <p className="text-xs text-slate-300 mb-3">
                    Your {exportResult.format.toUpperCase()} export has been generated.
                  </p>
                  <a
                    href={exportResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-brand-lime text-black font-semibold text-xs px-4 py-2 rounded-lg hover:brightness-110 transition-all"
                  >
                    <Download size={14} />
                    Download {exportResult.format.toUpperCase()}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionNarrativeModal;
