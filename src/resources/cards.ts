import type { TCGApi } from '../client';
import type { BulkCard, Card, ConditionMeta, ConditionPrice, Price, PriceHistoryPoint, Response } from '../types';

export interface PriceHistoryParams {
  range?: 'month' | 'quarter' | 'year' | 'all';
  printing?: string;
}

export class CardsResource {
  constructor(private readonly client: TCGApi) {}

  /** GET /cards/{id} */
  get(id: number): Promise<Response<Card>> {
    return this.client.request<Card>('GET', `/cards/${id}`);
  }

  /** GET /cards/{id}/prices — one row per printing */
  prices(id: number, params: { printing?: string } = {}): Promise<Response<Price[]>> {
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
