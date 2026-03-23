/** Product version aligned with PRD (see package.json). */
export const APP_VERSION = '4.3.0' as const;

export interface RuntimeConfigIssue {
    key: string;
    severity: 'warning' | 'error';
    message: string;
}

export interface RuntimeConfigValidation {
    ok: boolean;
    issues: RuntimeConfigIssue[];
}

export function validateRuntimeConfig(): RuntimeConfigValidation {
    const issues: RuntimeConfigIssue[] = [];

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const ebayClientId = import.meta.env.VITE_EBAY_CLIENT_ID;
    const ebayClientSecret = import.meta.env.VITE_EBAY_CLIENT_SECRET;
    const storageBucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET;
    const serverApiBaseUrl = import.meta.env.VITE_SERVER_API_BASE_URL;

    if (!supabaseUrl) {
        issues.push({
            key: 'VITE_SUPABASE_URL',
            severity: 'warning',
            message: 'Supabase URL is missing; app will run in demo/local mode.'
        });
    }

    if (!supabaseAnonKey) {
        issues.push({
            key: 'VITE_SUPABASE_ANON_KEY',
            severity: 'warning',
            message: 'Supabase anon key is missing; auth and cloud sync are disabled.'
        });
    }

    if (serverApiBaseUrl && !/^https?:\/\//.test(serverApiBaseUrl)) {
        issues.push({
            key: 'VITE_SERVER_API_BASE_URL',
            severity: 'error',
            message: 'VITE_SERVER_API_BASE_URL must be an absolute HTTP(S) URL when provided.'
        });
    }

    if (!ebayClientId) {
        issues.push({
            key: 'VITE_EBAY_CLIENT_ID',
            severity: 'warning',
            message: 'eBay client ID is missing; marketplace-first differentiator features may run in degraded mode.'
        });
    }

    if (ebayClientSecret) {
        issues.push({
            key: 'VITE_EBAY_CLIENT_SECRET',
            severity: 'error',
            message: 'eBay client secret must not be exposed to the browser. Move token exchange to a server-side function.'
        });
    }

    if (!storageBucket) {
        issues.push({
            key: 'VITE_SUPABASE_STORAGE_BUCKET',
            severity: 'warning',
            message: 'Supabase storage bucket is missing; private deal room attachments will be metadata-only.'
        });
    }

    return {
        ok: issues.every(issue => issue.severity !== 'error'),
        issues
    };
}
