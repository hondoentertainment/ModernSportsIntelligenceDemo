import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { downloadInsurancePacket } from '../../lib/utils/insurancePacketExport';
import type { GeneratedReport } from '../../lib/utils/reportService';

describe('insurancePacketExport', () => {
  const clicks: string[] = [];

  beforeEach(() => {
    clicks.length = 0;
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:packet');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      clicks.push(this.download);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('downloads a printable HTML packet named as an insurance valuation', () => {
    const report: GeneratedReport = {
      id: 'rpt-1',
      type: 'insurance',
      title: 'Insurance Valuation Report',
      generatedAt: '2026-09-06T12:00:00.000Z',
      config: { includeSold: false, sections: ['insurance'] },
      sections: [],
      cardCount: 1,
      metadata: {},
    };
    downloadInsurancePacket(report);
    expect(clicks[0]).toBe('MSI_Insurance_Valuation_2026-09-06.html');
  });
});
