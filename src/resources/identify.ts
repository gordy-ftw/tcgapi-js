import type { TCGApi } from '../client';
import type { IdentifyMeta, IdentifyResult, Response, ScanUsage } from '../types';

/** A photo: a Blob/File, raw bytes (Uint8Array, Buffer, ArrayBuffer), or a base64 string or data URL. JPEG, PNG or WebP, up to 8 MB. */
export type IdentifyImage = Blob | ArrayBuffer | Uint8Array | string;

export interface IdentifyOptions {
  /** A game slug from games.list(); searches only that game. */
  game?: string;
  /** Add the top candidate's current prices (no extra charge). */
  includePrices?: boolean;
  /** Add the top candidate's prices with each printing's eBay sold prices (implies includePrices; no extra charge). */
  includeEbay?: boolean;
}

// A read can take up to ~45s (one retry on a busy model host).
const IDENTIFY_TIMEOUT = 60_000;

export class IdentifyResource {
  constructor(private readonly client: TCGApi) {}

  /**
   * POST /identify — identify a card or sealed product from one photo.
   * Uses one scan from the account's balance (25 free, then prepaid packs), apart
   * from the daily request quota. A 402 with code SCAN_BALANCE_EMPTY means no scans left.
   */
  photo(image: IdentifyImage, options: IdentifyOptions = {}): Promise<Response<IdentifyResult, IdentifyMeta>> {
    const form = new FormData();
    if (typeof image === 'string') {
      const b64 = image.replace(/^data:[^,]*,/, '');
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      form.append('image', new Blob([bytes]), 'photo');
    } else if (image instanceof Blob) {
      form.append('image', image, 'photo');
    } else {
      form.append('image', new Blob([image as BlobPart]), 'photo');
    }
    const query = { game: options.game, include: options.includeEbay ? 'ebay' : options.includePrices ? 'prices' : undefined };
    return this.client.request<IdentifyResult>('POST', '/identify', query, { body: form, timeoutMs: IDENTIFY_TIMEOUT }) as unknown as Promise<
      Response<IdentifyResult, IdentifyMeta>
    >;
  }

  /**
   * GET /identify/usage — scan balance, scans per day for the last 30 days by outcome,
   * and the trial/purchase ledger. Free: uses no scan and no daily quota.
   */
  usage(): Promise<Response<ScanUsage>> {
    return this.client.request<ScanUsage>('GET', '/identify/usage');
  }
}
