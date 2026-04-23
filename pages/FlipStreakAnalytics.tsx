// @ts-nocheck
import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import FlipStreakAnalyticsModal from '../components/FlipStreakAnalyticsModal.tsx';

const FlipStreakAnalytics: React.FC = () => {
  const [showModal, setShowModal] = useState(true);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-cyan-500/20"><TrendingUp size={24} className="text-cyan-400" /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Flip Streak Analytics</h1>
          <p className="text-sm text-slate-400">Track your card flipping winning and losing streaks</p>
        </div>
      </div>
      <FlipStreakAnalyticsModal isOpen={showModal} onClose={() => setShowModal(false)} />
      {!showModal && (
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-semibold transition-colors">Open Flip Streak Analytics</button>
      )}
    </div>
  );
};

export default FlipStreakAnalytics;
