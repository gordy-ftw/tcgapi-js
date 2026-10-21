# tcgapi

[![npm](https://img.shields.io/npm/v/tcgapi.svg)](https://www.npmjs.com/package/tcgapi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official JavaScript / TypeScript SDK for [**tcgapi.dev**](https://tcgapi.dev) — a unified pricing API for **89+ trading card games**, including:

- Pokémon TCG (English + Japanese)
- Magic: The Gathering
- Yu-Gi-Oh!
- Lorcana
- One Piece Card Game
- Flesh and Blood
- Star Wars Unlimited
- Digimon, Dragon Ball Super, Riftbound, Union Arena, Final Fantasy TCG, Weiss Schwarz, Cardfight!! Vanguard, and dozens more.

Real-time market prices, full price history, fuzzy search, bulk lookups, and exports — all from one HTTP API.

## Install

```bash
npm install tcgapi
```

Requires Node 18+ (or any runtime with global `fetch` — Bun, Deno, Cloudflare Workers, modern browsers).

## Quickstart

Get a free API key at [**tcgapi.dev/dashboard**](https://tcgapi.dev/dashboard) (100 requests/day, no credit card).

```ts
import { TCGApi } from 'tcgapi';

const tcg = new TCGApi({ apiKey: process.env.TCGAPI_KEY });

// Look up a single card
const card = await tcg.cards.get(123456);
console.log(card.data.name);

// Get every printing's current price
const prices = await tcg.cards.prices(123456);
for (const p of prices.data) {
  console.log(`${p.printing}: $${p.market_price}`);
}
```

If you don't pass `apiKey`, the client reads from the `TCGAPI_KEY` environment variable.

## Examples

### Search across every game

```ts
const results = await tcg.search.cards({
  q: 'charizard',
  game: 'pokemon',
  sort: 'price_desc',
  per_page: 20,
});

for (const card of results.data) {
  console.log(card.name, card.set_name, card.market_price);
}
```

### Iterate without pagination boilerplate

```ts
for await (const card of tcg.search.iterate({ q: 'lightning', game: 'magic' })) {
  // walks `meta.has_more` automatically — caps at the API's 200/page max
}
```

### Browse sets

```ts
const games = await tcg.games.list();
const pokemonSets = await tcg.games.sets('pokemon');
const surgingSparks = pokemonSets.data.find(s => s.name.includes('Surging Sparks'));

if (surgingSparks) {
  const cards = await tcg.sets.cards(surgingSparks.id, { sort: 'price_desc' });
  console.log(`${surgingSparks.name}: ${cards.meta?.total} cards`);
}
```

### Bulk price lookup (Pro+)

```ts
// Auto-chunks if you pass more than 500 IDs.
const bulk = await tcg.bulk.prices([1, 2, 3, /* ... up to thousands */]);
console.log(`Got prices for ${bulk.data.length} card-printings`);
```

### Per-condition prices (Pro+)

```ts
// Price floors per (printing, condition) — Near Mint, Lightly Played, etc.
const conditions = await tcg.cards.conditions(13217, { printing: 'Holofoil' });
for (const row of conditions.data) {
  // median_with_shipping is robust to $0.01 junk listings — prefer it when pricing inventory
  console.log(`${row.printing} / ${row.condition}: $${row.median_with_shipping}`);
}
console.log(conditions.meta?.cached, conditions.meta?.condition_counts);

// Bulk variant — up to 500 cards per call, served from the nightly cache.
// Cards without condition data yet are absent; fetch them once via
// tcg.cards.conditions() to warm them.
const bulkConditions = await tcg.bulk.conditions([13217, 13218, 13219]);
```

### Top movers

```ts
const movers = await tcg.prices.topMovers({
  game: 'pokemon',
  direction: 'up',
  period: '7d',
  limit: 10,
});

for (const m of movers.data) {
  console.log(`${m.name} (${m.set_name}): +${m.price_change}% — $${m.market_price}`);
}
```

### How old is a market price?

Every price row carries `market_price_as_of`: the UTC date TCGPlayer last reported
that printing's market price. It is older than `last_updated_at` when a printing
has stopped selling — the last price is kept and dated rather than dropped.

```ts
const prices = await tcg.cards.prices(123456);
for (const p of prices.data) {
  console.log(p.printing, p.market_price, 'as of', p.market_price_as_of);
}
```

### Products TCGPlayer no longer prices

When TCGPlayer stops reporting any price for a product (typically out of print with
no listings), its rows keep the last prices reported and are no longer refreshed
daily. `no_market_price_since` says since when; it is `null` while the printing is
priced.

```ts
const prices = await tcg.cards.prices(123456);
for (const p of prices.data) {
  if (p.no_market_price_since) console.log(p.printing, 'unpriced on TCGPlayer since', p.no_market_price_since);
}
```

### eBay sold prices (Pro+)

`include: 'ebay'` adds an `ebay` field to each printing: the 30-day median eBay sold price
for ungraded copies plus a `graded` map keyed by grade (`"PSA 10"`, `"BGS 9.5"`, ...), or
`null` when there is no eBay data. `'ebay_sales'` also returns the sold listings. Costs 2
credits (`meta.credits_consumed`); below Pro it throws `TierError`.

```ts
const prices = await tcg.cards.prices(123456, { include: 'ebay' });
for (const p of prices.data) {
  console.log(p.printing, p.ebay?.median_30d, p.ebay?.graded['PSA 10']?.median_30d);
}

// Daily 30-day eBay median alongside the TCGPlayer history
const history = await tcg.cards.history(123456, { range: 'year', include: 'ebay' });
```

### Identify a card from a photo

`identify.photo()` reads one photo of a card, slab or sealed product and returns ranked
catalog candidates. It uses one **scan** per photo, separate from your daily request
limit: every account gets 25 free scans, then prepaid packs from the dashboard.

```ts
import { readFile } from 'node:fs/promises';

const result = await tcg.identify.photo(await readFile('card.jpg'), { includePrices: true });
const { status, candidates, read } = result.data;
if (status === 'matched') {
  console.log(candidates[0].name, candidates[0].set.name, candidates[0].prices);
} else if (status === 'retake') {
  console.log('Retake:', result.data.message);
} else {
  // ambiguous / not_found / unsupported: show candidates and let the user pick
}
console.log('scans left:', result.meta?.scans_remaining);
```

Accepts a `Blob`/`File`, raw bytes (`Uint8Array`, `Buffer`, `ArrayBuffer`) or a base64
string / data URL. A `402` with code `SCAN_BALANCE_EMPTY` means the balance is used up.

`identify.usage()` returns the balance, scans per day for the last 30 days by outcome and
the trial and pack purchases. It is free: no scan, no daily quota.

```ts
const { data } = await tcg.identify.usage();
console.log(data.balance, data.days.at(-1)); // { date, scans, matched, ambiguous, retake, ... }
```

### Price history (Hobby+)

```ts
// Window scales with your tier: free=7d, hobby=30d, starter=90d, pro/business=full.
const history = await tcg.cards.history(123456, { range: 'year' });
for (const point of history.data) {
  console.log(point.date, point.market_price);
}
```

## Rate limits

Every successful response carries the live rate-limit budget for your account:

```ts
const resp = await tcg.games.list();
console.log(resp.rateLimit);
// { daily_limit: 10000, daily_remaining: 9871, daily_reset: '2026-04-29T00:00:00.000Z' }
```

When you exceed the daily limit you'll get a typed `RateLimitError`:

```ts
import { RateLimitError } from 'tcgapi';

try {
  await tcg.cards.get(123);
} catch (err) {
  if (err instanceof RateLimitError) {
    console.log(`Hit the limit — retry in ${err.retryAfter}s`);
  } else {
    throw err;
  }
}
```

Other error classes: `AuthError` (401), `TierError` (403), `NotFoundError` (404), `TcgApiError` (anything else). All extend `Error`.

## Tiers

| Plan | Daily requests | History | Bulk endpoints | Sales velocity |
|------|---------------|---------|----------------|----------------|
| Free | 100 | 7 days | — | — |
| Hobby ($9.99/mo) | 1,000 | 30 days | — | — |
| Starter ($19.99/mo) | 2,500 | 90 days | Limited | — |
| Pro ($49.99/mo) | 10,000 | Full | Yes | Yes |
| Business ($99.99/mo) | 50,000 | Full | Yes | Yes |

Sales velocity = `sales_volume`, `avg_sales_price`, and `sales_as_of` on price responses (Pro+). The fields are absent below Pro.

Or pay per request via [x402](https://tcgapi.dev/api/x402) — no signup, USDC on Base or Solana.

## API reference

Full endpoint reference: [**tcgapi.dev/api**](https://tcgapi.dev/api/)
OpenAPI spec: [**tcgapi.dev/openapi.yaml**](https://tcgapi.dev/openapi.yaml)
Quickstart guide: [**tcgapi.dev/quickstart**](https://tcgapi.dev/quickstart/)

## License

MIT
