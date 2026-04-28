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

| Plan | Daily requests | History | Bulk endpoints |
|------|---------------|---------|----------------|
| Free | 100 | 7 days | — |
| Hobby ($9.99/mo) | 1,000 | 30 days | — |
| Starter ($19.99/mo) | 2,500 | 90 days | Limited |
| Pro ($49.99/mo) | 10,000 | Full | Yes |
| Business ($99.99/mo) | 50,000 | Full | Yes |

Or pay per request via [x402](https://tcgapi.dev/api/x402) — no signup, USDC on Base or Solana.

## API reference

Full endpoint reference: [**tcgapi.dev/api**](https://tcgapi.dev/api/)
OpenAPI spec: [**tcgapi.dev/openapi.yaml**](https://tcgapi.dev/openapi.yaml)
Quickstart guide: [**tcgapi.dev/quickstart**](https://tcgapi.dev/quickstart/)

## License

MIT
