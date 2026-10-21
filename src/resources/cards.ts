import type { TCGApi } from '../client';
import type { BulkCard, Card, ConditionMeta, ConditionPrice, Price, PriceHistoryPoint, Response } from '../types';

export interface PriceHistoryParams {
  range?: 'month' | 'quarter' | 'year' | 'all';
  printing?: string;
  /** `'ebay'` adds each day's 30-day eBay sold median to each row. Pro+; costs 2 credits. */
  include?: 'ebay';
}

export class CardsResource {
  constructor(private readonly client: TCGApi) {}

  /** GET /cards/{id} */
  get(id: number): Promise<Response<Card>> {
    return this.client.request<Card>('GET', `/cards/${id}`);
  }

  /**
   * GET /cards/{id}/prices — one row per printing.
   * `include: 'ebay'` adds an `ebay` summary of eBay sold prices to each row; `'ebay_sales'` also adds the
   * sold listings behind it. Pro+; costs 2 credits.
   */
  prices(id: number, params: { printing?: string; include?: 'ebay' | 'ebay_sales' } = {}): Promise<Response<Price[]>> {
    return this.client.request<Price[]>('GET', `/cards/${id}/prices`, params);
  }

  /**
   * GET /cards/{id}/prices/conditions — per-condition price floors (Pro+).
   * One row per (printing, condition) pair from live TCGPlayer listings.
   * Rows older than 24h trigger a live refresh within a daily per-account
   * quota; over quota, stale rows are served with `meta.stale: true`.
   */
  conditions(id: number, params: { printing?: string } = {}): Promise<Response<ConditionPrice[], ConditionMeta>> {
    return this.client.request<ConditionPrice[]>('GET', `/cards/${id}/prices/conditions`, params) as Promise<Response<ConditionPrice[], ConditionMeta>>;
  }

  /** GET /cards/tcgplayer/{tcgplayerId} — lookup with all printings nested */
  byTcgplayerId(tcgplayerId: number): Promise<Response<BulkCard>> {
    return this.client.request<BulkCard>('GET', `/cards/tcgplayer/${tcgplayerId}`);
  }

  /** GET /cards/{id}/history — tier-windowed price history */
  history(id: number, params: PriceHistoryParams = {}): Promise<Response<PriceHistoryPoint[]>> {
    return this.client.request<PriceHistoryPoint[]>('GET', `/cards/${id}/history`, params);
  }

  /** GET /cards/{id}/history/detailed — full price history (Pro+) */
  historyDetailed(id: number, params: { printing?: string } = {}): Promise<Response<PriceHistoryPoint[]>> {
    return this.client.request<PriceHistoryPoint[]>('GET', `/cards/${id}/history/detailed`, params);
  }
}
