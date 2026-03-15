import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Calculator,
  Save,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  BookOpen,
  GitCompare,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Legend,
} from 'recharts';
import {
  BreakEvenScenario,
  EstimatedGrade,
  ProfitProjection,
  GradingTier,
  FeeStructure,
  getScenarios,
  calculateBreakEven,
  getGradingTiers,
  getPlatformFees,
  getProfitProjections,
  getSavedCalculations,
  saveCalculation,
  deleteCalculation,
  getBestCaseROI,
  getWorstCaseROI,
  formatCurrency,
  formatPercent,
  getROIColor,
  getProfitColor,
} from '../lib/breakEvenCalculatorService';

// ─── Tab Definition ────────────────────────────────────────────────────────

type TabKey = 'calculator' | 'saved' | 'comparison' | 'feeGuide';

interface TabDef {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  { key: 'calculator', label: 'Calculator', icon: <Calculator className="w-4 h-4" /> },
  { key: 'saved', label: 'Saved Scenarios', icon: <Save className="w-4 h-4" /> },
  { key: 'comparison', label: 'Comparison', icon: <GitCompare className="w-4 h-4" /> },
  { key: 'feeGuide', label: 'Fee Guide', icon: <BookOpen className="w-4 h-4" /> },
];

// ─── Sub-Components ────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  colorClass,
  icon,
}: {
  label: string;
  value: string;
  colorClass?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400 uppercase tracking-wide">{label}</span>
        {icon && <span className="text-slate-500">{icon}</span>}
      </div>
      <div className={`text-xl font-bold ${colorClass || 'text-white'}`}>{value}</div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

const BreakEvenCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('calculator');
  const [savedScenarios, setSavedScenarios] = useState<BreakEvenScenario[]>([]);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);

  // Calculator form state
  const [cardName, setCardName] = useState('');
  const [player, setPlayer] = useState('');
  const [sport, setSport] = useState('Baseball');
  const [year, setYear] = useState(2024);
  const [set, setSet] = useState('');
  const [purchasePrice, setPurchasePrice] = useState(100);
  const [gradingCompany, setGradingCompany] = useState('PSA');
  const [gradingTierName, setGradingTierName] = useState('Regular');
  const [platform, setPlatform] = useState('eBay');
  const [shippingCost, setShippingCost] = useState(15);
  const [insuranceCost, setInsuranceCost] = useState(5);
  const [gradeEntries, setGradeEntries] = useState<EstimatedGrade[]>([
    { grade: 'PSA 10', probability: 0.25, marketValue: 500 },
    { grade: 'PSA 9', probability: 0.45, marketValue: 200 },
    { grade: 'PSA 8', probability: 0.20, marketValue: 100 },
    { grade: 'PSA 7', probability: 0.07, marketValue: 60 },
    { grade: 'PSA 6', probability: 0.03, marketValue: 30 },
  ]);

  const [calculatedScenario, setCalculatedScenario] = useState<BreakEvenScenario | null>(null);
  const [projections, setProjections] = useState<ProfitProjection[]>([]);

  const gradingTiers = useMemo(() => getGradingTiers(), []);
  const platformFees = useMemo(() => getPlatformFees(), []);
  const mockScenarios = useMemo(() => getScenarios(), []);

  const companyTiers = useMemo(
    () => gradingTiers.filter((t) => t.company === gradingCompany),
    [gradingTiers, gradingCompany],
  );

  const selectedTier = useMemo(
    () => companyTiers.find((t) => t.tier === gradingTierName) || companyTiers[0],
    [companyTiers, gradingTierName],
  );

  const selectedPlatform = useMemo(
    () => platformFees.find((p) => p.platform === platform) || platformFees[0],
    [platformFees, platform],
  );

  const platformFeePercent = useMemo(
    () => selectedPlatform.finalValueFee + selectedPlatform.paymentProcessing,
    [selectedPlatform],
  );

  // Load saved
  useEffect(() => {
    setSavedScenarios(getSavedCalculations());
  }, []);

  // Recalculate when form changes
  const handleCalculate = useCallback(() => {
    const scenario = calculateBreakEven({
      cardName: cardName || 'Untitled Card',
      player: player || 'Unknown Player',
      sport,
      year,
      set: set || 'Unknown Set',
      purchasePrice,
      gradingCost: selectedTier?.cost ?? 50,
      gradingCompany,
      shippingCost,
      insuranceCost,
      platformFees: platformFeePercent,
      estimatedGrades: gradeEntries,
    });
    setCalculatedScenario(scenario);
    setProjections(getProfitProjections(scenario));
  }, [
    cardName,
    player,
    sport,
    year,
    set,
    purchasePrice,
    selectedTier,
    gradingCompany,
    shippingCost,
    insuranceCost,
    platformFeePercent,
    gradeEntries,
  ]);

  useEffect(() => {
    handleCalculate();
  }, [handleCalculate]);

  const handleSave = () => {
    if (!calculatedScenario) return;
    saveCalculation(calculatedScenario);
    setSavedScenarios(getSavedCalculations());
  };

  const handleDelete = (id: string) => {
    deleteCalculation(id);
    setSavedScenarios(getSavedCalculations());
    setComparisonIds((prev) => prev.filter((cid) => cid !== id));
  };

  const toggleComparison = (id: string) => {
    setComparisonIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id],
    );
  };

  const updateGradeEntry = (index: number, field: keyof EstimatedGrade, value: string) => {
    setGradeEntries((prev) => {
      const copy = [...prev];
      if (field === 'grade') {
        copy[index] = { ...copy[index], grade: value };
      } else {
        copy[index] = { ...copy[index], [field]: parseFloat(value) || 0 };
      }
      return copy;
    });
  };

  const addGradeEntry = () => {
    setGradeEntries((prev) => [...prev, { grade: '', probability: 0, marketValue: 0 }]);
  };

  const removeGradeEntry = (index: number) => {
    setGradeEntries((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Waterfall Chart Data ──────────────────────────────────────────────
  const waterfallData = useMemo(() => {
    if (!projections.length) return [];
    return projections.map((p) => ({
      grade: p.grade,
      netProfit: p.netProfit,
      totalCosts: p.totalCosts,
      grossRevenue: p.grossRevenue,
      fill: p.isProfitable ? '#22c55e' : '#ef4444',
    }));
  }, [projections]);

  // ─── Comparison Data ───────────────────────────────────────────────────
  const comparisonScenarios = useMemo(() => {
    const allScenarios = [...mockScenarios, ...savedScenarios];
    return comparisonIds.map((id) => allScenarios.find((s) => s.id === id)).filter(Boolean) as BreakEvenScenario[];
  }, [comparisonIds, mockScenarios, savedScenarios]);

  // ─── Render Tabs ───────────────────────────────────────────────────────

  const renderCalculatorTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Input Form */}
      <div className="space-y-4">
        <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-400" />
            Card Details
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Card Name</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                placeholder="e.g. 2023 Topps Chrome RC #1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Player</label>
                <input
                  type="text"
                  value={player}
                  onChange={(e) => setPlayer(e.target.value)}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Sport</label>
                <select
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                >
                  <option>Baseball</option>
                  <option>Basketball</option>
                  <option>Football</option>
                  <option>Hockey</option>
                  <option>Soccer</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value) || 2024)}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Set</label>
                <input
                  type="text"
                  value={set}
                  onChange={(e) => setSet(e.target.value)}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            Costs & Fees
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Purchase Price: {formatCurrency(purchasePrice)}
              </label>
              <input
                type="range"
                min={1}
                max={5000}
                step={1}
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>$1</span>
                <span>$5,000</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Grading Company</label>
                <select
                  value={gradingCompany}
                  onChange={(e) => {
                    setGradingCompany(e.target.value);
                    const firstTier = gradingTiers.find((t) => t.company === e.target.value);
                    if (firstTier) setGradingTierName(firstTier.tier);
                  }}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                >
                  {[...new Set(gradingTiers.map((t) => t.company))].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tier</label>
                <select
                  value={gradingTierName}
                  onChange={(e) => setGradingTierName(e.target.value)}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                >
                  {companyTiers.map((t) => (
                    <option key={t.tier} value={t.tier}>
                      {t.tier} - {formatCurrency(t.cost)} ({t.turnaround})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Selling Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
              >
                {platformFees.map((p) => (
                  <option key={p.platform}>{p.platform}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Shipping Cost</label>
                <input
                  type="number"
                  value={shippingCost}
                  onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Insurance Cost</label>
                <input
                  type="number"
                  value={insuranceCost}
                  onChange={(e) => setInsuranceCost(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Estimated Grade Values
          </h3>
          <div className="space-y-2">
            {gradeEntries.map((entry, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={entry.grade}
                  onChange={(e) => updateGradeEntry(i, 'grade', e.target.value)}
                  placeholder="Grade"
                  className="col-span-4 bg-slate-700 text-white rounded px-2 py-1.5 text-sm border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="number"
                  value={entry.probability}
                  onChange={(e) => updateGradeEntry(i, 'probability', e.target.value)}
                  placeholder="Prob"
                  step="0.01"
                  className="col-span-3 bg-slate-700 text-white rounded px-2 py-1.5 text-sm border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
                <input
                  type="number"
                  value={entry.marketValue}
                  onChange={(e) => updateGradeEntry(i, 'marketValue', e.target.value)}
                  placeholder="Value"
                  className="col-span-3 bg-slate-700 text-white rounded px-2 py-1.5 text-sm border border-slate-600 focus:border-blue-500 focus:outline-none"
                />
                <button
                  onClick={() => removeGradeEntry(i)}
                  className="col-span-2 text-red-400 hover:text-red-300 flex justify-center"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addGradeEntry}
              className="w-full py-1.5 text-sm text-blue-400 hover:text-blue-300 border border-dashed border-slate-600 rounded"
            >
              + Add Grade
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Scenario
        </button>
      </div>

      {/* Right: Results */}
      <div className="space-y-4">
        {calculatedScenario && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Break-Even Grade"
                value={calculatedScenario.breakEvenGrade}
                colorClass="text-blue-400"
                icon={<CheckCircle2 className="w-4 h-4" />}
              />
              <StatCard
                label="Expected Profit"
                value={formatCurrency(calculatedScenario.expectedProfit)}
                colorClass={getProfitColor(calculatedScenario.expectedProfit)}
                icon={<DollarSign className="w-4 h-4" />}
              />
              <StatCard
                label="Expected ROI"
                value={formatPercent(calculatedScenario.expectedROI)}
                colorClass={getROIColor(calculatedScenario.expectedROI)}
                icon={<TrendingUp className="w-4 h-4" />}
              />
              <StatCard
                label="Total Investment"
                value={formatCurrency(
                  calculatedScenario.purchasePrice +
                    calculatedScenario.gradingCost +
                    calculatedScenario.shippingCost +
                    calculatedScenario.insuranceCost,
                )}
                colorClass="text-slate-300"
                icon={<DollarSign className="w-4 h-4" />}
              />
            </div>

            {/* Break-Even Visual Indicator */}
            <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Grade Scale - Break-Even Indicator
              </h3>
              <div className="flex items-stretch gap-1">
                {projections.map((p) => (
                  <div
                    key={p.grade}
                    className={`flex-1 rounded p-2 text-center text-xs transition-all ${
                      p.isBreakEven
                        ? 'bg-blue-600 ring-2 ring-blue-400 text-white'
                        : p.isProfitable
                          ? 'bg-green-900/50 text-green-300'
                          : 'bg-red-900/50 text-red-300'
                    }`}
                  >
                    <div className="font-semibold">{p.grade.split(' ').pop()}</div>
                    <div className="mt-1 text-[10px] opacity-80">{formatCurrency(p.netProfit)}</div>
                    {p.isBreakEven && (
                      <ChevronRight className="w-3 h-3 mx-auto mt-1 text-blue-200" />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-green-900/50 rounded" /> Profitable
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-blue-600 rounded" /> Break-Even
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-red-900/50 rounded" /> Loss
                </span>
              </div>
            </div>

            {/* Profit Waterfall Chart */}
            <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Profit Waterfall by Grade
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={waterfallData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="grade" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                    formatter={(value: number) => [formatCurrency(value), 'Net Profit']}
                  />
                  <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
                  <Bar dataKey="netProfit" radius={[4, 4, 0, 0]}>
                    {waterfallData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Projections Table */}
            <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Detailed Projections
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="text-left py-2 px-2">Grade</th>
                      <th className="text-right py-2 px-2">Revenue</th>
                      <th className="text-right py-2 px-2">Costs</th>
                      <th className="text-right py-2 px-2">Profit</th>
                      <th className="text-right py-2 px-2">ROI</th>
                      <th className="text-center py-2 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projections.map((p) => (
                      <tr
                        key={p.grade}
                        className={`border-b border-slate-700/50 ${
                          p.isBreakEven ? 'bg-blue-900/20' : ''
                        }`}
                      >
                        <td className="py-2 px-2 text-white font-medium">{p.grade}</td>
                        <td className="py-2 px-2 text-right text-slate-300">
                          {formatCurrency(p.grossRevenue)}
                        </td>
                        <td className="py-2 px-2 text-right text-slate-300">
                          {formatCurrency(p.totalCosts)}
                        </td>
                        <td className={`py-2 px-2 text-right font-medium ${getProfitColor(p.netProfit)}`}>
                          {formatCurrency(p.netProfit)}
                        </td>
                        <td className={`py-2 px-2 text-right ${getROIColor(p.roi)}`}>
                          {formatPercent(p.roi)}
                        </td>
                        <td className="py-2 px-2 text-center">
                          {p.isBreakEven ? (
                            <span className="text-blue-400 text-xs font-semibold">BREAK-EVEN</span>
                          ) : p.isProfitable ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderSavedTab = () => {
    const allScenarios = [...savedScenarios];
    if (allScenarios.length === 0) {
      return (
        <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
          <Info className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-400">No saved scenarios yet. Use the Calculator tab to create one.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allScenarios.map((s) => (
          <div key={s.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-white font-semibold text-sm truncate flex-1">{s.cardName}</h4>
              <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-300 ml-2">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              {s.player} | {s.sport} | {s.year}
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-slate-500 text-xs">Break-Even</span>
                <div className="text-blue-400 font-medium">{s.breakEvenGrade}</div>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Expected ROI</span>
                <div className={`font-medium ${getROIColor(s.expectedROI)}`}>
                  {formatPercent(s.expectedROI)}
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Investment</span>
                <div className="text-slate-300 font-medium">
                  {formatCurrency(s.purchasePrice + s.gradingCost + s.shippingCost + s.insuranceCost)}
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-xs">Expected Profit</span>
                <div className={`font-medium ${getProfitColor(s.expectedProfit)}`}>
                  {formatCurrency(s.expectedProfit)}
                </div>
              </div>
            </div>
            <button
              onClick={() => toggleComparison(s.id)}
              className={`mt-3 w-full py-1.5 text-xs rounded font-medium transition-colors ${
                comparisonIds.includes(s.id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {comparisonIds.includes(s.id) ? 'Remove from Comparison' : 'Add to Comparison'}
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderComparisonTab = () => {
    const allScenarios = [...mockScenarios, ...savedScenarios];

    if (comparisonScenarios.length === 0) {
      return (
        <div className="space-y-4">
          <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
            <GitCompare className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400 mb-4">Select scenarios to compare side-by-side.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allScenarios.slice(0, 6).map((s) => (
              <button
                key={s.id}
                onClick={() => toggleComparison(s.id)}
                className={`text-left p-3 rounded-lg border transition-colors ${
                  comparisonIds.includes(s.id)
                    ? 'bg-blue-900/30 border-blue-500'
                    : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="text-white text-sm font-medium truncate">{s.cardName}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {s.player} | {formatCurrency(s.purchasePrice)}
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {allScenarios.slice(0, 8).map((s) => (
            <button
              key={s.id}
              onClick={() => toggleComparison(s.id)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                comparisonIds.includes(s.id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {s.player}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-3 px-3">Metric</th>
                {comparisonScenarios.map((s) => (
                  <th key={s.id} className="text-right py-3 px-3 min-w-[140px]">
                    <div className="text-white text-xs font-medium truncate">{s.player}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Purchase Price', fn: (s: BreakEvenScenario) => formatCurrency(s.purchasePrice) },
                { label: 'Grading Cost', fn: (s: BreakEvenScenario) => formatCurrency(s.gradingCost) },
                {
                  label: 'Total Investment',
                  fn: (s: BreakEvenScenario) =>
                    formatCurrency(s.purchasePrice + s.gradingCost + s.shippingCost + s.insuranceCost),
                },
                { label: 'Break-Even Grade', fn: (s: BreakEvenScenario) => s.breakEvenGrade },
                { label: 'Expected Profit', fn: (s: BreakEvenScenario) => formatCurrency(s.expectedProfit) },
                { label: 'Expected ROI', fn: (s: BreakEvenScenario) => formatPercent(s.expectedROI) },
                { label: 'Best Case ROI', fn: (s: BreakEvenScenario) => formatPercent(getBestCaseROI(s)) },
                { label: 'Worst Case ROI', fn: (s: BreakEvenScenario) => formatPercent(getWorstCaseROI(s)) },
                { label: 'Grading Company', fn: (s: BreakEvenScenario) => s.gradingCompany },
                { label: 'Platform Fees', fn: (s: BreakEvenScenario) => formatPercent(s.platformFees) },
              ].map((row) => (
                <tr key={row.label} className="border-b border-slate-700/50">
                  <td className="py-2 px-3 text-slate-400">{row.label}</td>
                  {comparisonScenarios.map((s) => (
                    <td key={s.id} className="py-2 px-3 text-right text-white">
                      {row.fn(s)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Comparison Bar Chart */}
        <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            ROI Comparison
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={comparisonScenarios.map((s) => ({
                name: s.player,
                expectedROI: s.expectedROI,
                bestROI: getBestCaseROI(s),
                worstROI: getWorstCaseROI(s),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Bar dataKey="expectedROI" name="Expected ROI" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="bestROI" name="Best Case" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="worstROI" name="Worst Case" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderFeeGuideTab = () => {
    const tiers = getGradingTiers();
    const fees = getPlatformFees();
    const companies = [...new Set(tiers.map((t) => t.company))];

    return (
      <div className="space-y-6">
        {/* Platform Fees */}
        <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            Platform Fee Structures
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fees.map((f) => (
              <div key={f.platform} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <h4 className="text-white font-semibold mb-3">{f.platform}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Listing Fee</span>
                    <span className="text-white">{formatCurrency(f.listingFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Final Value Fee</span>
                    <span className="text-white">{formatPercent(f.finalValueFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Payment Processing</span>
                    <span className="text-white">{formatPercent(f.paymentProcessing)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Shipping Estimate</span>
                    <span className="text-white">{formatCurrency(f.shippingEstimate)}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-700 flex justify-between font-semibold">
                    <span className="text-slate-300">Total Fee Rate</span>
                    <span className="text-blue-400">
                      {formatPercent(f.finalValueFee + f.paymentProcessing)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grading Tiers by Company */}
        {companies.map((company) => (
          <div key={company} className="bg-slate-800 rounded-lg p-5 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">{company} Grading Tiers</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700">
                    <th className="text-left py-2 px-3">Tier</th>
                    <th className="text-right py-2 px-3">Cost</th>
                    <th className="text-right py-2 px-3">Turnaround</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers
                    .filter((t) => t.company === company)
                    .map((t) => (
                      <tr key={`${t.company}-${t.tier}`} className="border-b border-slate-700/50">
                        <td className="py-2 px-3 text-white">{t.tier}</td>
                        <td className="py-2 px-3 text-right text-green-400 font-medium">
                          {formatCurrency(t.cost)}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-300">{t.turnaround}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Tips */}
        <div className="bg-slate-800 rounded-lg p-5 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Pro Tips
          </h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              Always factor in insurance for cards worth over $200 raw.
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              COMC has the lowest total fees but requires consignment.
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              BGS 9.5 often commands a premium over PSA 10 for modern cards.
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              Economy grading tiers are best for cards under $100 raw value.
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              Consider SGC for vintage cards - growing market acceptance and lower fees.
            </li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Calculator className="w-7 h-7 text-blue-400" />
            Break-Even Calculator
          </h1>
          <p className="text-slate-400 mt-1">
            Analyze grading investments to find the minimum grade needed for profitability.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-800 rounded-lg p-1 border border-slate-700 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'calculator' && renderCalculatorTab()}
        {activeTab === 'saved' && renderSavedTab()}
        {activeTab === 'comparison' && renderComparisonTab()}
        {activeTab === 'feeGuide' && renderFeeGuideTab()}
      </div>
    </div>
  );
};

export default BreakEvenCalculator;
