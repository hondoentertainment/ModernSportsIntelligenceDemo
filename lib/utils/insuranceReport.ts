import jsPDF from 'jspdf';
import { CardInventory } from '../../types';

/**
 * Phase 25: Generate an insurance-ready valuation document.
 * Includes timestamped FMV per card, total collection value,
 * condition details, and grading information.
 */
export function generateInsuranceReport(
  inventory: CardInventory[],
  ownerName: string = 'Collector',
  policyNumber: string = ''
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = margin;
  const lineHeight = 6;

  const activeCards = inventory.filter(c => c.status !== 'sold');
  const totalFMV = activeCards.reduce((sum, c) => sum + (c.currentValue || c.purchasePrice || 0), 0);
  const totalCost = activeCards.reduce((sum, c) => sum + c.purchasePrice + (c.gradingFees || 0) + (c.shippingFees || 0), 0);
  const gradedCount = activeCards.filter(c => c.isGraded).length;
  const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const reportId = `INS-${Date.now().toString(36).toUpperCase()}`;

  // ─── HEADER ─────────────────────────────────────────────────
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 50, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('COLLECTION INSURANCE VALUATION', margin, 20);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Official Fair Market Value Assessment', margin, 30);

  doc.setFontSize(9);
  doc.text(`Report ID: ${reportId} | Generated: ${reportDate}`, margin, 40);

  y = 60;

  // ─── OWNER & POLICY INFO ───────────────────────────────────
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('POLICYHOLDER INFORMATION', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Owner: ${ownerName}`, margin, y); y += lineHeight;
  if (policyNumber) {
    doc.text(`Policy #: ${policyNumber}`, margin, y); y += lineHeight;
  }
  doc.text(`Valuation Date: ${reportDate}`, margin, y); y += lineHeight;
  doc.text(`Total Items: ${activeCards.length} (${gradedCount} professionally graded)`, margin, y);
  y += 12;

  // ─── VALUATION SUMMARY ─────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('VALUATION SUMMARY', margin, y);
  y += 8;

  doc.setFontSize(10);
  const summaryRows = [
    ['Total Fair Market Value (FMV)', `$${totalFMV.toLocaleString()}`],
    ['Total Cost Basis (incl. fees)', `$${totalCost.toLocaleString()}`],
    ['Replacement Cost Estimate', `$${Math.round(totalFMV * 1.15).toLocaleString()}`],
    ['Collection Size', `${activeCards.length} items`],
    ['Graded Items', `${gradedCount} (${activeCards.length > 0 ? Math.round(gradedCount / activeCards.length * 100) : 0}%)`],
  ];

  summaryRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'bold');
    doc.text(value, margin + 90, y);
    y += lineHeight;
  });

  y += 10;

  // ─── ITEMIZED INVENTORY ────────────────────────────────────
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ITEMIZED INVENTORY', margin, y);
  y += 8;

  // Table header
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y - 4, pageWidth - margin * 2, 8, 'F');

  doc.text('#', margin + 2, y);
  doc.text('Player', margin + 10, y);
  doc.text('Year/Set', margin + 55, y);
  doc.text('Condition', margin + 105, y);
  doc.text('FMV', margin + 140, y);
  y += 8;

  doc.setFont('helvetica', 'normal');

  // Sort by value descending for insurance purposes
  const sortedCards = [...activeCards].sort((a, b) => (b.currentValue || 0) - (a.currentValue || 0));

  sortedCards.forEach((card, idx) => {
    // Page break check
    if (y > pageHeight - 30) {
      doc.addPage();
      y = margin;

      // Repeat header on new page
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y - 4, pageWidth - margin * 2, 8, 'F');
      doc.text('#', margin + 2, y);
      doc.text('Player', margin + 10, y);
      doc.text('Year/Set', margin + 55, y);
      doc.text('Condition', margin + 105, y);
      doc.text('FMV', margin + 140, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
    }

    const condStr = card.isGraded
      ? `${card.gradingCompany} ${card.grade}`
      : (card.condition || 'Raw');
    const fmv = card.currentValue || card.purchasePrice || 0;

    doc.text(`${idx + 1}`, margin + 2, y);
    doc.text(card.player.substring(0, 20), margin + 10, y);
    doc.text(`${card.year} ${(card.set || '').substring(0, 20)}`, margin + 55, y);
    doc.text(condStr.substring(0, 15), margin + 105, y);
    doc.text(`$${fmv.toLocaleString()}`, margin + 140, y);
    y += lineHeight;
  });

  // ─── FOOTER / DISCLAIMER ──────────────────────────────────
  // Add on final page
  y += 10;
  if (y > pageHeight - 40) {
    doc.addPage();
    y = margin;
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(120, 120, 120);
  doc.text(
    'DISCLAIMER: This valuation report is generated by Modern Sports Intelligence based on publicly available',
    margin, y
  ); y += 4;
  doc.text(
    'market data and AI-assisted analysis. Values represent estimated Fair Market Value at the time of generation.',
    margin, y
  ); y += 4;
  doc.text(
    'This report does not constitute a professional appraisal. Consult a certified appraiser for official insurance claims.',
    margin, y
  ); y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(`Report ID: ${reportId}`, margin, y);
  doc.text(`Modern Sports Intelligence`, pageWidth - margin - 40, y);

  // ─── BRAND FOOTER BAR ─────────────────────────────────────
  doc.setFillColor(217, 249, 157);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text('MSI — Sports as an Asset Class | Insurance Valuation Report', margin, pageHeight - 5);

  // Save
  doc.save(`MSI_Insurance_Valuation_${new Date().toISOString().split('T')[0]}.pdf`);
}
