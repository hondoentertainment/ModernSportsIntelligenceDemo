/// <reference types="vite/client" />

/**
 * Minimal ambient declaration for @google/genai — the installed package
 * ships only .mjs files without bundled .d.ts declarations, so TypeScript
 * cannot resolve types automatically. This shim covers the subset used in
 * api/ai/generate.ts.
 */
declare module '@google/genai' {
  interface GenerateContentResponse {
    text: string | undefined;
  }

  interface GenerateContentParams {
    model: string;
    contents: unknown;
    config?: unknown;
  }

  interface ModelsResource {
    generateContent(params: GenerateContentParams): Promise<GenerateContentResponse>;
  }

  interface GoogleGenAIOptions {
    apiKey: string;
  }

  class GoogleGenAI {
    constructor(options: GoogleGenAIOptions);
    models: ModelsResource;
  }

  export { GoogleGenAI };
}

/**
 * Minimal ambient declaration for zod — the installed zod v4 package is
 * missing several .d.cts files (schemas.d.cts, etc.) which prevents TypeScript
 * from resolving `z.object`, `z.string`, etc. from the package exports.
 * This shim re-declares the parts of the API used in this codebase so tsc can
 * type-check without errors while the package types remain broken.
 */
declare module 'zod' {
  export type infer<T extends ZodTypeAny> = T['_output'];
  export type output<T extends ZodTypeAny> = T['_output'];

  export interface ZodTypeDef {
    typeName: string;
  }

  export class ZodType<Output = unknown, Def extends ZodTypeDef = ZodTypeDef, Input = Output> {
    readonly _output: Output;
    readonly _input: Input;
    readonly _def: Def;
    parse(data: unknown): Output;
    safeParse(data: unknown): { success: true; data: Output } | { success: false; error: ZodError };
    optional(): ZodOptional<this>;
    nullable(): ZodNullable<this>;
    default(def: Output | (() => Output)): ZodDefault<this>;
    passthrough(): this;
    transform<NewOut>(transform: (arg: Output) => NewOut): ZodTransformer<this, NewOut>;
    pipe<T extends ZodTypeAny>(target: T): ZodPipeline<this, T>;
  }

  export type ZodTypeAny = ZodType<unknown, ZodTypeDef, unknown>;

  export class ZodString extends ZodType<string> {
    optional(): ZodOptional<this>;
    default(def: string | (() => string)): ZodDefault<this>;
    min(min: number): this;
    max(max: number): this;
    email(): this;
    url(): this;
    uuid(): this;
    regex(regex: RegExp): this;
    trim(): this;
    toLowerCase(): this;
    toUpperCase(): this;
  }

  export class ZodNumber extends ZodType<number> {
    optional(): ZodOptional<this>;
    default(def: number | (() => number)): ZodDefault<this>;
    min(min: number): this;
    max(max: number): this;
    int(): this;
    positive(): this;
    nonnegative(): this;
  }

  export class ZodBoolean extends ZodType<boolean> {
    optional(): ZodOptional<this>;
    default(def: boolean | (() => boolean)): ZodDefault<this>;
  }

  export class ZodNull extends ZodType<null> {}
  export class ZodUndefined extends ZodType<undefined> {}
  export class ZodAny extends ZodType<unknown> {}
  export class ZodUnknown extends ZodType<unknown> {}

  export type ZodRawShape = { [k: string]: ZodTypeAny };
  export type ZodObjectDef<T extends ZodRawShape = ZodRawShape> = ZodTypeDef & { shape: () => T };

  export type objectOutputType<Shape extends ZodRawShape> = {
    [k in keyof Shape]: Shape[k]['_output'];
  };

  export class ZodObject<
    T extends ZodRawShape,
    UnknownKeys extends 'passthrough' | 'strict' | 'strip' = 'strip',
    Catchall extends ZodTypeAny = ZodTypeAny,
    Output = objectOutputType<T>,
    Input = Output,
  > extends ZodType<Output, ZodObjectDef<T>, Input> {
    passthrough(): ZodObject<T, 'passthrough', Catchall, Output, Input>;
    strict(): ZodObject<T, 'strict', Catchall, Output, Input>;
    strip(): ZodObject<T, 'strip', Catchall, Output, Input>;
    extend<Augmentation extends ZodRawShape>(augmentation: Augmentation): ZodObject<T & Augmentation>;
    merge<Incoming extends ZodRawShape>(merging: ZodObject<Incoming>): ZodObject<T & Incoming>;
    pick<Mask extends { [k in keyof T]?: true }>(mask: Mask): ZodObject<Pick<T, Extract<keyof T, keyof Mask>>>;
    omit<Mask extends { [k in keyof T]?: true }>(mask: Mask): ZodObject<Omit<T, keyof Mask>>;
    partial(): ZodObject<{ [k in keyof T]: ZodOptional<T[k]> }>;
    required(): ZodObject<{ [k in keyof T]: ZodNonOptional<T[k]> }>;
    shape: T;
  }

  export class ZodArray<T extends ZodTypeAny> extends ZodType<T['_output'][]> {
    optional(): ZodOptional<this>;
    min(min: number): this;
    max(max: number): this;
    nonempty(): this;
  }

  export class ZodOptional<T extends ZodTypeAny> extends ZodType<T['_output'] | undefined> {
    unwrap(): T;
  }

  export class ZodNullable<T extends ZodTypeAny> extends ZodType<T['_output'] | null> {
    unwrap(): T;
  }

  export class ZodDefault<T extends ZodTypeAny> extends ZodType<Exclude<T['_output'], undefined>> {
    unwrap(): T;
    removeDefault(): T;
  }

  export class ZodNonOptional<T extends ZodTypeAny> extends ZodType<Exclude<T['_output'], undefined>> {}

  export class ZodUnion<T extends readonly [ZodTypeAny, ...ZodTypeAny[]]> extends ZodType<T[number]['_output']> {}

  export class ZodEnum<T extends [string, ...string[]]> extends ZodType<T[number]> {
    options: T;
  }

  export class ZodLiteral<T> extends ZodType<T> {
    value: T;
  }

  export class ZodRecord<
    Key extends ZodType<string | number | symbol> = ZodString,
    Value extends ZodTypeAny = ZodTypeAny
  > extends ZodType<Record<Key['_output'], Value['_output']>> {}

  export class ZodTransformer<I extends ZodTypeAny, O> extends ZodType<O, ZodTypeDef, I['_input']> {}

  export class ZodPipeline<A extends ZodTypeAny, B extends ZodTypeAny> extends ZodType<B['_output'], ZodTypeDef, A['_input']> {}

  export class ZodError {
    issues: ZodIssue[];
    message: string;
  }

  export interface ZodIssue {
    code: string;
    message: string;
    path: (string | number)[];
  }

  export function object<T extends ZodRawShape>(shape: T): ZodObject<T>;
  export function string(): ZodString;
  export function number(): ZodNumber;
  export function boolean(): ZodBoolean;
  export function array<T extends ZodTypeAny>(schema: T): ZodArray<T>;
  export function optional<T extends ZodTypeAny>(schema: T): ZodOptional<T>;
  export function nullable<T extends ZodTypeAny>(schema: T): ZodNullable<T>;
  export function union<T extends readonly [ZodTypeAny, ...ZodTypeAny[]]>(types: T): ZodUnion<T>;
  export function enum_<T extends [string, ...string[]]>(values: T): ZodEnum<T>;
  export function literal<T extends string | number | boolean | null | undefined>(value: T): ZodLiteral<T>;
  export function record<Key extends ZodType<string | number | symbol>, Value extends ZodTypeAny>(key: Key, value: Value): ZodRecord<Key, Value>;
  export function record<Value extends ZodTypeAny>(value: Value): ZodRecord<ZodString, Value>;
  export function any(): ZodAny;
  export function unknown(): ZodUnknown;
  export function null_(): ZodNull;
  export function undefined_(): ZodUndefined;

  export namespace z {
    export { object, string, number, boolean, array, optional, nullable, union, literal, any, unknown, record };
    export { ZodType, ZodTypeAny, ZodString, ZodNumber, ZodBoolean, ZodObject, ZodArray, ZodOptional, ZodNullable, ZodDefault, ZodUnion, ZodEnum, ZodLiteral, ZodRecord, ZodError, ZodIssue };
    export type infer<T extends ZodTypeAny> = T['_output'];
  }
}

/**
 * Minimal ambient declaration for the `stripe` Node.js SDK.
 * The installed package (node_modules/stripe) is missing its package.json and
 * type declarations. This shim provides the subset used by api/stripe-webhook.ts
 * so tsc can type-check without errors.
 */
declare module 'stripe' {
  namespace Stripe {
    interface StripeOptions {
      apiVersion?: string;
      [key: string]: unknown;
    }

    namespace Checkout {
      interface Session {
        id: string;
        object: 'checkout.session';
        mode: string | null;
        customer: string | Stripe.Customer | null;
        client_reference_id: string | null;
        metadata: Record<string, string> | null;
        subscription: string | Stripe.Subscription | null;
        [key: string]: unknown;
      }
    }

    interface Customer {
      id: string;
      object: 'customer';
      [key: string]: unknown;
    }

    interface Subscription {
      id: string;
      object: 'subscription';
      status: Subscription.Status;
      customer: string | Customer | null;
      metadata: Record<string, string> | null;
      items: { data: SubscriptionItem[] };
      start_date: number;
      ended_at: number | null;
      trial_end: number | null;
      [key: string]: unknown;
    }

    namespace Subscription {
      type Status =
        | 'active'
        | 'canceled'
        | 'incomplete'
        | 'incomplete_expired'
        | 'past_due'
        | 'paused'
        | 'trialing'
        | 'unpaid';
    }

    interface SubscriptionItem {
      id: string;
      price?: { id: string; [key: string]: unknown };
      [key: string]: unknown;
    }

    interface Invoice {
      id: string;
      object: 'invoice';
      customer: string | Customer | null;
      parent?: InvoiceParent | null;
      lines?: { data: InvoiceLineItem[] };
      [key: string]: unknown;
    }

    interface InvoiceParent {
      type: string;
      subscription_details?: { subscription?: string | Subscription | null } | null;
      [key: string]: unknown;
    }

    interface InvoiceLineItem {
      subscription?: string | Subscription | null;
      [key: string]: unknown;
    }

    interface Event {
      id: string;
      type: string;
      data: {
        object: Record<string, unknown>;
      };
      [key: string]: unknown;
    }

    interface Webhooks {
      constructEvent(payload: string, sig: string, secret: string): Event;
    }

    interface SubscriptionRetrieveParams {
      expand?: string[];
    }

    interface SubscriptionsResource {
      retrieve(id: string, params?: SubscriptionRetrieveParams): Promise<Subscription>;
    }
  }

  class Stripe {
    constructor(apiKey: string, options?: Stripe.StripeOptions);
    webhooks: Stripe.Webhooks;
    subscriptions: Stripe.SubscriptionsResource;
  }

  export = Stripe;
}

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
