import { renderReportHTML, type GeneratedReport } from './reportService';

function triggerHtmlDownload(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Printable/PDF-friendly insurance packet without pulling jsPDF into the app graph. */
export function downloadInsurancePacket(report: GeneratedReport): void {
  const html = renderReportHTML(report);
  const day = report.generatedAt.slice(0, 10);
  triggerHtmlDownload(html, `MSI_Insurance_Valuation_${day}.html`);
}

export function printInsurancePacket(report: GeneratedReport): void {
  const html = renderReportHTML(report);
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => printWindow.print(), 300);
}
