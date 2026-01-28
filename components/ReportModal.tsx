
import React, { useState, useMemo } from 'react';
import { X, FileText, Download, FileSpreadsheet, TrendingUp, TrendingDown, PieChart, Briefcase } from 'lucide-react';
import { CardInventory } from '../types.ts';
import { generateReport, exportToCSV, generateTextReport, downloadFile } from '../lib/reportGenerator.ts';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    inventory: CardInventory[];
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, inventory }) => {
    const [activeTab, setActiveTab] = useState<'summary' | 'csv'>('summary');

    const report = useMemo(() => generateReport(inventory), [inventory]);

    const handleDownloadCSV = () => {
        const csv = exportToCSV(report);
        const date = new Date().toISOString().split('T')[0];
        downloadFile(csv, `portfolio-report-${date}.csv`, 'text/csv');
    };

    const handleDownloadTXT = () => {
        const txt = generateTextReport(report);
        const date = new Date().toISOString().split('T')[0];
        downloadFile(txt, `portfolio-report-${date}.txt`, 'text/plain');
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
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden bg-brand-slate border border-slate-800 rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 fade-in duration-300 flex flex-col">
                {/* Header */}
                <div className="relative px-8 pt-8 pb-6 border-b border-slate-800/50 shrink-0">
                    <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-brand-lime/10 blur-[80px] rounded-full"></div>

                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-brand-lime/10 rounded-2xl flex items-center justify-center">
                                <Briefcase className="text-brand-lime" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bebas tracking-widest text-white">Performance Report</h2>
                                <p className="text-xs text-brand-muted font-medium">
                                    Generated {new Date().toLocaleDateString()}
                                </p>
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

                {/* Tabs */}
                <div className="px-8 pt-6 flex gap-4 shrink-0">
                    {(['summary', 'csv'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab
                                    ? 'bg-brand-lime text-brand-charcoal'
                                    : 'bg-brand-charcoal border border-slate-800 text-brand-muted hover:text-white'
                                }`}
                        >
                            {tab === 'summary' ? 'Summary' : 'Export Data'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1">
                    {activeTab === 'summary' ? (
                        <div className="space-y-8">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Assets', value: report.summary.totalAssets, format: 'number' },
                                    { label: 'Total Invested', value: report.summary.totalInvested, format: 'currency' },
                                    { label: 'Current Value', value: report.summary.currentValue, format: 'currency', color: 'text-brand-lime' },
                                    { label: 'ROI', value: report.summary.roi, format: 'percent', color: report.summary.roi >= 0 ? 'text-brand-green' : 'text-brand-red' }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-brand-charcoal/50 border border-slate-800/50 rounded-2xl p-4">
                                        <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest mb-1">{stat.label}</p>
                                        <p className={`text-xl font-mono font-bold ${stat.color || 'text-white'}`}>
                                            {stat.format === 'currency' && '$'}
                                            {stat.format === 'number' ? stat.value : Math.round(stat.value as number).toLocaleString()}
                                            {stat.format === 'percent' && '%'}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Top Gainers */}
                            <div>
                                <h3 className="text-[10px] font-black text-brand-green uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <TrendingUp size={14} /> Top Gainers
                                </h3>
                                <div className="space-y-2">
                                    {report.topGainers.length > 0 ? report.topGainers.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-brand-green/5 border border-brand-green/10 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <span className="text-brand-green font-mono font-bold">#{i + 1}</span>
                                                <span className="font-medium text-white">{item.card.player}</span>
                                                <span className="text-[10px] text-brand-muted">{item.card.set}</span>
                                            </div>
                                            <span className="font-mono font-bold text-brand-green">+{item.roiPercent.toFixed(1)}%</span>
                                        </div>
                                    )) : (
                                        <p className="text-brand-muted text-sm">No gainers yet. Run Market Sync to update values.</p>
                                    )}
                                </div>
                            </div>

                            {/* Top Losers */}
                            <div>
                                <h3 className="text-[10px] font-black text-brand-red uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <TrendingDown size={14} /> Top Losers
                                </h3>
                                <div className="space-y-2">
                                    {report.topLosers.length > 0 ? report.topLosers.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-brand-red/5 border border-brand-red/10 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <span className="text-brand-red font-mono font-bold">#{i + 1}</span>
                                                <span className="font-medium text-white">{item.card.player}</span>
                                                <span className="text-[10px] text-brand-muted">{item.card.set}</span>
                                            </div>
                                            <span className="font-mono font-bold text-brand-red">{item.roiPercent.toFixed(1)}%</span>
                                        </div>
                                    )) : (
                                        <p className="text-brand-muted text-sm">No losers yet. Run Market Sync to update values.</p>
                                    )}
                                </div>
                            </div>

                            {/* By League */}
                            <div>
                                <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <PieChart size={14} /> By League
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {report.byLeague.map((item, i) => (
                                        <div key={i} className="bg-brand-charcoal/50 border border-slate-800/50 rounded-xl p-3 text-center">
                                            <p className="text-xs font-black text-white">{item.league}</p>
                                            <p className="text-[10px] text-brand-muted">{item.count} cards</p>
                                            <p className="text-sm font-mono text-brand-lime">${item.value.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <p className="text-brand-muted font-medium">
                                Export your portfolio data for use in spreadsheets, tax software, or insurance documentation.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={handleDownloadCSV}
                                    className="flex items-center gap-4 p-6 bg-brand-charcoal hover:bg-slate-800 border border-slate-800 rounded-2xl transition-all group"
                                >
                                    <div className="p-4 bg-brand-green/10 rounded-xl text-brand-green group-hover:scale-110 transition-transform">
                                        <FileSpreadsheet size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-white">CSV Spreadsheet</p>
                                        <p className="text-xs text-brand-muted">Excel, Google Sheets compatible</p>
                                    </div>
                                    <Download className="ml-auto text-brand-muted" size={20} />
                                </button>

                                <button
                                    onClick={handleDownloadTXT}
                                    className="flex items-center gap-4 p-6 bg-brand-charcoal hover:bg-slate-800 border border-slate-800 rounded-2xl transition-all group"
                                >
                                    <div className="p-4 bg-brand-teal/10 rounded-xl text-brand-teal group-hover:scale-110 transition-transform">
                                        <FileText size={24} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-bold text-white">Text Summary</p>
                                        <p className="text-xs text-brand-muted">Human-readable report</p>
                                    </div>
                                    <Download className="ml-auto text-brand-muted" size={20} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-slate-800/50 shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-brand-charcoal hover:bg-slate-800 border border-slate-800 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-xs"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
