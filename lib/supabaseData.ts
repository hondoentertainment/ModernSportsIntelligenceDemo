import { supabase, isDemoMode } from './supabase';
import { logger } from './logger';
import { CardInventory, TargetWatchlist } from '../types';
import type { PriceSnapshot } from './analytics/priceHistory';
import { mergeConsignmentIntoNotes, parseConsignmentFromNotes } from './utils/cardConsignmentCodec';

type DbCardRow = {
    id: string;
    player: string;
    year: number;
    manufacturer: string;
    card_number: string;
    set_name: string;
    sport: CardInventory['sport'];
    league: CardInventory['league'];
    is_autographed: boolean;
    condition: string;
    is_graded: boolean;
    grading_company?: CardInventory['gradingCompany'];
    grade?: string;
    purchase_price: number;
    purchase_date: string;
    current_value?: number;
    last_valuation_date?: string;
    image_url?: string;
    notes?: string;
    search_url?: string;
    valuation_confidence?: number;
    tax_basis?: number;
    grading_fees?: number;
    shipping_fees?: number;
    insurance_fees?: number;
    sale_price?: number;
    sale_date?: string;
    status?: CardInventory['status'];
    card_group?: string;
    group_order?: number;
    pop_count?: number;
    pop_higher?: number;
    scarcity_index?: number;
    pop_report?: CardInventory['popReport'];
    grading_roi?: number;
    liquidity_score?: number;
    exit_plan?: CardInventory['exitPlan'];
    exit_plan_id?: string;
    opportunity_score?: number;
    arbitrage_delta?: number;
    is_vaulted?: boolean;
    vault_provider?: CardInventory['vaultProvider'];
    vault_asset_id?: string;
    vault_instant_liquidity_price?: number;
    pricing_rationale?: string;
};

type DbTargetRow = {
    id: string;
    player: string;
    card_description: string;
    priority: TargetWatchlist['priority'];
    target_price: number;
    current_market_price?: number;
    sport: TargetWatchlist['sport'];
    league: TargetWatchlist['league'];
    status: TargetWatchlist['status'];
    created_at?: string;
    image_url?: string;
    search_url?: string;
    notes?: string;
    opportunity_score?: number;
    arbitrage_delta?: number;
    pricing_rationale?: string;
};

// Transform database row to CardInventory type
function dbToCard(row: DbCardRow): CardInventory {
    const { userNotes, consignment: parsedConsignment } = parseConsignmentFromNotes(row.notes);
    const consignment = row.status === 'sold' ? undefined : parsedConsignment;
    const status: CardInventory['status'] =
        row.status === 'sold' ? 'sold' : consignment ? 'consignment' : 'active';

    return {
        id: row.id,
        player: row.player,
        year: row.year,
        manufacturer: row.manufacturer,
        cardNumber: row.card_number,
        set: row.set_name,
        sport: row.sport,
        league: row.league,
        isAutographed: row.is_autographed,
        condition: row.condition,
        isGraded: row.is_graded,
        gradingCompany: row.grading_company,
        grade: row.grade,
        purchasePrice: row.purchase_price,
        purchaseDate: row.purchase_date,
        currentValue: row.current_value,
        lastValuationDate: row.last_valuation_date,
        image: row.image_url,
        notes: userNotes,
        consignment,
        searchUrl: row.search_url,
        valuationConfidence: row.valuation_confidence,
        taxBasis: row.tax_basis,
        gradingFees: row.grading_fees,
        shippingFees: row.shipping_fees,
        insuranceFees: row.insurance_fees,
        salePrice: row.sale_price,
        saleDate: row.sale_date,
        status,
        group: row.card_group,
        groupOrder: row.group_order,
        popCount: row.pop_count,
        popHigher: row.pop_higher,
        scarcityIndex: row.scarcity_index,
        popReport: row.pop_report || undefined,
        gradingRoi: row.grading_roi,
        liquidityScore: row.liquidity_score,
        exitPlan: row.exit_plan || undefined,
        exitPlanId: row.exit_plan_id,
        opportunityScore: row.opportunity_score,
        arbitrageDelta: row.arbitrage_delta,
        isVaulted: row.is_vaulted,
        vaultProvider: row.vault_provider,
        vaultAssetId: row.vault_asset_id,
        vaultInstantLiquidityPrice: row.vault_instant_liquidity_price,
        pricingRationale: row.pricing_rationale,
    };
}

// Transform CardInventory to database row format
function cardToDb(card: CardInventory, userId: string): DbCardRow & { user_id: string } {
    const notesForDb = mergeConsignmentIntoNotes(
        card.notes,
        card.status === 'consignment' && card.consignment ? card.consignment : undefined
    );
    const statusForDb =
        card.status === 'consignment' ? 'active' : card.status === 'sold' ? 'sold' : 'active';

    return {
        id: card.id,
        user_id: userId,
        player: card.player,
        year: card.year,
        manufacturer: card.manufacturer,
        card_number: card.cardNumber,
        set_name: card.set,
        sport: card.sport,
        league: card.league,
        is_autographed: card.isAutographed,
        condition: card.condition,
        is_graded: card.isGraded,
        grading_company: card.gradingCompany,
        grade: card.grade,
        purchase_price: card.purchasePrice,
        purchase_date: card.purchaseDate,
        current_value: card.currentValue,
        last_valuation_date: card.lastValuationDate,
        image_url: card.image,
        notes: notesForDb,
        search_url: card.searchUrl,
        valuation_confidence: card.valuationConfidence,
        tax_basis: card.taxBasis,
        grading_fees: card.gradingFees,
        shipping_fees: card.shippingFees,
        insurance_fees: card.insuranceFees,
        sale_price: card.salePrice,
        sale_date: card.saleDate,
        status: statusForDb,
        card_group: card.group,
        group_order: card.groupOrder,
        pop_count: card.popCount,
        pop_higher: card.popHigher,
        scarcity_index: card.scarcityIndex,
        pop_report: card.popReport,
        grading_roi: card.gradingRoi,
        liquidity_score: card.liquidityScore,
        exit_plan: card.exitPlan,
        exit_plan_id: card.exitPlanId,
        opportunity_score: card.opportunityScore,
        arbitrage_delta: card.arbitrageDelta,
        is_vaulted: card.isVaulted,
        vault_provider: card.vaultProvider,
        vault_asset_id: card.vaultAssetId,
        vault_instant_liquidity_price: card.vaultInstantLiquidityPrice,
        pricing_rationale: card.pricingRationale,
    };
}

// Transform database row to TargetWatchlist type
function dbToTarget(row: DbTargetRow): TargetWatchlist {
    return {
        id: row.id,
        player: row.player,
        cardDescription: row.card_description,
        priority: row.priority,
        targetPrice: row.target_price,
        currentMarketPrice: row.current_market_price,
        sport: row.sport,
        league: row.league,
        status: row.status,
        createdAt: row.created_at ?? new Date().toISOString(),
        image: row.image_url,
        searchUrl: row.search_url,
        notes: row.notes ?? undefined,
        opportunityScore: row.opportunity_score,
        arbitrageDelta: row.arbitrage_delta,
        pricingRationale: row.pricing_rationale,
    };
}

// Transform TargetWatchlist to database row format
function targetToDb(target: TargetWatchlist, userId: string): DbTargetRow & { user_id: string } {
    return {
        id: target.id,
        user_id: userId,
        player: target.player,
        card_description: target.cardDescription,
        priority: target.priority,
        target_price: target.targetPrice,
        current_market_price: target.currentMarketPrice,
        sport: target.sport,
        league: target.league,
        status: target.status,
        image_url: target.image,
        search_url: target.searchUrl,
        notes: target.notes,
        opportunity_score: target.opportunityScore,
        arbitrage_delta: target.arbitrageDelta,
        pricing_rationale: target.pricingRationale,
    };
}

// === CARD OPERATIONS ===

export async function fetchCards(userId: string): Promise<CardInventory[]> {
    if (isDemoMode) return [];

    const { data, error } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        logger.error('Error fetching cards:', error);
        return [];
    }

    return (data || []).map(dbToCard);
}

export async function upsertCard(card: CardInventory, userId: string): Promise<boolean> {
    if (isDemoMode) return true;

    const { error } = await supabase
        .from('cards')
        .upsert(cardToDb(card, userId), { onConflict: 'id' });

    if (error) {
        logger.error('Error upserting card:', error);
        return false;
    }
    return true;
}

export async function deleteCard(cardId: string): Promise<boolean> {
    if (isDemoMode) return true;

    const { error } = await supabase
        .from('cards')
        .delete()
        .eq('id', cardId);

    if (error) {
        logger.error('Error deleting card:', error);
        return false;
    }
    return true;
}

export async function bulkUpsertCards(cards: CardInventory[], userId: string): Promise<boolean> {
    if (isDemoMode) return true;

    const rows = cards.map(c => cardToDb(c, userId));
    const { error } = await supabase
        .from('cards')
        .upsert(rows, { onConflict: 'id' });

    if (error) {
        logger.error('Error bulk upserting cards:', error);
        return false;
    }
    return true;
}

// === TARGET OPERATIONS ===

export async function fetchTargets(userId: string): Promise<TargetWatchlist[]> {
    if (isDemoMode) return [];

    const { data, error } = await supabase
        .from('targets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        logger.error('Error fetching targets:', error);
        return [];
    }

    return (data || []).map(dbToTarget);
}

export async function upsertTarget(target: TargetWatchlist, userId: string): Promise<boolean> {
    if (isDemoMode) return true;

    const { error } = await supabase
        .from('targets')
        .upsert(targetToDb(target, userId), { onConflict: 'id' });

    if (error) {
        logger.error('Error upserting target:', error);
        return false;
    }
    return true;
}

export async function bulkUpsertTargets(targets: TargetWatchlist[], userId: string): Promise<boolean> {
    if (isDemoMode) return true;

    const rows = targets.map(t => targetToDb(t, userId));
    const { error } = await supabase
        .from('targets')
        .upsert(rows, { onConflict: 'id' });

    if (error) {
        logger.error('Error bulk upserting targets:', error);
        return false;
    }
    return true;
}

export async function deleteTarget(targetId: string): Promise<boolean> {
    if (isDemoMode) return true;

    const { error } = await supabase
        .from('targets')
        .delete()
        .eq('id', targetId);

    if (error) {
        logger.error('Error deleting target:', error);
        return false;
    }
    return true;
}

// === PRICE HISTORY OPERATIONS ===

/**
 * Fetch all price history for a user, grouped by card_id.
 * Returns a map of card_id -> PriceSnapshot[] (newest first).
 */
export async function fetchAllPriceHistory(userId: string): Promise<Record<string, PriceSnapshot[]>> {
    if (isDemoMode) return {};

    const { data, error } = await supabase
        .from('price_history')
        .select('card_id, value, recorded_at, source, valuation_method, confidence, metadata')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false });

    if (error) {
        logger.error('Error fetching price history:', error);
        return {};
    }

    // Group by card_id
    const grouped: Record<string, PriceSnapshot[]> = {};
    for (const row of data || []) {
        const cardId = row.card_id;
        if (!grouped[cardId]) grouped[cardId] = [];
        grouped[cardId].push({
            timestamp: row.recorded_at,
            value: Number(row.value),
            source: row.source || undefined,
            valuationMethod: row.valuation_method || undefined,
            confidence: row.confidence ? Number(row.confidence) : undefined,
            metadata: row.metadata || undefined,
        });
    }

    return grouped;
}

/**
 * Insert a single price snapshot.
 */
export async function insertPriceSnapshot(
    userId: string,
    snapshot: {
        cardId: string;
        value: number;
        timestamp: string;
        source?: string;
        valuationMethod?: string;
        confidence?: number;
        metadata?: Record<string, unknown>;
    }
): Promise<boolean> {
    if (isDemoMode) return true;

    const { error } = await supabase
        .from('price_history')
        .insert({
            user_id: userId,
            card_id: snapshot.cardId,
            entity_id: snapshot.cardId,
            entity_type: 'card',
            value: snapshot.value,
            recorded_at: snapshot.timestamp,
            source: snapshot.source,
            valuation_method: snapshot.valuationMethod,
            confidence: snapshot.confidence,
            metadata: snapshot.metadata || {},
        });

    if (error) {
        logger.error('Error inserting price snapshot:', error);
        return false;
    }
    return true;
}

/**
 * Insert multiple price snapshots in a single batch.
 */
export async function insertBatchPriceSnapshots(
    userId: string,
    snapshots: Array<{
        cardId: string;
        value: number;
        timestamp: string;
        source?: string;
        valuationMethod?: string;
        confidence?: number;
        metadata?: Record<string, unknown>;
    }>
): Promise<boolean> {
    if (isDemoMode) return true;
    if (snapshots.length === 0) return true;

    const rows = snapshots.map(s => ({
        user_id: userId,
        card_id: s.cardId,
        entity_id: s.cardId,
        entity_type: 'card',
        value: s.value,
        recorded_at: s.timestamp,
        source: s.source,
        valuation_method: s.valuationMethod,
        confidence: s.confidence,
        metadata: s.metadata || {},
    }));

    const { error } = await supabase
        .from('price_history')
        .insert(rows);

    if (error) {
        logger.error('Error batch inserting price snapshots:', error);
        return false;
    }
    return true;
}

/**
 * Prune old price history, keeping only the most recent N snapshots per card.
 * This prevents unbounded growth in the database.
 */
export async function prunePriceHistory(userId: string, keepPerCard: number = 30): Promise<void> {
    if (isDemoMode) return;

    // Fetch all snapshots ordered newest-first, then delete extras
    const { data, error } = await supabase
        .from('price_history')
        .select('id, card_id, recorded_at')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false });

    if (error || !data) return;

    // Group and find IDs to delete
    const counts: Record<string, number> = {};
    const idsToDelete: string[] = [];

    for (const row of data) {
        counts[row.card_id] = (counts[row.card_id] || 0) + 1;
        if (counts[row.card_id] > keepPerCard) {
            idsToDelete.push(row.id);
        }
    }

    if (idsToDelete.length > 0) {
        await supabase
            .from('price_history')
            .delete()
            .in('id', idsToDelete);
    }
}
