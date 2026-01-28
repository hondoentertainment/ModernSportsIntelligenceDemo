
import React, { useState, useEffect } from 'react';
import { X, Trophy, DollarSign, Star, FileText, Layers, Tag, Upload, Hash, Calendar } from 'lucide-react';
import { CardInventory, Sport, League } from '../types.ts';

interface AddAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (card: CardInventory) => void;
    editCard?: CardInventory | null;
    onUpdate?: (id: string, updates: Partial<CardInventory>) => void;
}

const SPORTS: Sport[] = ['Baseball', 'Basketball', 'Football', 'Hockey', 'Soccer'];
const LEAGUES: League[] = ['MLB', 'MiLB', 'NBA', 'NFL', 'Other'];
const CONDITIONS = ['Gem Mint', 'Mint', 'Near Mint', 'Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
const GRADERS = ['PSA', 'BGS', 'SGC', 'CGC', 'TAG', 'Raw'];

const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onAdd, editCard, onUpdate }) => {
    // Form State
    const [player, setPlayer] = useState('');
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [manufacturer, setManufacturer] = useState('');
    const [set, setSet] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [sport, setSport] = useState<Sport>('Baseball');
    const [league, setLeague] = useState<League>('MLB');
    const [isGraded, setIsGraded] = useState(false);
    const [gradingCompany, setGradingCompany] = useState('PSA');
    const [grade, setGrade] = useState('10');
    const [isAutographed, setIsAutographed] = useState(false);
    const [purchasePrice, setPurchasePrice] = useState('');
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');

    // Load edit data when modal opens with an editCard
    useEffect(() => {
        if (editCard) {
            setPlayer(editCard.player);
            setYear(editCard.year.toString());
            setManufacturer(editCard.manufacturer);
            setSet(editCard.set);
            setCardNumber(editCard.cardNumber);
            setSport(editCard.sport);
            setLeague(editCard.league);
            setIsGraded(editCard.isGraded);
            setGradingCompany(editCard.gradingCompany || 'PSA');
            setGrade(editCard.grade || '10');
            setIsAutographed(editCard.isAutographed);
            setPurchasePrice(editCard.purchasePrice.toString());
            setPurchaseDate(editCard.purchaseDate || new Date().toISOString().split('T')[0]);
        } else {
            // Reset form for new add
            setPlayer('');
            setYear(new Date().getFullYear().toString());
            setManufacturer('');
            setSet('');
            setCardNumber('');
            setSport('Baseball');
            setLeague('MLB');
            setIsGraded(false);
            setGradingCompany('PSA');
            setGrade('10');
            setIsAutographed(false);
            setPurchasePrice('');
            setPurchaseDate(new Date().toISOString().split('T')[0]);
            setNotes('');
        }
    }, [editCard, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!player.trim() || !manufacturer.trim() || !set.trim()) {
            return;
        }

        const cardData: any = {
            player: player.trim(),
            year: parseInt(year),
            manufacturer: manufacturer.trim(),
            set: set.trim(),
            cardNumber: cardNumber.trim() || 'N/A',
            sport,
            league,
            isGraded,
            gradingCompany: isGraded ? gradingCompany : undefined,
            grade: isGraded ? grade : undefined,
            isAutographed,
            purchasePrice: parseFloat(purchasePrice) || 0,
            purchaseDate,
            image: editCard?.image || 'https://images.unsplash.com/photo-1540553016722-983e48a2cd10?auto=format&fit=crop&q=80&w=600'
        };

        if (editCard && onUpdate) {
            onUpdate(editCard.id, cardData);
        } else {
            // Generate ID for new card
            const id = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
                ? crypto.randomUUID()
                : Math.random().toString(36).substring(2, 11);

            onAdd({ ...cardData, id, condition: isGraded ? 'Gem Mint' : 'Near Mint' });
        }

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
            <div className="relative w-full max-w-2xl bg-brand-slate border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="relative px-8 pt-8 pb-6 border-b border-slate-800/50 shrink-0">
                    <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-brand-lime/10 blur-[80px] rounded-full"></div>

                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-brand-lime/10 rounded-2xl flex items-center justify-center">
                                <Layers className="text-brand-lime" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bebas tracking-widest text-white">
                                    {editCard ? 'Edit Asset' : 'Add New Asset'}
                                </h2>
                                <p className="text-xs text-brand-muted font-medium">Enter detailed specifications for accurate valuation.</p>
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

                {/* Form Content - Scrollable */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                    {/* Primary Info Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Player Name *</label>
                            <input
                                type="text"
                                value={player}
                                onChange={(e) => setPlayer(e.target.value)}
                                placeholder="e.g. Michael Jordan"
                                className="w-full bg-brand-charcoal border border-slate-800 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime/30 transition-all font-medium text-white placeholder:text-slate-600"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Year *</label>
                            <input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                placeholder="YYYY"
                                className="w-full bg-brand-charcoal border border-slate-800 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime/30 transition-all font-medium text-white placeholder:text-slate-600"
                                required
                            />
                        </div>
                    </div>

                    {/* Set Info Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Manufacturer *</label>
                            <input
                                type="text"
                                value={manufacturer}
                                onChange={(e) => setManufacturer(e.target.value)}
                                placeholder="e.g. Panini"
                                className="w-full bg-brand-charcoal border border-slate-800 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime/30 transition-all font-medium text-white placeholder:text-slate-600"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Set Name *</label>
                            <input
                                type="text"
                                value={set}
                                onChange={(e) => setSet(e.target.value)}
                                placeholder="e.g. Prizm"
                                className="w-full bg-brand-charcoal border border-slate-800 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime/30 transition-all font-medium text-white placeholder:text-slate-600"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Card #</label>
                            <div className="relative">
                                <Hash size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    placeholder="e.g. 101"
                                    className="w-full bg-brand-charcoal border border-slate-800 rounded-2xl py-4 pl-10 pr-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime/30 transition-all font-medium text-white placeholder:text-slate-600"
                                />
                            </div>
                        </div>
                    </div>

                    {/* League & Condition */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Sport</label>
                            <select
                                value={sport}
                                onChange={(e) => setSport(e.target.value as Sport)}
                                className="w-full bg-brand-charcoal border border-slate-800 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime/30 transition-all font-medium text-white appearance-none cursor-pointer"
                            >
                                {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">League</label>
                            <select
                                value={league}
                                onChange={(e) => setLeague(e.target.value as League)}
                                className="w-full bg-brand-charcoal border border-slate-800 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime/30 transition-all font-medium text-white appearance-none cursor-pointer"
                            >
                                {LEAGUES.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Grading Toggle Section */}
                    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-3xl space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Trophy size={18} className={isGraded ? 'text-brand-lime' : 'text-slate-600'} />
                                <span className={`font-bold ${isGraded ? 'text-white' : 'text-slate-500'}`}>Professional Grading</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={isGraded} onChange={(e) => setIsGraded(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-lime"></div>
                            </label>
                        </div>

                        {isGraded && (
                            <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Grader</label>
                                    <select
                                        value={gradingCompany}
                                        onChange={(e) => setGradingCompany(e.target.value)}
                                        className="w-full bg-brand-charcoal border border-slate-800 rounded-2xl py-3 px-4 text-sm font-medium text-white focus:outline-none focus:border-brand-lime/30"
                                    >
                                        {GRADERS.filter(g => g !== 'Raw').map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Grade</label>
                                    <input
                                        type="text"
                                        value={grade}
                                        onChange={(e) => setGrade(e.target.value)}
                                        placeholder="e.g. 10"
                                        className="w-full bg-brand-charcoal border border-slate-800 rounded-2xl py-3 px-4 text-sm font-medium text-white focus:outline-none focus:border-brand-lime/30"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Autograph Toggle */}
                    <div className="flex items-center gap-3 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-brand-lime/30 transition-colors cursor-pointer" onClick={() => setIsAutographed(!isAutographed)}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${isAutographed ? 'bg-brand-lime border-brand-lime' : 'border-slate-600'}`}>
                            {isAutographed && <X size={12} className="text-brand-charcoal" />}
                        </div>
                        <div className="flex items-center gap-2">
                            <Star size={16} className={isAutographed ? 'text-amber-400' : 'text-slate-600'} />
                            <span className={`text-sm font-bold ${isAutographed ? 'text-white' : 'text-slate-400'}`}>Autographed / Signed</span>
                        </div>
                    </div>

                    {/* Financials */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-2">
                                <DollarSign size={12} /> Purchase Price
                            </label>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-lime font-bold">$</span>
                                <input
                                    type="number"
                                    value={purchasePrice}
                                    onChange={(e) => setPurchasePrice(e.target.value)}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    className="w-full bg-brand-charcoal border border-slate-800 rounded-2xl py-4 pl-10 pr-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime/30 transition-all font-mono font-bold text-white placeholder:text-slate-600"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-brand-muted uppercase tracking-widest flex items-center gap-2">
                                <Calendar size={12} /> Purchase Date
                            </label>
                            <input
                                type="date"
                                value={purchaseDate}
                                onChange={(e) => setPurchaseDate(e.target.value)}
                                className="w-full bg-brand-charcoal border border-slate-800 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime/20 focus:border-brand-lime/30 transition-all font-mono font-medium text-white appearance-none"
                            />
                        </div>
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="p-8 border-t border-slate-800/50 shrink-0 bg-brand-slate flex gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-4 bg-brand-charcoal hover:bg-slate-800 border border-slate-800 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="flex-1 py-4 bg-brand-lime hover:bg-white text-brand-charcoal font-black rounded-2xl transition-all shadow-xl shadow-brand-lime/20 uppercase tracking-widest text-xs"
                    >
                        {editCard ? 'Save Changes' : 'Add Asset'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddAssetModal;
