// Phase 41: Intelligence Copilot and Workflow Automation

export interface ExplainabilityCard {
    title: string;
    rationale: string;
    evidence: string[];
    confidence: number;
}

export interface WorkflowStep {
    id: string;
    name: string;
    requiresApproval: boolean;
}

export interface WorkflowTemplate {
    id: string;
    name: string;
    steps: WorkflowStep[];
}

export interface WorkflowRun {
    id: string;
    templateId: string;
    status: 'completed' | 'blocked' | 'running';
    completedSteps: string[];
    blockedReason?: string;
    generatedAt: string;
}

export function getDefaultWorkflowTemplates(): WorkflowTemplate[] {
    return [
        {
            id: 'daily-brief',
            name: 'Daily Brief',
            steps: [
                { id: 'fetch-signals', name: 'Fetch market signals', requiresApproval: false },
                { id: 'summarize-risk', name: 'Summarize risk posture', requiresApproval: false },
                { id: 'publish-brief', name: 'Publish morning brief', requiresApproval: false }
            ]
        },
        {
            id: 'rebalance-proposal',
            name: 'Rebalance Proposal',
            steps: [
                { id: 'compute-gaps', name: 'Compute allocation gaps', requiresApproval: false },
                { id: 'draft-actions', name: 'Draft buy/sell actions', requiresApproval: true },
                { id: 'finalize-plan', name: 'Finalize proposal', requiresApproval: false }
            ]
        }
    ];
}

export function runWorkflowTemplate(template: WorkflowTemplate, approvedStepIds: string[] = []): WorkflowRun {
    const completedSteps: string[] = [];

    for (const step of template.steps) {
        if (step.requiresApproval && !approvedStepIds.includes(step.id)) {
            return {
                id: crypto.randomUUID(),
                templateId: template.id,
                status: 'blocked',
                completedSteps,
                blockedReason: `Step '${step.name}' requires approval.`,
                generatedAt: new Date().toISOString()
            };
        }
        completedSteps.push(step.id);
    }

    return {
        id: crypto.randomUUID(),
        templateId: template.id,
        status: 'completed',
        completedSteps,
        generatedAt: new Date().toISOString()
    };
}

export function createExplainabilityCard(title: string, rationale: string, evidence: string[], confidence: number): ExplainabilityCard {
    return {
        title,
        rationale,
        evidence,
        confidence: Math.max(0, Math.min(1, confidence))
    };
}
