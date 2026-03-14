/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    readonly VITE_EBAY_CLIENT_ID?: string;
    readonly VITE_EBAY_CLIENT_SECRET?: string;
    readonly VITE_PRESSBOX_API_KEY?: string;
    readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
    readonly VITE_STRIPE_BASIC_PRICE_ID?: string;
    readonly VITE_STRIPE_PRO_PRICE_ID?: string;
    readonly VITE_STRIPE_ALPHA_PRICE_ID?: string;
    readonly VITE_SUPABASE_STORAGE_BUCKET?: string;
    readonly VITE_SERVER_API_BASE_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
