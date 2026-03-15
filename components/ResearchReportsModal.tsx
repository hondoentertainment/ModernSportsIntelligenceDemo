import React, { useState, useMemo, useCallback } from 'react';
import {
  X,
  FileText,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Star,
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Bookmark,
  AlertTriangle,
  Target,
  Zap,
  Filter,
  Users,
  Award,
} from 'lucide-react';
import {
  getRecentReports,
  getReportById,
  getPlayerResearchNotes,
  getContrarianPicks,
  getResearchStats,
  searchReports,
  toggleBookmark,
  isReportRead,
  ResearchReport,
  ReportType,
  PlayerResearchNote,
  ContrarianPick,
  PlayerRating,
  ReportSection,
} from '../lib/researchReportsService';

interface ResearchReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = 'latest' | 'player_notes' | 'contrarian' | 'archive';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: 'latest', label: 'Latest Research', icon: <FileText size={16} /> },
  { key: 'player_notes', label: 'Player Notes', icon: <Users size={16} /> },
  { key: 'contrarian', label: 'Contrarian Picks', icon: <TrendingUp size={16} /> },
  { key: 'archive', label: 'Archive', icon: <BookOpen size={16} /> },
];

const typeBadge: Record<ReportType, { label: string; color: string; bg: string; border: string }> = {
  weekly_market: { label: 'Weekly Market', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  player_analysis: { label: 'Player Analysis', color: 'text-lime-400', bg: 'bg-lime-500/10', border: 'border-lime-500/30' },
  sector_deep_dive: { label: 'Sector Deep Dive', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  event_preview: { label: 'Event Preview', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  contrarian_report: { label: 'Contrarian', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  special_report: { label: 'Special Report', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
};

const ratingColors: Record<PlayerRating, { text: string; bg: string; border: string }> = {
  'Strong Buy': { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  Buy: { text: 'text-lime-400', bg: 'bg-lime-500/10', border: 'border-lime-500/30' },
  Hold: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  Sell: { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  'Strong Sell': { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// ---- Sub-components ----

const ReportCard: React.FC<{
  report: ResearchReport;
  onClick: () => void;
  compact?: boolean;
}> = ({ report, onClick, compact }) => {
  const badge = typeBadge[report.type];
  const read = isReportRead(report.id);

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:border-lime-500/30 hover:bg-slate-700/30 ${
        read ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-800 border-slate-600'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className={`px-2 py-0.5 ${badge.bg} ${badge.color} border ${badge.border} text-[10px] font-medium rounded`}
            >
              {badge.label}
            </span>
            {!read && (
              <span className="px-1.5 py-0.5 bg-lime-500 text-slate-900 text-[10px] font-bold rounded">
                NEW
              </span>
            )}
            {report.bookmarked && <Star size={12} className="text-amber-400 fill-amber-400" />}
          </div>
          <h4 className="text-sm font-medium text-white mb-1 leading-snug">{report.title}</h4>
          {!compact && (
            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-2">
              {report.summary}
            </p>
          )}
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            <span>{report.author}</span>
            <span className="flex items-center gap-1">
              <Clock size={10} /> {formatShortDate(report.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen size={10} /> {report.readTime} min
            </span>
            <span className="flex items-center gap-1">
              <Eye size={10} /> {report.views.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportViewer: React.FC<{
  report: ResearchReport;
  onBack: () => void;
}> = ({ report, onBack }) => {
  const badge = typeBadge[report.type];
  const [bookmarked, setBookmarked] = useState(report.bookmarked);

  const handleBookmark = () => {
    const result = toggleBookmark(report.id);
    setBookmarked(result);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Reader Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-700">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={14} /> Back to list
        </button>
        <button
          onClick={handleBookmark}
          className={`flex items-center gap-1 text-xs transition-colors ${
            bookmarked ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'
          }`}
        >
          <Bookmark size={14} className={bookmarked ? 'fill-amber-400' : ''} />
          {bookmarked ? 'Bookmarked' : 'Bookmark'}
        </button>
      </div>

      {/* Reader Content */}
      <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-2 custom-scrollbar">
        {/* Title Block */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-0.5 ${badge.bg} ${badge.color} border ${badge.border} text-[10px] font-medium rounded`}
            >
              {badge.label}
            </span>
            {report.sport && (
              <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-[10px] font-medium rounded">
                {report.sport}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-white mb-2 leading-tight">{report.title}</h2>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="text-slate-300 font-medium">{report.author}</span>
            <span>{formatDate(report.publishedAt)}</span>
            <span className="flex items-center gap-1">
              <Clock size={12} /> {report.readTime} min read
            </span>
            <span className="flex items-center gap-1">
              <Eye size={12} /> {report.views.toLocaleString()} views
            </span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
          <h3 className="text-xs font-semibold text-lime-400 uppercase tracking-wider mb-2">
            Executive Summary
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">{report.summary}</p>
        </div>

        {/* Sections */}
        {report.sections.map((section, idx) => (
          <SectionBlock key={idx} section={section} index={idx} />
        ))}

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-slate-700">
          {report.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-slate-700/50 text-slate-400 text-[10px] rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const SectionBlock: React.FC<{ section: ReportSection; index: number }> = ({ section, index }) => {
  return (
    <div>
      <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-lime-500/10 text-lime-400 text-xs font-bold flex items-center justify-center">
          {index + 1}
        </span>
        {section.title}
      </h3>

      {/* Content paragraphs */}
      <div className="space-y-3 mb-4">
        {section.content.split('\n\n').map((paragraph, pIdx) => (
          <p key={pIdx} className="text-sm text-slate-300 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      {/* Data Points */}
      {section.dataPoints && section.dataPoints.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          {section.dataPoints.map((dp, dpIdx) => (
            <div
              key={dpIdx}
              className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-center"
            >
              <div className="text-[10px] text-slate-500 mb-1">{dp.label}</div>
              <div className="text-sm font-semibold text-white">{dp.value}</div>
              {dp.change && (
                <div
                  className={`text-[10px] font-medium mt-0.5 ${
                    dp.change.startsWith('+')
                      ? 'text-emerald-400'
                      : dp.change.startsWith('-')
                      ? 'text-red-400'
                      : 'text-slate-400'
                  }`}
                >
                  {dp.change}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PlayerNoteCard: React.FC<{ note: PlayerResearchNote }> = ({ note }) => {
  const colors = ratingColors[note.rating];
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold text-white">{note.player}</h4>
              <span
                className={`px-2 py-0.5 ${colors.bg} ${colors.text} border ${colors.border} text-[10px] font-bold rounded`}
              >
                {note.rating}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <span>{note.team}</span>
              <span className="text-slate-600">|</span>
              <span>{note.sport}</span>
              <span className="text-slate-600">|</span>
              <span>Updated {formatShortDate(note.lastUpdated)}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white">${note.priceTarget.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">Price Target</div>
          </div>
        </div>

        {/* Price Bar */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex-1">
            <div className="flex items-center justify-between text-[10px] mb-1">
              <span className="text-slate-500">Current: ${note.currentPrice.toLocaleString()}</span>
              <span className={`${colors.text} font-medium`}>+{note.upside}% Upside</span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((note.currentPrice / note.priceTarget) * 100, 100)}%`,
                  backgroundColor:
                    note.rating === 'Strong Buy'
                      ? '#34d399'
                      : note.rating === 'Buy'
                      ? '#a3e635'
                      : note.rating === 'Hold'
                      ? '#fbbf24'
                      : note.rating === 'Sell'
                      ? '#fb923c'
                      : '#f87171',
                }}
              />
            </div>
          </div>
          <ChevronRight
            size={16}
            className={`text-slate-500 transition-transform ${expanded ? 'rotate-90' : ''}`}
          />
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-700">
          {/* Thesis */}
          <div className="pt-3">
            <h5 className="text-xs font-semibold text-lime-400 uppercase tracking-wider mb-2">
              Investment Thesis
            </h5>
            <p className="text-xs text-slate-300 leading-relaxed">{note.thesis}</p>
          </div>

          {/* Catalysts & Risks */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Zap size={12} /> Catalysts
              </h5>
              <ul className="space-y-1">
                {note.catalysts.map((c, i) => (
                  <li key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-1">+</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <AlertTriangle size={12} /> Key Risks
              </h5>
              <ul className="space-y-1">
                {note.keyRisks.map((r, i) => (
                  <li key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                    <span className="text-red-500 mt-1">-</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Comparables */}
          <div>
            <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Comparable Players
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {note.comparables.map((comp, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-slate-700/50 border border-slate-600/50 text-[10px] text-slate-300 rounded"
                >
                  {comp}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ContrarianPickCard: React.FC<{ pick: ContrarianPick; rank: number }> = ({ pick, rank }) => {
  const sentimentColor =
    pick.marketSentiment === 'very_bearish'
      ? { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' }
      : { text: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };

  const scoreColor =
    pick.fundamentalScore >= 80
      ? 'text-emerald-400'
      : pick.fundamentalScore >= 70
      ? 'text-lime-400'
      : 'text-amber-400';

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 text-sm font-bold flex-shrink-0">
          {rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-semibold text-white">{pick.player}</h4>
            <div className="text-right">
              <div className="text-sm font-bold text-white">${pick.currentPrice}</div>
              <div className="text-[10px] text-red-400">-{pick.declinePercent}% from peak</div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mb-2">{pick.cardDescription}</p>

          {/* Scores Row */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1">
              <Target size={12} className={scoreColor} />
              <span className={`text-[10px] font-medium ${scoreColor}`}>
                Fund. Score: {pick.fundamentalScore}
              </span>
            </div>
            <span
              className={`px-1.5 py-0.5 ${sentimentColor.bg} ${sentimentColor.text} border ${sentimentColor.border} text-[10px] font-medium rounded`}
            >
              {pick.marketSentiment === 'very_bearish' ? 'Very Bearish' : 'Bearish'}
            </span>
            <span className="text-[10px] text-slate-500">
              R/R: <span className="text-lime-400 font-medium">{pick.riskReward}</span>
            </span>
          </div>

          {/* Thesis */}
          <p className="text-xs text-slate-400 leading-relaxed mb-2">{pick.contraryThesis}</p>

          {/* Footer */}
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <Clock size={10} /> {pick.timeframe}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ---- Main Modal ----

export const ResearchReportsModal: React.FC<ResearchReportsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('latest');
  const [selectedReport, setSelectedReport] = useState<ResearchReport | null>(null);
  const [archiveQuery, setArchiveQuery] = useState('');
  const [archiveTypeFilter, setArchiveTypeFilter] = useState<ReportType | 'all'>('all');

  const reports = useMemo(() => getRecentReports(), []);
  const playerNotes = useMemo(() => getPlayerResearchNotes(), []);
  const contrarianPicks = useMemo(() => getContrarianPicks(), []);
  const stats = useMemo(() => getResearchStats(), []);

  const archiveResults = useMemo(() => {
    let results = archiveQuery ? searchReports(archiveQuery) : getRecentReports();
    if (archiveTypeFilter !== 'all') {
      results = results.filter((r) => r.type === archiveTypeFilter);
    }
    return results;
  }, [archiveQuery, archiveTypeFilter]);

  const handleReportClick = useCallback((report: ResearchReport) => {
    const full = getReportById(report.id);
    if (full) setSelectedReport(full);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedReport(null);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-5xl h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-lime-500/10 rounded-xl">
              <FileText size={22} className="text-lime-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">MSI Research</h2>
              <p className="text-xs text-slate-500">
                AI-Powered Institutional Research — Bloomberg Intelligence for Cards
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Summary Stats Bar */}
        <div className="flex items-center gap-6 px-6 py-3 border-b border-slate-800 bg-slate-800/50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-slate-500" />
            <span className="text-xs text-slate-400">
              <span className="text-white font-medium">{stats.thisWeek}</span> reports this week
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} className="text-slate-500" />
            <span className="text-xs text-slate-400">
              <span className="text-white font-medium">{stats.playersCovered}</span> players covered
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Award size={14} className="text-emerald-500" />
            <span className="text-xs text-slate-400">
              Top call: <span className="text-emerald-400 font-medium">{stats.topPerformingCall}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-orange-400" />
            <span className="text-xs text-slate-400">
              <span className="text-orange-400 font-medium">{contrarianPicks.length}</span> contrarian picks
            </span>
          </div>
        </div>

        {/* Tabs */}
        {!selectedReport && (
          <div className="flex items-center gap-1 px-6 py-2 border-b border-slate-800 flex-shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-lime-500/10 text-lime-400 border border-lime-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {selectedReport ? (
            <ReportViewer report={selectedReport} onBack={handleBack} />
          ) : activeTab === 'latest' ? (
            <LatestResearchTab reports={reports} onReportClick={handleReportClick} />
          ) : activeTab === 'player_notes' ? (
            <PlayerNotesTab notes={playerNotes} />
          ) : activeTab === 'contrarian' ? (
            <ContrarianTab picks={contrarianPicks} />
          ) : (
            <ArchiveTab
              results={archiveResults}
              query={archiveQuery}
              onQueryChange={setArchiveQuery}
              typeFilter={archiveTypeFilter}
              onTypeFilterChange={setArchiveTypeFilter}
              onReportClick={handleReportClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ---- Tab Components ----

const LatestResearchTab: React.FC<{
  reports: ResearchReport[];
  onReportClick: (_report: ResearchReport) => void;
}> = ({ reports, onReportClick }) => (
  <div className="space-y-3">
    {reports.map((report) => (
      <ReportCard key={report.id} report={report} onClick={() => onReportClick(report)} />
    ))}
  </div>
);

const PlayerNotesTab: React.FC<{ notes: PlayerResearchNote[] }> = ({ notes }) => {
  // Sort by rating priority
  const ratingOrder: Record<PlayerRating, number> = {
    'Strong Buy': 0,
    Buy: 1,
    Hold: 2,
    Sell: 3,
    'Strong Sell': 4,
  };
  const sorted = [...notes].sort((a, b) => ratingOrder[a.rating] - ratingOrder[b.rating]);

  return (
    <div className="space-y-3">
      {/* Rating Legend */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Ratings:</span>
        {(['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell'] as PlayerRating[]).map((rating) => {
          const colors = ratingColors[rating];
          return (
            <span
              key={rating}
              className={`px-1.5 py-0.5 ${colors.bg} ${colors.text} border ${colors.border} text-[10px] font-medium rounded`}
            >
              {rating}
            </span>
          );
        })}
      </div>

      {sorted.map((note) => (
        <PlayerNoteCard key={note.player} note={note} />
      ))}
    </div>
  );
};

const ContrarianTab: React.FC<{ picks: ContrarianPick[] }> = ({ picks }) => (
  <div className="space-y-4">
    {/* Header Card */}
    <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <TrendingDown size={16} className="text-orange-400" />
        <h3 className="text-sm font-semibold text-orange-400">Contrarian Corner</h3>
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">
        Cards where market sentiment has diverged significantly from our fundamental models. These
        picks have returned <span className="text-lime-400 font-medium">+34% annualized</span>{' '}
        since inception versus +18% for the broader market. Hit rate:{' '}
        <span className="text-lime-400 font-medium">68%</span>.
      </p>
    </div>

    {picks.map((pick, idx) => (
      <ContrarianPickCard key={pick.player} pick={pick} rank={idx + 1} />
    ))}
  </div>
);

const ArchiveTab: React.FC<{
  results: ResearchReport[];
  query: string;
  onQueryChange: (_q: string) => void;
  typeFilter: ReportType | 'all';
  onTypeFilterChange: (_t: ReportType | 'all') => void;
  onReportClick: (_report: ResearchReport) => void;
}> = ({ results, query, onQueryChange, typeFilter, onTypeFilterChange, onReportClick }) => (
  <div className="space-y-4">
    {/* Search & Filters */}
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search reports by title, content, or tag..."
          className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-500/50"
        />
      </div>
      <div className="flex items-center gap-1">
        <Filter size={14} className="text-slate-500" />
        <select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value as ReportType | 'all')}
          className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-lime-500/50"
        >
          <option value="all">All Types</option>
          <option value="weekly_market">Weekly Market</option>
          <option value="player_analysis">Player Analysis</option>
          <option value="sector_deep_dive">Sector Deep Dive</option>
          <option value="event_preview">Event Preview</option>
          <option value="contrarian_report">Contrarian</option>
          <option value="special_report">Special Report</option>
        </select>
      </div>
    </div>

    {/* Results */}
    <div className="space-y-3">
      {results.length === 0 ? (
        <div className="text-center py-12">
          <Search size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No reports found matching your search.</p>
        </div>
      ) : (
        results.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onClick={() => onReportClick(report)}
            compact
          />
        ))
      )}
    </div>
  </div>
);

export default ResearchReportsModal;
