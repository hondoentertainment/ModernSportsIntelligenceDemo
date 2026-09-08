import React from 'react';
import {
  ADJACENT_HOBBY_ASSET_IDS,
  CROSS_ASSET_DATA_SOURCE,
  getAdjacentHobbyAssets,
} from '../lib/utils/crossAssetService';

interface AdjacentHobbyMarketsRailProps {
  compact?: boolean;
  nested?: boolean;
  correlations?: { asset: string; label: string; correlation90d: number }[];
}

export const AdjacentHobbyMarketsRail: React.FC<AdjacentHobbyMarketsRailProps> = ({
  compact = false,
  nested = false,
  correlations,
}) => {
  const assets = getAdjacentHobbyAssets();
  const Frame = nested ? 'div' : 'aside';

  return (
    <Frame
      role={nested ? undefined : 'status'}
      aria-label="Adjacent hobby markets"
      className={`rounded-xl border border-indigo-500/25 bg-indigo-500/5 ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}
    >
      <p className={`font-black uppercase tracking-widest text-indigo-300 ${compact ? 'text-[9px]' : 'text-[10px]'}`}>
        Adjacent hobby markets (seeded)
      </p>
      <p className={`text-slate-400 leading-relaxed mt-1 ${compact ? 'text-[10px]' : 'text-xs'}`}>
        Pokémon, Magic: The Gathering, and memorabilia are disclosed synthetic proxies — not live auction, TCGPlayer, or eBay feeds.
      </p>
      <div className={`mt-2 flex flex-wrap gap-2 ${compact ? '' : 'mt-3'}`}>
        {assets.map((asset) => {
          const corr = correlations?.find((row) => row.asset === asset.id);
          return (
            <span
              key={asset.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-[10px] text-slate-200"
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: asset.color }} />
              <span className="font-semibold">{asset.name.replace(' (seeded)', '')}</span>
              {corr ? (
                <span className="font-mono text-slate-400">r={corr.correlation90d.toFixed(2)}</span>
              ) : (
                <span className="font-mono text-slate-500">{asset.returns1Y >= 0 ? '+' : ''}{asset.returns1Y.toFixed(1)}% 1Y</span>
              )}
            </span>
          );
        })}
      </div>
      {!compact && (
        <p className="sr-only">
          {CROSS_ASSET_DATA_SOURCE} Tracked ids: {ADJACENT_HOBBY_ASSET_IDS.join(', ')}.
        </p>
      )}
    </Frame>
  );
};

export default AdjacentHobbyMarketsRail;
