// Response types for tcgapi.dev. Mirrors openapi/spec.yaml.

export interface Game {
  id: number;
  name: string;
  slug: string;
  tcgplayer_id: number;
  priority: number;
  set_count: number;
  card_count: number;
  image_url: string | null;
  logo_url: string | null;
  last_synced_at: string | null;
}

export interface Set {
  id: number;
  name: string;
  slug: string;
  tcgplayer_id: number;
  abbreviation: string | null;
  release_date: string | null;
  card_count: number;
  image_url: string | null;
  set_icon_url: string | null;
  game_name: string;
  game_slug: string;
}

export interface Card {
  id: number;
  name: string;
  clean_name: string;
  number: string | null;
  rarity: string | null;
  image_url: string | null;
  tcgplayer_id: number;
  tcgplayer_url: string | null;
  product_type: string | null;
  foil_only: number;
  game_name: string;
  game_slug: string;
  set_name: string;
  set_slug: string;
  custom_attributes?: Record<string, unknown> | null;
}

export interface Price {
  card_id: number;
  printing: string | null;
  market_price: number | null;
  /** UTC date (YYYY-MM-DD) TCGPlayer last reported this market price. Older than the other fields when the printing has had no market price recently (the last price is kept). Null when market_price is null/0 or none was reported in the past year. Absent on API versions before 2026-09. */
  market_price_as_of?: string | null;
  low_price: number | null;
  median_price: number | null;
  lowest_with_shipping: number | null;
  buylist_price: number | null;
  price_change_24h: number | null;
  price_change_7d: number | null;
  price_change_30d: number | null;
  last_updated_at: string;
  /** Copies sold in the latest enriched month window. Pro/Business tiers only — absent below Pro. */
  sales_volume?: number | null;
  /** Average sale price over the same window. Pro/Business tiers only — absent below Pro. */
  avg_sales_price?: number | null;
  /** Date of the sales snapshot. Pro/Business tiers only — absent below Pro. */
  sales_as_of?: string | null;
}

export interface CardWithPrice {
  id: number;
  name: string;
  clean_name: string;
  number: string | null;
  rarity: string | null;
  tcgplayer_id: number;
  product_type: string | null;
  foil_only: number;
  total_listings: number | null;
  printing: string | null;
  market_price: number | null;
  /** UTC date (YYYY-MM-DD) TCGPlayer last reported this market price. Older than the other fields when the printing has had no market price recently (the last price is kept). Null when market_price is null/0 or none was reported in the past year. Absent on API versions before 2026-09. */
  market_price_as_of?: string | null;
  low_price: number | null;
  median_price: number | null;
  lowest_with_shipping: number | null;
  price_updated_at: string | null;
  image_url: string | null;
  game_name?: string;
  game_slug?: string;
  set_name?: string;
}

export interface PriceMover {
  card_id: number;
  name: string;
  tcgplayer_id: number;
  product_type: string | null;
  foil_only: number;
  set_name: string;
  game_name: string;
  game_slug: string;
  printing: string | null;
  market_price: number;
  /** UTC date (YYYY-MM-DD) TCGPlayer last reported this market price. Older than the other fields when the printing has had no market price recently (the last price is kept). Null when market_price is null/0 or none was reported in the past year. Absent on API versions before 2026-09. */
  market_price_as_of?: string | null;
  price_change: number;
  last_updated_at: string;
  image_url: string | null;
}

export interface BulkPriceRow {
  card_id: number;
  name: string;
  tcgplayer_id: number;
  product_type: string | null;
  foil_only: number;
  printing: string | null;
  market_price: number | null;
  /** UTC date (YYYY-MM-DD) TCGPlayer last reported this market price. Older than the other fields when the printing has had no market price recently (the last price is kept). Null when market_price is null/0 or none was reported in the past year. Absent on API versions before 2026-09. */
  market_price_as_of?: string | null;
  low_price: number | null;
  median_price: number | null;
  lowest_with_shipping: number | null;
  buylist_price: number | null;
  price_change_24h: number | null;
  price_change_7d: number | null;
  price_change_30d: number | null;
  last_updated_at: string | null;
  image_url: string | null;
}

export interface BulkCard extends Card {
  prices: Price[];
}

export interface ConditionPrice {
  card_id: number;
  printing: string;
  /** TCGPlayer condition grade, e.g. "Near Mint", "Lightly Played". */
  condition: string;
  language: string;
  /** Lowest listed item price for this printing + condition. */
  low_price: number | null;
  /** Lowest listed price including shipping. */
  lowest_with_shipping: number | null;
  /** Median of sampled shipping-inclusive prices. Null when sample_count < 3 — prefer this over low_price when pricing inventory. */
  median_with_shipping: number | null;
  /** Number of listings sampled for this row (not total market depth — see ConditionMeta.condition_counts). */
  sample_count: number;
  last_updated_at: string;
}

/** Row shape of /bulk/conditions — a ConditionPrice plus card identity. */
export interface BulkConditionRow extends ConditionPrice {
  name: string;
  tcgplayer_id: number | null;
}

/** Meta for /cards/{id}/prices/conditions — cache/staleness signals. */
export interface ConditionMeta {
  /** True when served from cache without a live refresh. */
  cached?: boolean;
  /** Present (true) when rows are older than 24h and a live refresh wasn't possible (quota or upstream failure). */
  stale?: boolean;
  as_of?: string | null;
  /** Total live listings per condition across ALL printings (only present on live-refreshed responses). */
  condition_counts?: Record<string, number>;
}

export interface PriceHistoryPoint {
  date: string;
  printing: string | null;
  market_price: number | null;
  low_price: number | null;
  avg_sales_price: number | null;
  sales_volume: number | null;
}

export interface Meta {
  total: number;
  page?: number;
  per_page?: number;
  has_more?: boolean;
}

export interface RateLimit {
  daily_limit: number;
  daily_remaining: number;
  daily_reset: string;
}

export interface ApiKeySummary {
  id: string;
  key_prefix: string;
  name: string;
  tier: 'free' | 'hobby' | 'starter' | 'pro' | 'business';
  is_active: number;
  total_requests: number;
  created_at: string;
}

export interface ApiKeyCreated {
  id: string;
  key: string;
  key_prefix: string;
  name: string;
  tier: string;
  message: string;
}

export interface UsageResponse {
  account: {
    today_requests: number;
    daily_limit: number;
    daily_remaining: number;
  };
  keys: Array<{
    id: string;
    key_prefix: string;
    name: string;
    tier: string;
    total_requests: number;
  }>;
  subscription: {
    plan: string;
    status: string;
  };
  /** Photo identification scans (POST /v1/identify), billed apart from the daily quota */
  scans?: { balance: number; trial_pending: boolean };
}

// Wrapper returned by every list/detail call. Lets callers reach `meta` and `rateLimit`
// without losing access to the typed payload. The second parameter overrides the meta
// shape for endpoints with a non-standard meta (e.g. per-condition prices).
export interface IdentifyCandidate {
  card_id: number;
  tcgplayer_id: number | null;
  name: string;
  number: string | null;
  rarity: string | null;
  product_type: string | null;
  set: { id: number; name: string; code: string | null };
  game: { slug: string; name: string };
  image_url: string | null;
  match: {
    /** partial = the same number with the set total on one side only (169/249 vs 169) */
    number: 'exact' | 'partial' | 'unknown';
    /** Share of the read name's words in the card name (0-1) */
    name: number;
    /** How well the read set agrees with the card's set (0-1) */
    set: number;
    /** false when the card's title names an edition stamp the photo doesn't show, or the reverse */
    edition: boolean | null;
  };
  printings: string[];
  /** The printing the photo points to (finish, 1st Edition stamp), when it decides one */
  suggested_printing: string | null;
  score: number;
  /** Only on the first candidate, with include: 'prices' */
  prices?: Array<{
    printing: string;
    market_price: number | null;
    low_price: number | null;
    median_price: number | null;
    lowest_with_shipping: number | null;
    price_change_7d: number | null;
    price_change_30d: number | null;
    last_updated_at: string | null;
  }>;
}

export interface IdentifyResult {
  id: string;
  /**
   * matched: exactly one catalog card fits everything the photo shows (candidates[0]).
   * ambiguous: several fit. retake: photo not good enough (see message; candidates are hints).
   * not_found: nothing matches. unsupported: game or language not in the catalog.
   */
  status: 'matched' | 'ambiguous' | 'retake' | 'not_found' | 'unsupported';
  message: string | null;
  /** What the photo shows. Empty fields are unreadable, never guessed. */
  read: {
    game: string;
    name: string | null;
    number: string | null;
    set: string | null;
    language: string | null;
    kind: 'raw' | 'slab' | 'sealed' | 'unknown';
    product_type: string | null;
    finish: 'non_holo' | 'holo' | 'reverse_holo' | 'unknown';
    /** The edition mark seen; null when clearly none; 'unclear' when hidden */
    stamp: string | null;
    grade: { company: string | null; grade: string | null } | null;
    readable: { name: boolean; number: boolean; set: boolean };
    notes: string | null;
  } | null;
  candidates: IdentifyCandidate[];
  warnings: string[];
}

export interface IdentifyMeta {
  charged: 'scan' | 'x402';
  /** Scans left after this one (API-key requests) */
  scans_remaining?: number;
}

/** GET /identify/usage: one UTC day of scans, by outcome */
export interface ScanDay {
  date: string;
  /** Scans used that day */
  scans: number;
  /** Reads that failed on the reader's side and were refunded */
  refunded: number;
  matched: number;
  ambiguous: number;
  retake: number;
  not_found: number;
  unsupported: number;
}

export interface ScanLedgerEntry {
  reason: 'trial' | 'purchase';
  scans: number;
  amount_cents: number | null;
  created_at: string;
}

export interface ScanUsage {
  balance: number;
  trial_pending: boolean;
  /** The last 30 days, oldest first, including days with no scans */
  days: ScanDay[];
  /** Trial and pack purchases added to the balance, newest first (up to 50) */
  ledger: ScanLedgerEntry[];
}

export interface Response<T, M = Meta> {
  data: T;
  meta?: M;
  rateLimit?: RateLimit;
}
