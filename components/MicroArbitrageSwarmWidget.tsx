// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Radio, TrendingDown, MapPin, Eye, ArrowRight, Zap } from 'lucide-react';
import {
  getNearbyDeals,
  getArbitrageOpportunities,
  getSightings,
  type PriceSighting,
  type ArbitrageOpportunity,
  SIGHTING_SOURCE_LABELS,
} from '../lib/analytics/microArbitrageSwarmService';

interface MicroArbitrageSwarmWidgetProps {
  onViewAll?: () => void;
}

export default function MicroArbitrageSwarmWidget({ onViewAll }: MicroArbitrageSwarmWidgetProps) {
  const [loading, setLoading] = useState(true);
  const [nearbyCount, setNearbyCount] = useState(0);
  const [bestArbitrage, setBestArbitrage] = useState<ArbitrageOpportunity | null>(null);
  const [latestSighting, setLatestSighting] = useState<PriceSighting | null>(null);

  useEffect(() => {
    setTimeout(() => {
      const nearby = getNearbyDeals(41.88, -87.63, 300);
      setNearbyCount(nearby.length);
      const opps = getArbitrageOpportunities();
      if (opps.length > 0) setBestArbitrage(opps[0]);
      const sightings = getSightings();
      if (sightings.length > 0) setLatestSighting(sightings[0]);
      setLoading(false);
    }, 300);
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-4 animate-pulse">
        <div className="h-5 w-48 bg-slate-700 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-slate-700 rounded" />
          <div className="h-4 w-3/4 bg-slate-700 rounded" />
          <div className="h-4 w-1/2 bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Radio className="w-4 h-4 text-green-400" />
          Swarm Network
        </h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            View All <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* Nearby Deals */}
        <div className="flex items-center justify-between bg-slate-700/30 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-300">Nearby Deals</span>
          </div>
          <span className="text-sm font-bold text-blue-400">{nearbyCount}</span>
        </div>

        {/* Best Arbitrage */}
        {bestArbitrage && (
          <div className="flex items-center justify-between bg-slate-700/30 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-300">Best Arbitrage</span>
            </div>
            <span className="text-sm font-bold text-emerald-400">
              -{bestArbitrage.deltaPercent.toFixed(0)}%
            </span>
          </div>
        )}

        {/* Latest Sighting */}
        {latestSighting && (
          <div className="bg-slate-700/30 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-slate-400">Latest Sighting</span>
            </div>
            <p className="text-xs text-slate-200 truncate">{latestSighting.player}</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-slate-400">
                {SIGHTING_SOURCE_LABELS[latestSighting.source]}
              </span>
              <span className="text-xs font-semibold text-green-400">${latestSighting.price}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
