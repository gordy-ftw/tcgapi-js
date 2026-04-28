import type { TCGApi } from '../client';
import type { Game, Response, Set as TcgSet } from '../types';

export class GamesResource {
  constructor(private readonly client: TCGApi) {}

  /** GET /games — list every supported TCG */
  list(params: { page?: number; per_page?: number } = {}): Promise<Response<Game[]>> {
    return this.client.request<Game[]>('GET', '/games', params);
  }

  /** GET /games/{slug} — game detail by slug or TCGPlayer category ID */
  get(slug: string | number): Promise<Response<Game>> {
    return this.client.request<Game>('GET', `/games/${encodeURIComponent(String(slug))}`);
  }

  /** GET /games/{slug}/sets — sets/expansions for a game */
  sets(slug: string | number, params: { page?: number; per_page?: number } = {}): Promise<Response<TcgSet[]>> {
    return this.client.request<TcgSet[]>('GET', `/games/${encodeURIComponent(String(slug))}/sets`, params);
  }
}
