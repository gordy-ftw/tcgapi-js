import type { TCGApi } from '../client';
import type { BulkPriceRow, CardWithPrice, Response, Set as TcgSet } from '../types';

export interface ListSetsParams {
  game?: string;
  page?: number;
  per_page?: number;
}

export interface ListSetCardsParams {
  type?: 'Cards' | 'Sealed Products';
  sort?: 'number' | 'price_asc' | 'price_desc' | 'name';
  page?: number;
  per_page?: number;
}

export class SetsResource {
  constructor(private readonly client: TCGApi) {}

  /** GET /sets — all sets across all games (filter by `game` slug) */
  list(params: ListSetsParams = {}): Promise<Response<TcgSet[]>> {
    return this.client.request<TcgSet[]>('GET', '/sets', params);
  }

  /** GET /sets/{id} */
  get(id: number): Promise<Response<TcgSet>> {
    return this.client.request<TcgSet>('GET', `/sets/${id}`);
  }

  /** GET /sets/{id}/cards — cards in a set with primary printing prices */
  cards(id: number, params: ListSetCardsParams = {}): Promise<Response<CardWithPrice[]>> {
    return this.client.request<CardWithPrice[]>('GET', `/sets/${id}/cards`, params);
  }

  /** GET /sets/{id}/prices — every printing for every card. Starter+ */
  prices(id: number): Promise<Response<BulkPriceRow[]>> {
    return this.client.request<BulkPriceRow[]>('GET', `/sets/${id}/prices`);
  }

  /**
   * Async iterator over all cards in a set, paging at `pageSize` (max 200).
   * Useful for processing big sets without loading everything in memory.
   */
  async *iterateCards(id: number, params: ListSetCardsParams = {}): AsyncIterableIterator<CardWithPrice> {
    const perPage = Math.min(200, params.per_page ?? 200);
    let page = params.page ?? 1;
    while (true) {
      const resp = await this.cards(id, { ...params, page, per_page: perPage });
      for (const card of resp.data) yield card;
      if (!resp.meta?.has_more) return;
      page++;
    }
  }
}
