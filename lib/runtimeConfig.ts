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
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

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

    if (!geminiKey) {
        issues.push({
            key: 'VITE_GEMINI_API_KEY',
            severity: 'warning',
            message: 'Gemini API key is missing; AI features will be unavailable.'
        });
    }

    return {
        ok: issues.length === 0,
        issues
    };
}
