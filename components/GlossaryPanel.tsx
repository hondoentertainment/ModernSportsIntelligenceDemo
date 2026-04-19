import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { X, Search, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react';
import { store } from '../lib/dal/syncStore';

// ─── Storage ────────────────────────────────────────────────────────────────
const GLOSSARY_FEEDBACK_KEY = 'msi_glossary_feedback';

// ─── Types ──────────────────────────────────────────────────────────────────
interface GlossaryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type Category = 'Financial' | 'Grading' | 'Card Market' | 'Trading';

interface GlossaryTerm {
  term: string;
  category: Category;
  definition: string;
  detail?: string;
}

const CATEGORY_COLORS: Record<Category, string> = {
  Financial: 'bg-blue-500/10 text-blue-400',
  Grading: 'bg-purple-500/10 text-purple-400',
  'Card Market': 'bg-amber-500/10 text-amber-400',
  Trading: 'bg-green-500/10 text-green-400',
};

// ─── Glossary Data ──────────────────────────────────────────────────────────
const TERMS: GlossaryTerm[] = [
  // Financial
  { term: 'Alpha', category: 'Financial', definition: 'Excess return of a portfolio relative to a benchmark index.', detail: 'A positive alpha indicates the portfolio outperformed the benchmark, suggesting skilled selection. In cards, alpha measures how your picks perform vs. the broader market.' },
  { term: 'Beta', category: 'Financial', definition: 'Measure of a card or portfolio\'s volatility relative to the overall market.', detail: 'A beta of 1.0 means the card moves with the market. Higher than 1.0 indicates more volatility; lower indicates less. Rookie cards tend to have higher beta.' },
  { term: 'Capital Gains', category: 'Financial', definition: 'Profit earned from selling a card for more than its purchase price.', detail: 'Short-term capital gains (held less than a year) are taxed at ordinary income rates. Long-term gains receive preferential tax treatment.' },
  { term: 'Correlation', category: 'Financial', definition: 'Statistical relationship between price movements of two assets.', detail: 'A correlation of +1 means assets move together perfectly; -1 means they move inversely. Low correlation between cards improves portfolio diversification.' },
  { term: 'Cost Basis', category: 'Financial', definition: 'The original purchase price of a card, used for tax calculations.', detail: 'Includes the purchase price plus any associated costs like grading fees, shipping, or auction premiums. Accurate cost basis tracking is essential for tax reporting.' },
  { term: 'Diversification', category: 'Financial', definition: 'Spreading investments across multiple sports, players, and eras to reduce risk.', detail: 'A well-diversified card portfolio might include cards across multiple sports, eras, price points, and grading services to minimize the impact of any single loss.' },
  { term: 'Drawdown', category: 'Financial', definition: 'Peak-to-trough decline in portfolio value before a new high is reached.', detail: 'Maximum drawdown measures the worst historical loss. A 30% drawdown means the portfolio fell 30% from its peak before recovering. Critical for risk assessment.' },
  { term: 'Hedge', category: 'Financial', definition: 'A position taken to offset potential losses in another investment.', detail: 'In cards, hedging might mean holding graded and raw versions of the same card, or diversifying across sports to offset seasonal risk.' },
  { term: 'Monte Carlo', category: 'Financial', definition: 'Simulation technique using random sampling to model portfolio outcomes.', detail: 'Runs thousands of random scenarios based on historical volatility to estimate the range of possible future portfolio values. Core to MSI stress testing.' },
  { term: 'P&L', category: 'Financial', definition: 'Profit and Loss — the net gain or loss on your portfolio or individual cards.', detail: 'Unrealized P&L is the gain/loss if you sold at current market price. Realized P&L is from completed sales. Track both for portfolio health.' },
  { term: 'ROI', category: 'Financial', definition: 'Return on Investment — percentage gain relative to the amount invested.', detail: 'Calculated as (Current Value - Cost Basis) / Cost Basis * 100. A $100 card now worth $150 has a 50% ROI.' },
  { term: 'Sharpe Ratio', category: 'Financial', definition: 'Risk-adjusted return metric comparing excess return to volatility.', detail: 'Higher Sharpe ratios indicate better risk-adjusted performance. A ratio above 1.0 is good; above 2.0 is very good. Helps compare portfolios with different risk levels.' },
  { term: 'VaR', category: 'Financial', definition: 'Value at Risk — maximum expected loss over a given period at a confidence level.', detail: 'A 95% VaR of $5,000 means there is a 5% chance of losing more than $5,000 in the specified timeframe. Used in MSI stress testing.' },

  // Grading
  { term: 'BGS', category: 'Grading', definition: 'Beckett Grading Services — major card authentication and grading company.', detail: 'Uses sub-grades for centering, corners, edges, and surface. BGS 9.5 "Gem Mint" and BGS 10 "Pristine" are the top grades, with Black Label 10s being the rarest.' },
  { term: 'Centering', category: 'Grading', definition: 'How well the card image is aligned within the borders.', detail: 'Measured as a ratio (e.g., 55/45 left-right, 60/40 top-bottom). Perfect centering is 50/50 on both axes. Major factor in achieving gem grades.' },
  { term: 'Corners', category: 'Grading', definition: 'Condition of the four corners of a card — sharpness and wear.', detail: 'Graders examine corners under magnification for rounding, fraying, or dings. Even slight corner wear can drop a card from gem mint to near-mint.' },
  { term: 'Crossover', category: 'Grading', definition: 'Submitting a card graded by one service to another for re-grading.', detail: 'Common strategy when collectors believe a card deserves a higher grade from a different company, or to move from SGC/BGS to PSA for market premium.' },
  { term: 'Edges', category: 'Grading', definition: 'Condition of the four edges of a card — chipping, roughness, or wear.', detail: 'Edges are examined for chipping, diamond cuts, and general wear. Modern cards with clean-cut edges score higher than vintage cards with rough factory cuts.' },
  { term: 'Gem Rate', category: 'Grading', definition: 'Percentage of submitted cards that receive a gem mint grade (e.g., PSA 10).', detail: 'Gem rates vary by card year, set, and brand. Modern cards often have 70%+ gem rates, while vintage cards may be under 5%. Lower gem rates increase scarcity and value.' },
  { term: 'Pop Report', category: 'Grading', definition: 'Population count showing how many cards of each grade exist for a specific card.', detail: 'A card with a population of 5 in PSA 10 is far scarcer than one with 5,000. Pop reports are updated as new submissions are graded and directly affect value.' },
  { term: 'PSA', category: 'Grading', definition: 'Professional Sports Authenticator — the largest and most recognized grading service.', detail: 'Uses a 1-10 scale with 10 being "Gem Mint." PSA graded cards typically command the highest market premiums, especially PSA 10s.' },
  { term: 'SGC', category: 'Grading', definition: 'Sportscard Guaranty Corporation — respected grading service known for vintage expertise.', detail: 'Uses a 1-10 scale. Known for consistent and strict grading standards. Their tuxedo holder is distinctive. Growing in popularity as an alternative to PSA.' },
  { term: 'Surface', category: 'Grading', definition: 'Condition of the front and back surface of a card — scratches, print defects.', detail: 'Graders check for scratches, print lines, surface creases, staining, and other defects. Surface issues are often the most common reason cards miss gem grades.' },

  // Card Market
  { term: '1/1', category: 'Card Market', definition: 'A card that is the only one of its kind — the ultimate rarity.', detail: 'One-of-one cards include printing plates, unique parallels, and special serial numbered cards. They command extreme premiums due to absolute scarcity.' },
  { term: 'Auto', category: 'Card Market', definition: 'An autographed card, either on-card or sticker autograph.', detail: 'On-card autographs are signed directly on the card and are generally more valuable. Sticker autos have the signature on a separate sticker applied to the card.' },
  { term: 'Break', category: 'Card Market', definition: 'Group opening where participants buy spots for a chance at cards from sealed product.', detail: 'Types include random team, pick your team, and hit draft. Breaks allow access to expensive products at fractional cost but involve randomness.' },
  { term: 'Comp', category: 'Card Market', definition: 'Comparable sale — a recent transaction used to estimate a card\'s market value.', detail: 'The most reliable pricing method. Look at recent sales of the same card in the same grade on platforms like eBay, PWCC, and Goldin to establish fair market value.' },
  { term: 'Hobby Box', category: 'Card Market', definition: 'Premium sealed product sold through card shops, with guaranteed hits.', detail: 'Hobby boxes typically guarantee autographs, memorabilia cards, or numbered parallels. They are more expensive than retail but offer better odds at premium inserts.' },
  { term: 'Lot', category: 'Card Market', definition: 'A group of cards sold together as a single unit.', detail: 'Lots can be themed (same player, team, or set) or mixed. Buying lots can offer value but requires careful evaluation of individual card conditions and values.' },
  { term: 'Parallel', category: 'Card Market', definition: 'A variant of a base card with different color, finish, or numbering.', detail: 'Parallels create a rarity hierarchy: base, silver, gold, green (/75), blue (/25), red (/10), black (1/1). Lower numbered parallels are more valuable.' },
  { term: 'Patch', category: 'Card Market', definition: 'A memorabilia card containing a piece of game-worn or event-worn jersey.', detail: 'Multi-color patches (showing team logo pieces) are most valuable. Patch cards are authenticated by the manufacturer and embedded during card production.' },
  { term: 'Refractor', category: 'Card Market', definition: 'A card with a special reflective, prismatic finish created by Topps.', detail: 'Introduced in 1993 Topps Finest. Refractors come in multiple variants: base refractor, gold, orange, red, superfractor (1/1). Among the most collected parallel types.' },
  { term: 'Retail', category: 'Card Market', definition: 'Sealed product available at mass-market stores like Target and Walmart.', detail: 'Retail products have lower price points but fewer guaranteed hits compared to hobby. Blaster boxes, hangers, and mega boxes are common retail formats.' },
  { term: 'RPA', category: 'Card Market', definition: 'Rookie Patch Autograph — premium card combining a rookie card with patch and signature.', detail: 'RPAs are the pinnacle of modern sports cards. National Treasures and Flawless RPAs of top rookies are among the most valuable modern cards produced.' },
  { term: 'SP', category: 'Card Market', definition: 'Short Print — a card produced in lower quantities than base cards.', detail: 'Short prints are intentionally scarcer, making them harder to find and more valuable. Often identified by different photo variations or higher card numbers.' },
  { term: 'SSP', category: 'Card Market', definition: 'Super Short Print — even scarcer than a short print, extremely limited production.', detail: 'SSPs are among the hardest cards to pull from packs. In sets like Topps Chrome, SSP image variations can be worth 50-100x the base card value.' },
  { term: 'Wax', category: 'Card Market', definition: 'Slang for sealed/unopened packs or boxes of cards.', detail: 'Originally referred to the wax paper wrapping on vintage packs. Now used broadly for any sealed product. "Ripping wax" means opening packs.' },

  // Trading
  { term: 'Arbitrage', category: 'Trading', definition: 'Profiting from price differences of the same card across different platforms.', detail: 'Buy a card for $80 on eBay, sell for $100 on COMC. Platform arbitrage exploits inefficiencies in pricing across marketplaces. MSI tracks cross-platform spreads.' },
  { term: 'Bid-Ask Spread', category: 'Trading', definition: 'Difference between the highest price a buyer will pay and the lowest a seller will accept.', detail: 'Narrow spreads indicate liquid, efficiently priced cards. Wide spreads suggest illiquidity or disagreement on value. Important for timing buys and sells.' },
  { term: 'Liquidity', category: 'Trading', definition: 'How quickly and easily a card can be sold at its fair market value.', detail: 'PSA 10 rookies of star players are highly liquid. Obscure vintage cards may take weeks to sell. Liquidity affects portfolio flexibility and risk.' },
  { term: 'Market Depth', category: 'Trading', definition: 'The volume of buy and sell interest at various price levels for a card.', detail: 'Deep markets have many buyers and sellers, making prices stable. Thin markets can see large price swings from a single transaction.' },
  { term: 'Tax-Loss Harvesting', category: 'Trading', definition: 'Selling cards at a loss to offset capital gains and reduce tax liability.', detail: 'Strategic selling of underperforming cards to realize losses that offset gains from winners. Can save significant amounts on annual tax bills. MSI automates identification.' },
  { term: 'Wash Sale', category: 'Trading', definition: 'Selling a card at a loss and repurchasing the same card within 30 days.', detail: 'IRS wash sale rules may disallow the tax loss if you rebuy a substantially identical card within 30 days. Important to track when tax-loss harvesting.' },
];

// ─── Component ──────────────────────────────────────────────────────────────
const GlossaryPanel: React.FC<GlossaryPanelProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, 'up' | 'down'>>(() =>
    store.get<Record<string, 'up' | 'down'>>(GLOSSARY_FEEDBACK_KEY, {})
  );
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Persist feedback
  useEffect(() => {
    store.set(GLOSSARY_FEEDBACK_KEY, feedback);
  }, [feedback]);

  const handleFeedback = useCallback((term: string, type: 'up' | 'down') => {
    setFeedback((prev) => {
      const next = { ...prev };
      if (next[term] === type) {
        delete next[term];
      } else {
        next[term] = type;
      }
      return next;
    });
  }, []);

  const filteredTerms = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return TERMS
      .filter((t) => {
        if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
        if (q && !t.term.toLowerCase().includes(q) && !t.definition.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [searchQuery, categoryFilter]);

  // Group by first letter
  const grouped = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};
    filteredTerms.forEach((t) => {
      const letter = t.term[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(t);
    });
    return groups;
  }, [filteredTerms]);

  const categories: (Category | 'All')[] = ['All', 'Financial', 'Grading', 'Card Market', 'Trading'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div
        ref={panelRef}
        className="absolute top-0 right-0 h-full w-[400px] max-w-full bg-slate-900/[0.98] backdrop-blur-xl border-l border-slate-700/60 shadow-2xl flex flex-col"
        style={{ animation: 'glossarySlideIn 0.25s ease-out' }}
      >
        <style>{`
          @keyframes glossarySlideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <div>
            <h2 className="font-bebas text-xl text-white tracking-wide">Glossary</h2>
            <p className="text-[10px] text-slate-500">{TERMS.length} terms</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-600 hover:text-white transition-colors rounded-lg hover:bg-brand-charcoal"
            aria-label="Close glossary"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-3 flex-shrink-0">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              placeholder="Search terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-charcoal border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-brand-lime/50 focus:outline-none transition-colors"
              autoFocus
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="px-5 pb-3 flex-shrink-0">
          <div className="flex gap-1.5 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                  categoryFilter === cat
                    ? 'bg-brand-lime/15 text-brand-lime border border-brand-lime/30'
                    : 'bg-brand-charcoal text-slate-500 border border-slate-800 hover:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Terms list */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 scrollbar-thin">
          {Object.keys(grouped).length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search size={32} className="text-slate-700 mb-3" />
              <p className="text-sm text-slate-500">No terms found</p>
              <p className="text-[10px] text-slate-600 mt-1">Try a different search or filter</p>
            </div>
          )}

          {Object.entries(grouped).map(([letter, terms]) => (
            <div key={letter} className="mb-4">
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm py-1 z-10">
                <span className="text-[10px] font-black text-brand-lime uppercase tracking-widest">
                  {letter}
                </span>
              </div>

              <div className="space-y-1.5">
                {terms.map((t) => {
                  const isExpanded = expandedTerm === t.term;
                  const termFeedback = feedback[t.term];

                  return (
                    <div
                      key={t.term}
                      className={`rounded-xl border transition-all duration-200 ${
                        isExpanded
                          ? 'bg-brand-charcoal border-slate-600'
                          : 'bg-brand-charcoal/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Term header */}
                      <button
                        onClick={() => setExpandedTerm(isExpanded ? null : t.term)}
                        className="w-full flex items-start gap-3 px-3.5 py-3 text-left"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-white">{t.term}</span>
                            <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${CATEGORY_COLORS[t.category]}`}>
                              {t.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{t.definition}</p>
                        </div>
                        <div className="flex-shrink-0 mt-1 text-slate-600">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </button>

                      {/* Expanded detail */}
                      {isExpanded && t.detail && (
                        <div className="px-3.5 pb-3 border-t border-slate-800 pt-2.5">
                          <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                            {t.detail}
                          </p>

                          {/* Feedback */}
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] text-slate-600 uppercase tracking-widest">
                              Was this helpful?
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFeedback(t.term, 'up');
                              }}
                              className={`p-1 rounded transition-colors ${
                                termFeedback === 'up'
                                  ? 'text-brand-lime bg-brand-lime/10'
                                  : 'text-slate-600 hover:text-slate-400'
                              }`}
                              aria-label="Helpful"
                            >
                              <ThumbsUp size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFeedback(t.term, 'down');
                              }}
                              className={`p-1 rounded transition-colors ${
                                termFeedback === 'down'
                                  ? 'text-red-400 bg-red-400/10'
                                  : 'text-slate-600 hover:text-slate-400'
                              }`}
                              aria-label="Not helpful"
                            >
                              <ThumbsDown size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlossaryPanel;
