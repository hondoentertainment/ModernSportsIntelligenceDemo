import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Users,
  DollarSign,
  Star,
  TrendingUp,
  Clock,
  Camera,
  Search,
  ShoppingBag,
  Trophy,
  Radio,
  Eye,
  Target,
  CheckCircle,
  ChevronRight,
  Zap,
} from 'lucide-react';
import {
  getCardShows,
  getCardShowStats,
  getCheckInColor,
  getShowStatusColor,
  formatCurrency,
  type CardShow,
  type SquadMember,
  type ShowVendor,
  type HaulItem,
  type CheckInStatus,
  type ShowStatus,
  type MemberAssignment,
} from '../lib/utils/cardShowSquadService.ts';

// ---- Helpers ----

function getRoleIcon(role: MemberAssignment) {
  switch (role) {
    case 'scout':
      return <Search size={14} />;
    case 'buyer':
      return <ShoppingBag size={14} />;
    case 'seller':
      return <DollarSign size={14} />;
    case 'photographer':
      return <Camera size={14} />;
    case 'general':
      return <Users size={14} />;
  }
}

function getRoleColor(role: MemberAssignment): string {
  switch (role) {
    case 'scout':
      return 'text-cyan-400';
    case 'buyer':
      return 'text-emerald-400';
    case 'seller':
      return 'text-amber-400';
    case 'photographer':
      return 'text-purple-400';
    case 'general':
      return 'text-slate-400';
  }
}

function getCheckInLabel(status: CheckInStatus): string {
  switch (status) {
    case 'en-route':
      return 'En Route';
    case 'on-floor':
      return 'On Floor';
    case 'at-booth':
      return 'At Booth';
    case 'break':
      return 'On Break';
    case 'departed':
      return 'Departed';
  }
}

function getShowStatusLabel(status: ShowStatus): string {
  switch (status) {
    case 'upcoming':
      return 'Upcoming';
    case 'live':
      return 'LIVE';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
  }
}

function getPriceRatingBadge(price: 'cheap' | 'fair' | 'premium'): string {
  switch (price) {
    case 'cheap':
      return 'bg-green-500/20 text-green-400';
    case 'fair':
      return 'bg-blue-500/20 text-blue-400';
    case 'premium':
      return 'bg-amber-500/20 text-amber-400';
  }
}

function roiPercent(price: number, value: number): number {
  return price > 0 ? Math.round(((value - price) / price) * 100) : 0;
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ---- Sub-components ----

function StatsRow() {
  const stats = useMemo(() => getCardShowStats(), []);

  const kpis = [
    {
      label: 'Shows Attended',
      value: stats.showsAttended.toString(),
      sub: `${stats.upcomingShows} upcoming`,
      icon: <MapPin size={18} className="text-blue-400" />,
    },
    {
      label: 'Squad ROI',
      value: `${stats.avgROI}%`,
      sub: formatCurrency(stats.totalHaulValue - stats.totalSquadSpend) + ' profit',
      icon: <TrendingUp size={18} className="text-emerald-400" />,
    },
    {
      label: 'Want-List Hit Rate',
      value: `${stats.wantListCompletionRate}%`,
      sub: `${stats.vendorsRated} vendors rated`,
      icon: <Target size={18} className="text-purple-400" />,
    },
    {
      label: 'Best Find',
      value: '$1 Griffey',
      sub: stats.bestFind,
      icon: <Trophy size={18} className="text-amber-400" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3"
        >
          <div className="p-2 bg-slate-800 rounded-lg">{kpi.icon}</div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
              {kpi.label}
            </p>
            <p className="text-xl font-bold text-slate-100 mt-0.5">{kpi.value}</p>
            <p className="text-xs text-slate-400 mt-0.5 truncate">{kpi.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function MemberCard({ member }: { key?: React.Key; member: SquadMember }) {
  const statusColor = getCheckInColor(member.checkInStatus);
  const roleColor = getRoleColor(member.role);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-300`}>
            {member.handle.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">{member.handle}</p>
            <div className={`flex items-center gap-1 text-xs ${roleColor}`}>
              {getRoleIcon(member.role)}
              <span className="capitalize">{member.role}</span>
            </div>
          </div>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor}`}
        >
          {getCheckInLabel(member.checkInStatus)}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-400">
        <MapPin size={12} className="text-slate-500 flex-shrink-0" />
        <span className="truncate">{member.location}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-800/50 rounded-lg py-1.5 px-1">
          <p className="text-xs text-slate-500">Found</p>
          <p className="text-sm font-bold text-slate-200">
            {member.foundItems}/{member.wantListItems}
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-lg py-1.5 px-1">
          <p className="text-xs text-slate-500">Spent</p>
          <p className="text-sm font-bold text-slate-200">
            {member.spent > 0 ? formatCurrency(member.spent) : '—'}
          </p>
        </div>
        <div className="bg-slate-800/50 rounded-lg py-1.5 px-1">
          <p className="text-xs text-slate-500">Check-In</p>
          <p className="text-xs font-medium text-slate-300">{timeAgo(member.lastCheckIn)}</p>
        </div>
      </div>
    </div>
  );
}

function VendorRow({ vendor }: { key?: React.Key; vendor: ShowVendor }) {
  const priceClass = getPriceRatingBadge(vendor.priceRating);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-100">{vendor.name}</h4>
            <span className="text-xs text-slate-500 font-mono">#{vendor.boothNumber}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-0.5">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-semibold text-amber-400">{vendor.rating}</span>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${priceClass}`}>
              {vendor.priceRating}
            </span>
          </div>
        </div>
        {vendor.visitedBy.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-green-400">
            <CheckCircle size={12} />
            <span>{vendor.visitedBy.length} visited</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {vendor.specialties.map((spec) => (
          <span
            key={spec}
            className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full"
          >
            {spec}
          </span>
        ))}
      </div>

      {vendor.notes && (
        <p className="text-xs text-slate-500 italic">{vendor.notes}</p>
      )}

      {vendor.visitedBy.length > 0 && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <Eye size={11} />
          <span>Visited by: {vendor.visitedBy.join(', ')}</span>
        </div>
      )}
    </div>
  );
}

function HaulFeedItem({ item }: { key?: React.Key; item: HaulItem }) {
  const roi = roiPercent(item.price, item.estimatedValue);
  const roiColor = roi >= 50 ? 'text-emerald-400' : roi >= 20 ? 'text-blue-400' : 'text-slate-400';

  return (
    <div
      className={`bg-slate-900 border rounded-xl p-4 ${
        item.isHighlight
          ? 'border-amber-500/40 ring-1 ring-amber-500/10'
          : 'border-slate-800'
      }`}
    >
      <div className="flex items-start justify-between mb-1">
        <div className="flex items-center gap-2">
          {item.isHighlight && <Zap size={14} className="text-amber-400 fill-amber-400" />}
          <p className="text-sm font-semibold text-slate-100">{item.cardName}</p>
        </div>
        <span className={`text-xs font-bold ${roiColor}`}>+{roi}% ROI</span>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
        <span className="font-semibold text-slate-300">{item.memberHandle}</span>
        <span className="flex items-center gap-1">
          <DollarSign size={11} />
          {formatCurrency(item.price)} paid
        </span>
        <span className="flex items-center gap-1">
          <TrendingUp size={11} />
          {formatCurrency(item.estimatedValue)} est.
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5">
        <span>{item.vendor}</span>
        <span>{timeAgo(item.timestamp)}</span>
      </div>
    </div>
  );
}

function LiveShowView({ show }: { show: CardShow }) {
  const highlights = show.haul.filter((h) => h.isHighlight);
  const totalROI =
    show.totalSquadSpend > 0
      ? Math.round(
          ((show.totalHaulValue - show.totalSquadSpend) / show.totalSquadSpend) * 100
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Live banner */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Radio size={20} className="text-green-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-bold text-green-400 uppercase tracking-wide">
              Live — {show.name}
            </p>
            <p className="text-xs text-slate-400">
              {show.venue} — {show.city}, {show.state}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 text-right">
          <div>
            <p className="text-xs text-slate-500">Squad Spend</p>
            <p className="text-sm font-bold text-slate-200">
              {formatCurrency(show.totalSquadSpend)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Haul Value</p>
            <p className="text-sm font-bold text-emerald-400">
              {formatCurrency(show.totalHaulValue)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">ROI</p>
            <p className={`text-sm font-bold ${totalROI > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalROI > 0 ? '+' : ''}{totalROI}%
            </p>
          </div>
        </div>
      </div>

      {/* Squad + Vendors grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Squad Status Board */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-blue-400" />
            <h3 className="text-base font-semibold text-slate-100">Squad Status Board</h3>
            <span className="text-xs text-slate-500 ml-auto">
              {show.members.filter((m) => m.checkInStatus === 'on-floor' || m.checkInStatus === 'at-booth').length}/{show.members.length} active
            </span>
          </div>
          <div className="space-y-3">
            {show.members.map((member) => (
              <MemberCard key={member.userId} member={member} />
            ))}
          </div>
        </div>

        {/* Vendor List */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} className="text-purple-400" />
            <h3 className="text-base font-semibold text-slate-100">Vendor Directory</h3>
            <span className="text-xs text-slate-500 ml-auto">
              {show.vendors.filter((v) => v.visitedBy.length > 0).length}/{show.vendors.length} visited
            </span>
          </div>
          <div className="space-y-3">
            {show.vendors.map((vendor) => (
              <VendorRow key={vendor.id} vendor={vendor} />
            ))}
          </div>
        </div>
      </div>

      {/* Haul Feed */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag size={16} className="text-amber-400" />
          <h3 className="text-base font-semibold text-slate-100">Live Haul Feed</h3>
          <span className="text-xs text-slate-500 ml-auto">{show.haul.length} pickups</span>
        </div>
        {highlights.length > 0 && (
          <div className="mb-3 flex items-center gap-2 text-xs text-amber-400">
            <Zap size={12} className="fill-amber-400" />
            <span className="font-semibold">{highlights.length} highlight finds</span>
          </div>
        )}
        <div className="space-y-3">
          {show.haul
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((item) => (
              <HaulFeedItem key={item.id} item={item} />
            ))}
        </div>
      </div>
    </div>
  );
}

function UpcomingShowView({ show }: { show: CardShow }) {
  return (
    <div className="space-y-6">
      {/* Show info banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100">{show.name}</h3>
            <p className="text-sm text-slate-400 mt-1">
              {show.venue} — {show.city}, {show.state}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">
              {show.date} to {show.endDate}
            </p>
          </div>
          <span
            className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getShowStatusColor(show.status)}`}
          >
            {getShowStatusLabel(show.status)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-xs text-slate-500">Squad Size</p>
            <p className="text-lg font-bold text-slate-200">{show.squadSize}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-xs text-slate-500">Vendors Listed</p>
            <p className="text-lg font-bold text-slate-200">{show.vendors.length}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-xs text-slate-500">Total Want-List</p>
            <p className="text-lg font-bold text-slate-200">
              {show.members.reduce((s, m) => s + m.wantListItems, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Members */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users size={16} className="text-blue-400" />
          <h3 className="text-base font-semibold text-slate-100">Squad Roster</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {show.members.map((member) => (
            <MemberCard key={member.userId} member={member} />
          ))}
        </div>
      </div>

      {/* Vendors */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={16} className="text-purple-400" />
          <h3 className="text-base font-semibold text-slate-100">Target Vendors</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {show.vendors.map((vendor) => (
            <VendorRow key={vendor.id} vendor={vendor} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CompletedShowView({ show }: { show: CardShow }) {
  const totalROI =
    show.totalSquadSpend > 0
      ? Math.round(
          ((show.totalHaulValue - show.totalSquadSpend) / show.totalSquadSpend) * 100
        )
      : 0;

  const topBuyer = [...show.members].sort((a, b) => b.spent - a.spent)[0];
  const topScout = [...show.members].sort((a, b) => b.foundItems - a.foundItems)[0];

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-100">{show.name}</h3>
            <p className="text-sm text-slate-400 mt-1">
              {show.venue} — {show.city}, {show.state} — {show.date}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-full border ${getShowStatusColor(show.status)}`}
            >
              {getShowStatusLabel(show.status)}
            </span>
            <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5">
              <Trophy size={12} className="text-amber-400" />
              <span className="text-xs font-bold text-amber-400">Score: {show.squadScore}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-xs text-slate-500">Squad Spend</p>
            <p className="text-lg font-bold text-slate-200">{formatCurrency(show.totalSquadSpend)}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-xs text-slate-500">Haul Value</p>
            <p className="text-lg font-bold text-emerald-400">{formatCurrency(show.totalHaulValue)}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-xs text-slate-500">ROI</p>
            <p className={`text-lg font-bold ${totalROI > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              +{totalROI}%
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-xs text-slate-500">Want-List Hit</p>
            <p className="text-lg font-bold text-purple-400">{show.wantListHitRate}%</p>
          </div>
        </div>

        {/* MVP callouts */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-3">
            <ShoppingBag size={14} className="text-emerald-400" />
            <div>
              <p className="text-xs text-slate-500">Top Buyer</p>
              <p className="text-sm font-semibold text-slate-200">
                {topBuyer.handle} — {formatCurrency(topBuyer.spent)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-3">
            <Target size={14} className="text-cyan-400" />
            <div>
              <p className="text-xs text-slate-500">Top Scout</p>
              <p className="text-sm font-semibold text-slate-200">
                {topScout.handle} — {topScout.foundItems}/{topScout.wantListItems} found
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Haul Gallery */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ShoppingBag size={16} className="text-amber-400" />
          <h3 className="text-base font-semibold text-slate-100">Haul Gallery</h3>
          <span className="text-xs text-slate-500 ml-auto">{show.haul.length} pickups</span>
        </div>
        <div className="space-y-3">
          {show.haul
            .sort((a, b) => (b.isHighlight ? 1 : 0) - (a.isHighlight ? 1 : 0))
            .map((item) => (
              <HaulFeedItem key={item.id} item={item} />
            ))}
        </div>
      </div>

      {/* Vendor Ratings */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Star size={16} className="text-amber-400" />
          <h3 className="text-base font-semibold text-slate-100">Vendor Ratings</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...show.vendors]
            .sort((a, b) => b.rating - a.rating)
            .map((vendor) => (
              <VendorRow key={vendor.id} vendor={vendor} />
            ))}
        </div>
      </div>
    </div>
  );
}

// ---- Main Page ----

export default function CardShowSquad() {
  const shows = useMemo(() => getCardShows(), []);
  const [activeShowId, setActiveShowId] = useState<string>(
    shows.find((s) => s.status === 'live')?.id ?? shows[0]?.id ?? ''
  );

  const activeShow = shows.find((s) => s.id === activeShowId) ?? null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <MapPin size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              Card Show Squad Coordinator
            </h1>
            <p className="text-sm text-slate-400">
              Organize attendance, assign targets, track hauls, and rate vendors
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <StatsRow />

        {/* Show Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {shows.map((show) => {
            const isActive = show.id === activeShowId;
            const statusColor = getShowStatusColor(show.status);
            return (
              <button
                key={show.id}
                onClick={() => setActiveShowId(show.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border ${
                  isActive
                    ? 'bg-slate-800 border-slate-600 text-slate-100'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span
                  className={`inline-flex text-xs font-bold px-2 py-0.5 rounded-full border ${statusColor}`}
                >
                  {getShowStatusLabel(show.status)}
                </span>
                <span>{show.name}</span>
                <ChevronRight size={14} className="text-slate-600" />
              </button>
            );
          })}
        </div>

        {/* Active Show Content */}
        {activeShow && activeShow.status === 'live' && (
          <LiveShowView show={activeShow} />
        )}
        {activeShow && activeShow.status === 'upcoming' && (
          <UpcomingShowView show={activeShow} />
        )}
        {activeShow && activeShow.status === 'completed' && (
          <CompletedShowView show={activeShow} />
        )}
        {!activeShow && (
          <div className="text-center py-20 text-slate-500">
            No shows found. Create a squad for an upcoming card show.
          </div>
        )}
      </div>
    </div>
  );
}
