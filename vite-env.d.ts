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
    readonly VITE_FF_REAL_EBAY?: string;
    readonly VITE_FF_REAL_PSA?: string;
    readonly VITE_FF_REAL_BGS?: string;
    readonly VITE_FF_REAL_SPORTS?: string;
    readonly VITE_FF_REAL_COMC?: string;
    readonly VITE_FF_REAL_GEMINI?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

/** Experimental Barcode Detection API (Chromium / some mobile browsers). */
interface BarcodeDetectorOptions {
    formats?: string[];
}

interface DetectedBarcode {
    rawValue: string;
    format: string;
}

interface BarcodeDetector {
    detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>;
}

interface BarcodeDetectorConstructor {
    new (options?: BarcodeDetectorOptions): BarcodeDetector;
    getSupportedFormats(): Promise<string[]>;
}

interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
}
