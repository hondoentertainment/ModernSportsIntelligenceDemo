// Phase 112: AI Deal Negotiation Agent — Full Page
// Route: /autonomous-acquisition | Icon: Bot
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Bot } from 'lucide-react';
import AutonomousAcquisitionModal from '../components/AutonomousAcquisitionModal.tsx';
import AgentReasoningPanel from '../components/AgentReasoningPanel';
import { generateInvestmentThesis, InvestmentThesis } from '../lib/utils/agentFramework';
import { MOCK_INVENTORY_ITEMS } from '../constants.tsx';

const AutonomousAcquisition: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  const [thesis, setThesis] = useState<InvestmentThesis | null>(null);
  const [thesisLoading, setThesisLoading] = useState(true);

  useEffect(() => {
    // Generate a sample thesis from the first available inventory card
    const items = MOCK_INVENTORY_ITEMS;
    if (items.length > 0) {
      // Slight async delay to simulate agent processing
      const timer = setTimeout(() => {
        const result = generateInvestmentThesis(items[0], items);
        setThesis(result);
        setThesisLoading(false);
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setThesisLoading(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-violet-500/20">
          <Bot size={24} className="text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            AI Deal Negotiation Agent &mdash; Autonomous Acquisition
          </h1>
          <p className="text-sm text-slate-400">
            AI agent that hunts, evaluates, negotiates, and acquires cards across platforms with full escrow protection
          </p>
        </div>
      </div>

      {/* Negotiation Analytics link card */}
      <div className="flex items-center justify-between p-5 bg-slate-800/60 rounded-2xl border border-slate-700/60 hover:border-slate-600/70 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 shrink-0">
            <BarChart3 size={20} className="text-teal-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100">Negotiation Analytics</p>
            <p className="text-xs text-slate-400">
              Track win rates, average discounts, and playbook performance
            </p>
          </div>
        </div>
        <Link
          to="/negotiation-coach"
          className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-semibold transition-colors whitespace-nowrap"
        >
          View Analytics →
        </Link>
      </div>

      {/* Acquisition Agent modal / reopen button */}
      <AutonomousAcquisitionModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          Open Acquisition Agent
        </button>
      )}

      {/* Agent Reasoning Panel */}
      <AgentReasoningPanel
        analyses={thesis?.analyses ?? []}
        consensus={thesis?.consensus}
        cardName={thesis?.player}
        isLoading={thesisLoading}
      />
    </div>
  );
};

export default AutonomousAcquisition;
