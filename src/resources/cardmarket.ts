import type { TCGApi } from '../client';
import type { CardmarketCoverage, Response } from '../types';

export class CardmarketResource {
  constructor(private readonly client: TCGApi) {}

  /** GET /cardmarket/coverage — cards, printings and priced printings with a Cardmarket price, per game (recomputed daily). */
  coverage(): Promise<Response<CardmarketCoverage>> {
    return this.client.request<CardmarketCoverage>('GET', '/cardmarket/coverage');
  }
}
