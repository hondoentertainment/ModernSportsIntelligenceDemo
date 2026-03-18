import { describe, it, expect, beforeEach } from 'vitest';
import { getLocalAuditTrail, logAuditEvent } from '../../lib/utils/auditLog';

describe('auditLog', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('records audit events to local storage', async () => {
        await logAuditEvent({
            category: 'portfolio',
            action: 'card.add',
            entityType: 'card',
            entityId: 'abc123',
            metadata: { player: 'Test Player' }
        });

        const trail = getLocalAuditTrail();
        expect(trail.length).toBe(1);
        expect(trail[0].action).toBe('card.add');
        expect(trail[0].entity_id).toBe('abc123');
    });
});
