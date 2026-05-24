import React from 'react';
import { Radio, Beaker, AlertCircle, FlaskConical } from 'lucide-react';

export type DataSourceVariant = 'live' | 'sample' | 'stale' | 'mock';

interface DataSourceBadgeProps {
    variant: DataSourceVariant;
    label?: string;
    size?: 'xs' | 'sm';
    className?: string;
}

interface VariantConfig {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    defaultLabel: string;
    text: string;
    bg: string;
    border: string;
    pulse: boolean;
}

const VARIANT_CONFIG: Record<DataSourceVariant, VariantConfig> = {
    live: {
        icon: Radio,
        defaultLabel: 'Live',
        text: 'text-brand-lime',
        bg: 'bg-brand-lime/10',
        border: 'border-brand-lime/30',
        pulse: true,
    },
    sample: {
        icon: FlaskConical,
        defaultLabel: 'Sample',
        text: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        pulse: false,
    },
    stale: {
        icon: AlertCircle,
        defaultLabel: 'Stale',
        text: 'text-slate-300',
        bg: 'bg-slate-500/10',
        border: 'border-slate-500/30',
        pulse: false,
    },
    mock: {
        icon: Beaker,
        defaultLabel: 'Demo data',
        text: 'text-rose-400',
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        pulse: false,
    },
};

const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({
    variant,
    label,
    size = 'sm',
    className = '',
}) => {
    const config = VARIANT_CONFIG[variant];
    const Icon = config.icon;
    const displayLabel = label ?? config.defaultLabel;
    const iconSize = size === 'xs' ? 9 : 10;
    const typography = size === 'xs'
        ? 'text-[9px] font-black uppercase tracking-widest'
        : 'text-[10px] font-black uppercase tracking-widest';
    const padding = size === 'xs' ? 'px-1.5 py-0.5' : 'px-2 py-0.5';

    return (
        <span
            role="status"
            aria-label={displayLabel}
            className={`inline-flex items-center gap-1 rounded-full border ${config.bg} ${config.border} ${config.text} ${typography} ${padding} ${className}`}
        >
            <Icon
                size={iconSize}
                className={config.pulse ? 'animate-pulse' : undefined}
            />
            <span>{displayLabel}</span>
        </span>
    );
};

export default DataSourceBadge;
