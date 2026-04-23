// @ts-nocheck
import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface SparklineProps {
    data: number[];
    color?: string;
    height?: number;
    showTrend?: boolean;
}

/**
 * Lightweight inline sparkline chart for price history visualization
 */
const Sparkline: React.FC<SparklineProps> = ({
    data,
    color = '#D9F99D',
    height = 40,
    showTrend = false
}) => {
    // Need at least 2 points to render a meaningful chart
    if (data.length < 2) {
        return (
            <div
                className="flex items-center justify-center text-[9px] text-brand-muted font-medium"
                style={{ height }}
            >
                Awaiting data...
            </div>
        );
    }

    const chartData = data.map((value, index) => ({ value, index }));

    // Calculate trend
    const first = data[0];
    const last = data[data.length - 1];
    const isUp = last > first;
    const trendColor = isUp ? '#22C55E' : '#EF4444';
    const displayColor = showTrend ? trendColor : color;

    return (
        <div style={{ height }} className="w-full relative">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
                    <defs>
                        <linearGradient id={`sparkGradient-${displayColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={displayColor} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={displayColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={displayColor}
                        strokeWidth={2}
                        fill={`url(#sparkGradient-${displayColor.replace('#', '')})`}
                        dot={false}
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Sparkline;
