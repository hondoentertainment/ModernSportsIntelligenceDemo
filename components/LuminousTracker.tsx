
import React, { useEffect } from 'react';
import { useInventory, calculateStats } from '../lib/useInventory.ts';

/**
 * LuminousTracker handles global mouse tracking and ambient environmental UI.
 * It updates CSS variables used by .luminous-card and .ambient-glow.
 */
const LuminousTracker: React.FC = () => {
    const { inventory } = useInventory();

    useEffect(() => {
        const stats = calculateStats(inventory);
        const roi = stats.roi;

        // Define glow color based on ROI performance
        // High-performing portfolios glow Lime; Underperforming portfolios glow Red
        const glowColor = roi >= 0
            ? 'oklch(0.88 0.20 127)' // Brand Lime
            : 'oklch(0.60 0.24 25)';  // Brand Red

        document.documentElement.style.setProperty('--glow-color', glowColor);
    }, [inventory]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Convert cursor position to percentage for radial gradients
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;

            document.documentElement.style.setProperty('--mouse-x', `${x}%`);
            document.documentElement.style.setProperty('--mouse-y', `${y}%`);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return <div className="ambient-glow" aria-hidden="true" />;
};

export default LuminousTracker;
