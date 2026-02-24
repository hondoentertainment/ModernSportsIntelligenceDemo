import React from 'react';

interface LiquidityBadgeProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export const LiquidityBadge: React.FC<LiquidityBadgeProps> = ({
    score,
    size = 'md',
    showLabel = true
}) => {
    // Determine color and status based on score
    const getLiquidityStatus = (s: number) => {
        if (s >= 70) return { label: 'Liquid', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' };
        if (s >= 40) return { label: 'Moderate', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' };
        return { label: 'Illiquid', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' };
    };

    const status = getLiquidityStatus(score);

    const sizeStyles = {
        sm: { fontSize: '0.7rem', padding: '2px 6px', iconSize: 10 },
        md: { fontSize: '0.8rem', padding: '4px 10px', iconSize: 14 },
        lg: { fontSize: '0.9rem', padding: '6px 14px', iconSize: 18 },
    };

    const currentSize = sizeStyles[size];

    return (
        <div
            className="liquidity-badge"
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: currentSize.padding,
                borderRadius: '20px',
                backgroundColor: status.bg,
                border: `1px solid ${status.color}44`,
                color: status.color,
                fontSize: currentSize.fontSize,
                fontWeight: '600',
                fontFamily: 'Bebas Neue, sans-serif',
                letterSpacing: '0.5px',
                cursor: 'help'
            }}
            title={`MSI Liquidity Score: ${score}/100 - ${status.label}`}
        >
            <div
                style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: status.color,
                    boxShadow: `0 0 8px ${status.color}`,
                    animation: score < 40 ? 'pulse-opacity 2s infinite' : 'none'
                }}
            />
            {showLabel && <span>{status.label} {score}</span>}
            {!showLabel && <span>{score}</span>}

            <style>{`
        @keyframes pulse-opacity {
          0% { opacity: 0.4; }
          50% { opacity: 1; }
          100% { opacity: 0.4; }
        }
      `}</style>
        </div>
    );
};
