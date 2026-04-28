import type { TCGApi } from '../client';
import type { CardWithPrice, Response } from '../types';

export interface SearchParams {
  q: string;
  game?: string;
  set_id?: number;
  rarity?: string;
  type?: 'Cards' | 'Sealed Products';
  printing?: string;
  min_price?: number;
  max_price?: number;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'name';
  page?: number;
  per_page?: number;
}

export class SearchResource {
  constructor(private readonly client: TCGApi) {}

  /** GET /search — fuzzy card search */
  cards(params: SearchParams): Promise<Response<CardWithPrice[]>> {
    return this.client.request<CardWithPrice[]>('GET', '/search', params);
  }

  /**
   * Async iterator over search results. Walks `meta.has_more` until exhausted.
   * Caps `per_page` at the API max (200).
   */
  async *iterate(params: SearchParams): AsyncIterableIterator<CardWithPrice> {
    const perPage = Math.min(200, params.per_page ?? 200);
    let page = params.page ?? 1;
    while (true) {
      const resp = await this.cards({ ...params, page, per_page: perPage });
      for (const card of resp.data) yield card;
      if (!resp.meta?.has_more) return;
      page++;
    }
  }
}
