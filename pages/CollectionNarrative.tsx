// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
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
  Sparkles,
  TrendingUp,
  Target,
  ArrowRight,
} from 'lucide-react';
import {
  generateNarrative,
  getMomentLinks,
  analyzeThemes,
  generateExhibitionSections,
  getLegacyMemos,
  saveLegacyMemo,
  exportNarrative,
  getCollectionSignificanceScore,
  getSuggestedAdditions,
  type MomentLink,
  type LegacyMemo,
  type NarrativeExport,
  type SuggestedAddition,
} from '../lib/core/collectionNarrativeService';

function significanceColor(score: number): string {
  if (score >= 80) return '#34d399';
  if (score >= 50) return '#facc15';
  return '#f87171';
}

function significanceBadge(sig: MomentLink['significance']) {
  const map = {
    iconic: { label: 'Iconic', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    major: { label: 'Major', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    notable: { label: 'Notable', cls: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  };
  const { label, cls } = map[sig];
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${cls}`}>{label}</span>;
}

function priorityBadge(priority: SuggestedAddition['priority']) {
  const map = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${map[priority]}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
    </span>
  );
}

const CollectionNarrative: React.FC = () => {
  const narrative = useMemo(() => generateNarrative([]), []);
  const momentLinks = useMemo(() => getMomentLinks([]), []);
  const themeAnalysis = useMemo(() => analyzeThemes([]), []);
  const exhibitionSections = useMemo(() => generateExhibitionSections([]), []);
  const significanceScore = useMemo(() => getCollectionSignificanceScore(), []);
  const suggestedAdditions = useMemo(() => getSuggestedAdditions([]), []);

  const [memos, setMemos] = useState<LegacyMemo[]>(() => getLegacyMemos());
  const [memoText, setMemoText] = useState('');
  const [memoCardId, setMemoCardId] = useState('card-1');
  const [memoCardLabel, setMemoCardLabel] = useState('1986 Fleer Michael Jordan #57 RC');
  const [exportResult, setExportResult] = useState<NarrativeExport | null>(null);
  const [activeSection, setActiveSection] = useState<string>('narrative');

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

  const sections = [
    { id: 'narrative', label: 'Narrative', icon: <BookOpen size={16} /> },
    { id: 'exhibition', label: 'Exhibition', icon: <Layers size={16} /> },
    { id: 'moments', label: 'Moment Links', icon: <Link2 size={16} /> },
    { id: 'themes', label: 'Themes', icon: <Sparkles size={16} /> },
    { id: 'legacy', label: 'Legacy Vault', icon: <Archive size={16} /> },
    { id: 'suggestions', label: 'Suggestions', icon: <Target size={16} /> },
    { id: 'export', label: 'Export', icon: <Share2 size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <BookOpen size={28} className="text-brand-lime" />
                <h1 className="text-3xl font-bold">Collection Narrative Engine</h1>
              </div>
              <p className="text-slate-400 text-sm max-w-2xl">
                AI-generated museum catalog that tells the story of your collection — themes, eras,
                player arcs, historical moments, and your personal collecting philosophy.
              </p>
            </div>

            {/* Significance Score */}
            <div className="text-center shrink-0 ml-8">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="8"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke={significanceColor(significanceScore)}
                    strokeWidth="8"
                    strokeDasharray={`${(significanceScore / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: significanceColor(significanceScore) }}
                  >
                    {significanceScore}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">Historical Significance</p>
            </div>
          </div>

          {/* Section Nav */}
          <div className="flex gap-2 mt-8 overflow-x-auto pb-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  activeSection === s.id
                    ? 'bg-brand-lime text-black'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Narrative Section */}
        {activeSection === 'narrative' && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-3">{narrative.heritageStory.title}</h2>
              <p className="text-slate-400 italic text-lg">{narrative.heritageStory.subtitle}</p>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-8 border-l-4 border-brand-lime">
              <p className="text-slate-200 leading-relaxed">
                {narrative.heritageStory.openingParagraph}
              </p>
            </div>

            {narrative.heritageStory.chapters.map((chapter, idx) => (
              <div key={idx} className="space-y-4">
                <h3 className="text-xl font-semibold text-white">{chapter.heading}</h3>
                <p className="text-slate-300 leading-relaxed">{chapter.body}</p>
                <div className="flex gap-2 flex-wrap">
                  {chapter.cardIds.map((id) => {
                    const link = momentLinks.find((ml) => ml.cardId === id);
                    return (
                      <span
                        key={id}
                        className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700"
                      >
                        {link?.cardLabel ?? id}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="bg-slate-900/80 rounded-2xl p-8 border border-slate-700 mt-12">
              <p className="text-slate-200 italic leading-relaxed text-center">
                &ldquo;{narrative.heritageStory.closingReflection}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* Exhibition Sections */}
        {activeSection === 'exhibition' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Exhibition Sections</h2>
              <p className="text-slate-400 text-sm">
                Your collection organized as a museum exhibition with curatorial commentary.
              </p>
            </div>

            {exhibitionSections.map((section) => (
              <div
                key={section.id}
                className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800"
              >
                <div
                  className="p-6 border-l-4"
                  style={{ borderLeftColor: section.accentColor }}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: section.accentColor + '20',
                        color: section.accentColor,
                      }}
                    >
                      Section {section.order}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{section.title}</h3>
                  <p className="text-sm text-slate-400 mb-4">{section.subtitle}</p>
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    {section.curatorialNote}
                  </p>

                  <div className="flex gap-2 flex-wrap mt-4">
                    {section.cardIds.map((id) => {
                      const link = momentLinks.find((ml) => ml.cardId === id);
                      return (
                        <span
                          key={id}
                          className="text-xs px-3 py-1.5 rounded-full border"
                          style={{
                            borderColor: section.accentColor + '40',
                            color: section.accentColor,
                            backgroundColor: section.accentColor + '10',
                          }}
                        >
                          {link?.cardLabel ?? id}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Moment Links Timeline */}
        {activeSection === 'moments' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Moment Links Timeline</h2>
              <p className="text-slate-400 text-sm">
                Every card connected to the defining sports moment it represents.
              </p>
            </div>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-700" />

              {momentLinks
                .sort((a, b) => a.year - b.year)
                .map((ml, _idx) => (
                  <div key={ml.cardId} className="relative pl-16 pb-8">
                    {/* Timeline Dot */}
                    <div
                      className={`absolute left-4 w-5 h-5 rounded-full border-2 ${
                        ml.significance === 'iconic'
                          ? 'bg-amber-500 border-amber-400'
                          : ml.significance === 'major'
                            ? 'bg-blue-500 border-blue-400'
                            : 'bg-slate-500 border-slate-400'
                      }`}
                      style={{ top: '6px' }}
                    />

                    {/* Year Label */}
                    <div className="absolute left-[-2px] top-1 text-xs font-bold text-slate-500">
                      {ml.year}
                    </div>

                    <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 hover:border-slate-600 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-sm font-semibold text-white">{ml.cardLabel}</h4>
                        {significanceBadge(ml.significance)}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={12} className="text-slate-500" />
                        <span className="text-xs text-slate-500">{ml.momentDate}</span>
                      </div>
                      <h5 className="text-brand-lime font-medium text-sm mb-2">
                        {ml.momentTitle}
                      </h5>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {ml.momentDescription}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Theme Analysis Dashboard */}
        {activeSection === 'themes' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Theme Analysis Dashboard</h2>
              <p className="text-slate-400 text-sm">
                AI-identified patterns and unconscious collecting tendencies.
              </p>
            </div>

            {/* Persona Card */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-brand-lime/20 flex items-center justify-center">
                  <Star size={24} className="text-brand-lime" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">
                    Your Collector Persona
                  </p>
                  <h3 className="text-xl font-bold text-brand-lime">
                    {themeAnalysis.collectorPersona}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {themeAnalysis.narrativeSummary}
              </p>
            </div>

            {/* Theme Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {themeAnalysis.themes.map((theme) => (
                <div
                  key={theme.id}
                  className="bg-slate-900 rounded-xl p-6 border border-slate-800"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-white">{theme.label}</h4>
                    <span className="text-lg font-bold text-brand-lime">{theme.percentage}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full rounded-full bg-brand-lime transition-all duration-500"
                      style={{ width: `${theme.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">{theme.insight}</p>
                  <p className="text-xs text-slate-500">
                    {theme.matchingCardIds.length} cards matching
                  </p>
                </div>
              ))}
            </div>

            {/* Unconscious Patterns */}
            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-brand-lime" />
                Unconscious Patterns
              </h3>
              <div className="space-y-3">
                {themeAnalysis.unconsciousPatterns.map((pattern, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-brand-lime/10 flex items-center justify-center shrink-0">
                      <span className="text-sm text-brand-lime font-bold">{idx + 1}</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{pattern}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Legacy Vault */}
        {activeSection === 'legacy' && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Legacy Vault</h2>
              <p className="text-slate-400 text-sm">
                Record why each card matters. Build a personal archive for future generations.
              </p>
            </div>

            {/* Add Memo */}
            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Plus size={18} className="text-brand-lime" />
                Add Legacy Memo
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={memoCardId}
                    onChange={(e) => setMemoCardId(e.target.value)}
                    placeholder="Card ID"
                    className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime"
                  />
                  <input
                    type="text"
                    value={memoCardLabel}
                    onChange={(e) => setMemoCardLabel(e.target.value)}
                    placeholder="Card label"
                    className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime"
                  />
                </div>
                <textarea
                  value={memoText}
                  onChange={(e) => setMemoText(e.target.value)}
                  placeholder="Why does this card matter to you? Tell its story..."
                  rows={4}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-lime resize-none"
                />
                <button
                  onClick={handleSaveMemo}
                  disabled={!memoText.trim()}
                  className="bg-brand-lime text-black font-semibold text-sm px-6 py-3 rounded-xl hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save Memo
                </button>
              </div>
            </div>

            {/* Memos */}
            <div className="space-y-4">
              {memos.map((memo) => (
                <div
                  key={memo.id}
                  className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-brand-lime" />
                      <span className="text-sm font-semibold text-white">{memo.cardLabel}</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {new Date(memo.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    &ldquo;{memo.text}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Additions */}
        {activeSection === 'suggestions' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Suggested Additions</h2>
              <p className="text-slate-400 text-sm">
                Cards that would strengthen your collection&apos;s narrative themes.
              </p>
            </div>

            <div className="space-y-4">
              {suggestedAdditions.map((sa, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-base font-semibold text-white">{sa.player}</h4>
                      <p className="text-sm text-slate-400">{sa.cardDescription}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {priorityBadge(sa.priority)}
                      <span className="text-sm font-bold text-emerald-400">
                        ~${sa.estimatedValue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed mb-3">{sa.reason}</p>
                  <div className="flex items-center gap-2">
                    <ArrowRight size={12} className="text-brand-lime" />
                    <span className="text-xs text-brand-lime">
                      Strengthens: {sa.themeStrengthened}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export Tools */}
        {activeSection === 'export' && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Export & Share</h2>
              <p className="text-slate-400 text-sm">
                Share your collection&apos;s story in multiple formats.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                onClick={() => handleExport('pdf')}
                className="bg-slate-900 rounded-2xl p-8 border border-slate-800 hover:border-brand-lime transition-colors text-left group"
              >
                <FileText
                  size={40}
                  className="text-red-400 mb-4 group-hover:text-brand-lime transition-colors"
                />
                <h4 className="text-base font-semibold text-white mb-2">PDF Catalog</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Museum-quality 12-page catalog with curatorial notes, moment links, and full
                  narrative.
                </p>
              </button>

              <button
                onClick={() => handleExport('social')}
                className="bg-slate-900 rounded-2xl p-8 border border-slate-800 hover:border-brand-lime transition-colors text-left group"
              >
                <Image
                  size={40}
                  className="text-purple-400 mb-4 group-hover:text-brand-lime transition-colors"
                />
                <h4 className="text-base font-semibold text-white mb-2">Social Carousel</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  10-slide Instagram carousel featuring your top cards, moment links, and collection
                  themes.
                </p>
              </button>

              <button
                onClick={() => handleExport('web')}
                className="bg-slate-900 rounded-2xl p-8 border border-slate-800 hover:border-brand-lime transition-colors text-left group"
              >
                <Globe
                  size={40}
                  className="text-cyan-400 mb-4 group-hover:text-brand-lime transition-colors"
                />
                <h4 className="text-base font-semibold text-white mb-2">Web Showcase</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Embeddable web page with interactive exhibition sections and shareable link.
                </p>
              </button>
            </div>

            {exportResult && (
              <div className="bg-slate-900 rounded-2xl p-8 border border-brand-lime/30">
                <div className="flex items-center gap-3 mb-4">
                  <Download size={20} className="text-brand-lime" />
                  <span className="text-lg font-semibold text-white">Export Ready</span>
                </div>
                <p className="text-sm text-slate-300 mb-4">
                  Your {exportResult.format.toUpperCase()} export has been generated successfully.
                </p>
                <a
                  href={exportResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-brand-lime text-black font-semibold text-sm px-6 py-3 rounded-xl hover:brightness-110 transition-all"
                >
                  <Download size={16} />
                  Download {exportResult.format.toUpperCase()}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionNarrative;
