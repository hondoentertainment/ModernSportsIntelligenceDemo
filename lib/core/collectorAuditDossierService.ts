import { CardInventory } from '../../types';
import { ConsignmentService } from '../trading/consignmentService';
import { buildCoverageSnapshot } from './insurancePolicyService';
import { TaxLotService } from '../utils/taxLotService';
import type { GeneratedReport, ReportConfig, ReportSection } from '../utils/reportService';

interface CollectorAuditDossierOptions {
  cardId?: string;
}

function formatCardLabel(card: CardInventory): string {
  const graded = card.isGraded && card.gradingCompany && card.grade
    ? ` ${card.gradingCompany} ${card.grade}`
    : '';
  return `${card.year} ${card.manufacturer} ${card.player} ${card.set} #${card.cardNumber}${graded}`.trim();
}

function getCostBasis(card: CardInventory): number {
  return (
    (card.taxBasis || card.purchasePrice || 0) +
    (card.gradingFees || 0) +
    (card.shippingFees || 0) +
    (card.insuranceFees || 0)
  );
}

function buildOverviewSection(cards: CardInventory[], scopeLabel: string): ReportSection {
  const activeCards = cards.filter(card => card.status !== 'sold');
  const soldCards = cards.filter(card => card.status === 'sold');
  const totalValue = activeCards.reduce((sum, card) => sum + (card.currentValue ?? card.purchasePrice), 0);
  const totalReplacementCost = activeCards.reduce(
    (sum, card) => sum + ((card.currentValue ?? card.purchasePrice) * 1.15),
    0
  );
  const taxSummary = TaxLotService.generateTaxSummary(cards);
  const bestExitNet = activeCards.reduce((sum, card) => {
    const bestChannel = ConsignmentService.recommendExitChannel(card);
    return sum + bestChannel.expectedNet;
  }, 0);

  return {
    title: 'Collector Audit Overview',
    type: 'summary',
    data: [],
    summary: {
      Scope: scopeLabel,
      'Holdings Reviewed': cards.length,
      'Active Holdings': activeCards.length,
      'Sold Holdings': soldCards.length,
      'Current Portfolio Value': Math.round(totalValue * 100) / 100,
      'Estimated Replacement Cost': Math.round(totalReplacementCost * 100) / 100,
      'Best Exit Net': Math.round(bestExitNet * 100) / 100,
      'Estimated Tax Liability': Math.round(taxSummary.estimatedTaxLiability * 100) / 100,
    },
    sourceType: 'inventory-history',
    sourceNote: 'Built from current inventory, sold status, and stored valuation fields.',
  };
}

function buildAssetRegisterSection(cards: CardInventory[]): ReportSection {
  return {
    title: 'Asset Register',
    type: 'table',
    columns: ['player', 'card', 'status', 'costBasis', 'currentValue', 'liquidityScore', 'lastValuationDate'],
    data: cards.map(card => ({
      player: card.player,
      card: formatCardLabel(card),
      status: card.status ?? 'active',
      costBasis: Math.round(getCostBasis(card) * 100) / 100,
      currentValue: Math.round((card.currentValue ?? card.purchasePrice) * 100) / 100,
      liquidityScore: card.liquidityScore ?? 0,
      lastValuationDate: card.lastValuationDate ?? 'Not synced',
    })),
    sourceType: 'market-data',
    sourceNote: 'Uses stored purchase data plus the most recent valuation currently attached to each asset.',
  };
}

function buildTaxSection(cards: CardInventory[]): ReportSection[] {
  const summary = TaxLotService.generateTaxSummary(cards);
  const methodImpact = TaxLotService.compareMethodTaxImpact(cards).map(row => ({
    method: row.method,
    liability: Math.round(row.liability * 100) / 100,
    netGain: Math.round(row.netGain * 100) / 100,
  }));

  return [
    {
      title: 'Tax Posture',
      type: 'summary',
      data: [],
      summary: {
        'Tax Year': summary.taxYear,
        'Primary Method': summary.method,
        'Realized Transactions': summary.totalTransactions,
        'Short-Term Net': Math.round(summary.netShortTerm * 100) / 100,
        'Long-Term Net': Math.round(summary.netLongTerm * 100) / 100,
        'Total Net Gain/Loss': Math.round(summary.totalNetGainLoss * 100) / 100,
        'Estimated Tax Liability': Math.round(summary.estimatedTaxLiability * 100) / 100,
      },
      sourceType: 'inventory-history',
      sourceNote: 'Calculated from stored purchase dates, sale dates, basis adjustments, and current card status.',
    },
    {
      title: 'Tax Method Comparison',
      type: 'table',
      columns: ['method', 'liability', 'netGain'],
      data: methodImpact,
      sourceType: 'inventory-history',
      sourceNote: 'Method comparison is deterministic from the same recorded transaction history.',
    },
    {
      title: 'Schedule D Detail',
      type: 'table',
      columns: ['description', 'dateAcquired', 'dateSold', 'proceeds', 'costBasis', 'gainLoss', 'holdingPeriod'],
      data: summary.scheduleDEntries.map(entry => ({
        description: entry.description,
        dateAcquired: entry.dateAcquired,
        dateSold: entry.dateSold,
        proceeds: Math.round(entry.proceeds * 100) / 100,
        costBasis: Math.round(entry.costBasis * 100) / 100,
        gainLoss: Math.round(entry.gainLoss * 100) / 100,
        holdingPeriod: entry.holdingPeriod,
      })),
      sourceType: 'inventory-history',
      sourceNote: 'Only realized dispositions with stored sale dates are included in this ledger-style view.',
    },
  ];
}

function buildInsuranceSections(cards: CardInventory[]): ReportSection[] {
  const snapshot = buildCoverageSnapshot(cards.filter(card => card.status !== 'sold'));
  const primaryGap = snapshot.coverageGaps[0];

  return [
    {
      title: 'Insurance Readiness',
      type: 'summary',
      data: [],
      summary: {
        'Policies On File': snapshot.policies.length,
        'Collection Value Reviewed': Math.round(snapshot.totalCollectionValue * 100) / 100,
        'Coverage Gap': Math.round((primaryGap?.gapAmount ?? snapshot.totalCollectionValue) * 100) / 100,
        'Gap Severity': primaryGap?.severity ?? 'critical',
        'Estimated Annual Premium': Math.round(snapshot.premiumEstimate.annualPremium * 100) / 100,
        'Renewals Inside 90 Days': snapshot.renewalReminders.length,
      },
      sourceType: snapshot.policies.length > 0 ? 'user-input' : 'heuristic-estimate',
      sourceNote: snapshot.policies.length > 0
        ? 'Coverage uses stored policy records plus heuristic replacement-cost assumptions.'
        : 'No policy records found, so coverage values are estimated from replacement-cost heuristics only.',
    },
    {
      title: 'Coverage Gaps',
      type: 'table',
      columns: ['category', 'totalValue', 'coveredAmount', 'gapAmount', 'gapPercent', 'severity'],
      data: snapshot.coverageGaps.map(gap => ({
        category: gap.category,
        totalValue: Math.round(gap.totalValue * 100) / 100,
        coveredAmount: Math.round(gap.coveredAmount * 100) / 100,
        gapAmount: Math.round(gap.gapAmount * 100) / 100,
        gapPercent: Math.round(gap.gapPercent * 100) / 100,
        severity: gap.severity,
      })),
      sourceType: snapshot.policies.length > 0 ? 'user-input' : 'heuristic-estimate',
      sourceNote: 'Coverage gaps compare active policy records against current card values and replacement-cost assumptions.',
    },
    {
      title: 'High-Value Rider Recommendations',
      type: 'table',
      columns: ['player', 'currentValue', 'suggestedCoverage', 'estimatedRiderCost', 'reason'],
      data: snapshot.riderRecommendations.map(row => ({
        player: row.player,
        currentValue: Math.round(row.currentValue * 100) / 100,
        suggestedCoverage: Math.round(row.suggestedCoverage * 100) / 100,
        estimatedRiderCost: Math.round(row.estimatedRiderCost * 100) / 100,
        reason: row.reason,
      })),
      sourceType: 'heuristic-estimate',
      sourceNote: 'Recommendations are heuristic and should be reviewed with an insurance provider before binding coverage.',
    },
  ];
}

function buildExitSections(cards: CardInventory[]): ReportSection[] {
  const activeCards = cards.filter(card => card.status !== 'sold');
  const recommendationRows = activeCards.map(card => {
    const recommendation = ConsignmentService.recommendExitChannel(card);
    return {
      player: card.player,
      card: formatCardLabel(card),
      recommendedChannel: recommendation.channelName,
      expectedNet: Math.round(recommendation.expectedNet * 100) / 100,
      breakEvenSalePrice: Math.round(recommendation.breakEvenSalePrice * 100) / 100,
      daysToCash: recommendation.daysToCash,
      notes: recommendation.notes,
    };
  });

  const comparisonRows = activeCards[0]
    ? ConsignmentService.compareExitChannels(activeCards[0]).map(channel => ({
        channelName: channel.channelName,
        channelType: channel.channelType,
        estimatedSalePrice: Math.round(channel.estimatedSalePrice * 100) / 100,
        expectedNet: Math.round(channel.expectedNet * 100) / 100,
        breakEvenSalePrice: Math.round(channel.breakEvenSalePrice * 100) / 100,
        daysToCash: channel.daysToCash,
        confidence: channel.confidence,
      }))
    : [];

  return [
    {
      title: 'Exit Readiness Recommendations',
      type: 'table',
      columns: ['player', 'card', 'recommendedChannel', 'expectedNet', 'breakEvenSalePrice', 'daysToCash', 'notes'],
      data: recommendationRows,
      sourceType: 'heuristic-estimate',
      sourceNote: 'Exit routing uses static marketplace and consignment fee schedules plus each asset’s stored basis and valuation.',
    },
    {
      title: activeCards[0]
        ? `Exit Channel Comparison — ${activeCards[0].player}`
        : 'Exit Channel Comparison',
      type: 'table',
      columns: ['channelName', 'channelType', 'estimatedSalePrice', 'expectedNet', 'breakEvenSalePrice', 'daysToCash', 'confidence'],
      data: comparisonRows,
      sourceType: 'heuristic-estimate',
      sourceNote: 'Channel comparison is decision support only and is not connected to live marketplace APIs.',
    },
  ];
}

export function buildCollectorAuditDossierReport(
  inventory: CardInventory[],
  config: ReportConfig,
  options: CollectorAuditDossierOptions = {}
): GeneratedReport {
  const selectedCards = options.cardId
    ? inventory.filter(card => card.id === options.cardId)
    : inventory;
  const scopeLabel = options.cardId && selectedCards[0]
    ? `Single Asset — ${selectedCards[0].player}`
    : 'Portfolio';
  const title = options.cardId && selectedCards[0]
    ? `Collector Audit Dossier — ${selectedCards[0].player}`
    : 'Collector Audit Dossier';

  const sections: ReportSection[] = [
    buildOverviewSection(selectedCards, scopeLabel),
    buildAssetRegisterSection(selectedCards),
    ...buildTaxSection(selectedCards),
    ...buildInsuranceSections(selectedCards),
    ...buildExitSections(selectedCards),
  ];

  return {
    id: `rpt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    type: 'collector_audit_dossier',
    title,
    generatedAt: new Date().toISOString(),
    config,
    sections,
    cardCount: selectedCards.length,
    metadata: {
      scope: scopeLabel,
      selectedCardId: options.cardId ?? 'portfolio',
    },
  };
}
