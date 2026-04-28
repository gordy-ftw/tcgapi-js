import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TCGApi, NotFoundError, TcgApiError } from '../dist/index.js';

const tcg = new TCGApi();
// Endpoints under x402 pricing (search, top-movers, etc) require a key for free use.
const hasKey = !!process.env.TCGAPI_KEY;

test('games.list returns a populated array', async () => {
  const resp = await tcg.games.list({ per_page: 5 });
  assert.ok(Array.isArray(resp.data));
  assert.ok(resp.data.length > 0, 'expected at least one game');
  assert.ok(resp.data[0].slug, 'first game should have a slug');
});

test('games.get returns Pokemon by slug', async () => {
  const resp = await tcg.games.get('pokemon');
  assert.equal(resp.data.slug, 'pokemon');
  assert.equal(resp.data.name, 'Pokemon');
});

test('games.get throws NotFoundError for unknown slug', async () => {
  await assert.rejects(() => tcg.games.get('definitely-not-a-real-game-xyz'), NotFoundError);
});

test('games.sets returns sets for Pokemon', async () => {
  const resp = await tcg.games.sets('pokemon', { per_page: 3 });
  assert.ok(resp.data.length > 0);
  assert.ok(resp.data[0].name);
  assert.ok(resp.data[0].id);
});

test('search.cards returns matches (requires key or returns 402)', { skip: !hasKey }, async () => {
  const resp = await tcg.search.cards({ q: 'charizard', per_page: 5 });
  assert.ok(resp.data.length > 0, 'expected charizard results');
  assert.ok((resp.meta?.total ?? 0) > 0);
});

test('search.cards without key returns 402 typed error', { skip: hasKey }, async () => {
  await assert.rejects(
    () => tcg.search.cards({ q: 'charizard' }),
    (err) => err instanceof TcgApiError && err.status === 402,
  );
});

test('prices.topMovers requires key (skipped without TCGAPI_KEY)', { skip: !hasKey }, async () => {
  const resp = await tcg.prices.topMovers({ limit: 3 });
  assert.ok(Array.isArray(resp.data));
});
