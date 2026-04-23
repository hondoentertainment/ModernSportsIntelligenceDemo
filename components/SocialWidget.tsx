// @ts-nocheck
import React, { useMemo } from 'react';
import {
  Users,
  MessageCircle,
  ArrowRightLeft,
  ChevronRight,
  Bell,
  Star,
} from 'lucide-react';
import { CardInventory } from '../types';
import {
  getTradeMatches,
  getActivityFeed,
  getUnreadMessageCount,
  getNewFollowerCount,
  TradeMatch,
  ActivityFeedItem,
} from '../lib/social/socialService';

interface SocialWidgetProps {
  cards: CardInventory[];
  onClick?: () => void;
}

const ACTIVITY_ICONS: Record<string, string> = {
  listing: '📋',
  trade: '🔄',
  achievement: '🏆',
  grading: '📊',
  purchase: '💰',
  price_milestone: '📈',
  follow: '👤',
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export const SocialWidget: React.FC<SocialWidgetProps> = ({ cards, onClick }) => {
  const unreadMessages = useMemo(() => getUnreadMessageCount(), []);
  const newFollowers = useMemo(() => getNewFollowerCount(), []);
  const tradeMatches = useMemo(() => getTradeMatches(cards).slice(0, 3), [cards]);
  const recentActivity = useMemo(() => getActivityFeed('global').slice(0, 3), []);

  const totalNotifications = unreadMessages + newFollowers;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-brand-slate border border-slate-800 rounded-[2.5rem] p-8 space-y-5 animate-in slide-in-from-bottom-8 duration-700 hover:border-slate-700 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
            <Users size={22} />
          </div>
          <div>
            <h3 className="text-3xl font-bebas tracking-widest text-white leading-tight">
              Social <span className="text-blue-400">Hub</span>
            </h3>
            <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
              Network & messaging
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalNotifications > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold rounded-full">
              <Bell size={12} />
              {totalNotifications}
            </span>
          )}
          <ChevronRight
            size={20}
            className="text-slate-600 group-hover:text-brand-lime group-hover:translate-x-1 transition-all"
          />
        </div>
      </div>

      {/* Notification Badges */}
      <div className="flex items-center gap-3">
        {newFollowers > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <Users size={12} className="text-blue-400" />
            <span className="text-xs font-bold text-blue-400">{newFollowers} new follower{newFollowers !== 1 ? 's' : ''}</span>
          </div>
        )}
        {unreadMessages > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
            <MessageCircle size={12} className="text-green-400" />
            <span className="text-xs font-bold text-green-400">{unreadMessages} unread</span>
          </div>
        )}
      </div>

      {/* Top Trade Matches */}
      {tradeMatches.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black text-brand-muted uppercase tracking-widest">
            <ArrowRightLeft size={12} />
            Top Trade Matches
          </div>
          <div className="space-y-1.5">
            {tradeMatches.map((match: TradeMatch) => (
              <div
                key={match.collectorId}
                className="flex items-center gap-3 px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-xl"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                  style={{ backgroundColor: match.avatarColor }}
                >
                  {match.initials}
                </div>
                <span className="text-xs text-white font-medium truncate flex-1">
                  {match.collectorName}
                </span>
                <div className="flex items-center gap-1 text-xs">
                  <Star size={10} className="text-amber-400" />
                  <span className="text-amber-400 font-bold">{match.matchScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
            Recent Activity
          </div>
          <div className="space-y-1">
            {recentActivity.map((item: ActivityFeedItem) => (
              <div key={item.id} className="flex items-start gap-2 text-xs">
                <span className="flex-shrink-0">{ACTIVITY_ICONS[item.type] || '📌'}</span>
                <span className="text-slate-400 truncate flex-1">
                  <span className="text-slate-300 font-medium">{item.collectorName}</span>{' '}
                  {item.description.replace(item.collectorName, '').trim()}
                </span>
                <span className="text-slate-600 flex-shrink-0">{timeAgo(item.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="text-center">
        <span className="text-xs font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
          Open Social Hub →
        </span>
      </div>
    </button>
  );
};

export default SocialWidget;
