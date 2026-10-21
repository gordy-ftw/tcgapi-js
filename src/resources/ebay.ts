import type { TCGApi } from '../client';
import type { EbayCoverage, EbayGameCoverage, Response } from '../types';

export class EbayResource {
  constructor(private readonly client: TCGApi) {}

  /**
   * GET /ebay/coverage — how many cards have eBay sold prices, per game and how often they refresh.
   * With `game` (a slug): that game plus per-set coverage. Public: no key needed, not counted
   * against quota. Throws NotFoundError when the game has no eBay data.
   */
  coverage(): Promise<Response<EbayCoverage>>;
  coverage(params: { game: string }): Promise<Response<EbayGameCoverage>>;
  coverage(params: { game?: string } = {}): Promise<Response<EbayCoverage | EbayGameCoverage>> {
    return this.client.request<EbayCoverage | EbayGameCoverage>('GET', '/ebay/coverage', params);
  }
}
