import { store } from '../dal/syncStore';
import {
  fetchDealRoomAttachments,
  fetchDealRoomMessages,
  fetchDealRoomParticipants,
  fetchDealRooms as fetchPersistedDealRooms,
  insertDealRoomMessage,
  upsertDealRoom,
  upsertDealRoomParticipant,
} from '../differentiatorData';

// ── Interfaces ──────────────────────────────────────────────────────────────────

export interface DealParticipant {
  id: string;
  name: string;
  role: 'seller' | 'buyer' | 'broker' | 'observer';
  institution: string;
  verified: boolean;
  joinedAt: string;
  reputation: {
    rating: number;
    trades: number;
    memberSince: string;
  };
}

export interface DealMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'message' | 'offer' | 'counter' | 'accept' | 'reject' | 'system';
  offerAmount?: number;
  attachedData?: Record<string, unknown>;
}

export interface DealRoom {
  id: string;
  title: string;
  type: 'buy' | 'sell' | 'swap' | 'auction';
  status: 'active' | 'negotiating' | 'pending_close' | 'closed' | 'expired';
  createdBy: string;
  participants: DealParticipant[];
  card: {
    player: string;
    description: string;
    grade: string;
    estimatedValue: number;
  };
  askingPrice: number;
  currentBid: number;
  messages: DealMessage[];
  attachments: string[];
  createdAt: string;
  expiresAt: string;
  isEncrypted: boolean;
}

export interface IOIBroadcast {
  id: string;
  type: 'buy' | 'sell';
  anonymous: boolean;
  category: string;
  priceRange: { min: number; max: number };
  description: string;
  responses: number;
  postedAt: string;
  expiresAt: string;
  status: 'active' | 'filled' | 'expired';
}

export interface DealFlowStats {
  activeRooms: number;
  pendingOffers: number;
  totalVolume: number;
  avgDealSize: number;
  closedThisMonth: number;
  successRate: number;
}

// ── Storage helpers ─────────────────────────────────────────────────────────────

const STORAGE_KEY_ROOMS = 'dealRoom_rooms';
const STORAGE_KEY_IOI = 'dealRoom_ioi';

function loadRooms(): DealRoom[] {
  const cached = store.get<DealRoom[] | null>(STORAGE_KEY_ROOMS, null);
  if (cached) return cached;
  const rooms = generateMockRooms();
  store.set(STORAGE_KEY_ROOMS, rooms);
  return rooms;
}

function saveRooms(rooms: DealRoom[]) {
  store.set(STORAGE_KEY_ROOMS, rooms);
}

function loadIOI(): IOIBroadcast[] {
  const cached = store.get<IOIBroadcast[] | null>(STORAGE_KEY_IOI, null);
  if (cached) return cached;
  const ioi = generateMockIOI();
  store.set(STORAGE_KEY_IOI, ioi);
  return ioi;
}

function saveIOI(list: IOIBroadcast[]) {
  store.set(STORAGE_KEY_IOI, list);
}

// ── Mock data generators ────────────────────────────────────────────────────────

function generateMockRooms(): DealRoom[] {
  const now = new Date();
  return [
    {
      id: 'dr-001',
      title: '2003 LeBron James Topps Chrome RC PSA 10',
      type: 'sell',
      status: 'negotiating',
      createdBy: 'p-001',
      participants: [
        { id: 'p-001', name: 'Heritage Capital', role: 'seller', institution: 'Heritage Capital Partners', verified: true, joinedAt: new Date(now.getTime() - 86400000 * 3).toISOString(), reputation: { rating: 4.9, trades: 247, memberSince: '2019' } },
        { id: 'p-002', name: 'Elite Cards LLC', role: 'buyer', institution: 'Elite Cards Institutional', verified: true, joinedAt: new Date(now.getTime() - 86400000 * 2).toISOString(), reputation: { rating: 4.7, trades: 183, memberSince: '2020' } },
        { id: 'p-003', name: 'J. Morgan (Broker)', role: 'broker', institution: 'Morgan Sports Advisory', verified: true, joinedAt: new Date(now.getTime() - 86400000 * 3).toISOString(), reputation: { rating: 4.8, trades: 412, memberSince: '2018' } },
      ],
      card: { player: 'LeBron James', description: '2003 Topps Chrome Rookie Card #111', grade: 'PSA 10', estimatedValue: 85000 },
      askingPrice: 82000,
      currentBid: 78500,
      messages: [
        { id: 'm-001', senderId: 'system', senderName: 'System', content: 'Encrypted deal room created. All messages are end-to-end encrypted.', timestamp: new Date(now.getTime() - 86400000 * 3).toISOString(), type: 'system' },
        { id: 'm-002', senderId: 'p-001', senderName: 'Heritage Capital', content: 'Offering 2003 LeBron Topps Chrome RC PSA 10. Population 218. Pristine centering, strong eye appeal. Authentication report attached.', timestamp: new Date(now.getTime() - 86400000 * 2.9).toISOString(), type: 'message' },
        { id: 'm-003', senderId: 'p-002', senderName: 'Elite Cards LLC', content: 'Interested. What provenance can you provide?', timestamp: new Date(now.getTime() - 86400000 * 2.5).toISOString(), type: 'message' },
        { id: 'm-004', senderId: 'p-001', senderName: 'Heritage Capital', content: 'Originally sourced from a sealed case break in 2004. One owner since grading in 2005. Full chain of custody available.', timestamp: new Date(now.getTime() - 86400000 * 2).toISOString(), type: 'message' },
        { id: 'm-005', senderId: 'p-002', senderName: 'Elite Cards LLC', content: 'Submitting initial offer.', timestamp: new Date(now.getTime() - 86400000 * 1.5).toISOString(), type: 'message' },
        { id: 'm-006', senderId: 'p-002', senderName: 'Elite Cards LLC', content: 'Offer: $75,000', timestamp: new Date(now.getTime() - 86400000 * 1.5).toISOString(), type: 'offer', offerAmount: 75000 },
        { id: 'm-007', senderId: 'p-001', senderName: 'Heritage Capital', content: 'Counter: $80,000. Recent comps support $82K-$88K range.', timestamp: new Date(now.getTime() - 86400000).toISOString(), type: 'counter', offerAmount: 80000 },
        { id: 'm-008', senderId: 'p-003', senderName: 'J. Morgan (Broker)', content: 'Both sides are within range. I recommend meeting at $78,500 given current market velocity.', timestamp: new Date(now.getTime() - 43200000).toISOString(), type: 'message' },
        { id: 'm-009', senderId: 'p-002', senderName: 'Elite Cards LLC', content: 'Counter: $78,500', timestamp: new Date(now.getTime() - 36000000).toISOString(), type: 'counter', offerAmount: 78500 },
      ],
      attachments: ['auth_report_lebron_2003.pdf', 'provenance_chain.pdf'],
      createdAt: new Date(now.getTime() - 86400000 * 3).toISOString(),
      expiresAt: new Date(now.getTime() + 86400000 * 4).toISOString(),
      isEncrypted: true,
    },
    {
      id: 'dr-002',
      title: '1986 Michael Jordan Fleer RC PSA 9',
      type: 'buy',
      status: 'active',
      createdBy: 'p-010',
      participants: [
        { id: 'p-010', name: 'You', role: 'buyer', institution: 'Personal Account', verified: true, joinedAt: new Date(now.getTime() - 86400000 * 5).toISOString(), reputation: { rating: 4.6, trades: 89, memberSince: '2021' } },
        { id: 'p-011', name: 'Vault Holdings', role: 'seller', institution: 'Vault Holdings Group', verified: true, joinedAt: new Date(now.getTime() - 86400000 * 4).toISOString(), reputation: { rating: 4.8, trades: 315, memberSince: '2017' } },
      ],
      card: { player: 'Michael Jordan', description: '1986 Fleer #57 Rookie Card', grade: 'PSA 9', estimatedValue: 42000 },
      askingPrice: 45000,
      currentBid: 0,
      messages: [
        { id: 'm-020', senderId: 'system', senderName: 'System', content: 'Encrypted deal room created.', timestamp: new Date(now.getTime() - 86400000 * 5).toISOString(), type: 'system' },
        { id: 'm-021', senderId: 'p-011', senderName: 'Vault Holdings', content: '1986 Fleer Jordan RC PSA 9 available. Strong corners, excellent registration. Pop 1,870 but condition is above average for the grade.', timestamp: new Date(now.getTime() - 86400000 * 4).toISOString(), type: 'message' },
        { id: 'm-022', senderId: 'p-010', senderName: 'You', content: 'Can you provide high-res scans of all four corners?', timestamp: new Date(now.getTime() - 86400000 * 3).toISOString(), type: 'message' },
        { id: 'm-023', senderId: 'p-011', senderName: 'Vault Holdings', content: 'Scans uploaded. Note the sharp corners — this could potentially cross to a BGS 9.5 with favorable subgrades.', timestamp: new Date(now.getTime() - 86400000 * 2).toISOString(), type: 'message' },
      ],
      attachments: ['jordan_fleer_86_scans.zip'],
      createdAt: new Date(now.getTime() - 86400000 * 5).toISOString(),
      expiresAt: new Date(now.getTime() + 86400000 * 10).toISOString(),
      isEncrypted: true,
    },
    {
      id: 'dr-003',
      title: '1952 Topps Mickey Mantle #311 SGC 4',
      type: 'auction',
      status: 'pending_close',
      createdBy: 'p-020',
      participants: [
        { id: 'p-020', name: 'Prestige Auctions', role: 'seller', institution: 'Prestige Sports Auctions', verified: true, joinedAt: new Date(now.getTime() - 86400000 * 14).toISOString(), reputation: { rating: 5.0, trades: 892, memberSince: '2015' } },
        { id: 'p-021', name: 'Cardboard Capital', role: 'buyer', institution: 'Cardboard Capital Mgmt', verified: true, joinedAt: new Date(now.getTime() - 86400000 * 10).toISOString(), reputation: { rating: 4.7, trades: 156, memberSince: '2020' } },
        { id: 'p-022', name: 'Vintage Vault Fund', role: 'buyer', institution: 'VVF Asset Management', verified: true, joinedAt: new Date(now.getTime() - 86400000 * 9).toISOString(), reputation: { rating: 4.9, trades: 278, memberSince: '2018' } },
        { id: 'p-010', name: 'You', role: 'observer', institution: 'Personal Account', verified: true, joinedAt: new Date(now.getTime() - 86400000 * 7).toISOString(), reputation: { rating: 4.6, trades: 89, memberSince: '2021' } },
      ],
      card: { player: 'Mickey Mantle', description: '1952 Topps #311', grade: 'SGC 4', estimatedValue: 98000 },
      askingPrice: 95000,
      currentBid: 92500,
      messages: [
        { id: 'm-030', senderId: 'system', senderName: 'System', content: 'Encrypted auction room created. Bidding is sealed until final round.', timestamp: new Date(now.getTime() - 86400000 * 14).toISOString(), type: 'system' },
        { id: 'm-031', senderId: 'p-020', senderName: 'Prestige Auctions', content: 'Presenting 1952 Topps Mantle #311 SGC 4. Eye appeal far exceeds grade. Original color, no trimming, clean back.', timestamp: new Date(now.getTime() - 86400000 * 13).toISOString(), type: 'message' },
        { id: 'm-032', senderId: 'p-021', senderName: 'Cardboard Capital', content: 'Offer: $85,000', timestamp: new Date(now.getTime() - 86400000 * 8).toISOString(), type: 'offer', offerAmount: 85000 },
        { id: 'm-033', senderId: 'p-022', senderName: 'Vintage Vault Fund', content: 'Offer: $88,000', timestamp: new Date(now.getTime() - 86400000 * 7).toISOString(), type: 'offer', offerAmount: 88000 },
        { id: 'm-034', senderId: 'p-021', senderName: 'Cardboard Capital', content: 'Counter: $91,000', timestamp: new Date(now.getTime() - 86400000 * 5).toISOString(), type: 'counter', offerAmount: 91000 },
        { id: 'm-035', senderId: 'p-022', senderName: 'Vintage Vault Fund', content: 'Counter: $92,500', timestamp: new Date(now.getTime() - 86400000 * 3).toISOString(), type: 'counter', offerAmount: 92500 },
        { id: 'm-036', senderId: 'p-020', senderName: 'Prestige Auctions', content: 'Final bidding round closes in 24 hours. Current high bid: $92,500 from Vintage Vault Fund.', timestamp: new Date(now.getTime() - 86400000).toISOString(), type: 'system' },
      ],
      attachments: ['mantle_52_auth.pdf', 'mantle_52_condition_report.pdf', 'mantle_52_provenance.pdf'],
      createdAt: new Date(now.getTime() - 86400000 * 14).toISOString(),
      expiresAt: new Date(now.getTime() + 86400000).toISOString(),
      isEncrypted: true,
    },
    {
      id: 'dr-004',
      title: '2018 Luka Doncic Prizm Silver RC PSA 10',
      type: 'swap',
      status: 'active',
      createdBy: 'p-010',
      participants: [
        { id: 'p-010', name: 'You', role: 'seller', institution: 'Personal Account', verified: true, joinedAt: new Date(now.getTime() - 86400000 * 2).toISOString(), reputation: { rating: 4.6, trades: 89, memberSince: '2021' } },
        { id: 'p-030', name: 'Swaphouse Trading', role: 'buyer', institution: 'Swaphouse Trading Co', verified: true, joinedAt: new Date(now.getTime() - 86400000).toISOString(), reputation: { rating: 4.5, trades: 204, memberSince: '2019' } },
      ],
      card: { player: 'Luka Doncic', description: '2018 Panini Prizm Silver #280 RC', grade: 'PSA 10', estimatedValue: 8500 },
      askingPrice: 8000,
      currentBid: 0,
      messages: [
        { id: 'm-040', senderId: 'system', senderName: 'System', content: 'Encrypted deal room created for swap negotiation.', timestamp: new Date(now.getTime() - 86400000 * 2).toISOString(), type: 'system' },
        { id: 'm-041', senderId: 'p-010', senderName: 'You', content: 'Looking to swap Luka Prizm Silver PSA 10 for a comparable Trae Young Prizm Silver PSA 10 + cash difference.', timestamp: new Date(now.getTime() - 86400000 * 1.5).toISOString(), type: 'message' },
        { id: 'm-042', senderId: 'p-030', senderName: 'Swaphouse Trading', content: 'I have a Trae Young Prizm Silver PSA 10 valued at $5,200. Would consider swap + $2,800 cash from my side.', timestamp: new Date(now.getTime() - 86400000).toISOString(), type: 'message' },
      ],
      attachments: [],
      createdAt: new Date(now.getTime() - 86400000 * 2).toISOString(),
      expiresAt: new Date(now.getTime() + 86400000 * 12).toISOString(),
      isEncrypted: true,
    },
  ];
}

function generateMockIOI(): IOIBroadcast[] {
  const now = new Date();
  return [
    { id: 'ioi-001', type: 'buy', anonymous: true, category: 'Basketball / LeBron James / Modern', priceRange: { min: 50000, max: 100000 }, description: 'Seeking any LeBron James RC in PSA 9+ condition. Topps Chrome, Bowman Chrome, or Exquisite preferred. Immediate settlement available.', responses: 4, postedAt: new Date(now.getTime() - 86400000 * 2).toISOString(), expiresAt: new Date(now.getTime() + 86400000 * 5).toISOString(), status: 'active' },
    { id: 'ioi-002', type: 'sell', anonymous: false, category: 'Baseball / Vintage / Pre-War', priceRange: { min: 25000, max: 75000 }, description: 'Offering a collection of 1933 Goudey cards including Ruth #53 SGC 3, Gehrig #160 SGC 2.5, and Foxx #29 SGC 4. Will sell individually or as lot.', responses: 7, postedAt: new Date(now.getTime() - 86400000 * 4).toISOString(), expiresAt: new Date(now.getTime() + 86400000 * 3).toISOString(), status: 'active' },
    { id: 'ioi-003', type: 'buy', anonymous: true, category: 'Football / Patrick Mahomes / Modern', priceRange: { min: 15000, max: 40000 }, description: 'Looking for 2017 Mahomes Prizm Silver RC PSA 10 or Optic Rated Rookie PSA 10. Prefer cards with strong centering.', responses: 2, postedAt: new Date(now.getTime() - 86400000).toISOString(), expiresAt: new Date(now.getTime() + 86400000 * 7).toISOString(), status: 'active' },
    { id: 'ioi-004', type: 'sell', anonymous: false, category: 'Basketball / Michael Jordan / Vintage', priceRange: { min: 30000, max: 60000 }, description: '1986 Fleer Jordan RC PSA 8 available for private sale. Fresh from a long-term collection. No auction — direct deal only.', responses: 11, postedAt: new Date(now.getTime() - 86400000 * 3).toISOString(), expiresAt: new Date(now.getTime() + 86400000 * 4).toISOString(), status: 'active' },
    { id: 'ioi-005', type: 'buy', anonymous: true, category: 'Baseball / Shohei Ohtani / Modern', priceRange: { min: 5000, max: 20000 }, description: 'Institutional buyer seeking bulk Ohtani RCs. Interested in Topps Chrome, Bowman 1st, and Update Series. PSA 9-10 only. Volume discount expected.', responses: 6, postedAt: new Date(now.getTime() - 86400000 * 5).toISOString(), expiresAt: new Date(now.getTime() + 86400000 * 2).toISOString(), status: 'active' },
    { id: 'ioi-006', type: 'sell', anonymous: true, category: 'Basketball / Giannis Antetokounmpo / Modern', priceRange: { min: 8000, max: 15000 }, description: '2013 Giannis Prizm RC PSA 10. Pop 487. Looking for serious buyers only. Wire transfer preferred.', responses: 3, postedAt: new Date(now.getTime() - 86400000 * 1.5).toISOString(), expiresAt: new Date(now.getTime() + 86400000 * 6).toISOString(), status: 'active' },
    { id: 'ioi-007', type: 'buy', anonymous: false, category: 'Football / Tom Brady / Vintage Modern', priceRange: { min: 20000, max: 50000 }, description: 'Seeking 2000 Playoff Contenders Championship Ticket Tom Brady RC. Any grade considered for the right price. PSA/BGS preferred.', responses: 1, postedAt: new Date(now.getTime() - 86400000 * 6).toISOString(), expiresAt: new Date(now.getTime() + 86400000 * 8).toISOString(), status: 'active' },
    { id: 'ioi-008', type: 'sell', anonymous: false, category: 'Baseball / Mike Trout / Modern', priceRange: { min: 40000, max: 80000 }, description: '2011 Topps Update Mike Trout RC PSA 10. Gem mint with exceptional eye appeal. Comp sales at $72K-$85K. Will entertain offers above $65K.', responses: 9, postedAt: new Date(now.getTime() - 86400000 * 2).toISOString(), expiresAt: new Date(now.getTime() + 86400000 * 5).toISOString(), status: 'active' },
  ];
}

// ── Public API ───────────────────────────────────────────────────────────────────

export function getDealRooms(): DealRoom[] {
  return loadRooms();
}

export function createDealRoom(
  card: { player: string; description: string; grade: string; estimatedValue: number },
  type: DealRoom['type'],
  askingPrice: number
): DealRoom {
  const rooms = loadRooms();
  const now = new Date();
  const newRoom: DealRoom = {
    id: `dr-${Date.now()}`,
    title: `${card.player} ${card.description} ${card.grade}`,
    type,
    status: 'active',
    createdBy: 'p-010',
    participants: [
      {
        id: 'p-010',
        name: 'You',
        role: type === 'sell' || type === 'swap' ? 'seller' : 'buyer',
        institution: 'Personal Account',
        verified: true,
        joinedAt: now.toISOString(),
        reputation: { rating: 4.6, trades: 89, memberSince: '2021' },
      },
    ],
    card,
    askingPrice,
    currentBid: 0,
    messages: [
      {
        id: `m-${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        content: `Encrypted deal room created for ${type} negotiation. Awaiting participants.`,
        timestamp: now.toISOString(),
        type: 'system',
      },
    ],
    attachments: [],
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 86400000 * 14).toISOString(),
    isEncrypted: true,
  };
  rooms.unshift(newRoom);
  saveRooms(rooms);
  return newRoom;
}

export function sendMessage(roomId: string, message: Omit<DealMessage, 'id' | 'timestamp'>): DealMessage {
  const rooms = loadRooms();
  const room = rooms.find(r => r.id === roomId);
  if (!room) throw new Error('Room not found');
  const msg: DealMessage = {
    ...message,
    id: `m-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  room.messages.push(msg);
  saveRooms(rooms);
  return msg;
}

export function makeOffer(roomId: string, amount: number): DealMessage {
  const rooms = loadRooms();
  const room = rooms.find(r => r.id === roomId);
  if (!room) throw new Error('Room not found');
  const msg: DealMessage = {
    id: `m-${Date.now()}`,
    senderId: 'p-010',
    senderName: 'You',
    content: `Offer: $${amount.toLocaleString()}`,
    timestamp: new Date().toISOString(),
    type: 'offer',
    offerAmount: amount,
  };
  room.messages.push(msg);
  room.currentBid = Math.max(room.currentBid, amount);
  if (room.status === 'active') room.status = 'negotiating';
  saveRooms(rooms);
  return msg;
}

export function getIOIBoard(): IOIBroadcast[] {
  return loadIOI();
}

export function broadcastIOI(ioi: Omit<IOIBroadcast, 'id' | 'responses' | 'postedAt' | 'status'>): IOIBroadcast {
  const list = loadIOI();
  const newIOI: IOIBroadcast = {
    ...ioi,
    id: `ioi-${Date.now()}`,
    responses: 0,
    postedAt: new Date().toISOString(),
    status: 'active',
  };
  list.unshift(newIOI);
  saveIOI(list);
  return newIOI;
}

export function getDealFlowStats(): DealFlowStats {
  const rooms = loadRooms();
  const active = rooms.filter(r => r.status !== 'closed' && r.status !== 'expired');
  const pending = rooms.filter(r => r.status === 'negotiating' || r.status === 'pending_close');
  const closed = rooms.filter(r => r.status === 'closed');
  const totalVolume = rooms.reduce((sum, r) => sum + Math.max(r.currentBid, r.askingPrice), 0);
  return {
    activeRooms: active.length,
    pendingOffers: pending.length,
    totalVolume,
    avgDealSize: rooms.length > 0 ? Math.round(totalVolume / rooms.length) : 0,
    closedThisMonth: closed.length + 3, // simulated additional closed deals
    successRate: 78.4,
  };
}

// ── Monthly volume data for analytics chart ─────────────────────────────────────

export function getMonthlyVolume(): { month: string; volume: number; deals: number }[] {
  return [
    { month: 'Sep', volume: 142000, deals: 8 },
    { month: 'Oct', volume: 218000, deals: 12 },
    { month: 'Nov', volume: 185000, deals: 9 },
    { month: 'Dec', volume: 310000, deals: 16 },
    { month: 'Jan', volume: 267000, deals: 14 },
    { month: 'Feb', volume: 345000, deals: 18 },
    { month: 'Mar', volume: 198000, deals: 11 },
  ];
}

function mapRoomRecordToDealRoom(
  room: Awaited<ReturnType<typeof fetchPersistedDealRooms>>[number],
  participants: Awaited<ReturnType<typeof fetchDealRoomParticipants>>,
  messages: Awaited<ReturnType<typeof fetchDealRoomMessages>>,
  attachments: Awaited<ReturnType<typeof fetchDealRoomAttachments>>,
): DealRoom {
  return {
    id: room.id,
    title: room.title,
    type: room.roomType,
    status: room.status,
    createdBy: room.ownerUserId || 'owner',
    participants: participants.map(participant => ({
      id: participant.id,
      name: participant.displayName,
      role: participant.role,
      institution: 'MSI Verified Counterparty',
      verified: participant.isVerified,
      joinedAt: participant.joinedAt,
      reputation: {
        rating: participant.isVerified ? 4.8 : 4.2,
        trades: 0,
        memberSince: participant.joinedAt.slice(0, 4),
      },
    })),
    card: {
      player: room.cardPlayer,
      description: room.cardDescription,
      grade: room.cardGrade || 'Raw',
      estimatedValue: room.estimatedValue || room.askingPrice || 0,
    },
    askingPrice: room.askingPrice || 0,
    currentBid: room.currentBid || 0,
    messages: messages.map(message => ({
      id: message.id,
      senderId: message.senderParticipantId || 'system',
      senderName: message.senderDisplayName,
      content: message.content,
      timestamp: message.createdAt,
      type: message.messageType,
      offerAmount: message.offerAmount,
      attachedData: message.metadata,
    })),
    attachments: attachments.map(attachment => attachment.filename),
    createdAt: room.createdAt,
    expiresAt: room.expiresAt || new Date(Date.now() + 14 * 86400000).toISOString(),
    isEncrypted: room.isEncrypted,
  };
}

export async function getDealRoomsAsync(ownerUserId?: string): Promise<DealRoom[]> {
  const rooms = await fetchPersistedDealRooms(ownerUserId);
  if (rooms.length === 0) {
    return getDealRooms();
  }

  const hydrated = await Promise.all(rooms.map(async room => {
    const [participants, messages, attachments] = await Promise.all([
      fetchDealRoomParticipants(room.id),
      fetchDealRoomMessages(room.id),
      fetchDealRoomAttachments(room.id),
    ]);
    return mapRoomRecordToDealRoom(room, participants, messages, attachments);
  }));

  return hydrated;
}

export async function createDealRoomAsync(
  card: { player: string; description: string; grade: string; estimatedValue: number },
  type: DealRoom['type'],
  askingPrice: number,
  ownerUserId?: string | null,
): Promise<DealRoom> {
  const now = new Date().toISOString();
  const roomRecord = {
    id: crypto.randomUUID(),
    ownerUserId: ownerUserId || null,
    title: `${card.player} ${card.description} ${card.grade}`,
    roomType: type,
    status: 'active' as const,
    cardPlayer: card.player,
    cardDescription: card.description,
    cardGrade: card.grade,
    estimatedValue: card.estimatedValue,
    askingPrice,
    currentBid: 0,
    isEncrypted: true,
    createdAt: now,
    expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
    metadata: { source: 'private_deal_room_agent' },
  };
  await upsertDealRoom(roomRecord);

  const participant = {
    id: crypto.randomUUID(),
    roomId: roomRecord.id,
    userId: ownerUserId || null,
    displayName: 'You',
    role: type === 'sell' || type === 'swap' ? 'seller' as const : 'buyer' as const,
    isVerified: true,
    joinedAt: now,
  };
  await upsertDealRoomParticipant(participant);
  await insertDealRoomMessage({
    id: crypto.randomUUID(),
    roomId: roomRecord.id,
    senderParticipantId: null,
    senderDisplayName: 'System',
    messageType: 'system',
    content: `Private deal room created for ${card.player}.`,
    createdAt: now,
  });

  return mapRoomRecordToDealRoom(roomRecord, [participant], [{
    id: crypto.randomUUID(),
    roomId: roomRecord.id,
    senderParticipantId: null,
    senderDisplayName: 'System',
    messageType: 'system',
    content: `Private deal room created for ${card.player}.`,
    createdAt: now,
  }], []);
}

export async function sendMessageAsync(roomId: string, message: Omit<DealMessage, 'id' | 'timestamp'>): Promise<DealMessage> {
  const next: DealMessage = {
    ...message,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };
  await insertDealRoomMessage({
    id: next.id,
    roomId,
    senderParticipantId: next.senderId === 'system' ? null : next.senderId,
    senderDisplayName: next.senderName,
    messageType: next.type,
    content: next.content,
    offerAmount: next.offerAmount,
    metadata: next.attachedData,
    createdAt: next.timestamp,
  });
  return next;
}

export async function makeOfferAsync(roomId: string, amount: number): Promise<DealMessage> {
  return sendMessageAsync(roomId, {
    senderId: 'p-010',
    senderName: 'You',
    content: `Offer: $${amount.toLocaleString()}`,
    type: 'offer',
    offerAmount: amount,
  });
}
