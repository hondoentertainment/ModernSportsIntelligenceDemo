import React, { useState, useMemo } from 'react';
import { X, Landmark, DollarSign, AlertTriangle, CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { getPositions, getCollateral } from '../lib/cardLoanCollateralService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CardLoanCollateralModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('loans');
  const loans = useMemo(() => getPositions(), []);
  const collateral = useMemo(() => getCollateral(), []);

  if (!isOpen) return null;

  const tabs = [
    { id: 'loans', label: 'Loans', count: loans.length },
    { id: 'collateral', label: 'Collateral', count: collateral.length },
  ];

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'text-emerald-400 bg-emerald-400/10';
    if (status === 'pending') return 'text-blue-400 bg-blue-400/10';
    if (status === 'at-risk') return 'text-red-400 bg-red-400/10';
    return 'text-slate-400 bg-slate-400/10';
  };

  const getConditionIcon = (condition: string) => {
    if (condition === 'appreciating') return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (condition === 'declining') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <div className="w-4 h-4 text-slate-400">—</div>;
  };

  const formatCurrency = (n: number) => `$${n.toLocaleString()}`;

  const totalLoaned = loans.filter(l => l.status === 'active' || l.status === 'at-risk').reduce((s, l) => s + l.loanAmount, 0);
  const totalCollateral = loans.filter(l => l.status === 'active' || l.status === 'at-risk').reduce((s, l) => s + l.collateralValue, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-xl">
              <Landmark className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Card Loan Collateral</h2>
              <p className="text-sm text-slate-400">Manage card-backed lending positions and collateral health</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-700/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-green-400 border-b-2 border-green-400'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              {tab.label}
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-slate-700">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'loans' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-400">{formatCurrency(totalLoaned)}</div>
                  <div className="text-sm text-slate-400">Active Loans</div>
                </div>
                <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{formatCurrency(totalCollateral)}</div>
                  <div className="text-sm text-slate-400">Total Collateral</div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-400">{totalCollateral > 0 ? ((totalLoaned / totalCollateral) * 100).toFixed(1) : 0}%</div>
                  <div className="text-sm text-slate-400">Avg LTV</div>
                </div>
              </div>
              {loans.map((loan) => (
                <div key={loan.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{loan.cardName}</h3>
                      <span className="text-sm text-slate-400">{loan.grade} — {loan.lender}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(loan.status)}`}>
                      {loan.status === 'at-risk' ? 'At Risk' : loan.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Loan Amount</div>
                      <div className="text-green-400 font-bold text-sm">{formatCurrency(loan.loanAmount)}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Collateral</div>
                      <div className="text-white font-bold text-sm">{formatCurrency(loan.collateralValue)}</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">LTV</div>
                      <div className={`font-bold text-sm ${loan.ltv >= 65 ? 'text-red-400' : 'text-emerald-400'}`}>{loan.ltv}%</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Rate</div>
                      <div className="text-amber-400 font-bold text-sm">{loan.interestRate}%</div>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2.5 text-center">
                      <div className="text-xs text-slate-500 mb-1">Maturity</div>
                      <div className="text-slate-300 font-medium text-sm">{loan.maturityDate}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'collateral' && (
            <div className="space-y-3">
              {collateral.map((c) => (
                <div key={c.id} className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3 flex-1">
                    {getConditionIcon(c.condition)}
                    <div>
                      <h4 className="text-white text-sm font-medium">{c.cardName}</h4>
                      <span className="text-xs text-slate-500">{c.grade} — Last appraisal: {c.lastAppraisal}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-slate-500 text-xs">Current</div>
                      <div className="text-white font-medium">{formatCurrency(c.currentValue)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-500 text-xs">Pledged</div>
                      <div className="text-green-400 font-medium">{c.pledgedValue > 0 ? formatCurrency(c.pledgedValue) : 'Unpledged'}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-500 text-xs">Haircut</div>
                      <div className="text-slate-300">{c.haircut}%</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${c.eligible ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                      {c.eligible ? 'Eligible' : 'Ineligible'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardLoanCollateralModal;
