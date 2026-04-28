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
  low_price: number | null;
  median_price: number | null;
  lowest_with_shipping: number | null;
  buylist_price: number | null;
  price_change_24h: number | null;
  price_change_7d: number | null;
  price_change_30d: number | null;
  last_updated_at: string;
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
}

// Wrapper returned by every list/detail call. Lets callers reach `meta` and `rateLimit`
// without losing access to the typed payload.
export interface Response<T> {
  data: T;
  meta?: Meta;
  rateLimit?: RateLimit;
}
