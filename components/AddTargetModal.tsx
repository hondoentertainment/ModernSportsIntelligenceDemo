
import React, { useState } from 'react';
import { X, Target, DollarSign, Star, FileText, Trophy } from 'lucide-react';
import { TargetWatchlist, Sport, League } from '../types.ts';

interface AddTargetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (target: Omit<TargetWatchlist, 'id' | 'createdAt' | 'status'>) => void;
    editTarget?: TargetWatchlist | null;
    onUpdate?: (id: string, updates: Partial<TargetWatchlist>) => void;
}

const SPORTS: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];
const LEAGUES: League[] = ['MLB', 'MiLB', 'NBA', 'NFL', 'Other'];
const PRIORITIES: ('High' | 'Medium' | 'Low')[] = ['High', 'Medium', 'Low'];

const AddTargetModal: React.FC<AddTargetModalProps> = ({ isOpen, onClose, onAdd, editTarget, onUpdate }) => {
    const [player, setPlayer] = useState(editTarget?.player || '');
    const [cardDescription, setCardDescription] = useState(editTarget?.cardDescription || '');
    const [targetPrice, setTargetPrice] = useState(editTarget?.targetPrice?.toString() || '');
    const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>(editTarget?.priority || 'Medium');
    const [sport, setSport] = useState<Sport>(editTarget?.sport || 'Baseball');
    const [league, setLeague] = useState<League>(editTarget?.league || 'MLB');
    const [notes, setNotes] = useState(editTarget?.notes || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!player.trim() || !cardDescription.trim() || !targetPrice) {
            return;
        }

        const targetData = {
            player: player.trim(),
            cardDescription: cardDescription.trim(),
            targetPrice: parseFloat(targetPrice),
            priority,
            sport,
            league,
            notes: notes.trim() || undefined,
            image: 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80&w=600'
        };

        if (editTarget && onUpdate) {
            onUpdate(editTarget.id, targetData);
        } else {
            onAdd(targetData);
        }

        // Reset form
        setPlayer('');
        setCardDescription('');
        setTargetPrice('');
        setPriority('Medium');
        setSport('Baseball');
        setLeague('MLB');
        setNotes('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-xl bg-brand-slate border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                {/* Header */}
                <div className="relative px-8 pt-8 pb-6 border-b border-slate-800/50">
                    <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-brand-lime/10 blur-[80px] rounded-full"></div>

                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-brand-lime/10 rounded-2xl flex items-center justify-center">
                                <Target className="text-brand-lime" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bebas tracking-widest text-white">
                                    {editTarget ? 'Edit Target' : 'New Acquisition Target'}
                                </h2>
                                <p className="text-xs text-brand-muted font-medium">Set your price threshold</p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="p-3 bg-brand-charcoal hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            <X size={20} className="text-brand-muted" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {/* Player Name */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                            Player Name *
                        </label>
                        <input
                            type="text"
                            value={player}
                            onChange={(e) => setPlayer(e.target.value)}
                            placeholder="e.g. Shohei Ohtani"
                            className="w-full bg-brand-charcoal border border-slate-800 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime/30 transition-all font-medium text-white placeholder:text-slate-600"
                            required
                        />
                    </div>

                    {/* Card Description */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                            Card Description *
                        </label>
                        <input
                            type="text"
                            value={cardDescription}
                            onChange={(e) => setCardDescription(e.target.value)}
                            placeholder="e.g. 2018 Bowman Chrome Auto PSA 10"
                            className="w-full bg-brand-charcoal border border-slate-800 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime/30 transition-all font-medium text-white placeholder:text-slate-600"
                            required
                        />
                    </div>

                    {/* Target Price & Priority Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-2">
                                <DollarSign size={12} /> Target Price *
                            </label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-lime font-bold">$</span>
                                <input
                                    type="number"
                                    value={targetPrice}
                                    onChange={(e) => setTargetPrice(e.target.value)}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className="w-full bg-brand-charcoal border border-slate-800 rounded-2xl py-4 pl-10 pr-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime/30 transition-all font-mono font-bold text-white placeholder:text-slate-600"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-2">
                                <Star size={12} /> Priority
                            </label>
                            <div className="flex gap-2">
                                {PRIORITIES.map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p)}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${priority === p
                                                ? p === 'High'
                                                    ? 'bg-red-500/20 border-red-500/50 text-red-400'
                                                    : p === 'Medium'
                                                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                                        : 'bg-slate-500/20 border-slate-500/50 text-slate-400'
                                                : 'bg-brand-charcoal border-slate-800 text-brand-muted hover:border-slate-700'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sport & League Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-2">
                                <Trophy size={12} /> Sport
                            </label>
                            <select
                                value={sport}
                                onChange={(e) => setSport(e.target.value as Sport)}
                                className="w-full bg-brand-charcoal border border-slate-800 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime/30 transition-all font-medium text-white appearance-none cursor-pointer"
                            >
                                {SPORTS.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                                League
                            </label>
                            <select
                                value={league}
                                onChange={(e) => setLeague(e.target.value as League)}
                                className="w-full bg-brand-charcoal border border-slate-800 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime/30 transition-all font-medium text-white appearance-none cursor-pointer"
                            >
                                {LEAGUES.map((l) => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-2">
                            <FileText size={12} /> Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any additional context for this target..."
                            rows={2}
                            className="w-full bg-brand-charcoal border border-slate-800 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime/30 transition-all font-medium text-white placeholder:text-slate-600 resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 bg-brand-charcoal hover:bg-slate-800 border border-slate-800 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-4 bg-brand-lime hover:bg-white text-brand-charcoal font-black rounded-2xl transition-all shadow-xl shadow-brand-lime/20 uppercase tracking-widest text-xs"
                        >
                            {editTarget ? 'Update Target' : 'Add Target'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTargetModal;
