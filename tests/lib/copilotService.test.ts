import { describe, expect, it } from 'vitest';
import { createExplainabilityCard, getDefaultWorkflowTemplates, runWorkflowTemplate } from '../../lib/copilotService';

describe('copilotService', () => {
    it('runs workflow and blocks when approval is missing', () => {
        const templates = getDefaultWorkflowTemplates();
        const rebalance = templates.find(t => t.id === 'rebalance-proposal')!;

        const blocked = runWorkflowTemplate(rebalance, []);
        const approved = runWorkflowTemplate(rebalance, ['draft-actions']);

        expect(blocked.status).toBe('blocked');
        expect(approved.status).toBe('completed');
    });

    it('creates explainability cards', () => {
        const card = createExplainabilityCard('Rebalance', 'Reduce concentration.', ['Top holding > 40%'], 0.82);
        expect(card.confidence).toBe(0.82);
    });
});
