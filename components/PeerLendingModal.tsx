import React, { useState, useMemo } from 'react';
import { X, ArrowLeftRight, DollarSign, Clock, CheckCircle, AlertCircle, Percent, Users } from 'lucide-react';
import { getListings } from '../lib/peerLendingService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PeerLendingModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('listings');

  const listings = useMemo(() => getListings(), []);

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' };
      case 'funded': return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' };
      case 'overdue': return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' };
      case 'completed': return { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' };
      default: return { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400' };
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-emerald-400';
      case 'medium': return 'text-amber-400';
      case 'high': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const tabs = [
    { id: 'listings', label: 'Listings', icon: <DollarSign size={16} />, count: listings.filter((l: any) => l.status === 'active' || !l.status).length },
    { id: 'loans', label: 'Active Loans', icon: <ArrowLeftRight size={16} />, count: listings.filter((l: any) => l.status === 'funded').length },
  ];

  const totalLent = listings.reduce((sum: number, l: any) => sum + (l.amount || 0), 0);
  const avgRate = (listings.reduce((sum: number, l: any) => sum + (l.interestRate || 0), 0) / listings.length).toFixed(1);
  const activeCount = listings.filter((l: any) => l.status === 'active' || l.status === 'funded').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-500/10 rounded-xl">
              <ArrowLeftRight size={24} className="text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Peer Lending</h2>
              <p className="text-xs text-slate-500">Peer-to-peer collectible-backed lending marketplace</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 px-6 pt-4">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Total Volume</p>
            <p className="text-lg font-bold text-green-400">${(totalLent / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Avg Rate</p>
            <p className="text-lg font-bold text-white">{avgRate}%</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/30">
            <p className="text-xs text-slate-500">Active Deals</p>
            <p className="text-lg font-bold text-white">{activeCount}</p>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 px-6 pt-4 border-b border-slate-700/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'text-green-400 bg-slate-800/50 border-b-2 border-green-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-slate-700/50">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'listings' && (
            <div className="grid gap-4">
              {listings.filter((l: any) => l.status === 'active' || !l.status || l.status === 'pending').map((listing: any, idx: number) => {
                const status = getStatusColor(listing.status || 'active');
                return (
                  <div key={idx} className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                          <DollarSign size={18} className="text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{listing.collateral || `Listing ${idx + 1}`}</h3>
                          <p className="text-xs text-slate-500">{listing.borrower || 'Anonymous'} • {listing.duration || '30'} days</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full border ${status.bg} ${status.border} ${status.text}`}>
                        {listing.status || 'active'}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Amount</p>
                        <p className="text-sm font-bold text-green-400">${(listing.amount || 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Interest</p>
                        <p className="text-sm font-bold text-white">{listing.interestRate || 0}%</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">LTV</p>
                        <p className="text-sm font-bold text-amber-400">{listing.ltv || 60}%</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                        <p className="text-xs text-slate-500">Risk</p>
                        <p className={`text-sm font-bold ${getRiskColor(listing.riskLevel || 'medium')}`}>{listing.riskLevel || 'medium'}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'loans' && (
            <div className="grid gap-4">
              {listings.filter((l: any) => l.status === 'funded' || l.status === 'overdue').map((loan: any, idx: number) => (
                <div key={idx} className="bg-slate-800/40 rounded-xl border border-slate-700/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-semibold">{loan.collateral || `Loan ${idx + 1}`}</h3>
                    <div className="flex items-center gap-2">
                      {loan.status === 'overdue' ? <AlertCircle size={14} className="text-red-400" /> : <CheckCircle size={14} className="text-emerald-400" />}
                      <span className={`text-sm ${loan.status === 'overdue' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {loan.status === 'overdue' ? 'Overdue' : 'On Track'}
                      </span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Repayment Progress</span>
                      <span className="text-green-400">{loan.repaymentProgress || 45}%</span>
                    </div>
                    <div className="w-full bg-slate-700/30 rounded-full h-2">
                      <div className="bg-green-500 rounded-full h-2 transition-all" style={{ width: `${loan.repaymentProgress || 45}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Remaining</p>
                      <p className="text-sm font-bold text-green-400">${(loan.remainingBalance || 0).toLocaleString()}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Due Date</p>
                      <p className="text-sm font-bold text-white">{loan.dueDate || '2024-03-15'}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-slate-500">Payments</p>
                      <p className="text-sm font-bold text-blue-400">{loan.paymentsMade || 0}/{loan.totalPayments || 6}</p>
                    </div>
                  </div>
                </div>
              ))}
              {listings.filter((l: any) => l.status === 'funded' || l.status === 'overdue').length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <ArrowLeftRight size={48} className="mx-auto mb-4 opacity-30" />
                  <p>No active loans yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PeerLendingModal;
