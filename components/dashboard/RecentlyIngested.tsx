import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import CardImage from '../CardImage';
import { getRarityTier, getTierStyles } from '../../lib/rarity';
import { CardInventory } from '../../types';

interface RecentlyIngestedProps {
  inventory: CardInventory[];
}

const RecentlyIngested: React.FC<RecentlyIngestedProps> = ({ inventory }) => {
  const recentCards = inventory.slice(-3).reverse();

  return (
    <section className="reveal-section" style={{ animationDelay: '600ms' }}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-bebas tracking-wider flex items-center gap-4">
          <Activity className="text-brand-lime" size={32} />
          Recently Ingested
        </h2>
        <Link
          to="/collection"
          className="text-xs font-black text-brand-lime uppercase tracking-widest border-b border-brand-lime/30 hover:border-brand-lime pb-1 transition-all"
        >
          View All {inventory.length} Assets
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recentCards.map(card => {
          const tier = getRarityTier(card);
          const styles = getTierStyles(tier);

          return (
            <div
              key={card.id}
              className={`group bg-brand-slate border ${styles.border} rounded-[2rem] p-6 hover:shadow-xl transition-all flex items-center gap-6 relative overflow-hidden`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${styles.glow || 'from-transparent'} via-transparent to-transparent opacity-30`}
              ></div>

              <div
                className={`w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 border-slate-800 ${styles.border !== 'border-slate-800' ? styles.border : ''} transition-colors relative z-10`}
              >
                <CardImage
                  src={card.image}
                  playerName={card.player}
                  year={card.year}
                  manufacturer={card.manufacturer}
                  className="w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-bold text-lg truncate ${styles.text}`}>{card.player}</h4>
                  {tier !== 'Common' && tier !== 'Uncommon' && (
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${styles.badge}`}>
                      {tier === 'OneOfOne' ? '1/1' : tier}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest mb-3 truncate">
                  {card.year} {card.manufacturer} {card.set}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono font-black text-slate-100">
                    ${card.purchasePrice.toLocaleString()}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter ${card.isGraded ? 'bg-brand-lime/10 text-brand-lime border border-brand-lime/20' : 'bg-slate-800 text-brand-muted'}`}
                  >
                    {card.isGraded ? `${card.gradingCompany} ${card.grade}` : 'Raw'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default React.memo(RecentlyIngested);
