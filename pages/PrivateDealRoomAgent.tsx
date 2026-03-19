import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Lock, MessageSquare, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { createPrivateDealRoomAgentFromListing } from '../lib/utils/fiveDifferentiatorService';
import { getActiveListingsAsync, Listing } from '../lib/trading/p2pMarketplaceService';
import { getDealRoomsAsync } from '../lib/trading/dealRoomService';
import type { DealRoom } from '../lib/trading/dealRoomService';
import { logger } from '../lib/logger';
import { withRetry } from '../lib/retry';

const fmt = (value: number) => `$${Math.round(value).toLocaleString()}`;

const PrivateDealRoomAgent: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [rooms, setRooms] = useState<DealRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<DealRoom | null>(null);
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [nextListings, nextRooms] = await withRetry(
        () => Promise.all([
          getActiveListingsAsync(user?.id),
          getDealRoomsAsync(user?.id),
        ]),
        { maxAttempts: 3, initialDelayMs: 400, timeoutMs: 15_000 }
      );
      setListings(nextListings.filter(listing => listing.askingPrice >= 1000));
      setRooms(nextRooms);
      setSelectedRoom(nextRooms[0] || null);
    } catch (loadError) {
      logger.error('Failed to load private deal room data:', loadError);
      setError(loadError instanceof Error ? loadError.message : 'Unable to load private deal rooms.');
      addToast('error', 'Could not load deal room data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, addToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const actionableListings = useMemo(
    () => listings.filter(listing => listing.askingPrice >= 1000).slice(0, 8),
    [listings],
  );

  const handleLaunch = async (listing: Listing) => {
    setLaunchingId(listing.id);
    const room = await createPrivateDealRoomAgentFromListing(listing, user?.id);
    const nextRooms = await getDealRoomsAsync(user?.id);
    setRooms(nextRooms);
    setSelectedRoom(room);
    setLaunchingId(null);
  };

  return (
    <div className="space-y-8 pb-16">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-300">
          <Lock size={12} />
          Private Deal Room Agent
        </div>
        <h1 className="mt-3 text-4xl font-bebas tracking-wide text-white">High-Value Private Negotiation Console</h1>
        <p className="max-w-3xl text-sm text-slate-400">
          Promote sensitive marketplace opportunities into access-controlled deal rooms with trust-aware counterparties, secure message history, and human approval checkpoints.
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-semibold">Deal room data unavailable</div>
            <p className="mt-2 text-red-200/90">{error}</p>
          </div>
          <button type="button" aria-label="Retry loading deal rooms" onClick={() => void load()} className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-xs font-medium transition-colors">Retry</button>
        </div>
      )}

      {isLoading && (
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-6 text-sm text-slate-400">
          Loading active listings, secure rooms, and counterparty context...
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><MessageSquare size={12} className="text-blue-300" /> Live Rooms</div>
          <div className="text-2xl font-bold text-white">{rooms.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><ShieldCheck size={12} className="text-emerald-300" /> Encrypted</div>
          <div className="text-2xl font-bold text-emerald-300">{rooms.filter(room => room.isEncrypted).length}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Users size={12} className="text-violet-300" /> Counterparties</div>
          <div className="text-2xl font-bold text-violet-300">{rooms.reduce((sum, room) => sum + room.participants.length, 0)}</div>
        </div>
        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500"><Sparkles size={12} className="text-amber-300" /> Candidates</div>
          <div className="text-2xl font-bold text-amber-300">{actionableListings.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1 rounded-3xl border border-slate-700/50 bg-slate-900/50 p-6">
          <h2 className="text-lg font-bold text-white">Promotion Queue</h2>
          <p className="mb-4 text-xs text-slate-500">Listings eligible for private-room escalation</p>
          <div className="space-y-3">
            {actionableListings.map(listing => (
              <div key={listing.id} className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
                <div className="text-sm font-semibold text-white">{listing.player}</div>
                <div className="text-xs text-slate-500">{listing.cardDescription}</div>
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-slate-500">Ask</div>
                    <div className="font-bold text-emerald-300">{fmt(listing.askingPrice)}</div>
                  </div>
                  <button
                    onClick={() => void handleLaunch(listing)}
                    disabled={launchingId === listing.id}
                    className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-wait disabled:opacity-60"
                  >
                    {launchingId === listing.id ? 'Launching…' : 'Launch Room'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-2 rounded-3xl border border-slate-700/50 bg-slate-900/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Negotiation Timeline</h2>
              <p className="text-xs text-slate-500">Persisted room events and agent-ready context</p>
            </div>
          </div>

          {selectedRoom ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{selectedRoom.title}</h3>
                    <p className="text-xs text-slate-500">{selectedRoom.card.description} · {selectedRoom.card.grade}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center text-xs">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-500">Ask</div>
                      <div className="font-bold text-white">{fmt(selectedRoom.askingPrice)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-500">Bid</div>
                      <div className="font-bold text-emerald-300">{fmt(selectedRoom.currentBid)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-slate-500">Participants</div>
                      <div className="font-bold text-blue-300">{selectedRoom.participants.length}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
                  <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Participants</div>
                  <div className="space-y-2">
                    {selectedRoom.participants.map(participant => (
                      <div key={participant.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm">
                        <div>
                          <div className="font-medium text-white">{participant.name}</div>
                          <div className="text-[10px] uppercase tracking-widest text-slate-500">{participant.role}</div>
                        </div>
                        <div className="text-xs text-amber-300">{participant.reputation.rating.toFixed(1)} / 5</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
                  <div className="mb-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Recent Messages</div>
                  <div className="space-y-2">
                    {selectedRoom.messages.slice(-5).map(message => (
                      <div key={message.id} className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-white">{message.senderName}</span>
                          <span className="text-slate-500">{new Date(message.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="mt-1 text-sm text-slate-300">{message.content}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-700 p-6 text-sm text-slate-500">
              Launch a private room from the promotion queue to start a persisted negotiation timeline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivateDealRoomAgent;
