import { beforeEach, describe, expect, it } from 'vitest';
import { PlatformService } from '../../lib/platformService';

describe('platformService', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('registers extensions and issues scoped tokens', () => {
        PlatformService.registerExtension({ id: 'ext-1', name: 'Partner A', version: '1.0.0', permissions: ['portfolio.read'], enabled: true });
        const token = PlatformService.issueApiToken('tenant-1', ['portfolio.read']);

        expect(PlatformService.listExtensions().length).toBe(1);
        expect(PlatformService.hasScope(token.token, 'portfolio.read')).toBe(true);
        expect(PlatformService.hasScope(token.token, 'portfolio.write')).toBe(false);
    });

    it('publishes webhook events', () => {
        PlatformService.publishWebhook({ type: 'valuation.updated', payload: { cardId: 'c1' } });
        expect(PlatformService.listWebhooks().length).toBe(1);
    });
});
