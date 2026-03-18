import { store } from './dal/syncStore';
import {
    AgentOutcomeRecord,
    AgentRecommendationRecord,
    CatalystMarketEvent,
    CounterpartyEdge,
    CounterpartyProfile,
    DealRoomAttachment,
    DealRoomMessageRecord,
    DealRoomParticipantRecord,
    DealRoomRecord,
    ExecutionApprovalRecord,
    ExecutionFillRecord,
    ExecutionIntentRecord,
    ListingOfferRecord,
    MarketplaceListingRecord,
    ScenarioRunRecord,
    ScenarioSnapshot,
    TrustEvent,
} from '../types';
import { isDemoMode, supabase } from './supabase';
import { logger } from './logger';

type PersistedRow = Record<string, any>;

export type DifferentiatorPersistenceStatus = 'local' | 'retrying' | 'synced' | 'offline' | 'error';

export interface DifferentiatorPersistenceState {
    status: DifferentiatorPersistenceStatus;
    lastError: string | null;
    lastSyncedAt: string | null;
}

const LOCAL_KEYS = {
    listings: 'msi_diff_marketplace_listings',
    offers: 'msi_diff_listing_offers',
    counterparties: 'msi_diff_counterparties',
    edges: 'msi_diff_counterparty_edges',
    trustEvents: 'msi_diff_trust_events',
    dealRooms: 'msi_diff_deal_rooms',
    participants: 'msi_diff_deal_room_participants',
    messages: 'msi_diff_deal_room_messages',
    attachments: 'msi_diff_deal_room_attachments',
    catalystEvents: 'msi_diff_catalyst_events',
    scenarioSnapshots: 'msi_diff_scenario_snapshots',
    scenarioRuns: 'msi_diff_scenario_runs',
    agentRecommendations: 'msi_diff_agent_recommendations',
    agentOutcomes: 'msi_diff_agent_outcomes',
    executionIntents: 'msi_diff_execution_intents',
    executionApprovals: 'msi_diff_execution_approvals',
    executionFills: 'msi_diff_execution_fills',
} as const;

const persistenceState = new Map<string, DifferentiatorPersistenceState>();

function readLocal<T>(key: string): T[] {
    const parsed = store.get<T[]>(key, []);
    return Array.isArray(parsed) ? parsed : [];
}

function writeLocal<T>(key: string, rows: T[]): void {
    store.set(key, rows);
}

function upsertLocal<T extends { id: string }>(key: string, row: T): T {
    const existing = readLocal<T>(key);
    const next = [row, ...existing.filter(item => item.id !== row.id)];
    writeLocal(key, next);
    return row;
}

function sortNewest<T extends { createdAt?: string }>(rows: T[]): T[] {
    return [...rows].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
}

function setPersistenceState(key: string, next: Partial<DifferentiatorPersistenceState>) {
    const current = persistenceState.get(key) || {
        status: 'local',
        lastError: null,
        lastSyncedAt: null,
    };
    persistenceState.set(key, {
        ...current,
        ...next,
    });
}

export function getDifferentiatorPersistenceState(key: string): DifferentiatorPersistenceState {
    return persistenceState.get(key) || {
        status: isDemoMode ? 'local' : 'retrying',
        lastError: null,
        lastSyncedAt: null,
    };
}

function marketplaceListingFromRow(row: PersistedRow): MarketplaceListingRecord {
    return {
        id: row.id,
        ownerUserId: row.owner_user_id,
        counterpartyId: row.counterparty_id,
        sourceVenue: row.source_venue,
        externalListingId: row.external_listing_id,
        title: row.title,
        player: row.player,
        cardDescription: row.card_description,
        sport: row.sport,
        year: row.year,
        setName: row.set_name,
        grade: row.grade,
        condition: row.condition,
        askingPrice: Number(row.asking_price),
        estimatedMarketValue: row.estimated_market_value ? Number(row.estimated_market_value) : undefined,
        currency: row.currency || 'USD',
        status: row.status,
        listingUrl: row.listing_url,
        imageUrl: row.image_url,
        metadata: row.metadata || {},
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function marketplaceListingToRow(listing: MarketplaceListingRecord): PersistedRow {
    return {
        id: listing.id,
        owner_user_id: listing.ownerUserId || null,
        counterparty_id: listing.counterpartyId || null,
        source_venue: listing.sourceVenue,
        external_listing_id: listing.externalListingId || null,
        title: listing.title,
        player: listing.player,
        card_description: listing.cardDescription,
        sport: listing.sport,
        year: listing.year,
        set_name: listing.setName,
        grade: listing.grade,
        condition: listing.condition,
        asking_price: listing.askingPrice,
        estimated_market_value: listing.estimatedMarketValue,
        currency: listing.currency,
        status: listing.status,
        listing_url: listing.listingUrl,
        image_url: listing.imageUrl,
        metadata: listing.metadata || {},
        created_at: listing.createdAt,
        updated_at: listing.updatedAt || new Date().toISOString(),
    };
}

function listingOfferFromRow(row: PersistedRow): ListingOfferRecord {
    return {
        id: row.id,
        listingId: row.listing_id,
        buyerCounterpartyId: row.buyer_counterparty_id,
        sellerCounterpartyId: row.seller_counterparty_id,
        amount: Number(row.amount),
        currency: row.currency || 'USD',
        status: row.status,
        message: row.message,
        sourceVenue: row.source_venue,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        expiresAt: row.expires_at,
    };
}

function listingOfferToRow(offer: ListingOfferRecord, ownerUserId?: string | null): PersistedRow {
    return {
        id: offer.id,
        owner_user_id: ownerUserId || null,
        listing_id: offer.listingId,
        buyer_counterparty_id: offer.buyerCounterpartyId || null,
        seller_counterparty_id: offer.sellerCounterpartyId || null,
        amount: offer.amount,
        currency: offer.currency,
        status: offer.status,
        message: offer.message,
        source_venue: offer.sourceVenue,
        created_at: offer.createdAt,
        updated_at: offer.updatedAt || new Date().toISOString(),
        expires_at: offer.expiresAt,
    };
}

function counterpartyFromRow(row: PersistedRow): CounterpartyProfile {
    return {
        id: row.id,
        ownerUserId: row.owner_user_id,
        displayName: row.display_name,
        handle: row.handle,
        marketplaceVenue: row.marketplace_venue,
        externalReference: row.external_reference,
        verificationTier: row.verification_tier,
        trustScore: Number(row.trust_score || 0),
        reputationScore: Number(row.reputation_score || 0),
        successfulDeals: Number(row.successful_deals || 0),
        disputedDeals: Number(row.disputed_deals || 0),
        avgResponseHours: row.avg_response_hours ? Number(row.avg_response_hours) : undefined,
        avgCloseDays: row.avg_close_days ? Number(row.avg_close_days) : undefined,
        totalVolumeUsd: row.total_volume_usd ? Number(row.total_volume_usd) : undefined,
        fraudFlags: Number(row.fraud_flags || 0),
        riskLevel: row.risk_level,
        notes: row.notes,
        lastInteractionAt: row.last_interaction_at,
        createdAt: row.created_at,
    };
}

function counterpartyToRow(profile: CounterpartyProfile): PersistedRow {
    return {
        id: profile.id,
        owner_user_id: profile.ownerUserId || null,
        display_name: profile.displayName,
        handle: profile.handle,
        marketplace_venue: profile.marketplaceVenue,
        external_reference: profile.externalReference,
        verification_tier: profile.verificationTier,
        trust_score: profile.trustScore,
        reputation_score: profile.reputationScore,
        successful_deals: profile.successfulDeals,
        disputed_deals: profile.disputedDeals,
        avg_response_hours: profile.avgResponseHours,
        avg_close_days: profile.avgCloseDays,
        total_volume_usd: profile.totalVolumeUsd,
        fraud_flags: profile.fraudFlags,
        risk_level: profile.riskLevel,
        notes: profile.notes,
        last_interaction_at: profile.lastInteractionAt,
        created_at: profile.createdAt,
        updated_at: new Date().toISOString(),
    };
}

function edgeFromRow(row: PersistedRow): CounterpartyEdge {
    return {
        id: row.id,
        sourceCounterpartyId: row.source_counterparty_id,
        targetCounterpartyId: row.target_counterparty_id,
        edgeType: row.edge_type,
        weight: Number(row.weight || 0),
        trustDelta: Number(row.trust_delta || 0),
        evidenceCount: Number(row.evidence_count || 0),
        metadata: row.metadata || {},
        createdAt: row.created_at,
    };
}

function edgeToRow(edge: CounterpartyEdge, ownerUserId?: string | null): PersistedRow {
    return {
        id: edge.id,
        owner_user_id: ownerUserId || null,
        source_counterparty_id: edge.sourceCounterpartyId,
        target_counterparty_id: edge.targetCounterpartyId,
        edge_type: edge.edgeType,
        weight: edge.weight,
        trust_delta: edge.trustDelta,
        evidence_count: edge.evidenceCount,
        metadata: edge.metadata || {},
        created_at: edge.createdAt,
    };
}

function trustEventFromRow(row: PersistedRow): TrustEvent {
    return {
        id: row.id,
        counterpartyId: row.counterparty_id,
        eventType: row.event_type,
        impactScore: Number(row.impact_score || 0),
        referenceType: row.reference_type,
        referenceId: row.reference_id,
        notes: row.notes,
        metadata: row.metadata || {},
        createdAt: row.created_at,
    };
}

function trustEventToRow(event: TrustEvent, ownerUserId?: string | null): PersistedRow {
    return {
        id: event.id,
        owner_user_id: ownerUserId || null,
        counterparty_id: event.counterpartyId,
        event_type: event.eventType,
        impact_score: event.impactScore,
        reference_type: event.referenceType,
        reference_id: event.referenceId,
        notes: event.notes,
        metadata: event.metadata || {},
        created_at: event.createdAt,
    };
}

function dealRoomFromRow(row: PersistedRow): DealRoomRecord {
    return {
        id: row.id,
        ownerUserId: row.owner_user_id,
        listingId: row.listing_id,
        title: row.title,
        roomType: row.room_type,
        status: row.status,
        cardPlayer: row.card_player,
        cardDescription: row.card_description,
        cardGrade: row.card_grade,
        estimatedValue: row.estimated_value ? Number(row.estimated_value) : undefined,
        askingPrice: row.asking_price ? Number(row.asking_price) : undefined,
        currentBid: row.current_bid ? Number(row.current_bid) : undefined,
        isEncrypted: Boolean(row.is_encrypted),
        createdAt: row.created_at,
        expiresAt: row.expires_at,
        metadata: row.metadata || {},
    };
}

function dealRoomToRow(room: DealRoomRecord): PersistedRow {
    return {
        id: room.id,
        owner_user_id: room.ownerUserId || null,
        listing_id: room.listingId || null,
        title: room.title,
        room_type: room.roomType,
        status: room.status,
        card_player: room.cardPlayer,
        card_description: room.cardDescription,
        card_grade: room.cardGrade,
        estimated_value: room.estimatedValue,
        asking_price: room.askingPrice,
        current_bid: room.currentBid,
        is_encrypted: room.isEncrypted,
        metadata: room.metadata || {},
        created_at: room.createdAt,
        expires_at: room.expiresAt,
    };
}

function participantFromRow(row: PersistedRow): DealRoomParticipantRecord {
    return {
        id: row.id,
        roomId: row.room_id,
        userId: row.user_id,
        counterpartyId: row.counterparty_id,
        displayName: row.display_name,
        role: row.role,
        isVerified: Boolean(row.is_verified),
        joinedAt: row.joined_at,
    };
}

function participantToRow(record: DealRoomParticipantRecord): PersistedRow {
    return {
        id: record.id,
        room_id: record.roomId,
        user_id: record.userId || null,
        counterparty_id: record.counterpartyId || null,
        display_name: record.displayName,
        role: record.role,
        is_verified: record.isVerified,
        joined_at: record.joinedAt,
    };
}

function messageFromRow(row: PersistedRow): DealRoomMessageRecord {
    return {
        id: row.id,
        roomId: row.room_id,
        senderParticipantId: row.sender_participant_id,
        senderDisplayName: row.sender_display_name,
        messageType: row.message_type,
        content: row.content,
        offerAmount: row.offer_amount ? Number(row.offer_amount) : undefined,
        metadata: row.metadata || {},
        createdAt: row.created_at,
    };
}

function messageToRow(record: DealRoomMessageRecord): PersistedRow {
    return {
        id: record.id,
        room_id: record.roomId,
        sender_participant_id: record.senderParticipantId || null,
        sender_display_name: record.senderDisplayName,
        message_type: record.messageType,
        content: record.content,
        offer_amount: record.offerAmount,
        metadata: record.metadata || {},
        created_at: record.createdAt,
    };
}

function attachmentFromRow(row: PersistedRow): DealRoomAttachment {
    return {
        id: row.id,
        roomId: row.room_id,
        storagePath: row.storage_path,
        filename: row.filename,
        mimeType: row.mime_type,
        uploadedBy: row.uploaded_by,
        uploadedAt: row.created_at,
    };
}

function attachmentToRow(record: DealRoomAttachment): PersistedRow {
    return {
        id: record.id,
        room_id: record.roomId,
        storage_path: record.storagePath,
        filename: record.filename,
        mime_type: record.mimeType,
        uploaded_by: record.uploadedBy || null,
        created_at: record.uploadedAt,
    };
}

function catalystEventFromRow(row: PersistedRow): CatalystMarketEvent {
    return {
        id: row.id,
        assetId: row.asset_id,
        assetName: row.asset_name,
        catalystType: row.catalyst_type,
        headline: row.headline,
        narrative: row.narrative,
        confidence: Number(row.confidence || 0),
        expectedMovePct: Number(row.expected_move_pct || 0),
        downsidePct: Number(row.downside_pct || 0),
        severity: row.severity,
        triggerWindow: row.trigger_window,
        source: row.source,
        linkedListingId: row.linked_listing_id,
        linkedDealRoomId: row.linked_deal_room_id,
        createdAt: row.created_at,
    };
}

function catalystEventToRow(event: CatalystMarketEvent, ownerUserId?: string | null): PersistedRow {
    return {
        id: event.id,
        owner_user_id: ownerUserId || null,
        asset_id: event.assetId || null,
        asset_name: event.assetName,
        catalyst_type: event.catalystType,
        headline: event.headline,
        narrative: event.narrative,
        confidence: event.confidence,
        expected_move_pct: event.expectedMovePct,
        downside_pct: event.downsidePct,
        severity: event.severity,
        trigger_window: event.triggerWindow,
        source: event.source,
        linked_listing_id: event.linkedListingId || null,
        linked_deal_room_id: event.linkedDealRoomId || null,
        created_at: event.createdAt,
    };
}

function scenarioSnapshotFromRow(row: PersistedRow): ScenarioSnapshot {
    return {
        id: row.id,
        ownerUserId: row.owner_user_id,
        name: row.name,
        templateKind: row.template_kind,
        description: row.description,
        inputs: row.inputs || {},
        summary: row.summary,
        createdAt: row.created_at,
    };
}

function scenarioSnapshotToRow(snapshot: ScenarioSnapshot): PersistedRow {
    return {
        id: snapshot.id,
        owner_user_id: snapshot.ownerUserId || null,
        name: snapshot.name,
        template_kind: snapshot.templateKind,
        description: snapshot.description,
        inputs: snapshot.inputs || {},
        summary: snapshot.summary,
        created_at: snapshot.createdAt,
    };
}

function scenarioRunFromRow(row: PersistedRow): ScenarioRunRecord {
    return {
        id: row.id,
        ownerUserId: row.owner_user_id,
        snapshotId: row.snapshot_id,
        scenarioName: row.scenario_name,
        scenarioKind: row.scenario_kind,
        portfolioValue: Number(row.portfolio_value || 0),
        projectedValue: Number(row.projected_value || 0),
        navDelta: Number(row.nav_delta || 0),
        riskScore: row.risk_score ? Number(row.risk_score) : undefined,
        summary: row.summary,
        inputs: row.inputs || {},
        outputs: row.outputs || {},
        createdAt: row.created_at,
    };
}

function scenarioRunToRow(run: ScenarioRunRecord): PersistedRow {
    return {
        id: run.id,
        owner_user_id: run.ownerUserId || null,
        snapshot_id: run.snapshotId || null,
        scenario_name: run.scenarioName,
        scenario_kind: run.scenarioKind,
        portfolio_value: run.portfolioValue,
        projected_value: run.projectedValue,
        nav_delta: run.navDelta,
        risk_score: run.riskScore,
        summary: run.summary,
        inputs: run.inputs || {},
        outputs: run.outputs || {},
        created_at: run.createdAt,
    };
}

function agentRecommendationFromRow(row: PersistedRow): AgentRecommendationRecord {
    return {
        id: row.id,
        ownerUserId: row.owner_user_id,
        source: row.source,
        cycleId: row.cycle_id,
        thesisId: row.thesis_id,
        summary: row.summary,
        recommendedAction: row.recommended_action,
        riskAssessment: row.risk_assessment,
        status: row.status,
        keyTakeaways: Array.isArray(row.key_takeaways) ? row.key_takeaways : [],
        agents: Array.isArray(row.agents) ? row.agents : [],
        executionPlan: Array.isArray(row.execution_plan) ? row.execution_plan : [],
        linkedIntentId: row.linked_intent_id,
        linkedOutcomeId: row.linked_outcome_id,
        metadata: row.metadata || {},
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function agentRecommendationToRow(record: AgentRecommendationRecord): PersistedRow {
    return {
        id: record.id,
        owner_user_id: record.ownerUserId || null,
        source: record.source,
        cycle_id: record.cycleId || null,
        thesis_id: record.thesisId || null,
        summary: record.summary,
        recommended_action: record.recommendedAction,
        risk_assessment: record.riskAssessment,
        status: record.status,
        key_takeaways: record.keyTakeaways || [],
        agents: record.agents || [],
        execution_plan: record.executionPlan || [],
        linked_intent_id: record.linkedIntentId || null,
        linked_outcome_id: record.linkedOutcomeId || null,
        metadata: record.metadata || {},
        created_at: record.createdAt,
        updated_at: record.updatedAt || new Date().toISOString(),
    };
}

function agentOutcomeFromRow(row: PersistedRow): AgentOutcomeRecord {
    return {
        id: row.id,
        ownerUserId: row.owner_user_id,
        recommendationId: row.recommendation_id,
        intentId: row.intent_id,
        fillId: row.fill_id,
        outcomeType: row.outcome_type,
        amount: row.amount ? Number(row.amount) : undefined,
        quantity: row.quantity ? Number(row.quantity) : undefined,
        price: row.price ? Number(row.price) : undefined,
        venue: row.venue,
        rationale: row.rationale,
        metadata: row.metadata || {},
        recordedAt: row.recorded_at,
    };
}

function agentOutcomeToRow(record: AgentOutcomeRecord): PersistedRow {
    return {
        id: record.id,
        owner_user_id: record.ownerUserId || null,
        recommendation_id: record.recommendationId,
        intent_id: record.intentId || null,
        fill_id: record.fillId || null,
        outcome_type: record.outcomeType,
        amount: record.amount,
        quantity: record.quantity,
        price: record.price,
        venue: record.venue || null,
        rationale: record.rationale,
        metadata: record.metadata || {},
        recorded_at: record.recordedAt,
    };
}

function executionIntentFromRow(row: PersistedRow): ExecutionIntentRecord {
    return {
        id: row.id,
        ownerUserId: row.owner_user_id,
        recommendationId: row.recommendation_id,
        counterpartyId: row.counterparty_id,
        listingId: row.listing_id,
        dealRoomId: row.deal_room_id,
        actionType: row.action_type,
        venue: row.venue,
        assetId: row.asset_id,
        assetName: row.asset_name,
        quantity: Number(row.quantity || 0),
        limitPrice: Number(row.limit_price || 0),
        maxSlippagePct: row.max_slippage_pct ? Number(row.max_slippage_pct) : undefined,
        status: row.status,
        rationale: row.rationale,
        metadata: row.metadata || {},
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function executionIntentToRow(intent: ExecutionIntentRecord): PersistedRow {
    return {
        id: intent.id,
        owner_user_id: intent.ownerUserId || null,
        recommendation_id: intent.recommendationId || null,
        counterparty_id: intent.counterpartyId || null,
        listing_id: intent.listingId || null,
        deal_room_id: intent.dealRoomId || null,
        action_type: intent.actionType,
        venue: intent.venue,
        asset_id: intent.assetId || null,
        asset_name: intent.assetName,
        quantity: intent.quantity,
        limit_price: intent.limitPrice,
        max_slippage_pct: intent.maxSlippagePct,
        status: intent.status,
        rationale: intent.rationale,
        metadata: intent.metadata || {},
        created_at: intent.createdAt,
        updated_at: intent.updatedAt || new Date().toISOString(),
    };
}

function executionApprovalFromRow(row: PersistedRow): ExecutionApprovalRecord {
    return {
        id: row.id,
        intentId: row.intent_id,
        decision: row.decision,
        actorUserId: row.actor_user_id,
        actorLabel: row.actor_label,
        note: row.note,
        createdAt: row.created_at,
    };
}

function executionApprovalToRow(record: ExecutionApprovalRecord): PersistedRow {
    return {
        id: record.id,
        intent_id: record.intentId,
        actor_user_id: record.actorUserId || null,
        actor_label: record.actorLabel,
        decision: record.decision,
        note: record.note,
        created_at: record.createdAt,
    };
}

function executionFillFromRow(row: PersistedRow): ExecutionFillRecord {
    return {
        id: row.id,
        intentId: row.intent_id,
        venue: row.venue,
        fillQuantity: Number(row.fill_quantity || 0),
        fillPrice: Number(row.fill_price || 0),
        fees: row.fees ? Number(row.fees) : undefined,
        state: row.state,
        externalOrderId: row.external_order_id,
        createdAt: row.created_at,
    };
}

function executionFillToRow(record: ExecutionFillRecord): PersistedRow {
    return {
        id: record.id,
        intent_id: record.intentId,
        venue: record.venue,
        fill_quantity: record.fillQuantity,
        fill_price: record.fillPrice,
        fees: record.fees,
        state: record.state,
        external_order_id: record.externalOrderId || null,
        created_at: record.createdAt,
    };
}

async function fetchRows(table: string, mapper: (_row: PersistedRow) => any, localKey: string, query?: (_builder: any) => any) {
    if (isDemoMode) {
        setPersistenceState(localKey, { status: 'local', lastError: null });
        return sortNewest(readLocal(localKey) as any[]);
    }

    let builder = supabase.from(table).select('*');
    builder = query ? query(builder) : builder.order('created_at', { ascending: false });
    const { data, error } = await builder;
    if (error) {
        logger.error(`Failed to fetch ${table}:`, error);
        setPersistenceState(localKey, {
            status: 'offline',
            lastError: `Failed to fetch ${table} from cloud. Showing cached local data.`,
        });
        return sortNewest(readLocal(localKey) as any[]);
    }
    setPersistenceState(localKey, {
        status: 'synced',
        lastError: null,
        lastSyncedAt: new Date().toISOString(),
    });
    return (data || []).map(mapper);
}

async function upsertRow<T extends { id: string }>(table: string, row: PersistedRow, localKey: string, localValue: T) {
    upsertLocal(localKey, localValue);
    if (isDemoMode) {
        setPersistenceState(localKey, { status: 'local', lastError: null });
        return true;
    }

    setPersistenceState(localKey, { status: 'retrying', lastError: null });
    const { error } = await supabase.from(table).upsert(row, { onConflict: 'id' });
    if (error) {
        logger.error(`Failed to upsert ${table}:`, error);
        setPersistenceState(localKey, {
            status: 'offline',
            lastError: `Failed to save ${table} to cloud. Local cache has been retained.`,
        });
        return false;
    }
    setPersistenceState(localKey, {
        status: 'synced',
        lastError: null,
        lastSyncedAt: new Date().toISOString(),
    });
    return true;
}

async function insertRow<T extends { id: string }>(table: string, row: PersistedRow, localKey: string, localValue: T) {
    upsertLocal(localKey, localValue);
    if (isDemoMode) {
        setPersistenceState(localKey, { status: 'local', lastError: null });
        return true;
    }

    setPersistenceState(localKey, { status: 'retrying', lastError: null });
    const { error } = await supabase.from(table).insert(row);
    if (error) {
        logger.error(`Failed to insert ${table}:`, error);
        setPersistenceState(localKey, {
            status: 'offline',
            lastError: `Failed to insert ${table} in cloud. Local cache has been retained.`,
        });
        return false;
    }
    setPersistenceState(localKey, {
        status: 'synced',
        lastError: null,
        lastSyncedAt: new Date().toISOString(),
    });
    return true;
}

export async function fetchMarketplaceListings(ownerUserId?: string): Promise<MarketplaceListingRecord[]> {
    return fetchRows(
        'marketplace_listings',
        marketplaceListingFromRow,
        LOCAL_KEYS.listings,
        builder => ownerUserId
            ? builder.eq('owner_user_id', ownerUserId).order('created_at', { ascending: false })
            : builder.order('created_at', { ascending: false })
    );
}

export async function upsertMarketplaceListing(listing: MarketplaceListingRecord): Promise<boolean> {
    return upsertRow('marketplace_listings', marketplaceListingToRow(listing), LOCAL_KEYS.listings, listing);
}

export async function fetchListingOffers(listingId?: string): Promise<ListingOfferRecord[]> {
    return fetchRows(
        'listing_offers',
        listingOfferFromRow,
        LOCAL_KEYS.offers,
        builder => listingId
            ? builder.eq('listing_id', listingId).order('created_at', { ascending: false })
            : builder.order('created_at', { ascending: false })
    );
}

export async function upsertListingOffer(offer: ListingOfferRecord, ownerUserId?: string): Promise<boolean> {
    return upsertRow('listing_offers', listingOfferToRow(offer, ownerUserId), LOCAL_KEYS.offers, offer);
}

export async function fetchCounterparties(ownerUserId?: string): Promise<CounterpartyProfile[]> {
    return fetchRows(
        'counterparties',
        counterpartyFromRow,
        LOCAL_KEYS.counterparties,
        builder => ownerUserId
            ? builder.eq('owner_user_id', ownerUserId).order('created_at', { ascending: false })
            : builder.order('created_at', { ascending: false })
    );
}

export async function upsertCounterpartyProfile(profile: CounterpartyProfile): Promise<boolean> {
    return upsertRow('counterparties', counterpartyToRow(profile), LOCAL_KEYS.counterparties, profile);
}

export async function fetchCounterpartyEdges(ownerUserId?: string): Promise<CounterpartyEdge[]> {
    return fetchRows(
        'counterparty_edges',
        edgeFromRow,
        LOCAL_KEYS.edges,
        builder => ownerUserId
            ? builder.eq('owner_user_id', ownerUserId).order('created_at', { ascending: false })
            : builder.order('created_at', { ascending: false })
    );
}

export async function upsertCounterpartyEdge(edge: CounterpartyEdge, ownerUserId?: string): Promise<boolean> {
    return upsertRow('counterparty_edges', edgeToRow(edge, ownerUserId), LOCAL_KEYS.edges, edge);
}

export async function fetchTrustEvents(counterpartyId?: string): Promise<TrustEvent[]> {
    return fetchRows(
        'trust_events',
        trustEventFromRow,
        LOCAL_KEYS.trustEvents,
        builder => counterpartyId
            ? builder.eq('counterparty_id', counterpartyId).order('created_at', { ascending: false })
            : builder.order('created_at', { ascending: false })
    );
}

export async function insertTrustEvent(event: TrustEvent, ownerUserId?: string): Promise<boolean> {
    return insertRow('trust_events', trustEventToRow(event, ownerUserId), LOCAL_KEYS.trustEvents, event);
}

export async function fetchDealRooms(ownerUserId?: string): Promise<DealRoomRecord[]> {
    return fetchRows(
        'deal_rooms',
        dealRoomFromRow,
        LOCAL_KEYS.dealRooms,
        builder => ownerUserId
            ? builder.eq('owner_user_id', ownerUserId).order('created_at', { ascending: false })
            : builder.order('created_at', { ascending: false })
    );
}

export async function upsertDealRoom(room: DealRoomRecord): Promise<boolean> {
    return upsertRow('deal_rooms', dealRoomToRow(room), LOCAL_KEYS.dealRooms, room);
}

export async function fetchDealRoomParticipants(roomId: string): Promise<DealRoomParticipantRecord[]> {
    return fetchRows(
        'deal_room_participants',
        participantFromRow,
        LOCAL_KEYS.participants,
        builder => builder.eq('room_id', roomId).order('joined_at', { ascending: true })
    );
}

export async function upsertDealRoomParticipant(record: DealRoomParticipantRecord): Promise<boolean> {
    return upsertRow('deal_room_participants', participantToRow(record), LOCAL_KEYS.participants, record);
}

export async function fetchDealRoomMessages(roomId: string): Promise<DealRoomMessageRecord[]> {
    return fetchRows(
        'deal_room_messages',
        messageFromRow,
        LOCAL_KEYS.messages,
        builder => builder.eq('room_id', roomId).order('created_at', { ascending: true })
    );
}

export async function insertDealRoomMessage(record: DealRoomMessageRecord): Promise<boolean> {
    return insertRow('deal_room_messages', messageToRow(record), LOCAL_KEYS.messages, record);
}

export async function fetchDealRoomAttachments(roomId: string): Promise<DealRoomAttachment[]> {
    return fetchRows(
        'deal_room_attachments',
        attachmentFromRow,
        LOCAL_KEYS.attachments,
        builder => builder.eq('room_id', roomId).order('created_at', { ascending: false })
    );
}

export async function upsertDealRoomAttachment(record: DealRoomAttachment): Promise<boolean> {
    return upsertRow('deal_room_attachments', attachmentToRow(record), LOCAL_KEYS.attachments, record);
}

export async function fetchCatalystEvents(ownerUserId?: string): Promise<CatalystMarketEvent[]> {
    return fetchRows(
        'catalyst_events',
        catalystEventFromRow,
        LOCAL_KEYS.catalystEvents,
        builder => ownerUserId
            ? builder.eq('owner_user_id', ownerUserId).order('created_at', { ascending: false })
            : builder.order('created_at', { ascending: false })
    );
}

export async function upsertCatalystEvent(event: CatalystMarketEvent, ownerUserId?: string): Promise<boolean> {
    return upsertRow('catalyst_events', catalystEventToRow(event, ownerUserId), LOCAL_KEYS.catalystEvents, event);
}

export async function fetchScenarioSnapshots(ownerUserId?: string): Promise<ScenarioSnapshot[]> {
    return fetchRows(
        'scenario_snapshots',
        scenarioSnapshotFromRow,
        LOCAL_KEYS.scenarioSnapshots,
        builder => ownerUserId
            ? builder.eq('owner_user_id', ownerUserId).order('created_at', { ascending: false })
            : builder.order('created_at', { ascending: false })
    );
}

export async function upsertScenarioSnapshot(snapshot: ScenarioSnapshot): Promise<boolean> {
    return upsertRow('scenario_snapshots', scenarioSnapshotToRow(snapshot), LOCAL_KEYS.scenarioSnapshots, snapshot);
}

export async function fetchScenarioRuns(ownerUserId?: string): Promise<ScenarioRunRecord[]> {
    return fetchRows(
        'scenario_runs',
        scenarioRunFromRow,
        LOCAL_KEYS.scenarioRuns,
        builder => ownerUserId
            ? builder.eq('owner_user_id', ownerUserId).order('created_at', { ascending: false })
            : builder.order('created_at', { ascending: false })
    );
}

export async function upsertScenarioRun(run: ScenarioRunRecord): Promise<boolean> {
    return upsertRow('scenario_runs', scenarioRunToRow(run), LOCAL_KEYS.scenarioRuns, run);
}

export async function fetchAgentRecommendations(ownerUserId?: string): Promise<AgentRecommendationRecord[]> {
    return fetchRows(
        'agent_recommendations',
        agentRecommendationFromRow,
        LOCAL_KEYS.agentRecommendations,
        builder => ownerUserId
            ? builder.eq('owner_user_id', ownerUserId).order('created_at', { ascending: false })
            : builder.order('created_at', { ascending: false })
    );
}

export async function upsertAgentRecommendation(record: AgentRecommendationRecord): Promise<boolean> {
    return upsertRow('agent_recommendations', agentRecommendationToRow(record), LOCAL_KEYS.agentRecommendations, record);
}

export async function fetchAgentOutcomes(recommendationId?: string): Promise<AgentOutcomeRecord[]> {
    return fetchRows(
        'agent_outcomes',
        agentOutcomeFromRow,
        LOCAL_KEYS.agentOutcomes,
        builder => recommendationId
            ? builder.eq('recommendation_id', recommendationId).order('recorded_at', { ascending: false })
            : builder.order('recorded_at', { ascending: false })
    );
}

export async function insertAgentOutcome(record: AgentOutcomeRecord): Promise<boolean> {
    return insertRow('agent_outcomes', agentOutcomeToRow(record), LOCAL_KEYS.agentOutcomes, record);
}

export async function fetchExecutionIntents(ownerUserId?: string): Promise<ExecutionIntentRecord[]> {
    return fetchRows(
        'execution_intents',
        executionIntentFromRow,
        LOCAL_KEYS.executionIntents,
        builder => ownerUserId
            ? builder.eq('owner_user_id', ownerUserId).order('created_at', { ascending: false })
            : builder.order('created_at', { ascending: false })
    );
}

export async function upsertExecutionIntent(intent: ExecutionIntentRecord): Promise<boolean> {
    return upsertRow('execution_intents', executionIntentToRow(intent), LOCAL_KEYS.executionIntents, intent);
}

export async function fetchExecutionApprovals(intentId?: string): Promise<ExecutionApprovalRecord[]> {
    return fetchRows(
        'execution_approvals',
        executionApprovalFromRow,
        LOCAL_KEYS.executionApprovals,
        builder => intentId
            ? builder.eq('intent_id', intentId).order('created_at', { ascending: false })
            : builder.order('created_at', { ascending: false })
    );
}

export async function insertExecutionApproval(record: ExecutionApprovalRecord): Promise<boolean> {
    return insertRow('execution_approvals', executionApprovalToRow(record), LOCAL_KEYS.executionApprovals, record);
}

export async function fetchExecutionFills(intentId?: string): Promise<ExecutionFillRecord[]> {
    return fetchRows(
        'execution_fills',
        executionFillFromRow,
        LOCAL_KEYS.executionFills,
        builder => intentId
            ? builder.eq('intent_id', intentId).order('created_at', { ascending: false })
            : builder.order('created_at', { ascending: false })
    );
}

export async function insertExecutionFill(record: ExecutionFillRecord): Promise<boolean> {
    return insertRow('execution_fills', executionFillToRow(record), LOCAL_KEYS.executionFills, record);
}
