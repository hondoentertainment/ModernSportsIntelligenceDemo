
import React, { useState, useCallback } from 'react';
import { Search, Sparkles, Target, Zap, ArrowRight, ShieldCheck, Info, Loader2 } from 'lucide-react';
import { findSimilarCards } from '../lib/gemini.ts';
import { useSupabaseInventory } from '../lib/useSupabaseInventory.ts';
import { useToast } from '../contexts/ToastContext.tsx';
import CardImage from '../components/CardImage.tsx';
import ImageLightbox from '../components/ImageLightbox.tsx';

const DeepSearch: React.FC = () => {
    const { inventory } = useSupabaseInventory();
    const { addToast } = useToast();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [lightboxResult, setLightboxResult] = useState<{ image?: string; name: string; team?: string; league?: string } | null>(null);

    const handleDeepSearch = useCallback(async () => {
        if (!query.trim()) return;
        setIsSearching(true);
        setHasSearched(true);
        try {
            const searchResults = await findSimilarCards(query, inventory);
            setResults(searchResults);
            if (searchResults.length === 0) {
                addToast('info', 'No similar cards found. Try a different query.');
            }
        } catch (error) {
            console.error('Deep search failed:', error);
            addToast('error', 'Deep search failed. Check your connection.', { dedupeKey: 'deepsearch_page' });
        } finally {
            setIsSearching(false);
        }
    }, [query, inventory, addToast]);

    const suggestions = [
        "The next Victor Wembanyama",
        "Vintage 90s MLB sluggers",
        "NFL QBs with high playoff ROI",
        "Similar to Mickey Mantle 1952"
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-blue/10 border border-brand-blue/20 rounded-full mb-2">
                        <Sparkles size={12} className="text-brand-blue animate-pulse" />
                        <span className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Powered by Gemini 1.5 Flash</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bebas tracking-tight text-white leading-none">
                        Deep <span className="text-brand-blue">Intelligence</span>
                    </h1>
                    <p className="text-brand-muted max-w-2xl font-medium">AI-driven card similarity and semantic search. Search by vibe, era, or trajectory.</p>
                </div>
            </div>

            {/* Search HUD */}
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-blue to-brand-lime rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200"></div>
                    <div className="relative bg-brand-charcoal border border-slate-800 rounded-[2.5rem] p-4 flex items-center gap-4">
                        <Search className="ml-4 text-brand-muted group-focus-within:text-brand-blue transition-colors" size={24} />
                        <input
                            type="text"
                            placeholder="Search by vibe, trajectory, or specific card similarity..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleDeepSearch()}
                            className="flex-1 bg-transparent border-none text-xl font-bold text-white focus:outline-none placeholder:text-slate-600"
                        />
                        <button
                            onClick={handleDeepSearch}
                            disabled={isSearching || !query.trim()}
                            className={`px-8 py-4 bg-brand-blue hover:bg-white text-brand-charcoal font-black rounded-3xl transition-all flex items-center gap-3 uppercase tracking-widest text-xs active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                            Search Alpha
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 justify-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 px-2">Suggestions:</span>
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setQuery(s);
                                // Trigger search after state update
                                setTimeout(() => setQuery(prev => {
                                    if (prev === s) handleDeepSearch();
                                    return prev;
                                }), 0);
                            }}
                            className="px-4 py-2 bg-brand-slate/40 border border-slate-800 rounded-xl text-[10px] font-bold text-brand-muted hover:border-brand-blue/40 hover:text-brand-blue transition-all"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Grid */}
            {hasSearched && (
                <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <h2 className="text-3xl font-bebas tracking-wider flex items-center gap-3 text-white">
                            <Target className="text-brand-blue" size={24} />
                            Similarity Core
                        </h2>
                        <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                            {results.length} institutional matches
                        </span>
                    </div>

                    {isSearching ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-brand-slate/40 border border-slate-800 rounded-[2.5rem] h-96 animate-pulse"></div>
                            ))}
                        </div>
                    ) : results.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.map((result, i) => (
                                <div key={i} className="group bg-brand-slate border border-slate-800 rounded-[2.5rem] overflow-hidden hover:border-brand-blue/50 transition-all flex flex-col relative">
                                    <div className="h-48 relative overflow-hidden">
                                        <CardImage
                                            src={result.image}
                                            playerName={result.name}
                                            className="w-full h-full"
                                            enableLightbox={true}
                                            onImageClick={() => setLightboxResult(result)}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-brand-slate via-transparent to-transparent opacity-60"></div>
                                        <div className="absolute top-4 right-4 px-3 py-1 bg-brand-charcoal/80 backdrop-blur-md rounded-full border border-white/5 flex items-center gap-1.5 shadow-xl">
                                            <ShieldCheck size={12} className="text-brand-blue" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-widest">{result.similarityScore}% Match</span>
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-4 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest mb-1">{result.league} Asset</p>
                                                <h3 className="text-2xl font-bold text-white leading-none">{result.name}</h3>
                                                <p className="text-sm text-brand-muted font-medium">{result.team}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Est. NAV</p>
                                                <p className="text-xl font-mono font-black text-white">${result.estimatedValue.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-brand-charcoal/50 rounded-2xl border border-white/5 relative group-hover:bg-brand-charcoal/80 transition-colors">
                                            <div className="absolute -top-3 left-4 px-2 bg-brand-charcoal text-[8px] font-black text-brand-muted uppercase tracking-[0.2em] border border-white/10 rounded flex items-center gap-1">
                                                <Info size={10} />
                                                Alpha Rationale
                                            </div>
                                            <p className="text-xs text-slate-300 leading-relaxed italic">
                                                "{result.reason}"
                                            </p>
                                        </div>

                                        <div className="mt-auto pt-4">
                                            <button className="w-full py-3 bg-brand-charcoal hover:bg-slate-800 border border-slate-700 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-[10px] active:scale-95 group/btn">
                                                Deep Scout Report
                                                <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-brand-charcoal/30 rounded-[3rem] border border-dashed border-slate-800">
                            <Zap size={48} className="mx-auto text-slate-700 mb-6" />
                            <h3 className="text-2xl font-bebas tracking-wider text-white">No Semantic Matches</h3>
                            <p className="text-brand-muted max-w-md mx-auto mt-2">Adjust your intelligence parameters and re-query the alpha database.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!hasSearched && (
                <div className="relative overflow-hidden bg-brand-charcoal border border-slate-800 rounded-[3rem] p-12 text-center group">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    <Target size={64} className="mx-auto text-brand-blue/20 mb-6 group-hover:scale-110 transition-transform duration-500" />
                    <h2 className="text-4xl font-bebas tracking-tight text-white mb-4">Awaiting Signal Ingestion</h2>
                    <p className="text-brand-muted max-w-xl mx-auto text-lg leading-relaxed">
                        Enter a search query above to calibrate the AI similarity engine. Use natural language to find assets that match your professional investment thesis.
                    </p>
                </div>
            )}

            <ImageLightbox
                isOpen={!!lightboxResult}
                onClose={() => setLightboxResult(null)}
                src={lightboxResult?.image}
                alt={lightboxResult?.name ?? ''}
                caption={lightboxResult ? `${lightboxResult.name}${lightboxResult.team ? ` • ${lightboxResult.team}` : ''}${lightboxResult.league ? ` • ${lightboxResult.league}` : ''}` : undefined}
            />
        </div>
    );
};

export default DeepSearch;
