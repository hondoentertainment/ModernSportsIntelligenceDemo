import React, { useCallback, useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Shield, LayoutGrid, List as ListIcon, Search, Share2, CheckCircle2, Code2 } from 'lucide-react';
import { CardInventory, UserProfile, League } from '../types';
import { fetchPublicProfile, fetchPublicInventory, generateShareLink } from '../lib/social/socialService';
import CardImage from '../components/CardImage';
import { getRarityTier, getTierStyles } from '../lib/utils/rarity';
import { LEAGUES } from '../constants';
import { useToast } from '../contexts/ToastContext';
import { logger } from '../lib/logger';
import { withRetry } from '../lib/retry';
import { validateUsername } from '../lib/apiValidation';
import { buildIframeEmbedSnippet, isPortfolioEmbedView, PORTFOLIO_EMBED_DISCLOSURE } from '../lib/social/portfolioEmbed';
import { buildShareableCollectionPreview, generateEmbedCode } from '../lib/social/collectionShare';

const PublicPortfolio: React.FC = () => {
    const { username: usernameParam } = useParams<{ username: string }>();
    const [searchParams] = useSearchParams();
    const isEmbed = isPortfolioEmbedView(searchParams.toString());
    let username: string | null = null;
    let usernameError: string | null = null;
    if (usernameParam) {
        try {
            username = validateUsername(usernameParam);
        } catch {
            usernameError = 'Invalid username';
        }
    }
    const { addToast } = useToast();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [inventory, setInventory] = useState<CardInventory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterLeague, setFilterLeague] = useState<League | 'All'>('All');
    const [copied, setCopied] = useState<'link' | 'embed' | null>(null);

    const loadData = useCallback(async () => {
        if (!username) return;
        setLoading(true);
        setError(null);
        try {
            const user = await withRetry(
                async () => {
                    const u = await fetchPublicProfile(username);
                    if (u) {
                        const cards = await fetchPublicInventory(u.id);
                        return { user: u, cards };
                    }
                    return { user: null, cards: [] };
                },
                { maxAttempts: 3, initialDelayMs: 400, timeoutMs: 15_000 }
            );
            if (user.user) {
                setProfile(user.user);
                setInventory(user.cards);
            } else {
                setProfile(null);
                setInventory([]);
            }
        } catch (err) {
            logger.error('Failed to load public profile', err);
            setError(err instanceof Error ? err.message : 'Failed to load portfolio.');
            addToast('error', 'Could not load portfolio. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [username, addToast]);

    useEffect(() => {
        if (!username) {
            setLoading(false);
            return;
        }
        void loadData();
    }, [loadData, username]);

    const copyLink = () => {
        if (username) {
            navigator.clipboard.writeText(generateShareLink(username));
            setCopied('link');
            setTimeout(() => setCopied(null), 2000);
        }
    };

    const copyEmbed = () => {
        if (username) {
            navigator.clipboard.writeText(buildIframeEmbedSnippet(username));
            setCopied('embed');
            setTimeout(() => setCopied(null), 2000);
        }
    };

    const filteredInventory = inventory.filter(c => {
        const matchesSearch = c.player.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.set.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLeague = filterLeague === 'All' || c.league === filterLeague;
        return matchesSearch && matchesLeague;
    });

    if (usernameError || !usernameParam) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Shield size={64} className="text-red-500/80 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Invalid username</h2>
                <p className="text-slate-400 mb-6">{usernameError ?? 'Username is required.'}</p>
                <Link to="/" className="px-6 py-3 bg-brand-lime text-brand-charcoal font-bold rounded-xl uppercase tracking-widest hover:bg-brand-green transition-colors">Return to Base</Link>
            </div>
        );
    }

    if (loading && !profile) {
        return <div className="flex items-center justify-center h-full text-brand-lime animate-pulse">Loading Asset Data...</div>;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Shield size={64} className="text-red-500/80 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Could not load portfolio</h2>
                <p className="text-slate-400 mb-6">{error}</p>
                <div className="flex gap-4">
                    <button type="button" onClick={() => void loadData()} className="px-6 py-3 bg-brand-lime text-brand-charcoal font-bold rounded-xl uppercase tracking-widest hover:bg-white transition-colors">Retry</button>
                    <Link to="/" className="px-6 py-3 bg-slate-700 text-white font-bold rounded-xl uppercase tracking-widest hover:bg-slate-600 transition-colors">Return to Base</Link>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <Shield size={64} className="text-slate-600 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Portfolio Not Found</h2>
                <p className="text-slate-400">The user @{username ?? usernameParam} does not exist or has a private portfolio.</p>
                <Link to="/" className="mt-8 px-6 py-3 bg-brand-lime text-brand-charcoal font-bold rounded-xl uppercase tracking-widest hover:bg-brand-green transition-colors">Return to Base</Link>
            </div>
        );
    }

    const widgetPreview = username
        ? generateEmbedCode(buildShareableCollectionPreview(inventory, {
            ownerName: profile.displayName || profile.username,
            title: `${profile.displayName || profile.username} collection`,
            description: profile.bio || 'Public collection snapshot',
        }))
        : '';

    return (
        <div className={`mx-auto space-y-8 ${isEmbed ? 'max-w-xl p-3' : 'max-w-[1920px]'}`}>
            {isEmbed && (
                <p className="text-[10px] text-slate-500 font-semibold">{PORTFOLIO_EMBED_DISCLOSURE}</p>
            )}
            {/* Profile Header */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 backdrop-blur-sm">
                <div className="relative">
                    <img
                        src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${profile.displayName}&background=random`}
                        alt={profile.username}
                        className="w-24 h-24 rounded-full border-4 border-brand-charcoal shadow-2xl"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-brand-lime text-brand-charcoal text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border-2 border-brand-charcoal">
                        Alpha {profile.alphaScore}
                    </div>
                </div>
                <div className="flex-1 text-center md:text-left space-y-2">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight">{profile.displayName}</h1>
                    <p className="text-brand-lime font-mono text-sm">@{profile.username}</p>
                    <p className="text-slate-400 max-w-lg">{profile.bio}</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-center px-6 py-3 bg-brand-charcoal/50 rounded-2xl border border-slate-700">
                        <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest mb-1">Portfolio Value</p>
                        <p className="text-2xl font-mono font-bold text-white">${profile.portfolioValue.toLocaleString()}</p>
                    </div>
                    <div className="text-center px-6 py-3 bg-brand-charcoal/50 rounded-2xl border border-slate-700">
                        <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest mb-1">ROI</p>
                        <p className={`text-2xl font-mono font-bold ${profile.roi >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                            {profile.roi >= 0 ? '+' : ''}{profile.roi}%
                        </p>
                    </div>
                </div>
                {!isEmbed && (
                    <div className="flex gap-2">
                        <button type="button" onClick={copyLink} className="p-4 bg-brand-lime text-brand-charcoal rounded-2xl hover:bg-white transition-colors" aria-label="Copy share link">
                            {copied === 'link' ? <CheckCircle2 size={24} /> : <Share2 size={24} />}
                        </button>
                        <button type="button" onClick={copyEmbed} className="p-4 bg-slate-800 text-brand-lime rounded-2xl hover:bg-slate-700 transition-colors" aria-label="Copy embed snippet">
                            {copied === 'embed' ? <CheckCircle2 size={24} /> : <Code2 size={24} />}
                        </button>
                    </div>
                )}
            </div>

            {!isEmbed && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
                <div className="flex items-center gap-2">
                    <Code2 size={16} className="text-brand-lime" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Iframe embed snippet</span>
                </div>
                <p className="text-[10px] text-slate-500">{PORTFOLIO_EMBED_DISCLOSURE}</p>
                <pre className="text-[10px] font-mono text-slate-400 bg-black/40 rounded-xl p-3 overflow-x-auto whitespace-pre-wrap">{username ? buildIframeEmbedSnippet(username) : ''}</pre>
                {widgetPreview && (
                    <iframe title="Static widget preview" srcDoc={widgetPreview} sandbox="" className="w-full h-64 border border-slate-800 rounded-xl" />
                )}
            </div>
            )}

            {/* Controls */}
            <div className={`flex flex-col md:flex-row gap-4 items-center justify-between ${isEmbed ? '' : 'sticky top-0 z-20'} bg-brand-charcoal/95 backdrop-blur-xl py-4 border-b border-slate-800/50`}>
                <div className="flex flex-1 gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:max-w-md group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-brand-lime transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search assets..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-slate-200 focus:outline-none focus:border-brand-lime/50 focus:ring-1 focus:ring-brand-lime/50 transition-all placeholder:text-slate-600"
                        />
                    </div>
                    <div className="flex gap-2">
                        {LEAGUES.map(league => (
                            <button
                                key={league}
                                onClick={() => setFilterLeague(league === filterLeague ? 'All' : league as League)}
                                className={`px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${filterLeague === league
                                    ? 'bg-brand-lime text-brand-charcoal shadow-[0_0_20px_rgba(132,204,22,0.3)]'
                                    : 'bg-slate-900/50 text-slate-500 hover:bg-slate-800 hover:text-slate-300 border border-slate-800'
                                    }`}
                            >
                                {league}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-brand-charcoal text-brand-lime shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-brand-charcoal text-brand-lime shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <ListIcon size={20} />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 pb-20">
                {filteredInventory.map(card => {
                    const tier = getRarityTier(card);
                    const styles = getTierStyles(tier);
                    return (
                        <div key={card.id} className={`group bg-brand-slate border ${styles.border} rounded-[2.5rem] overflow-hidden relative opacity-90 hover:opacity-100 hover:scale-[1.01] transition-all duration-300`}>
                            <div className="aspect-[4/5] bg-slate-950 relative overflow-hidden">
                                <CardImage
                                    src={card.image}
                                    playerName={card.player}
                                    year={card.year}
                                    manufacturer={card.manufacturer}
                                    className="w-full h-full"
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t ${styles.glow || 'from-black/80'} via-transparent to-transparent opacity-60`}></div>
                                <div className="absolute top-6 left-6 flex flex-col gap-2">
                                    {card.isGraded && (
                                        <div className="bg-brand-lime text-brand-charcoal px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest shadow-xl">
                                            {card.gradingCompany} {card.grade}
                                        </div>
                                    )}
                                </div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <span className={`text-[9px] font-black ${styles.text} uppercase tracking-widest mb-1 block`}>{card.sport}</span>
                                    <h3 className="text-xl font-bold text-white leading-tight truncate">{card.player}</h3>
                                    <p className="text-xs text-slate-300 mt-1">{card.year} {card.manufacturer} {card.set}</p>
                                </div>
                            </div>
                            {/* Read Only Footer */}
                            <div className="p-6 bg-brand-charcoal/50 border-t border-slate-800">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-[9px] font-black text-brand-muted uppercase tracking-tighter mb-0.5">Est. Value</p>
                                        <p className="text-lg font-mono font-bold text-white">${card.currentValue?.toLocaleString() || '—'}</p>
                                    </div>
                                    {card.popCount !== undefined && (
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-brand-muted uppercase tracking-tighter mb-0.5">Scarcity</p>
                                            <span className="text-xs font-bold text-brand-lime px-2 py-0.5 bg-brand-lime/10 rounded">Pop {card.popCount}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PublicPortfolio;
