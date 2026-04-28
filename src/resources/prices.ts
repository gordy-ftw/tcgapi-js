import type { TCGApi } from '../client';
import type { PriceMover, Response } from '../types';

export interface TopMoversParams {
  game?: string;
  direction?: 'up' | 'down';
  period?: '24h' | '7d' | '30d';
  printing?: string;
  type?: 'Cards' | 'Sealed Products';
  limit?: number;
}

export class PricesResource {
  constructor(private readonly client: TCGApi) {}

  /** GET /prices/top-movers */
  topMovers(params: TopMoversParams = {}): Promise<Response<PriceMover[]>> {
    return this.client.request<PriceMover[]>('GET', '/prices/top-movers', params);
  }
}
