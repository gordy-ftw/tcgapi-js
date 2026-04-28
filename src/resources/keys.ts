import type { TCGApi } from '../client';
import type { ApiKeyCreated, ApiKeySummary, Response } from '../types';

export class KeysResource {
  constructor(private readonly client: TCGApi) {}

  /** GET /keys — list keys for the authenticated session (cookie-based) */
  list(): Promise<Response<ApiKeySummary[]>> {
    return this.client.request<ApiKeySummary[]>('GET', '/keys');
  }

  /** POST /keys — create a key. The full secret is in `data.key` and is shown only once. */
  create(_name?: string): Promise<Response<ApiKeyCreated>> {
    // POST body not yet wired through the request helper (key-management is session-cookie based,
    // not the typical SDK path). Most users get keys from the dashboard at https://tcgapi.dev/dashboard.
    throw new Error('Key creation requires a logged-in session. Use https://tcgapi.dev/dashboard.');
  }

  /** DELETE /keys/{id} — deactivate a key */
  delete(_id: string): Promise<Response<{ message: string }>> {
    throw new Error('Key deletion requires a logged-in session. Use https://tcgapi.dev/dashboard.');
  }
}
