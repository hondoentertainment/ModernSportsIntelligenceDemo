import { supabase, isDemoMode } from './supabase';
import { CardInventory, TargetWatchlist } from '../types';
import type { PriceSnapshot } from './priceHistory';

// Transform database row to CardInventory type
function dbToCard(row: any): CardInventory {
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
        notes: row.notes,
        searchUrl: row.search_url,
        taxBasis: row.tax_basis,
        gradingFees: row.grading_fees,
        shippingFees: row.shipping_fees,
        group: row.card_group,
        groupOrder: row.group_order,
    };
}

// Transform CardInventory to database row format
function cardToDb(card: CardInventory, userId: string): any {
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
        notes: card.notes,
        search_url: card.searchUrl,
        tax_basis: card.taxBasis,
        grading_fees: card.gradingFees,
        shipping_fees: card.shippingFees,
        card_group: card.group,
        group_order: card.groupOrder,
    };
}

// Transform database row to TargetWatchlist type
function dbToTarget(row: any): TargetWatchlist {
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
        createdAt: row.created_at,
        image: row.image_url,
        searchUrl: row.search_url,
        notes: row.notes,
    };
}

// Transform TargetWatchlist to database row format
function targetToDb(target: TargetWatchlist, userId: string): any {
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
        console.error('Error fetching cards:', error);
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
        console.error('Error upserting card:', error);
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
        console.error('Error deleting card:', error);
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
        console.error('Error bulk upserting cards:', error);
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
        console.error('Error fetching targets:', error);
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
        console.error('Error upserting target:', error);
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
        console.error('Error bulk upserting targets:', error);
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
        console.error('Error deleting target:', error);
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
        .select('card_id, value, recorded_at')
        .eq('user_id', userId)
        .order('recorded_at', { ascending: false });

    if (error) {
        console.error('Error fetching price history:', error);
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
        });
    }

    return grouped;
}

/**
 * Insert a single price snapshot.
 */
export async function insertPriceSnapshot(
    userId: string,
    cardId: string,
    value: number,
    timestamp: string
): Promise<boolean> {
    if (isDemoMode) return true;

    const { error } = await supabase
        .from('price_history')
        .insert({
            user_id: userId,
            card_id: cardId,
            value,
            recorded_at: timestamp,
        });

    if (error) {
        console.error('Error inserting price snapshot:', error);
        return false;
    }
    return true;
}

/**
 * Insert multiple price snapshots in a single batch.
 */
export async function insertBatchPriceSnapshots(
    userId: string,
    snapshots: { cardId: string; value: number; timestamp: string }[]
): Promise<boolean> {
    if (isDemoMode) return true;
    if (snapshots.length === 0) return true;

    const rows = snapshots.map(s => ({
        user_id: userId,
        card_id: s.cardId,
        value: s.value,
        recorded_at: s.timestamp,
    }));

    const { error } = await supabase
        .from('price_history')
        .insert(rows);

    if (error) {
        console.error('Error batch inserting price snapshots:', error);
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
