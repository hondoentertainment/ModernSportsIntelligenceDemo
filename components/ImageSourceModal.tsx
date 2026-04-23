// @ts-nocheck
import React from 'react';
import { Camera, MapPin, Calendar, Users, Shield, Copyright, ExternalLink, X } from 'lucide-react';
import { getImageSource } from '../lib/utils/imageSourceService.ts';

interface Props {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

const EVENT_TYPE_STYLES: Record<string, { label: string; className: string }> = {
  regular_season:   { label: 'Regular Season',   className: 'bg-blue-500/20 text-blue-400' },
  playoffs:         { label: 'Playoffs',          className: 'bg-amber-500/20 text-amber-400' },
  all_star:         { label: 'All-Star',          className: 'bg-purple-500/20 text-purple-400' },
  spring_training:  { label: 'Spring Training',   className: 'bg-emerald-500/20 text-emerald-400' },
  draft:            { label: 'Draft',             className: 'bg-cyan-500/20 text-cyan-400' },
  press_conference: { label: 'Press Conference',  className: 'bg-slate-500/20 text-slate-400' },
  practice:         { label: 'Practice',          className: 'bg-teal-500/20 text-teal-400' },
  award_ceremony:   { label: 'Award Ceremony',   className: 'bg-pink-500/20 text-pink-400' },
};

const SOURCE_COLORS: Record<string, string> = {
  'AP':                 'bg-red-500/20 text-red-400',
  'Getty Images':       'bg-orange-500/20 text-orange-400',
  'USA TODAY Sports':   'bg-blue-500/20 text-blue-400',
  'Reuters':            'bg-sky-500/20 text-sky-400',
  'Icon Sportswire':    'bg-green-500/20 text-green-400',
  'Sports Illustrated': 'bg-yellow-500/20 text-yellow-400',
  'Team Photographer':  'bg-violet-500/20 text-violet-400',
};

const ImageSourceModal: React.FC<Props> = ({ imageUrl, isOpen, onClose }) => {
  if (!isOpen) return null;

  const source = getImageSource(imageUrl);
  if (!source) return null;

  const formattedDate = new Date(source.gameDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const eventStyle = EVENT_TYPE_STYLES[source.eventType] || EVENT_TYPE_STYLES.regular_season;
  const sourceColor = SOURCE_COLORS[source.source] || 'bg-slate-500/20 text-slate-400';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-gradient-to-r from-amber-500/10 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20">
              <Camera size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Image Source & Game Attribution</h2>
              <p className="text-xs text-slate-400">Provenance and licensing details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-72px)]">
          {/* Image Preview */}
          <div className="relative w-full bg-slate-950 flex items-center justify-center" style={{ maxHeight: '280px' }}>
            <img
              src={source.imageUrl}
              alt={source.caption}
              className="w-full object-cover"
              style={{ maxHeight: '280px' }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-4 pt-12">
              <p className="text-sm text-slate-200 italic leading-relaxed">
                &ldquo;{source.caption}&rdquo;
              </p>
            </div>
          </div>

          {/* Attribution Card */}
          <div className="p-5 space-y-5">
            {/* Photographer & Source */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                  <Camera size={18} className="text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">{source.photographer}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium ${sourceColor}`}>
                    {source.source}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {source.licensedUse ? (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-[10px] font-medium">
                    <Shield size={11} />
                    Licensed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/15 text-red-400 text-[10px] font-medium">
                    <Shield size={11} />
                    Unlicensed
                  </span>
                )}
              </div>
            </div>

            {/* Game Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Game */}
              <div className="bg-slate-800/50 rounded-xl p-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <ExternalLink size={10} />
                  Game
                </p>
                <p className="text-sm font-semibold text-slate-100">{source.gameDescription}</p>
                <p className="text-[11px] text-slate-400 mt-1">{source.homeTeam} vs {source.awayTeam}</p>
              </div>

              {/* Date */}
              <div className="bg-slate-800/50 rounded-xl p-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar size={10} />
                  Date
                </p>
                <p className="text-sm font-semibold text-slate-100">{formattedDate}</p>
              </div>

              {/* Venue */}
              <div className="bg-slate-800/50 rounded-xl p-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <MapPin size={10} />
                  Venue
                </p>
                <p className="text-sm font-semibold text-slate-100">{source.venue}</p>
              </div>

              {/* Season & Event */}
              <div className="bg-slate-800/50 rounded-xl p-3">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Season</p>
                <p className="text-sm font-semibold text-slate-100">{source.season}</p>
                <span className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-medium ${eventStyle.className}`}>
                  {eventStyle.label}
                </span>
              </div>
            </div>

            {/* Players Featured */}
            {source.playersFeatured.length > 0 && (
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Users size={10} />
                  Players Featured
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {source.playersFeatured.map(player => (
                    <span
                      key={player}
                      className="px-2.5 py-1 bg-slate-800 text-slate-200 rounded-lg text-xs font-medium border border-slate-700/50"
                    >
                      {player}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Copyright & Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
              <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                <Copyright size={12} />
                <span>{source.copyright}</span>
              </div>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-medium rounded-lg transition-colors"
                onClick={() => {/* simulated navigation */}}
              >
                <ExternalLink size={12} />
                View Game Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSourceModal;
