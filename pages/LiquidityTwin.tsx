import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRightLeft, Clock3, Layers3, RadioTower, Wallet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSupabaseInventory } from '../lib/useSupabaseInventory';
import { buildLiquidityTwinAssets, getLiquidityTwinOrderBook, getPortfolioLiquiditySummary, LiquidityTwinAssetView } from '../lib/fiveDifferentiatorService';
import { CardInventory } from '../types';

const formatCurrency = (value?: number) => value ? `$${Math.round(value).toLocaleString()}` : 'N/A';

const LiquidityTwin: React.FC = () => {
  const { user } = useAuth();
  const { inventory } = useSupabaseInventory();
  const [assets, setAssets] = useState<LiquidityTwinAssetView[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardInventory | null>(null);
  const [orderBook, setOrderBook] = useState<Awaited<ReturnType<typeof getLiquidityTwinOrderBook>>>(null);
  const [portfolioLiquidity, setPortfolioLiquidity] = useState<Awaited<ReturnType<typeof getPortfolioLiquiditySummary>> | null>(null);

  useEffect(() => {
    const load = async () => {
      const activeInventory = inventory.filter(card => card.status !== 'sold');
      const [nextAssets, nextPortfolio] = await Promise.all([
        buildLiquidityTwinAssets(activeInventory, user?.id),
        getPortfolioLiquiditySummary(activeInventory),
      ]);
      setAssets(nextAssets);
      setPortfolioLiquidity(nextPortfolio);
      setSelectedCard(activeInventory[0] || null);
    };
    void load();
  }, [inventory, user?.id]);

  useEffect(() => {
    const loadOrderBook = async () => {
      if (!selectedCard) {
        setOrderBook(null);
        return;
      }
      setOrderBook(await getLiquidityTwinOrderBook(selectedCard));
    };
    void loadOrderBook();
  }, [selectedCard]);

  const summary = useMemo(() => {
    if (!portfolioLiquidity) {
      return { overallScore: 0, estimatedLiquidValue: 0, avgDaysToSell: 0 };
    }
    return portfolioLiquidity;
  }, [portfolioLiquidity]);

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-violet-300">
            <Layers3 size={12} />
            Liquidity Twin
          </div>
          <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">Exit Intelligence & Venue Routing</h1>
          <p className="max-w-3xl text-sm text-slate-400">
            Synthetic spreads, time-to-exit guidance, private-room eligibility, and venue recommendations for real liquidation planning.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Wallet size={12} className="text-brand-lime" />
            Liquid Value
          </div>
          <div className="text-2xl font-bold text-white">{formatCurrency(summary.estimatedLiquidValue)}</div>
          <p className="mt-1 text-xs text-slate-500">Estimated value available under current liquidity conditions</p>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <RadioTower size={12} className="text-sky-400" />
            Portfolio Score
          </div>
          <div className="text-2xl font-bold text-sky-300">{summary.overallScore || 0}/100</div>
          <p className="mt-1 text-xs text-slate-500">Portfolio-wide liquidity grade across active positions</p>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Clock3 size={12} className="text-amber-400" />
            Avg Days To Exit
          </div>
          <div className="text-2xl font-bold text-amber-300">{Math.round(summary.avgDaysToSell || 0)}d</div>
          <p className="mt-1 text-xs text-slate-500">Expected time to sell across the liquid portion of the portfolio</p>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <ArrowRightLeft size={12} className="text-emerald-400" />
            Recommended Route
          </div>
          <div className="text-2xl font-bold capitalize text-emerald-300">{assets[0]?.recommendedVenue || 'internal'}</div>
          <p className="mt-1 text-xs text-slate-500">Best venue for the most exit-ready position right now</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-3xl border border-slate-700/50 bg-slate-900/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Exit Queue</h2>
              <p className="text-xs text-slate-500">Assets ranked by time-to-exit and actionable venue fit</p>
            </div>
          </div>
          <div className="space-y-3">
            {assets.map(asset => (
              <button
                key={asset.assetId}
                onClick={() => setSelectedCard(inventory.find(card => card.id === asset.assetId) || null)}
                className={`w-full rounded-2xl border p-4 text-left transition-all ${
                  selectedCard?.id === asset.assetId ? 'border-brand-lime/50 bg-brand-lime/5' : 'border-slate-700/50 bg-slate-950/40 hover:border-slate-500/50'
                }`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{asset.assetName}</h3>
                    <p className="text-xs text-slate-500">Recommended venue: <span className="font-bold capitalize text-slate-300">{asset.recommendedVenue}</span></p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-500">Liquidity</div>
                      <div className="font-bold text-sky-300">{asset.liquidityScore}/100</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-500">Spread</div>
                      <div className="font-bold text-amber-300">{asset.spreadPct.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-500">Exit</div>
                      <div className="font-bold text-emerald-300">{asset.timeToExitDays}d</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-500">Demand</div>
                      <div className="font-bold text-violet-300">{asset.activeListings}L / {asset.openOffers}O</div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-700/50 bg-slate-900/50 p-6">
          <h2 className="text-lg font-bold text-white">Order Book Twin</h2>
          <p className="mb-4 text-xs text-slate-500">Synthetic depth for the selected asset</p>
          {selectedCard && orderBook ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
                <div className="text-sm font-semibold text-white">{selectedCard.player}</div>
                <div className="text-xs text-slate-500">{selectedCard.year} {selectedCard.set}</div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-emerald-500/10 p-2">
                    <div className="text-[10px] uppercase tracking-widest text-slate-500">Best Bid</div>
                    <div className="font-bold text-emerald-300">{formatCurrency(orderBook.bids[0]?.price)}</div>
                  </div>
                  <div className="rounded-xl bg-slate-800/70 p-2">
                    <div className="text-[10px] uppercase tracking-widest text-slate-500">Mid</div>
                    <div className="font-bold text-white">{formatCurrency(orderBook.midpoint)}</div>
                  </div>
                  <div className="rounded-xl bg-red-500/10 p-2">
                    <div className="text-[10px] uppercase tracking-widest text-slate-500">Best Ask</div>
                    <div className="font-bold text-red-300">{formatCurrency(orderBook.asks[0]?.price)}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
                  <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">Bids</div>
                  <div className="space-y-2">
                    {orderBook.bids.slice(0, 4).map(entry => (
                      <div key={`${entry.price}-${entry.quantity}`} className="flex items-center justify-between text-xs">
                        <span className="text-emerald-300">{formatCurrency(entry.price)}</span>
                        <span className="text-slate-500">Qty {entry.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
                  <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-red-400">Asks</div>
                  <div className="space-y-2">
                    {orderBook.asks.slice(0, 4).map(entry => (
                      <div key={`${entry.price}-${entry.quantity}`} className="flex items-center justify-between text-xs">
                        <span className="text-red-300">{formatCurrency(entry.price)}</span>
                        <span className="text-slate-500">Qty {entry.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-700 p-6 text-sm text-slate-500">
              Select an asset with predictive coverage to inspect the synthetic book.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiquidityTwin;
