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
  /** Set (ISO 8601, UTC) when TCGPlayer has priced nothing for this product since then — typically out of print with no listings. The row keeps the last prices TCGPlayer reported and is not refreshed daily, so last_updated_at stays at the last real update. Null while the printing is priced. Absent on API versions before 2026-10. */
  no_market_price_since?: string | null;
  /** Copies sold in the latest enriched month window. Pro/Business tiers only — absent below Pro. */
  sales_volume?: number | null;
  /** Average sale price over the same window. Pro/Business tiers only — absent below Pro. */
  avg_sales_price?: number | null;
  /** Date of the sales snapshot. Pro/Business tiers only — absent below Pro. */
  sales_as_of?: string | null;
  /** eBay sold prices for this printing. Only with `include: 'ebay'` or `'ebay_sales'` (Pro+, 2 credits); null when there is no eBay data for the printing. */
  ebay?: EbaySummary | null;
}

/** eBay sold-price figures for one printing (ungraded) or one grade. */
export interface EbayStats {
  /** Median sold price in the 30 days before as_of. Null when nothing sold in the window. */
  median_30d: number | null;
  /** Sales the median rests on. */
  sales_30d: number;
  /** Latest sale, in or out of the window. On a Best Offer sale, the accepted offer. */
  last_price: number | null;
  last_sold: string | null;
}

/** eBay sold listings for one printing. Top-level figures are ungraded copies of every condition. */
export interface EbaySummary extends EbayStats {
  /** How many of the 30 window days the stored ungraded sales cover (30 = complete; lower in the first month of tracking). */
  days?: number;
  /** Every grade that has sold, keyed by label ("PSA 10", "CGC 10 Pristine", "BGS 9.5"). */
  graded: Record<string, EbayStats>;
  /** The same as `days` for graded sales, which start being tracked on their own date. */
  graded_days?: number;
  /** Date the sales were last read. The 30-day window ends here. */
  as_of: string;
  /** Only with `include: 'ebay_sales'`: the included sales in the 30-day window, newest first. */
  sales?: EbaySale[];
  /** identify.photo() with `includeEbay` on a graded slab: the eBay figures for the grade on the label. */
  slab_grade?: (EbayStats & { label: string }) | null;
}

export interface EbaySale {
  sold_date: string;
  /** Sold price; on a Best Offer sale, the accepted offer. */
  price: number;
  best_offer: boolean;
  /** Asking price, on Best Offer sales. */
  list_price: number | null;
  /** Grade label (e.g. "PSA 10"); null = ungraded. */
  grade: string | null;
  /** Ungraded sales only, when the title states one (Near Mint … Damaged). */
  condition: string | null;
  title: string;
  url: string;
}

/** eBay sold median for the 30 days up to a history row's date. `graded` lists only grades with a sale in that window. */
export interface EbayHistoryPoint {
  median_30d: number | null;
  sales_30d: number;
  /** How many of that day's 30 window days the stored ungraded sales cover (30 = complete). */
  days?: number;
  /** Null when graded sales were not yet complete on that day. */
  graded: Record<string, { median_30d: number | null; sales_30d: number }> | null;
  /** The same as `days` for graded sales. Absent when graded is null. */
  graded_days?: number;
  /** Only on days after the card's latest eBay read: those days carry that read's figures, and this is its date (YYYY-MM-DD). */
  as_of?: string;
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
  /** Set (ISO 8601, UTC) when TCGPlayer has priced nothing for this product since then — typically out of print with no listings. The row keeps the last prices TCGPlayer reported and is not refreshed daily, so last_updated_at stays at the last real update. Null while the printing is priced. Absent on API versions before 2026-10. */
  no_market_price_since?: string | null;
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
  /** Set (ISO 8601, UTC) when TCGPlayer has priced nothing for this product since then — typically out of print with no listings. The row keeps the last prices TCGPlayer reported and is not refreshed daily, so last_updated_at stays at the last real update. Null while the printing is priced. Absent on API versions before 2026-10. */
  no_market_price_since?: string | null;
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
  /** Set (ISO 8601, UTC) when TCGPlayer has priced nothing for this product since then — typically out of print with no listings. The row keeps the last prices TCGPlayer reported and is not refreshed daily, so last_updated_at stays at the last real update. Null while the printing is priced. Absent on API versions before 2026-10. */
  no_market_price_since?: string | null;
  image_url: string | null;
  /** Only with `include: 'ebay'` (Pro+): the printing's eBay summary (without sales), or null. */
  ebay?: EbaySummary | null;
}

export interface BulkCard extends Card {
  prices: Price[];
}

/** GET /ebay/coverage: eBay sold-price coverage for one game. */
export interface EbayCoverageGame {
  /** Game name */
  game: string;
  slug: string;
  cards: number;
  cards_with_ebay: number;
  coverage_pct: number;
  printings_with_ebay: number;
  /** Date of the newest eBay read in this game (YYYY-MM-DD). */
  newest_as_of: string;
  /** Cards with eBay data by how often their sales are re-read. */
  refresh: { daily: number; '3d': number; weekly: number; monthly: number };
}

export interface EbayCoverageSet {
  set_id: number;
  /** Set name */
  set: string;
  cards: number;
  cards_with_ebay: number;
  coverage_pct: number;
}

/** GET /ebay/coverage without `game`. */
export interface EbayCoverage {
  totals: { cards_with_ebay: number; printings_with_ebay: number; games: number };
  games: EbayCoverageGame[];
  computed_at: string;
}

/** GET /ebay/coverage?game={slug}: the game plus per-set coverage. */
export interface EbayGameCoverage extends EbayCoverageGame {
  sets: EbayCoverageSet[];
  computed_at: string;
}

/**
 * One printing's Cardmarket price (EUR) from Cardmarket's daily price guide. Each printing reads one Cardmarket product
 * and one of its two series: `regular`, or `foil` (Pokemon: reverse holo).
 */
export interface CardmarketPrice {
  card_id: number;
  /** Our printing, or `'All editions'` when Cardmarket sells the card's editions as one product (Yu-Gi-Oh! 1st Edition + Unlimited). */
  printing: string;
  /** True for `'All editions'`: the price covers every edition, never one. */
  editions_blended: boolean;
  price_trend: number | null;
  avg_sell_price: number | null;
  /** Lowest listing. */
  low_price: number | null;
  avg_1d: number | null;
  avg_7d: number | null;
  avg_30d: number | null;
  currency: 'EUR';
  /** Date of the Cardmarket price guide the price came from (ISO 8601, UTC). */
  last_updated_at: string | null;
  cm_product_id: number;
  cm_name: string;
  /** Cardmarket product page, when known. */
  cm_url: string | null;
  cm_series: 'regular' | 'foil';
  /** How the card was matched to the Cardmarket product (diagnostic). */
  match_method: string;
}

/** A row of GET /sets/{id}/prices/cardmarket: the price plus the card's name, number and TCGPlayer id. */
export interface CardmarketSetPrice extends CardmarketPrice {
  name: string;
  number: string | null;
  tcgplayer_id: number | null;
}

export interface CardmarketCoverageGame {
  game_id: number;
  game: string | null;
  game_slug: string | null;
  cards: number;
  printings: number;
  priced_printings: number;
  updated_at: string;
}

/** GET /cardmarket/coverage: cards, printings and priced printings per game (recomputed daily). */
export interface CardmarketCoverage {
  total_cards: number;
  total_printings: number;
  total_priced_printings: number;
  price_guide_oldest: string | null;
  price_guide_newest: string | null;
  games: CardmarketCoverageGame[];
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

/**
 * One step of a printing's supply ladder: listings priced at or under `max_pct` of its market price.
 * Photo (custom) listings are left out — sellers list opened boxes and lots under sealed products.
 */
export interface SupplyLadderStep {
  /** Step as a share of the market price: 0.9, 1, 1.1, 1.25 or 1.5. */
  max_pct: number;
  /** Listing price (before shipping) at most this. */
  max_price: number;
  listings: number;
  /** Copies for sale across those listings. */
  units: number;
  sellers: number;
  /** False when only the cheapest 50 listings could be itemised, so listings, units and sellers are lower bounds. */
  exact: boolean;
}

/** The 110% ladder step summed over printings (each against its own market price). */
export interface SupplyNearMarket {
  listings: number;
  units: number;
  /** Summed per printing, so a seller listing two printings counts twice. */
  sellers: number;
  /** True only when every printing's 110% step is exact. */
  exact: boolean;
}

/** One price ladder per printing that has a market price. */
export interface SupplyPrinting {
  printing: string;
  /** The market price the ladder was measured against, as of last_updated_at. */
  market_price: number;
  ladder: SupplyLadderStep[];
}

/**
 * GET /cards/{id}/supply and rows of /bulk/supply — how much of a product is for sale on TCGPlayer,
 * from how many sellers, and how much of it sits near the market price. English listings priced
 * for US shipping, read about every 3 days per product. Counts only; no seller identities.
 */
export interface ListingSupply {
  card_id: number;
  name: string;
  tcgplayer_id: number | null;
  /** Active listings, all conditions and printings (photo listings included). */
  listings: number;
  /** Copies for sale across all listings. */
  units: number | null;
  /** Distinct sellers. Null when it could not be counted. */
  sellers: number | null;
  /** The listing with the most copies and its share (0-1) of all units. Null when units are unknown or 0. */
  largest_listing: { quantity: number; share: number } | null;
  /** Listings with exactly one copy. */
  single_unit_listings: number | null;
  /** True when every listing was itemised (not just counted). */
  complete: boolean;
  /** The 110% step across printings; `listings: 0` means nobody is selling near the market price. Null when no printing has a market price. */
  near_market: SupplyNearMarket | null;
  /** Copies sold over the last 30 days (all printings). */
  sales_30d: number | null;
  /** sales_30d divided by the days with recorded sales. Null with fewer than 7 recorded days. */
  sales_per_day: number | null;
  /** units / sales_per_day. Null when sales_per_day is null or 0. */
  days_of_supply: number | null;
  /** near_market.units / sales_per_day. */
  near_market_days_of_supply: number | null;
  /** Listings per condition, e.g. `{ "Near Mint": 40 }`. */
  by_condition: Record<string, number>;
  /** Listings per printing, e.g. `{ "Normal": 205 }`. */
  by_printing: Record<string, number>;
  printings: SupplyPrinting[];
  last_updated_at: string;
}

/** Meta for /cards/{id}/supply. */
export interface SupplyMeta {
  /** When the listings were read (same as data.last_updated_at). */
  as_of?: string;
}

/** One point of /cards/{id}/supply/history: one per day the listings were read (about every 3 days). History starts 2026-10-27. */
export interface SupplyHistoryPoint {
  /** YYYY-MM-DD (UTC). */
  date: string;
  listings: number;
  units: number | null;
  sellers: number | null;
  /** The near-market (110%) step; null when no printing had a market price that day. */
  near_market_listings: number | null;
  near_market_units: number | null;
  near_market_sellers: number | null;
  near_market_exact: boolean | null;
}

export interface PriceHistoryPoint {
  date: string;
  printing: string | null;
  market_price: number | null;
  low_price: number | null;
  avg_sales_price: number | null;
  sales_volume: number | null;
  /** Only with `include: 'ebay'` on cards.history (Pro+, 2 credits). Null before eBay sales for the printing are complete, or when there is no eBay data. */
  ebay?: EbayHistoryPoint | null;
}

export interface Meta {
  total: number;
  page?: number;
  per_page?: number;
  has_more?: boolean;
  /** Credits charged on requests with an eBay `include` (2 on card prices/history; 1 + cards with eBay data on bulk prices); absent otherwise. */
  credits_consumed?: number;
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
  /** Only on the first candidate, with includePrices or includeEbay */
  prices?: Array<{
    printing: string;
    market_price: number | null;
    low_price: number | null;
    median_price: number | null;
    lowest_with_shipping: number | null;
    price_change_7d: number | null;
    price_change_30d: number | null;
    last_updated_at: string | null;
    /** See Price.no_market_price_since. */
    no_market_price_since?: string | null;
    /** Only with includeEbay: the printing's eBay summary (without sales; slab_grade on a slab), or null. */
    ebay?: EbaySummary | null;
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
