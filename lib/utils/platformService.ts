import { store } from '../dal/syncStore';

// Phase 42: Ecosystem Expansion and Institutional Distribution

const EXTENSION_KEY = 'msi_extensions';
const API_TOKEN_KEY = 'msi_api_tokens';
const WEBHOOK_KEY = 'msi_webhooks';

export interface ExtensionManifest {
    id: string;
    name: string;
    version: string;
    permissions: string[];
    enabled: boolean;
}

export interface ApiTokenRecord {
    id: string;
    token: string;
    scopes: string[];
    tenantId: string;
    createdAt: string;
    revokedAt?: string;
}

export interface WebhookEvent {
    id: string;
    type: 'valuation.updated' | 'alert.triggered' | 'autopilot.executed';
    payload: Record<string, unknown>;
    createdAt: string;
}

export class PlatformService {
    static registerExtension(manifest: ExtensionManifest): ExtensionManifest[] {
        const list = store.get<ExtensionManifest[]>(EXTENSION_KEY, []);
        const idx = list.findIndex(x => x.id === manifest.id);
        if (idx >= 0) list[idx] = manifest;
        else list.push(manifest);
        store.set(EXTENSION_KEY, list);
        return list;
    }

    static listExtensions(): ExtensionManifest[] {
        return store.get<ExtensionManifest[]>(EXTENSION_KEY, []);
    }

    static issueApiToken(tenantId: string, scopes: string[]): ApiTokenRecord {
        const token = `msi_${crypto.randomUUID().replace(/-/g, '')}`;
        const record: ApiTokenRecord = {
            id: crypto.randomUUID(),
            token,
            scopes,
            tenantId,
            createdAt: new Date().toISOString()
        };

        const list = store.get<ApiTokenRecord[]>(API_TOKEN_KEY, []);
        list.unshift(record);
        store.set(API_TOKEN_KEY, list);
        return record;
    }

    static hasScope(token: string, scope: string): boolean {
        const list = store.get<ApiTokenRecord[]>(API_TOKEN_KEY, []);
        const rec = list.find(x => x.token === token && !x.revokedAt);
        return !!rec && rec.scopes.includes(scope);
    }

    static publishWebhook(event: Omit<WebhookEvent, 'id' | 'createdAt'>): WebhookEvent {
        const record: WebhookEvent = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            ...event
        };
        const list = store.get<WebhookEvent[]>(WEBHOOK_KEY, []);
        list.unshift(record);
        store.set(WEBHOOK_KEY, list.slice(0, 500));
        return record;
    }

    static listWebhooks(): WebhookEvent[] {
        return store.get<WebhookEvent[]>(WEBHOOK_KEY, []);
    }
}
