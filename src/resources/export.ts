import type { TCGApi } from '../client';
import type { BulkPriceRow, Response } from '../types';

export class ExportResource {
  constructor(private readonly client: TCGApi) {}

  /** GET /export/set/{id}?format=json — full set dump */
  setJson(id: number): Promise<Response<BulkPriceRow[]>> {
    return this.client.request<BulkPriceRow[]>('GET', `/export/set/${id}`, { format: 'json' });
  }

  /** GET /export/set/{id}?format=csv — same dump as a CSV string */
  setCsv(id: number): Promise<string> {
    return this.client.requestRaw('GET', `/export/set/${id}`, { format: 'csv' });
  }
}
