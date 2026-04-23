// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  MessageSquare,
  Lock,
  Shield,
  Send,
  DollarSign,
  Plus,
  Filter,
  Clock,
  Users,
  CheckCircle,
  BarChart3,
  Eye,
  Bell,
  TrendingUp,
  ChevronLeft,
} from 'lucide-react';
import {
  DealRoom,
  DealMessage,
  getDealRooms,
  createDealRoom,
  sendMessage,
  makeOffer,
  getIOIBoard,
  getDealFlowStats,
  getMonthlyVolume,
} from '../lib/trading/dealRoomService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = 'rooms' | 'ioi' | 'new_deal' | 'analytics';

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  active:        { label: 'ACTIVE',      cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
  negotiating:   { label: 'NEGOTIATING', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
  pending_close: { label: 'CLOSING',     cls: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
  closed:        { label: 'CLOSED',      cls: 'bg-slate-500/20 text-slate-400 border-slate-500/40' },
  expired:       { label: 'EXPIRED',     cls: 'bg-red-500/20 text-red-400 border-red-500/40' },
};

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  buy:     { label: 'BUY',     cls: 'bg-emerald-500/20 text-emerald-300' },
  sell:    { label: 'SELL',    cls: 'bg-red-500/20 text-red-300' },
  swap:    { label: 'SWAP',    cls: 'bg-purple-500/20 text-purple-300' },
  auction: { label: 'AUCTION', cls: 'bg-amber-500/20 text-amber-300' },
};

const ROLE_BADGE: Record<string, { label: string; cls: string }> = {
  seller:   { label: 'Seller',   cls: 'bg-red-500/20 text-red-300' },
  buyer:    { label: 'Buyer',    cls: 'bg-emerald-500/20 text-emerald-300' },
  broker:   { label: 'Broker',   cls: 'bg-blue-500/20 text-blue-300' },
  observer: { label: 'Observer', cls: 'bg-slate-500/20 text-slate-400' },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ── Chat Room View ──────────────────────────────────────────────────────────────

const ChatRoom: React.FC<{ room: DealRoom; onBack: () => void }> = ({ room, onBack }) => {
  const [msgText, setMsgText] = useState('');
  const [offerMode, setOfferMode] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [messages, setMessages] = useState<DealMessage[]>(room.messages);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!msgText.trim()) return;
    const msg = sendMessage(room.id, {
      senderId: 'p-010',
      senderName: 'You',
      content: msgText,
      type: 'message',
    });
    setMessages(prev => [...prev, msg]);
    setMsgText('');
  };

  const handleOffer = () => {
    const amount = parseInt(offerAmount.replace(/[^0-9]/g, ''));
    if (!amount || amount <= 0) return;
    const msg = makeOffer(room.id, amount);
    setMessages(prev => [...prev, msg]);
    setOfferAmount('');
    setOfferMode(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (offerMode) handleOffer();
      else handleSend();
    }
  };

  // Build offer timeline from messages
  const offerTimeline = messages.filter(m => m.type === 'offer' || m.type === 'counter');

  const roleBadge = (msg: DealMessage) => {
    const participant = room.participants.find(p => p.id === msg.senderId);
    if (!participant) return null;
    const badge = ROLE_BADGE[participant.role];
    return (
      <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${badge.cls}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Room header */}
      <div className="flex items-center gap-3 p-3 border-b border-slate-700/50 bg-slate-800/30">
        <button onClick={onBack} className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors">
          <ChevronLeft size={16} className="text-slate-400" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-200 truncate">{room.card.player}</h3>
            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${STATUS_BADGE[room.status].cls}`}>
              {STATUS_BADGE[room.status].label}
            </span>
          </div>
          <p className="text-[10px] text-slate-500">{room.card.description} · {room.card.grade} · Est. ${room.card.estimatedValue.toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px] text-blue-300">
            <Lock size={10} />
            <span>E2E</span>
          </div>
          <div className="flex -space-x-1.5">
            {room.participants.slice(0, 4).map((p, _i) => (
              <div key={p.id} className={`w-6 h-6 rounded-full border-2 border-slate-800 flex items-center justify-center text-[9px] font-bold ${p.verified ? 'bg-amber-500/30 text-amber-300' : 'bg-slate-700 text-slate-400'}`}>
                {p.name[0]}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Offer timeline bar (if offers exist) */}
      {offerTimeline.length > 0 && (
        <div className="px-3 py-2 bg-slate-800/20 border-b border-slate-700/30">
          <div className="flex items-center gap-2 mb-1.5">
            <TrendingUp size={10} className="text-slate-500" />
            <span className="text-[10px] text-slate-500 font-medium">PRICE NEGOTIATION</span>
          </div>
          <div className="flex items-center gap-1">
            {offerTimeline.map((o, i) => (
              <React.Fragment key={o.id}>
                <div className={`px-2 py-1 rounded text-[10px] font-medium ${o.type === 'offer' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                  ${o.offerAmount?.toLocaleString()}
                </div>
                {i < offerTimeline.length - 1 && (
                  <div className="w-3 h-px bg-slate-600" />
                )}
              </React.Fragment>
            ))}
            <div className="ml-auto text-[10px] text-slate-500">
              Ask: ${room.askingPrice.toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5" style={{ maxHeight: '35vh' }}>
        {messages.map(msg => {
          if (msg.type === 'system') {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-300 flex items-center gap-1.5">
                  <Shield size={10} />
                  {msg.content}
                </div>
              </div>
            );
          }

          const isYou = msg.senderId === 'p-010';
          const isOffer = msg.type === 'offer' || msg.type === 'counter';
          const isAccept = msg.type === 'accept';
          const isReject = msg.type === 'reject';

          return (
            <div key={msg.id} className={`flex ${isYou ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${isYou ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  {!isYou && <span className="text-[10px] font-medium text-slate-400">{msg.senderName}</span>}
                  {!isYou && roleBadge(msg)}
                  <span className="text-[9px] text-slate-600">{formatTime(msg.timestamp)}</span>
                  {isYou && roleBadge(msg)}
                  {isYou && <span className="text-[10px] font-medium text-slate-400">You</span>}
                </div>
                <div className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  isOffer
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-200'
                    : isAccept
                    ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                    : isReject
                    ? 'bg-red-500/15 border border-red-500/30 text-red-300'
                    : isYou
                    ? 'bg-blue-600/20 border border-blue-500/20 text-slate-200'
                    : 'bg-slate-800/60 border border-slate-700/30 text-slate-300'
                }`}>
                  {isOffer && <DollarSign size={12} className="inline mr-1 text-amber-400" />}
                  {msg.content}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-slate-700/50 bg-slate-800/20">
        {offerMode ? (
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" />
              <input
                type="text"
                value={offerAmount}
                onChange={e => setOfferAmount(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter offer amount..."
                className="w-full pl-8 pr-3 py-2 bg-slate-800 border border-amber-500/30 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                autoFocus
              />
            </div>
            <button onClick={handleOffer} className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-colors">
              Submit Offer
            </button>
            <button onClick={() => setOfferMode(false)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-colors">
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={msgText}
              onChange={e => setMsgText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a secure message..."
              className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/40"
            />
            <button onClick={() => setOfferMode(true)} className="px-3 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 rounded-lg text-xs font-semibold transition-colors border border-amber-500/30">
              <DollarSign size={14} />
            </button>
            <button onClick={handleSend} className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
              <Send size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Modal ──────────────────────────────────────────────────────────────────

const DealRoomModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<TabKey>('rooms');
  const [selectedRoom, setSelectedRoom] = useState<DealRoom | null>(null);
  const [ioiSportFilter, setIoiSportFilter] = useState('all');
  const [ioiTypeFilter, setIoiTypeFilter] = useState<'all' | 'buy' | 'sell'>('all');

  // New deal form state
  const [newPlayer, setNewPlayer] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [newEstValue, setNewEstValue] = useState('');
  const [newType, setNewType] = useState<DealRoom['type']>('sell');
  const [newAskingPrice, setNewAskingPrice] = useState('');
  const [newDealCreated, setNewDealCreated] = useState(false);

  if (!isOpen) return null;

  const rooms = getDealRooms();
  const ioiBoard = getIOIBoard();
  const stats = getDealFlowStats();
  const monthlyVolume = getMonthlyVolume();

  // Filter IOI
  const filteredIOI = ioiBoard.filter(ioi => {
    if (ioiTypeFilter !== 'all' && ioi.type !== ioiTypeFilter) return false;
    if (ioiSportFilter !== 'all') {
      const sport = ioi.category.split('/')[0]?.trim().toLowerCase() || '';
      if (!sport.includes(ioiSportFilter.toLowerCase())) return false;
    }
    return true;
  });

  const handleCreateDeal = () => {
    if (!newPlayer.trim() || !newDescription.trim() || !newAskingPrice) return;
    createDealRoom(
      {
        player: newPlayer,
        description: newDescription,
        grade: newGrade || 'Ungraded',
        estimatedValue: parseInt(newEstValue) || 0,
      },
      newType,
      parseInt(newAskingPrice.replace(/[^0-9]/g, '')) || 0
    );
    setNewDealCreated(true);
    setTimeout(() => {
      setNewDealCreated(false);
      setNewPlayer('');
      setNewDescription('');
      setNewGrade('');
      setNewEstValue('');
      setNewAskingPrice('');
      setTab('rooms');
    }, 1500);
  };

  const tabItems: { key: TabKey; label: string; count?: number }[] = [
    { key: 'rooms', label: 'Deal Rooms', count: rooms.length },
    { key: 'ioi', label: 'IOI Board', count: ioiBoard.length },
    { key: 'new_deal', label: 'New Deal' },
    { key: 'analytics', label: 'Analytics' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-gradient-to-r from-blue-500/10 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <MessageSquare size={20} className="text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-100">Institutional Deal Room</h2>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  <Lock size={9} />
                  END-TO-END ENCRYPTED
                </span>
              </div>
              <p className="text-xs text-slate-400">Secure negotiations for high-value card transactions</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-4 gap-3 p-4 bg-slate-800/30">
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Active Rooms</p>
            <p className="text-xl font-bold text-slate-200">{stats.activeRooms}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Pending Offers</p>
            <p className="text-xl font-bold text-amber-400">{stats.pendingOffers}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Total Volume</p>
            <p className="text-xl font-bold text-emerald-400">${(stats.totalVolume / 1000).toFixed(0)}K</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-3 text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">IOI Count</p>
            <p className="text-xl font-bold text-blue-400">{ioiBoard.length}</p>
          </div>
        </div>

        {/* Tabs (hidden when viewing a specific room) */}
        {!selectedRoom && (
          <div className="flex gap-1 px-4 pt-3">
            {tabItems.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                  tab === t.key ? 'bg-blue-500/20 text-blue-300' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {t.label}{t.count !== undefined ? ` (${t.count})` : ''}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {selectedRoom ? (
            <ChatRoom room={selectedRoom} onBack={() => setSelectedRoom(null)} />
          ) : (
            <div className="p-4 overflow-y-auto" style={{ maxHeight: '50vh' }}>
              {/* ── Deal Rooms Tab ── */}
              {tab === 'rooms' && (
                <div className="space-y-3">
                  {rooms.map(room => {
                    const lastMsg = room.messages[room.messages.length - 1];
                    const statusBadge = STATUS_BADGE[room.status];
                    const typeBadge = TYPE_BADGE[room.type];

                    return (
                      <div
                        key={room.id}
                        className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4 hover:border-blue-500/20 transition-all cursor-pointer"
                        onClick={() => setSelectedRoom(room)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-semibold text-slate-200 truncate">{room.title}</h4>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${statusBadge.cls}`}>
                                {statusBadge.label}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${typeBadge.cls}`}>
                                {typeBadge.label}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500">{room.card.description} · {room.card.grade}</p>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <p className="text-sm font-bold text-slate-200">${room.askingPrice.toLocaleString()}</p>
                            {room.currentBid > 0 && (
                              <p className="text-[10px] text-emerald-400">Bid: ${room.currentBid.toLocaleString()}</p>
                            )}
                          </div>
                        </div>

                        {/* Participants */}
                        <div className="flex items-center gap-2 mb-2">
                          <Users size={10} className="text-slate-500" />
                          <div className="flex items-center gap-1.5">
                            {room.participants.map(p => (
                              <div key={p.id} className="flex items-center gap-1">
                                <span className="text-[10px] text-slate-400">{p.name}</span>
                                {p.verified && (
                                  <Shield size={9} className="text-amber-400" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Last message preview */}
                        {lastMsg && (
                          <div className="flex items-center justify-between bg-slate-900/50 rounded-lg px-3 py-1.5">
                            <p className="text-[10px] text-slate-400 truncate flex-1">
                              <span className="text-slate-500 font-medium">{lastMsg.senderName}:</span> {lastMsg.content}
                            </p>
                            <span className="text-[9px] text-slate-600 shrink-0 ml-2">{timeAgo(lastMsg.timestamp)}</span>
                          </div>
                        )}

                        {/* Encryption + expiry */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 text-[9px] text-blue-300">
                            <Lock size={9} />
                            Encrypted
                          </div>
                          <div className="flex items-center gap-1 text-[9px] text-slate-500">
                            <Clock size={9} />
                            Expires {formatDate(room.expiresAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {rooms.length === 0 && (
                    <div className="text-center py-12">
                      <MessageSquare size={32} className="text-slate-600 mx-auto mb-3" />
                      <p className="text-sm text-slate-400">No active deal rooms</p>
                      <button onClick={() => setTab('new_deal')} className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors">
                        Create Deal Room
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── IOI Board Tab ── */}
              {tab === 'ioi' && (
                <div className="space-y-3">
                  {/* Filters */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Filter size={10} />
                      Filter:
                    </div>
                    <div className="flex gap-1.5">
                      {['all', 'buy', 'sell'].map(t => (
                        <button
                          key={t}
                          onClick={() => setIoiTypeFilter(t as 'all' | 'buy' | 'sell')}
                          className={`px-2.5 py-1 text-[10px] rounded-lg transition-colors ${
                            ioiTypeFilter === t ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {t === 'all' ? 'All Types' : t.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <div className="w-px h-4 bg-slate-700" />
                    <div className="flex gap-1.5">
                      {['all', 'Baseball', 'Basketball', 'Football'].map(s => (
                        <button
                          key={s}
                          onClick={() => setIoiSportFilter(s)}
                          className={`px-2.5 py-1 text-[10px] rounded-lg transition-colors ${
                            ioiSportFilter === s ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {s === 'all' ? 'All Sports' : s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredIOI.map(ioi => (
                    <div key={ioi.id} className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4 hover:border-blue-500/20 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            ioi.type === 'buy' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {ioi.type === 'buy' ? 'BID WANTED' : 'OFFER'}
                          </span>
                          {ioi.anonymous && (
                            <span className="text-[9px] text-slate-500 flex items-center gap-1">
                              <Eye size={9} />
                              Anonymous
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500">{ioi.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-200">
                            ${(ioi.priceRange.min / 1000).toFixed(0)}K - ${(ioi.priceRange.max / 1000).toFixed(0)}K
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed mb-3">{ioi.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Bell size={9} />
                            {ioi.responses} responses
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={9} />
                            Posted {timeAgo(ioi.postedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={9} />
                            Expires {formatDate(ioi.expiresAt)}
                          </span>
                        </div>
                        <button className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-[10px] font-semibold transition-colors border border-blue-500/30">
                          Respond
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredIOI.length === 0 && (
                    <div className="text-center py-12">
                      <Bell size={32} className="text-slate-600 mx-auto mb-3" />
                      <p className="text-sm text-slate-400">No IOI broadcasts match your filters</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── New Deal Tab ── */}
              {tab === 'new_deal' && (
                <div className="max-w-lg mx-auto">
                  {newDealCreated ? (
                    <div className="text-center py-12">
                      <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
                      <p className="text-lg font-semibold text-slate-200">Deal Room Created</p>
                      <p className="text-sm text-slate-400 mt-1">Your encrypted room is ready. Redirecting...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Plus size={16} className="text-blue-400" />
                        <h3 className="text-sm font-semibold text-slate-200">Create New Deal Room</h3>
                      </div>

                      {/* Deal type selector */}
                      <div>
                        <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1.5">Deal Type</label>
                        <div className="flex gap-2">
                          {(['sell', 'buy', 'swap', 'auction'] as const).map(t => (
                            <button
                              key={t}
                              onClick={() => setNewType(t)}
                              className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-colors border ${
                                newType === t
                                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                  : 'bg-slate-800 text-slate-400 border-slate-700/30 hover:text-slate-200'
                              }`}
                            >
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Card details */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1.5">Player Name</label>
                          <input
                            type="text"
                            value={newPlayer}
                            onChange={e => setNewPlayer(e.target.value)}
                            placeholder="e.g. LeBron James"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/40"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1.5">Grade</label>
                          <input
                            type="text"
                            value={newGrade}
                            onChange={e => setNewGrade(e.target.value)}
                            placeholder="e.g. PSA 10"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/40"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1.5">Card Description</label>
                        <input
                          type="text"
                          value={newDescription}
                          onChange={e => setNewDescription(e.target.value)}
                          placeholder="e.g. 2003 Topps Chrome Rookie Card #111"
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/40"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1.5">Estimated Value ($)</label>
                          <input
                            type="text"
                            value={newEstValue}
                            onChange={e => setNewEstValue(e.target.value)}
                            placeholder="e.g. 50000"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/40"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1.5">Asking Price ($)</label>
                          <input
                            type="text"
                            value={newAskingPrice}
                            onChange={e => setNewAskingPrice(e.target.value)}
                            placeholder="e.g. 48000"
                            className="w-full px-3 py-2 bg-slate-800 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/40"
                          />
                        </div>
                      </div>

                      <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 flex items-start gap-2">
                        <Lock size={14} className="text-blue-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-blue-300 font-medium">End-to-End Encryption</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">All messages and attachments will be encrypted. Only verified participants can view room contents.</p>
                        </div>
                      </div>

                      <button
                        onClick={handleCreateDeal}
                        disabled={!newPlayer.trim() || !newDescription.trim() || !newAskingPrice}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        Create Encrypted Deal Room
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── Analytics Tab ── */}
              {tab === 'analytics' && (
                <div className="space-y-4">
                  {/* Stat cards */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4 text-center">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Success Rate</p>
                      <p className="text-2xl font-bold text-emerald-400">{stats.successRate}%</p>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4 text-center">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Avg Deal Size</p>
                      <p className="text-2xl font-bold text-slate-200">${(stats.avgDealSize / 1000).toFixed(0)}K</p>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4 text-center">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Closed This Month</p>
                      <p className="text-2xl font-bold text-blue-400">{stats.closedThisMonth}</p>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4 text-center">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Active Rooms</p>
                      <p className="text-2xl font-bold text-amber-400">{stats.activeRooms}</p>
                    </div>
                  </div>

                  {/* Volume chart */}
                  <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart3 size={14} className="text-blue-400" />
                      <h4 className="text-sm font-semibold text-slate-200">Monthly Deal Volume</h4>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={monthlyVolume}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#475569' }} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#475569' }} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                          labelStyle={{ color: '#e2e8f0' }}
                          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Volume']}
                        />
                        <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Deals per month chart */}
                  <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp size={14} className="text-emerald-400" />
                      <h4 className="text-sm font-semibold text-slate-200">Deals Closed per Month</h4>
                    </div>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={monthlyVolume}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#475569' }} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#475569' }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                          labelStyle={{ color: '#e2e8f0' }}
                          formatter={(value: number) => [value, 'Deals']}
                        />
                        <Bar dataKey="deals" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Time to close + additional metrics */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Avg Time to Close</p>
                      <p className="text-xl font-bold text-slate-200">4.2 <span className="text-xs text-slate-400 font-normal">days</span></p>
                      <div className="w-full bg-slate-700/50 rounded-full h-1.5 mt-2">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '42%' }} />
                      </div>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Avg Negotiation Rounds</p>
                      <p className="text-xl font-bold text-slate-200">3.1 <span className="text-xs text-slate-400 font-normal">rounds</span></p>
                      <div className="w-full bg-slate-700/50 rounded-full h-1.5 mt-2">
                        <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '62%' }} />
                      </div>
                    </div>
                    <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Buyer / Seller Ratio</p>
                      <p className="text-xl font-bold text-slate-200">1.4 <span className="text-xs text-slate-400 font-normal">: 1</span></p>
                      <div className="w-full bg-slate-700/50 rounded-full h-1.5 mt-2">
                        <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '58%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DealRoomModal;
