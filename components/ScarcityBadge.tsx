
import React from 'react';
import { PopReport } from '../types';
import { Award, Shield, Zap } from 'lucide-react';

interface ScarcityBadgeProps {
    report?: PopReport;
    className?: string;
}

const ScarcityBadge: React.FC<ScarcityBadgeProps> = ({ report, className = "" }) => {
    if (!report) return null;

    const getBadgeStyle = () => {
        switch (report.badge) {
            case 'Apex':
                return {
                    bg: 'bg-brand-lime/20 border-brand-lime/50',
                    text: 'text-brand-lime',
                    icon: <Award className="w-3 h-3 text-brand-lime" />,
                    label: 'Apex (Pop 1)'
                };
            case 'Low Pop':
                return {
                    bg: 'bg-amber-400/20 border-amber-400/50',
                    text: 'text-amber-400',
                    icon: <Zap className="w-3 h-3 text-amber-400" />,
                    label: `Low Pop (${report.popAtGrade})`
                };
            default:
                return {
                    bg: 'bg-brand-charcoal border-slate-700',
                    text: 'text-slate-400',
                    icon: <Shield className="w-3 h-3 text-slate-400" />,
                    label: `Pop ${report.popAtGrade}`
                };
        }
    };

    const style = getBadgeStyle();

    return (
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${style.bg} ${style.text} ${className}`} title={`Total Pop: ${report.popTotal} | Higher: ${report.popHigher}`}>
            {style.icon}
            {style.label}
        </div>
    );
};

export default ScarcityBadge;
