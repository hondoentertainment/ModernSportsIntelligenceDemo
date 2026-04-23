// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { sanitizeHtml } from '../lib/sanitizeHtml';
import {
  X,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  Search,
  FileText,
  Copy,
  CheckCircle2,
  Star,
  BarChart3,
  ArrowRight,
  Percent,
  Tag,
  Clock,
  Eye,
  Layout,
  Sparkles,
  Type,
  Palette,
  AlertCircle,
} from 'lucide-react';
import {
  getListings,
  getTitleSuggestions,
  getPricingSuggestion,
  getTemplates,
  getListingStats,
} from '../lib/utils/ebayListingGeneratorService';
import type {
  ListingDraft,
  TitleSuggestion,
  PricingSuggestion,
  ListingTemplate,
  ListingStats,
} from '../lib/utils/ebayListingGeneratorService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const statusColors: Record<string, string> = {
  draft: 'text-amber-400 bg-amber-500/20',
  ready: 'text-green-400 bg-green-500/20',
  listed: 'text-blue-400 bg-blue-500/20',
};

const formatColors: Record<string, string> = {
  auction: 'text-red-400 bg-red-500/20',
  'buy-it-now': 'text-green-400 bg-green-500/20',
  'best-offer': 'text-blue-400 bg-blue-500/20',
};

type Tab = 'listings' | 'title-builder' | 'pricing' | 'templates';

const EbayListingGeneratorModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('listings');
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [copiedTitle, setCopiedTitle] = useState<string | null>(null);

  const listings = useMemo(() => getListings(), []);
  const titleSuggestions = useMemo(() => getTitleSuggestions(), []);
  const pricing = useMemo(() => getPricingSuggestion(), []);
  const templates = useMemo(() => getTemplates(), []);
  const stats = useMemo(() => getListingStats(), []);

  if (!isOpen) return null;

  const handleCopy = (title: string, id: string) => {
    navigator.clipboard.writeText(title).catch(() => {});
    setCopiedTitle(id);
    setTimeout(() => setCopiedTitle(null), 2000);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'listings', label: 'Listings', icon: <ShoppingBag size={16} /> },
    { id: 'title-builder', label: 'Title Builder', icon: <Type size={16} /> },
    { id: 'pricing', label: 'Pricing', icon: <DollarSign size={16} /> },
    { id: 'templates', label: 'Templates', icon: <Layout size={16} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-brand-charcoal border border-slate-700 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/20">
              <ShoppingBag size={22} className="text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">eBay Listing Generator</h2>
              <p className="text-xs text-slate-400">SEO-optimized listing generation with title builder and HTML templates</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-3 p-4 border-b border-slate-700/50 bg-slate-800/30">
          {[
            { label: 'Listings', value: stats.totalListings.toString(), icon: <ShoppingBag size={14} />, color: 'text-orange-400' },
            { label: 'Avg SEO Score', value: `${stats.avgSeoScore.toFixed(0)}/100`, icon: <Search size={14} />, color: 'text-green-400' },
            { label: 'Sell-Through', value: `${(stats.sellThroughRate * 100).toFixed(0)}%`, icon: <Percent size={14} />, color: 'text-blue-400' },
            { label: 'Avg Days to Sell', value: stats.avgDaysToSell.toFixed(1), icon: <Clock size={14} />, color: 'text-amber-400' },
          ].map((stat, i) => (
            <div key={i} className="bg-slate-800/50 rounded-lg p-3 text-center">
              <div className={`flex items-center justify-center gap-1 text-xs mb-1 ${stat.color}`}>
                {stat.icon} {stat.label}
              </div>
              <div className="text-lg font-bold text-slate-100">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-4 pt-3 border-b border-slate-700/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-700/50 text-orange-400 border-b-2 border-orange-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'listings' && (
            <div className="space-y-3">
              {listings.map(listing => (
                <div key={listing.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${statusColors[listing.status]}`}>
                        {listing.status.toUpperCase()}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${formatColors[listing.format]}`}>
                        {listing.format.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">SEO</span>
                      <span className={`text-sm font-bold ${listing.titleScore >= 90 ? 'text-green-400' : listing.titleScore >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
                        {listing.titleScore}/100
                      </span>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-1">{listing.generatedTitle}</h3>
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">{listing.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-400">Grade: <span className="text-slate-200 font-medium">{listing.grade}</span></span>
                      <span className="text-slate-400">Price: <span className="text-green-400 font-medium">${listing.suggestedPrice.toLocaleString()}</span></span>
                      <span className="text-slate-400">Shipping: <span className="text-slate-200 font-medium">{listing.shippingCost > 0 ? `$${listing.shippingCost}` : 'Free'}</span></span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(listing.generatedTitle, listing.id)}
                        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-slate-300 flex items-center gap-1 transition-colors"
                      >
                        {copiedTitle === listing.id ? <CheckCircle2 size={12} className="text-green-400" /> : <Copy size={12} />}
                        {copiedTitle === listing.id ? 'Copied' : 'Copy Title'}
                      </button>
                      <button className="px-2 py-1 bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 rounded text-xs font-medium transition-colors">
                        Edit
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {listing.keywords.map((kw, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-slate-700/50 text-slate-400 rounded text-[10px]">{kw}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'title-builder' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-orange-400" />
                <span className="text-sm text-slate-400">AI-generated title suggestions ranked by SEO score</span>
              </div>
              {titleSuggestions.map((s, i) => (
                <div key={i} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${s.seoScore >= 90 ? 'text-green-400' : s.seoScore >= 80 ? 'text-amber-400' : 'text-red-400'}`}>
                        {s.seoScore}
                      </span>
                      <span className="text-xs text-slate-500">SEO Score</span>
                    </div>
                    <button
                      onClick={() => handleCopy(s.title, `ts-${i}`)}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs text-slate-300 flex items-center gap-1 transition-colors"
                    >
                      {copiedTitle === `ts-${i}` ? <CheckCircle2 size={12} className="text-green-400" /> : <Copy size={12} />}
                      Copy
                    </button>
                  </div>
                  <p className="text-sm font-medium text-slate-200 mb-2 font-mono bg-slate-800/50 p-2 rounded">{s.title}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>{s.characterCount} chars</span>
                    <span>Keyword density: {(s.keywordDensity * 100).toFixed(0)}%</span>
                    <span className="text-slate-500">{s.reasoning}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
                <h3 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <DollarSign size={16} className="text-green-400" /> Pricing Intelligence
                </h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">Start Price</div>
                    <div className="text-xl font-bold text-slate-200">${pricing.startPrice}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">Buy It Now</div>
                    <div className="text-xl font-bold text-green-400">${pricing.buyItNowPrice}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">Reserve</div>
                    <div className="text-xl font-bold text-amber-400">${pricing.reservePrice}</div>
                  </div>
                </div>
                <div className="mb-4">
                  <h4 className="text-sm text-slate-400 mb-2">Recent Sales</h4>
                  <div className="flex gap-2">
                    {pricing.recentSales.map((sale, i) => (
                      <div key={i} className="bg-slate-800/50 rounded px-3 py-2 text-center flex-1">
                        <div className="text-sm font-medium text-slate-200">${sale}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-orange-400" />
                    <span className="text-sm text-orange-300">{pricing.recommendation}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="grid grid-cols-2 gap-4">
              {templates.map(tmpl => (
                <div key={tmpl.id} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-slate-200">{tmpl.name}</h4>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-amber-400" />
                      <span className="text-xs text-slate-400">{tmpl.popularity}% popular</span>
                    </div>
                  </div>
                  <div
                    className="bg-white rounded-lg p-3 mb-3 text-sm"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(tmpl.previewHtml) }}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 capitalize">{tmpl.style} style</span>
                    <button className="px-3 py-1.5 bg-orange-600/20 text-orange-400 hover:bg-orange-600/30 rounded-lg text-xs font-medium transition-colors">
                      Use Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700/50 bg-slate-800/30">
          <span className="text-xs text-slate-500">Titles optimized for eBay search algorithm — {new Date().toLocaleDateString()}</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm text-slate-300 transition-colors">
              Export All
            </button>
            <button className="px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg text-sm text-white font-semibold transition-colors">
              Generate Listing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EbayListingGeneratorModal;
