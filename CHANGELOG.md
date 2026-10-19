# Changelog

## 0.6.0

- `no_market_price_since` on price rows (`Price`, `CardWithPrice`, `PriceMover`,
  `BulkPriceRow`, identify `prices`): ISO timestamp since which TCGPlayer has priced
  nothing for the product, `null` while it is priced. Optional: `undefined` until the
  API serves it.
- `identify.usage()`: scan balance, 30 days of scans by outcome, and the trial/purchase
  ledger (`GET /v1/identify/usage`).

Earlier releases are described in their tagged commits.
