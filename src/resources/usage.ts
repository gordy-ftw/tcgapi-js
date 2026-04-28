import type { TCGApi } from '../client';
import type { Response, UsageResponse } from '../types';

export class UsageResource {
  constructor(private readonly client: TCGApi) {}

  /** GET /usage — usage stats for the authenticated session */
  get(): Promise<Response<UsageResponse>> {
    return this.client.request<UsageResponse>('GET', '/usage');
  }
}
