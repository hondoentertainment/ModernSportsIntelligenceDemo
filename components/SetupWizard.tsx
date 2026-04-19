import React, { useState, useCallback, useEffect } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Upload,
  DollarSign,
  Trophy,
  CheckCircle2,
  Play,
  SkipForward,
  Plus,
  FileSpreadsheet,
  Database,
  CircleDot,
} from 'lucide-react';
import { store } from '../lib/dal/syncStore';

// ─── Storage Keys ──────────────────────────────────────────────────────────
const WIZARD_COMPLETE_KEY = 'msi_setup_wizard_complete';
const SETUP_CARDS_KEY = 'msi_setup_cards';
const SETUP_BUDGET_KEY = 'msi_setup_budget';
const SETUP_SPORTS_KEY = 'msi_setup_sports';

// ─── Types ─────────────────────────────────────────────────────────────────
interface SetupWizardProps {
  isOpen: boolean;
  onComplete: () => void;
}

interface CardEntry {
  player: string;
  year: string;
  sport: string;
  value: string;
}

interface BudgetConfig {
  amount: number;
  period: 'monthly' | 'yearly';
  allocations: Record<string, number>;
}

interface SportOption {
  id: string;
  label: string;
  icon: string;
  color: string;
}

const SPORTS: SportOption[] = [
  { id: 'baseball', label: 'Baseball', icon: '\u26BE', color: 'text-red-400' },
  { id: 'basketball', label: 'Basketball', icon: '\uD83C\uDFC0', color: 'text-orange-400' },
  { id: 'football', label: 'Football', icon: '\uD83C\uDFC8', color: 'text-amber-400' },
  { id: 'hockey', label: 'Hockey', icon: '\uD83C\uDFD2', color: 'text-cyan-400' },
  { id: 'soccer', label: 'Soccer', icon: '\u26BD', color: 'text-green-400' },
];

const STEP_LABELS = ['Welcome', 'Add Cards', 'Budget', 'Sports', 'All Set'];

// ─── Component ──────────────────────────────────────────────────────────────
const SetupWizard: React.FC<SetupWizardProps> = ({ isOpen, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [cardEntry, setCardEntry] = useState<CardEntry>({ player: '', year: '', sport: 'baseball', value: '' });
  const [addedCards, setAddedCards] = useState<CardEntry[]>([]);
  const [addMode, setAddMode] = useState<'manual' | 'csv' | null>(null);
  const [budget, setBudget] = useState<BudgetConfig>({
    amount: 500,
    period: 'monthly',
    allocations: { baseball: 30, basketball: 25, football: 25, hockey: 10, soccer: 10 },
  });
  const [selectedSports, setSelectedSports] = useState<string[]>(['baseball', 'basketball']);
  const [animateCheck, setAnimateCheck] = useState(false);

  // Hydrate saved state
  useEffect(() => {
    const savedCards = store.get<CardEntry[]>(SETUP_CARDS_KEY, []);
    if (savedCards.length > 0) setAddedCards(savedCards);
    const savedBudget = store.get<BudgetConfig | null>(SETUP_BUDGET_KEY, null);
    if (savedBudget) setBudget(savedBudget);
    const savedSports = store.get<string[]>(SETUP_SPORTS_KEY, []);
    if (savedSports.length > 0) setSelectedSports(savedSports);
  }, []);

  // Persist on change
  useEffect(() => { store.set(SETUP_CARDS_KEY, addedCards); }, [addedCards]);
  useEffect(() => { store.set(SETUP_BUDGET_KEY, budget); }, [budget]);
  useEffect(() => { store.set(SETUP_SPORTS_KEY, selectedSports); }, [selectedSports]);

  // Animate final step checkmark
  useEffect(() => {
    if (currentStep === 4) {
      const t = setTimeout(() => setAnimateCheck(true), 300);
      return () => clearTimeout(t);
    }
    setAnimateCheck(false);
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    store.set(WIZARD_COMPLETE_KEY, true);
    onComplete();
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    store.set(WIZARD_COMPLETE_KEY, true);
    onComplete();
  }, [onComplete]);

  const handleNext = useCallback(() => {
    if (currentStep < 4) {
      setCurrentStep((s) => s + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, handleComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const addCard = useCallback(() => {
    if (!cardEntry.player.trim()) return;
    setAddedCards((prev) => [...prev, { ...cardEntry }]);
    setCardEntry({ player: '', year: '', sport: 'baseball', value: '' });
  }, [cardEntry]);

  const loadDemoData = useCallback(() => {
    const demo: CardEntry[] = [
      { player: 'Mike Trout', year: '2011', sport: 'baseball', value: '450' },
      { player: 'Luka Doncic', year: '2018', sport: 'basketball', value: '320' },
      { player: 'Patrick Mahomes', year: '2017', sport: 'football', value: '275' },
      { player: 'Connor McDavid', year: '2015', sport: 'hockey', value: '180' },
      { player: 'Erling Haaland', year: '2020', sport: 'soccer', value: '95' },
    ];
    setAddedCards(demo);
  }, []);

  const toggleSport = useCallback((id: string) => {
    setSelectedSports((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }, []);

  const updateAllocation = useCallback((sportId: string, value: number) => {
    setBudget((prev) => ({
      ...prev,
      allocations: { ...prev.allocations, [sportId]: value },
    }));
  }, []);

  if (!isOpen) return null;

  // ─── Step Renderers ────────────────────────────────────────────────────

  const renderWelcome = () => (
    <div className="flex flex-col items-center text-center px-8 py-6">
      <div className="w-20 h-20 rounded-2xl bg-brand-lime/10 border border-brand-lime/30 flex items-center justify-center mb-6">
        <Sparkles size={36} className="text-brand-lime" />
      </div>
      <h2 className="font-bebas text-3xl text-white tracking-wide mb-3">
        Welcome to Modern Sports Intelligence
      </h2>
      <p className="text-slate-400 text-sm leading-relaxed max-w-md mb-6">
        The institutional-grade platform for sports card portfolio management.
        Track, analyze, and optimize your collection with AI-powered tools,
        Monte Carlo simulations, and real-time market data.
      </p>
      <div className="grid grid-cols-3 gap-4 w-full max-w-sm">
        {[
          { icon: <Trophy size={18} />, label: 'Portfolio Tracking' },
          { icon: <DollarSign size={18} />, label: 'Market Intelligence' },
          { icon: <Sparkles size={18} />, label: 'AI Analytics' },
        ].map((feat) => (
          <div key={feat.label} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-brand-charcoal border border-slate-800">
            <span className="text-brand-lime">{feat.icon}</span>
            <span className="text-[10px] text-slate-400 font-medium">{feat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAddCards = () => (
    <div className="px-8 py-4">
      <h2 className="font-bebas text-2xl text-white tracking-wide mb-1">Add Your First Cards</h2>
      <p className="text-slate-500 text-xs mb-5">Start building your portfolio. You can always add more later.</p>

      {/* Mode selector */}
      <div className="flex gap-3 mb-5">
        {[
          { mode: 'manual' as const, icon: <Plus size={16} />, label: 'Manual Entry' },
          { mode: 'csv' as const, icon: <FileSpreadsheet size={16} />, label: 'Import CSV' },
        ].map((opt) => (
          <button
            key={opt.mode}
            onClick={() => setAddMode(opt.mode)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
              addMode === opt.mode
                ? 'bg-brand-lime/10 border border-brand-lime/40 text-brand-lime'
                : 'bg-brand-charcoal border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {opt.icon}
            {opt.label}
          </button>
        ))}
      </div>

      {addMode === 'manual' && (
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Player name"
              value={cardEntry.player}
              onChange={(e) => setCardEntry((p) => ({ ...p, player: e.target.value }))}
              className="bg-brand-charcoal border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-brand-lime/50 focus:outline-none transition-colors"
            />
            <input
              type="text"
              placeholder="Year"
              value={cardEntry.year}
              onChange={(e) => setCardEntry((p) => ({ ...p, year: e.target.value }))}
              className="bg-brand-charcoal border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-brand-lime/50 focus:outline-none transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={cardEntry.sport}
              onChange={(e) => setCardEntry((p) => ({ ...p, sport: e.target.value }))}
              className="bg-brand-charcoal border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-lime/50 focus:outline-none transition-colors"
            >
              {SPORTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Est. value ($)"
              value={cardEntry.value}
              onChange={(e) => setCardEntry((p) => ({ ...p, value: e.target.value }))}
              className="bg-brand-charcoal border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-brand-lime/50 focus:outline-none transition-colors"
            />
          </div>
          <button
            onClick={addCard}
            disabled={!cardEntry.player.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-lime/10 border border-brand-lime/30 text-brand-lime text-xs font-bold hover:bg-brand-lime/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={14} />
            Add Card
          </button>
        </div>
      )}

      {addMode === 'csv' && (
        <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-700 rounded-xl mb-4">
          <Upload size={28} className="text-slate-600 mb-3" />
          <p className="text-slate-500 text-xs mb-1">Drag & drop your CSV file here</p>
          <p className="text-slate-600 text-[10px]">Supported: .csv, .xlsx</p>
        </div>
      )}

      {/* Added cards list */}
      {addedCards.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">
            Added ({addedCards.length})
          </p>
          <div className="space-y-1.5 max-h-32 overflow-y-auto scrollbar-thin">
            {addedCards.map((c, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-brand-charcoal rounded-lg">
                <span className="text-xs text-white">{c.player} ({c.year})</span>
                <span className="text-[10px] text-brand-lime font-mono">${c.value || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skip / demo */}
      <button
        onClick={loadDemoData}
        className="flex items-center gap-2 text-[10px] text-slate-500 hover:text-brand-lime transition-colors"
      >
        <Database size={12} />
        Skip — load demo data instead
      </button>
    </div>
  );

  const renderBudget = () => {
    const totalAlloc = Object.values(budget.allocations).reduce((a, b) => a + b, 0);
    return (
      <div className="px-8 py-4">
        <h2 className="font-bebas text-2xl text-white tracking-wide mb-1">Set Your Collection Budget</h2>
        <p className="text-slate-500 text-xs mb-5">Define spending limits to keep your collecting on track.</p>

        {/* Amount input */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1">
            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="number"
              value={budget.amount}
              onChange={(e) => setBudget((p) => ({ ...p, amount: Number(e.target.value) }))}
              className="w-full bg-brand-charcoal border border-slate-700 rounded-lg pl-9 pr-4 py-3 text-xl text-white font-bold focus:border-brand-lime/50 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex rounded-lg overflow-hidden border border-slate-700">
            {(['monthly', 'yearly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setBudget((prev) => ({ ...prev, period: p }))}
                className={`px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                  budget.period === p
                    ? 'bg-brand-lime text-brand-charcoal'
                    : 'bg-brand-charcoal text-slate-500 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Sport allocation sliders */}
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">
          Sport Allocation
          <span className={`ml-2 ${totalAlloc === 100 ? 'text-brand-lime' : 'text-amber-400'}`}>
            ({totalAlloc}%)
          </span>
        </p>
        <div className="space-y-3">
          {SPORTS.map((sport) => (
            <div key={sport.id} className="flex items-center gap-3">
              <span className="w-5 text-center">{sport.icon}</span>
              <span className="text-xs text-slate-300 w-20">{sport.label}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={budget.allocations[sport.id] ?? 0}
                onChange={(e) => updateAllocation(sport.id, Number(e.target.value))}
                className="flex-1 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-brand-lime [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-lime"
              />
              <span className="text-xs text-brand-lime font-mono w-10 text-right">
                {budget.allocations[sport.id] ?? 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderChooseSports = () => (
    <div className="px-8 py-4">
      <h2 className="font-bebas text-2xl text-white tracking-wide mb-1">Choose Your Sports</h2>
      <p className="text-slate-500 text-xs mb-5">Select the sports you collect. We will tailor your dashboard experience.</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {SPORTS.map((sport) => {
          const isSelected = selectedSports.includes(sport.id);
          return (
            <button
              key={sport.id}
              onClick={() => toggleSport(sport.id)}
              className={`relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-brand-lime bg-brand-lime/5 shadow-lg shadow-brand-lime/5'
                  : 'border-slate-800 bg-brand-charcoal hover:border-slate-600'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 size={16} className="text-brand-lime" />
                </div>
              )}
              <span className="text-3xl">{sport.icon}</span>
              <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                {sport.label}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-slate-600 mt-4 text-center">
        {selectedSports.length === 0
          ? 'Select at least one sport to continue'
          : `${selectedSports.length} sport${selectedSports.length > 1 ? 's' : ''} selected`}
      </p>
    </div>
  );

  const renderAllSet = () => (
    <div className="flex flex-col items-center text-center px-8 py-8">
      {/* Animated checkmark */}
      <div
        className={`w-24 h-24 rounded-full border-4 flex items-center justify-center mb-6 transition-all duration-700 ${
          animateCheck
            ? 'border-brand-lime bg-brand-lime/10 scale-100 opacity-100'
            : 'border-slate-700 bg-transparent scale-75 opacity-0'
        }`}
      >
        <CheckCircle2
          size={48}
          className={`transition-all duration-500 delay-200 ${
            animateCheck ? 'text-brand-lime scale-100' : 'text-slate-700 scale-50'
          }`}
        />
      </div>

      <h2 className="font-bebas text-3xl text-white tracking-wide mb-2">You're All Set!</h2>
      <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-8">
        Your portfolio is configured and ready. Explore your personalized dashboard with
        AI-powered insights, real-time pricing, and risk analytics.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={handleComplete}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-lime text-brand-charcoal font-black text-sm uppercase tracking-widest hover:bg-brand-lime/90 transition-colors"
        >
          <Sparkles size={16} />
          Explore Dashboard
        </button>
        <button
          onClick={handleComplete}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-xs font-bold hover:text-white hover:border-slate-500 transition-colors"
        >
          <Play size={14} />
          Watch Tutorial
        </button>
      </div>
    </div>
  );

  const stepContent = [renderWelcome, renderAddCards, renderBudget, renderChooseSports, renderAllSet];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      {/* Dark glass overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleSkip} />

      {/* Wizard card */}
      <div className="relative w-full max-w-xl mx-4 bg-brand-slate border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-10 text-slate-600 hover:text-white transition-colors"
          aria-label="Close wizard"
        >
          <X size={18} />
        </button>

        {/* Progress indicator — numbered steps with connecting line */}
        <div className="px-8 pt-6 pb-2">
          <div className="flex items-center justify-between relative">
            {/* Connecting line */}
            <div className="absolute top-4 left-6 right-6 h-[2px] bg-slate-800" />
            <div
              className="absolute top-4 left-6 h-[2px] bg-brand-lime transition-all duration-500"
              style={{ width: `${(currentStep / (STEP_LABELS.length - 1)) * (100 - 12)}%` }}
            />

            {STEP_LABELS.map((label, i) => {
              const isActive = i === currentStep;
              const isComplete = i < currentStep;
              return (
                <div key={label} className="relative flex flex-col items-center z-10">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      isComplete
                        ? 'bg-brand-lime text-brand-charcoal'
                        : isActive
                        ? 'bg-brand-lime/20 border-2 border-brand-lime text-brand-lime'
                        : 'bg-brand-charcoal border-2 border-slate-700 text-slate-600'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-[9px] mt-1.5 font-bold uppercase tracking-wider ${
                      isActive ? 'text-brand-lime' : isComplete ? 'text-slate-400' : 'text-slate-700'
                    }`}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step content */}
        <div className="min-h-[360px] flex flex-col justify-center">
          {stepContent[currentStep]()}
        </div>

        {/* Navigation footer */}
        {currentStep < 4 && (
          <div className="flex items-center justify-between px-8 py-4 border-t border-slate-800">
            <div>
              {currentStep > 0 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white hover:bg-brand-charcoal uppercase tracking-widest transition-all"
                >
                  <ChevronLeft size={14} />
                  Back
                </button>
              ) : (
                <div />
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* Skip wizard link */}
              <button
                onClick={handleSkip}
                className="text-[9px] text-slate-600 hover:text-slate-400 uppercase tracking-widest transition-colors"
              >
                <SkipForward size={10} className="inline mr-1" />
                Skip wizard
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-brand-lime text-brand-charcoal text-[11px] font-black uppercase tracking-widest hover:bg-brand-lime/90 transition-all"
              >
                {currentStep === 0 ? 'Get Started' : 'Next'}
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SetupWizard;
