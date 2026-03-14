import React from 'react';
import { TargetWatchlist, CardInventory } from '../types';
import { ArbitrageService } from '../lib/ArbitrageService';
import { Sparkles, TrendingDown, Clock, Activity } from 'lucide-react';

interface OpportunityBadgeProps {
    asset: CardInventory | TargetWatchlist;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export const OpportunityBadge: React.FC<OpportunityBadgeProps> = ({
    asset,
    size = 'md',
    showLabel = true
}) => {
    const { score, delta } = asset.opportunityScore !== undefined
        ? { score: asset.opportunityScore, delta: asset.arbitrageDelta || 0 }
        : ArbitrageService.evaluateOpportunity(asset);

    const getOpportunityStyle = (s: number, d: number) => {
        // Flash Sale / Deep Arbitrage
        if (s >= 80) return {
            label: 'Arbitrage',
            color: '#D9F99D', // Brand Lime
            bg: 'rgba(217, 249, 157, 0.15)',
            border: 'rgba(217, 249, 157, 0.4)',
            icon: <Zap size={iconSize} />,
            glow: 'shadow-[0_0_15px_rgba(217,249,157,0.3)]'
        };
        // Value Play
        if (s >= 65) return {
            label: 'Value Play',
            color: '#FCD34D', // Gold
            bg: 'rgba(252, 211, 77, 0.1)',
            border: 'rgba(252, 211, 77, 0.2)',
            icon: <TrendingDown size={iconSize} />,
            glow: ''
        };
        // Fair Value
        if (s >= 40) return {
            label: 'Fair Value',
            color: '#94A3B8', // Slate 400
            bg: 'rgba(148, 163, 184, 0.1)',
            border: 'rgba(148, 163, 184, 0.2)',
            icon: <Activity size={iconSize} />,
            glow: ''
        };
        // Overvalued
        return {
            label: 'Premium',
            color: '#F87171', // Red 400
            bg: 'rgba(248, 113, 113, 0.1)',
            border: 'rgba(248, 113, 113, 0.2)',
            icon: <Clock size={iconSize} />,
            glow: ''
        };
    };

    const pxSizes = {
        sm: { text: 'text-[9px]', px: 'px-1.5 py-0.5', icon: 10 },
        md: { text: 'text-[10px]', px: 'px-2 py-1', icon: 12 },
        lg: { text: 'text-xs', px: 'px-3 py-1.5', icon: 14 }
    };

    const iconSize = pxSizes[size].icon;
    // Fallback to Sparkles icon to avoid implicit any/undefined Zap error above
    const Zap = Sparkles;

    const style = getOpportunityStyle(score, delta);

    return (
        <div
            className={`inline-flex items-center gap-1.5 rounded-md ${pxSizes[size].px} font-black uppercase tracking-widest ${style.glow} transition-colors cursor-help`}
            style={{
                backgroundColor: style.bg,
                color: style.color,
                border: `1px solid ${style.border}`
            }}
            title={`Score: ${score}/100 | Target Deviation: ${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`}
        >
            {style.icon}
            {showLabel && (
                <span className={pxSizes[size].text}>
                    {style.label} {score >= 80 && <span className="ml-1 opacity-80">({delta.toFixed(0)}%)</span>}
                </span>
            )}
            {!showLabel && size !== 'sm' && (
                <span className={pxSizes[size].text}>{score}</span>
            )}
        </div>
    );
};
