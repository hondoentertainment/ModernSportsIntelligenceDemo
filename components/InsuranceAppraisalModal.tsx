import React, { useState } from 'react';
import {
  X, FileText, RefreshCw, CheckCircle, Award, FileCheck, DollarSign, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  generateAppraisalReport,
  getComparables,
  type AppraisalReport,
  type AppraisalLineItem,
  type AppraisalComparable,
} from '../lib/core/insuranceAppraisalService';

interface InsuranceAppraisalModalProps {
  isOpen: boolean;
  onClose: () => void;
  items?: any[];
}

const fmt = (n: number) => `$${n.toLocaleString()}`;

const InsuranceAppraisalModal: React.FC<InsuranceAppraisalModalProps> = ({ isOpen, onClose, items = [] }) => {
  const [step, setStep] = useState<'input' | 'processing' | 'result'>('input');
  const [cardName, setCardName] = useState('');
  const [cardGrade, setCardGrade] = useState('PSA 10');
  const [cardYear, setCardYear] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [report, setReport] = useState<AppraisalReport | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = () => {
    setStep('processing');
    const appraisalItems = cardName
      ? [{ name: cardName, grade: cardGrade, year: cardYear, currentValue: Number(estimatedValue) || 10000 }]
      : items.length > 0
        ? items
        : [];

    // Simulate processing delay
    setTimeout(() => {
      const result = generateAppraisalReport(appraisalItems);
      setReport(result);
      setStep('result');
    }, 1500);
  };

  const handleReset = () => {
    setStep('input');
    setReport(null);
    setCardName('');
    setCardGrade('PSA 10');
    setCardYear('');
    setEstimatedValue('');
    setExpandedItem(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-slate-100">Quick Appraisal</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-700">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'input' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">
                Enter card details for a quick appraisal with comparable sales analysis.
                Leave fields empty to appraise your entire collection.
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Card Name / Description</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                  placeholder="e.g., 1986 Fleer Michael Jordan #57"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Year</label>
                  <input
                    type="text"
                    value={cardYear}
                    onChange={e => setCardYear(e.target.value)}
                    placeholder="e.g., 1986"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Grade</label>
                  <select
                    value={cardGrade}
                    onChange={e => setCardGrade(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="PSA 10">PSA 10</option>
                    <option value="PSA 9">PSA 9</option>
                    <option value="PSA 8">PSA 8</option>
                    <option value="BGS 9.5">BGS 9.5</option>
                    <option value="BGS 9">BGS 9</option>
                    <option value="SGC 10">SGC 10</option>
                    <option value="SGC 9">SGC 9</option>
                    <option value="Raw">Raw / Ungraded</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Estimated Value ($)</label>
                <input
                  type="number"
                  value={estimatedValue}
                  onChange={e => setEstimatedValue(e.target.value)}
                  placeholder="e.g., 42500"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleGenerate}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
              >
                <FileText size={16} /> Generate Appraisal Report
              </button>
            </div>
          )}

          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-16">
              <RefreshCw size={36} className="text-blue-400 animate-spin mb-4" />
              <p className="text-sm text-slate-300 font-medium">Generating appraisal report...</p>
              <p className="text-xs text-slate-500 mt-1">Analyzing comparable sales data</p>
            </div>
          )}

          {step === 'result' && report && (
            <div className="space-y-4">
              {/* Certification Badges */}
              <div className="flex flex-wrap gap-2">
                {report.certification.irsCompliant && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500/15 text-blue-400 text-xs font-medium border border-blue-500/30">
                    <FileCheck size={12} /> IRS-Compliant
                  </span>
                )}
                {report.certification.insuranceGrade && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded bg-green-500/15 text-green-400 text-xs font-medium border border-green-500/30">
                    <Award size={12} /> Insurance-Grade
                  </span>
                )}
                {report.certification.uspap && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded bg-purple-500/15 text-purple-400 text-xs font-medium border border-purple-500/30">
                    <CheckCircle size={12} /> USPAP Compliant
                  </span>
                )}
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900 rounded-lg p-3 border border-slate-700 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Fair Market Value</p>
                  <p className="text-lg font-bold text-green-400">{fmt(report.totalFairMarketValue)}</p>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 border border-slate-700 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Replacement</p>
                  <p className="text-lg font-bold text-blue-400">{fmt(report.totalReplacementValue)}</p>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 border border-slate-700 text-center">
                  <p className="text-[10px] text-slate-500 uppercase">Liquidation</p>
                  <p className="text-lg font-bold text-amber-400">{fmt(report.totalLiquidationValue)}</p>
                </div>
              </div>

              {/* Certification Details */}
              <div className="bg-slate-900 rounded-lg border border-slate-700 p-3 text-xs">
                <p className="text-slate-500 mb-1">Certified by: <span className="text-slate-300">{report.certification.appraiserName}</span></p>
                <p className="text-slate-500">Credentials: <span className="text-slate-300">{report.certification.appraiserCredentials}</span></p>
                <p className="text-slate-500">Valid until: <span className="text-slate-300">{report.certification.expirationDate}</span></p>
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-300">Appraised Items ({report.lineItems.length})</h4>
                {report.lineItems.map(item => (
                  <div key={item.id} className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                    <button
                      onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-800/50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 truncate">{item.cardName}</p>
                        <p className="text-xs text-slate-500">{item.grade} | {item.comparables.length} comps</p>
                      </div>
                      <div className="flex items-center gap-2 ml-3 shrink-0">
                        <span className="text-sm font-semibold text-green-400">{fmt(item.fairMarketValue)}</span>
                        {expandedItem === item.id ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
                      </div>
                    </button>
                    {expandedItem === item.id && (
                      <div className="px-3 pb-3 border-t border-slate-700/50 pt-2">
                        <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
                          <div className="text-center">
                            <p className="text-slate-500">FMV</p>
                            <p className="text-green-400 font-medium">{fmt(item.fairMarketValue)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-500">Replacement</p>
                            <p className="text-blue-400 font-medium">{fmt(item.replacementValue)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-500">Liquidation</p>
                            <p className="text-amber-400 font-medium">{fmt(item.liquidationValue)}</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 mb-1">Top Comparables:</p>
                        {item.comparables.slice(0, 3).map(comp => (
                          <div key={comp.id} className="flex justify-between text-xs py-1 border-t border-slate-700/30">
                            <span className="text-slate-400 truncate flex-1">{comp.venue} ({comp.saleDate})</span>
                            <span className="text-slate-300 ml-2">{fmt(comp.salePrice)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium"
                >
                  New Appraisal
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-1"
                >
                  <DollarSign size={14} /> Download PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsuranceAppraisalModal;
