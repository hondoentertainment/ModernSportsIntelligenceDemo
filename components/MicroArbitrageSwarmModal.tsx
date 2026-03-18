import React, { useState } from 'react';
import { X, Radio, Plus, MapPin, DollarSign, Tag } from 'lucide-react';
import {
  reportSighting,
  SIGHTING_SOURCE_LABELS,
  type PriceSighting,
  type SightingSource,
} from '../lib/analytics/microArbitrageSwarmService';

interface MicroArbitrageSwarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSightingReported?: (sighting: PriceSighting) => void;
}

export default function MicroArbitrageSwarmModal({ isOpen, onClose, onSightingReported }: MicroArbitrageSwarmModalProps) {
  const [form, setForm] = useState({
    cardDescription: '',
    player: '',
    year: 2024,
    grade: 'Raw',
    price: 0,
    source: 'card_show' as SightingSource,
    city: '',
    state: '',
    sport: 'Baseball',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!form.cardDescription || !form.player || !form.price) return;
    setSubmitting(true);
    setTimeout(() => {
      const newSighting = reportSighting({
        cardDescription: form.cardDescription,
        player: form.player,
        year: form.year,
        grade: form.grade,
        price: form.price,
        source: form.source,
        location: { city: form.city || 'Unknown', state: form.state || 'US', lat: 39.83, lng: -98.58 },
        sport: form.sport,
      });
      setSubmitting(false);
      setSubmitted(true);
      onSightingReported?.(newSighting);
      setTimeout(() => {
        setSubmitted(false);
        setForm({ cardDescription: '', player: '', year: 2024, grade: 'Raw', price: 0, source: 'card_show', city: '', state: '', sport: 'Baseball' });
        onClose();
      }, 1500);
    }, 500);
  };

  const isValid = form.cardDescription && form.player && form.price > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Radio className="w-5 h-5 text-green-400" />
            Quick Sighting Report
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Plus className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-green-400 mb-1">Sighting Reported!</h3>
            <p className="text-sm text-slate-400">Thanks for contributing to the swarm network.</p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {/* Card Description */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                <Tag className="w-3 h-3 inline mr-1" />
                Card Description *
              </label>
              <input
                type="text"
                placeholder="e.g., 2023 Topps Chrome #201"
                value={form.cardDescription}
                onChange={e => setForm(f => ({ ...f, cardDescription: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Player */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Player *</label>
              <input
                type="text"
                placeholder="Player name"
                value={form.player}
                onChange={e => setForm(f => ({ ...f, player: e.target.value }))}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Price + Grade row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  <DollarSign className="w-3 h-3 inline mr-1" />
                  Price *
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.price || ''}
                  onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Grade</label>
                <select
                  value={form.grade}
                  onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100"
                >
                  <option value="Raw">Raw</option>
                  <option value="Raw NM">Raw NM</option>
                  <option value="Raw NM-MT">Raw NM-MT</option>
                  <option value="PSA 9">PSA 9</option>
                  <option value="PSA 10">PSA 10</option>
                  <option value="BGS 9.5">BGS 9.5</option>
                  <option value="BGS 10">BGS 10</option>
                  <option value="SGC 10">SGC 10</option>
                </select>
              </div>
            </div>

            {/* Source + Sport row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Source</label>
                <select
                  value={form.source}
                  onChange={e => setForm(f => ({ ...f, source: e.target.value as SightingSource }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100"
                >
                  {Object.entries(SIGHTING_SOURCE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Sport</label>
                <select
                  value={form.sport}
                  onChange={e => setForm(f => ({ ...f, sport: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100"
                >
                  <option value="Baseball">Baseball</option>
                  <option value="Football">Football</option>
                  <option value="Basketball">Basketball</option>
                </select>
              </div>
            </div>

            {/* Location row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  City
                </label>
                <input
                  type="text"
                  placeholder="City"
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">State</label>
                <input
                  type="text"
                  placeholder="e.g., TX"
                  value={form.state}
                  onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!isValid || submitting}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isValid && !submitting
                  ? 'bg-green-600 hover:bg-green-500 text-white'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Submitting...' : 'Submit Sighting'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
