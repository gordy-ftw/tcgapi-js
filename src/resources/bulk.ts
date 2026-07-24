import type { TCGApi } from '../client';
import type { BulkCard, BulkConditionRow, BulkPriceRow, PriceHistoryPoint, Response } from '../types';

const BULK_PRICES_MAX = 500;
const BULK_CARDS_MAX = 100;
const BULK_HISTORY_MAX = 50;
const BULK_CONDITIONS_MAX = 500;

function joinIds(ids: number[]): string {
  if (ids.length === 0) throw new Error('At least one card ID required');
  return ids.join(',');
}

export class BulkResource {
  constructor(private readonly client: TCGApi) {}

  /**
   * GET /bulk/prices — up to 500 cards per call. Pro+ tier.
   * Returns one row per (card, printing) — a card with N printings yields N rows.
   * For larger lists this method auto-chunks and concatenates.
   */
  async prices(ids: number[]): Promise<Response<BulkPriceRow[]>> {
    if (ids.length <= BULK_PRICES_MAX) {
      return this.client.request<BulkPriceRow[]>('GET', '/bulk/prices', { ids: joinIds(ids) });
    }
    const all: BulkPriceRow[] = [];
    let lastRateLimit;
    for (let i = 0; i < ids.length; i += BULK_PRICES_MAX) {
      const chunk = ids.slice(i, i + BULK_PRICES_MAX);
      const resp = await this.client.request<BulkPriceRow[]>('GET', '/bulk/prices', { ids: joinIds(chunk) });
      all.push(...resp.data);
      lastRateLimit = resp.rateLimit;
    }
    return { data: all, meta: { total: all.length }, rateLimit: lastRateLimit };
  }

  /**
   * GET /bulk/cards — up to 100 cards per call. Pro+ tier.
   * Auto-chunks for larger lists.
   */
  async cards(ids: number[]): Promise<Response<BulkCard[]>> {
    if (ids.length <= BULK_CARDS_MAX) {
      return this.client.request<BulkCard[]>('GET', '/bulk/cards', { ids: joinIds(ids) });
    }
    const all: BulkCard[] = [];
    let lastRateLimit;
    for (let i = 0; i < ids.length; i += BULK_CARDS_MAX) {
      const chunk = ids.slice(i, i + BULK_CARDS_MAX);
      const resp = await this.client.request<BulkCard[]>('GET', '/bulk/cards', { ids: joinIds(chunk) });
      all.push(...resp.data);
      lastRateLimit = resp.rateLimit;
    }
    return { data: all, meta: { total: all.length }, rateLimit: lastRateLimit };
  }

  /**
   * GET /bulk/conditions — per-condition prices for up to 500 cards per call. Pro+ tier.
   * Served entirely from the nightly cache (never triggers live fetches); cards without
   * condition data yet are absent from the result — request them once via
   * cards.conditions() to warm them. Auto-chunks for larger lists.
   */
  async conditions(ids: number[]): Promise<Response<BulkConditionRow[]>> {
    if (ids.length <= BULK_CONDITIONS_MAX) {
      return this.client.request<BulkConditionRow[]>('GET', '/bulk/conditions', { ids: joinIds(ids) });
    }
    const all: BulkConditionRow[] = [];
    let lastRateLimit;
    for (let i = 0; i < ids.length; i += BULK_CONDITIONS_MAX) {
      const chunk = ids.slice(i, i + BULK_CONDITIONS_MAX);
      const resp = await this.client.request<BulkConditionRow[]>('GET', '/bulk/conditions', { ids: joinIds(chunk) });
      all.push(...resp.data);
      lastRateLimit = resp.rateLimit;
    }
    return { data: all, meta: { total: all.length }, rateLimit: lastRateLimit };
  }

  /**
   * GET /bulk/history — up to 50 cards per call. Pro+ tier.
   * Returns a map of card_id -> history points.
   */
  async history(
    ids: number[],
    params: { range?: 'month' | 'quarter' | 'year' | 'all'; printing?: string } = {}
  ): Promise<Response<Record<string, PriceHistoryPoint[]>>> {
    if (ids.length <= BULK_HISTORY_MAX) {
      return this.client.request<Record<string, PriceHistoryPoint[]>>('GET', '/bulk/history', { ids: joinIds(ids), ...params });
    }
    const merged: Record<string, PriceHistoryPoint[]> = {};
    let lastRateLimit;
    for (let i = 0; i < ids.length; i += BULK_HISTORY_MAX) {
      const chunk = ids.slice(i, i + BULK_HISTORY_MAX);
      const resp = await this.client.request<Record<string, PriceHistoryPoint[]>>('GET', '/bulk/history', { ids: joinIds(chunk), ...params });
      Object.assign(merged, resp.data);
      lastRateLimit = resp.rateLimit;
    }
    return { data: merged, rateLimit: lastRateLimit };
  }
}
