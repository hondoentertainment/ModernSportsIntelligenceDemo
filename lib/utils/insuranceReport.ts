import jsPDF from 'jspdf';
import { CardInventory } from '../../types';
import { buildInsurancePacket, type BuildInsurancePacketOptions } from './insurancePacket';

export type GenerateInsurancePdfOptions = BuildInsurancePacketOptions;

/**
 * Phase 25: Generate an insurance-ready valuation PDF.
 * Timestamped FMV per card, total collection value, methodology, and disclaimer.
 */
export function generateInsuranceReport(
  inventory: CardInventory[],
  ownerName: string = 'Collector',
  policyNumber: string = ''
): void {
  generateInsurancePdf(inventory, { ownerName, policyNumber });
}

export function generateInsurancePdf(
  inventory: CardInventory[],
  options: GenerateInsurancePdfOptions = {}
): void {
  const packet = buildInsurancePacket(inventory, options);
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = margin;
  const lineHeight = 6;
  const reportDate = new Date(packet.generatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 50, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('COLLECTION INSURANCE VALUATION', margin, 20);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Timestamped Fair Market Value Packet', margin, 30);

  doc.setFontSize(9);
  doc.text(`Report ID: ${packet.reportId} | Generated: ${reportDate}`, margin, 40);

  y = 60;

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('POLICYHOLDER INFORMATION', margin, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Owner: ${packet.ownerName}`, margin, y); y += lineHeight;
  if (packet.policyNumber) {
    doc.text(`Policy #: ${packet.policyNumber}`, margin, y); y += lineHeight;
  }
  doc.text(`Valuation Date: ${reportDate}`, margin, y); y += lineHeight;
  doc.text(
    `Total Items: ${packet.totals.itemCount} (${packet.totals.gradedCount} professionally graded, ${packet.totals.certifiedCount} certified)`,
    margin,
    y
  );
  y += 12;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('VALUATION SUMMARY', margin, y);
  y += 8;

  doc.setFontSize(10);
  const summaryRows = [
    ['Total Collection FMV', `$${packet.totals.totalFmv.toLocaleString()}`],
    ['Replacement Cost Estimate (FMV + 15%)', `$${packet.totals.totalReplacement.toLocaleString()}`],
    ['Collection Size', `${packet.totals.itemCount} items`],
    ['Graded Items', `${packet.totals.gradedCount} (${packet.totals.itemCount > 0 ? Math.round((packet.totals.gradedCount / packet.totals.itemCount) * 100) : 0}%)`],
  ];

  summaryRows.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'bold');
    doc.text(value, margin + 90, y);
    y += lineHeight;
  });

  y += 10;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('METHODOLOGY', margin, y);
  y += 8;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  packet.methodology.forEach((bullet) => {
    const lines = doc.splitTextToSize(`• ${bullet}`, pageWidth - margin * 2);
    lines.forEach((line: string) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 4.5;
    });
  });

  y += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ITEMIZED INVENTORY (FMV AS-OF)', margin, y);
  y += 8;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y - 4, pageWidth - margin * 2, 8, 'F');

  doc.text('#', margin + 2, y);
  doc.text('Player', margin + 8, y);
  doc.text('Year/Set', margin + 48, y);
  doc.text('Cert', margin + 88, y);
  doc.text('FMV as of', margin + 112, y);
  doc.text('FMV', margin + 150, y);
  y += 8;

  doc.setFont('helvetica', 'normal');

  packet.items.forEach((item, idx) => {
    if (y > pageHeight - 30) {
      doc.addPage();
      y = margin;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y - 4, pageWidth - margin * 2, 8, 'F');
      doc.text('#', margin + 2, y);
      doc.text('Player', margin + 8, y);
      doc.text('Year/Set', margin + 48, y);
      doc.text('Cert', margin + 88, y);
      doc.text('FMV as of', margin + 112, y);
      doc.text('FMV', margin + 150, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
    }

    const asOf = item.fmvAsOf.slice(0, 10);
    doc.text(`${idx + 1}`, margin + 2, y);
    doc.text(item.player.substring(0, 18), margin + 8, y);
    doc.text(`${item.year} ${(item.set || '').substring(0, 14)}`, margin + 48, y);
    doc.text((item.certNumber || '—').substring(0, 12), margin + 88, y);
    doc.text(asOf, margin + 112, y);
    doc.text(`$${item.fmv.toLocaleString()}`, margin + 150, y);
    y += lineHeight;
  });

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
  const disclaimerLines = doc.splitTextToSize(packet.disclaimer, pageWidth - margin * 2);
  disclaimerLines.forEach((line: string) => {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 4;
  });
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(`Report ID: ${packet.reportId}`, margin, y);
  doc.text('Modern Sports Intelligence', pageWidth - margin - 40, y);

  doc.setFillColor(217, 249, 157);
  doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  doc.text('MSI — Sports as an Asset Class | Insurance Valuation Packet', margin, pageHeight - 5);

  doc.save(`MSI_Insurance_Valuation_${packet.generatedAt.split('T')[0]}.pdf`);
}
