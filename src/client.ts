import { AuthError, NotFoundError, RateLimitError, TcgApiError, TierError, type ApiErrorBody } from './errors';
import type { Response as TcgResponse } from './types';
import { GamesResource } from './resources/games';
import { SetsResource } from './resources/sets';
import { CardsResource } from './resources/cards';
import { SearchResource } from './resources/search';
import { PricesResource } from './resources/prices';
import { BulkResource } from './resources/bulk';
import { ExportResource } from './resources/export';
import { KeysResource } from './resources/keys';
import { UsageResource } from './resources/usage';

export interface TCGApiOptions {
  /** API key from https://tcgapi.dev/dashboard. Format: tcg_live_... */
  apiKey?: string;
  /** Override base URL (defaults to https://api.tcgapi.dev/v1) */
  baseUrl?: string;
  /** Custom fetch implementation. Defaults to the runtime's global fetch. */
  fetch?: typeof fetch;
  /** Per-request timeout in ms. Defaults to 30s. */
  timeoutMs?: number;
  /** Optional User-Agent override. */
  userAgent?: string;
}

const DEFAULT_BASE_URL = 'https://api.tcgapi.dev/v1';
const DEFAULT_TIMEOUT = 30_000;

export class TCGApi {
  readonly baseUrl: string;
  private readonly apiKey: string | undefined;
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;
  private readonly userAgent: string | undefined;

  readonly games: GamesResource;
  readonly sets: SetsResource;
  readonly cards: CardsResource;
  readonly search: SearchResource;
  readonly prices: PricesResource;
  readonly bulk: BulkResource;
  readonly export: ExportResource;
  readonly keys: KeysResource;
  readonly usage: UsageResource;

  constructor(options: TCGApiOptions = {}) {
    this.apiKey = options.apiKey ?? (typeof process !== 'undefined' ? process.env?.TCGAPI_KEY : undefined);
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    const f = options.fetch ?? (typeof fetch !== 'undefined' ? fetch.bind(globalThis) : undefined);
    if (!f) throw new Error('No fetch implementation available. Pass `fetch` in options or use Node 18+.');
    this.fetchImpl = f;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT;
    this.userAgent = options.userAgent;

    this.games = new GamesResource(this);
    this.sets = new SetsResource(this);
    this.cards = new CardsResource(this);
    this.search = new SearchResource(this);
    this.prices = new PricesResource(this);
    this.bulk = new BulkResource(this);
    this.export = new ExportResource(this);
    this.keys = new KeysResource(this);
    this.usage = new UsageResource(this);
  }

  /** @internal */
  async request<T>(method: string, path: string, query?: Record<string, unknown> | object): Promise<TcgResponse<T>> {
    const url = new URL(this.baseUrl + path);
    if (query) {
      for (const [k, v] of Object.entries(query as Record<string, unknown>)) {
        if (v === undefined || v === null) continue;
        url.searchParams.set(k, String(v));
      }
    }

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (this.apiKey) headers['X-API-Key'] = this.apiKey;
    if (this.userAgent) headers['User-Agent'] = this.userAgent;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let resp: globalThis.Response;
    try {
      resp = await this.fetchImpl(url.toString(), { method, headers, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }

    const text = await resp.text();
    let body: unknown;
    try {
      body = text ? JSON.parse(text) : undefined;
    } catch {
      body = undefined;
    }

    if (!resp.ok) {
      const errBody = (body ?? undefined) as ApiErrorBody | undefined;
      // Standard tcgapi: error = {message, code}. x402 402: error = "string message".
      const errField = (errBody as { error?: unknown } | undefined)?.error;
      let message: string;
      let code: string | undefined;
      if (errField && typeof errField === 'object') {
        message = (errField as { message?: string }).message ?? `Request failed with status ${resp.status}`;
        code = (errField as { code?: string }).code;
      } else if (typeof errField === 'string') {
        message = errField;
        code = undefined;
      } else {
        message = `Request failed with status ${resp.status}`;
        code = undefined;
      }
      throw makeError(resp.status, message, code, errBody, resp.headers.get('Retry-After'));
    }

    const parsed = (body ?? {}) as { data: T; meta?: TcgResponse<T>['meta']; rate_limit?: TcgResponse<T>['rateLimit'] };
    return {
      data: parsed.data,
      meta: parsed.meta,
      rateLimit: parsed.rate_limit,
    };
  }

  /** @internal — for the export endpoint that returns CSV */
  async requestRaw(method: string, path: string, query?: Record<string, unknown> | object): Promise<string> {
    const url = new URL(this.baseUrl + path);
    if (query) {
      for (const [k, v] of Object.entries(query as Record<string, unknown>)) {
        if (v === undefined || v === null) continue;
        url.searchParams.set(k, String(v));
      }
    }
    const headers: Record<string, string> = {};
    if (this.apiKey) headers['X-API-Key'] = this.apiKey;
    if (this.userAgent) headers['User-Agent'] = this.userAgent;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    let resp: globalThis.Response;
    try {
      resp = await this.fetchImpl(url.toString(), { method, headers, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
    const text = await resp.text();
    if (!resp.ok) {
      let body: ApiErrorBody | undefined;
      try { body = JSON.parse(text); } catch { /* not JSON */ }
      throw makeError(resp.status, body?.error?.message ?? `Request failed with status ${resp.status}`, body?.error?.code, body, resp.headers.get('Retry-After'));
    }
    return text;
  }
}

function makeError(status: number, message: string, code: string | undefined, body: ApiErrorBody | undefined, retryAfter: string | null): TcgApiError {
  if (status === 401) return new AuthError(message, body);
  if (status === 403) return new TierError(message, body);
  if (status === 404) return new NotFoundError(message, body);
  if (status === 429) {
    const ra = retryAfter ? parseInt(retryAfter, 10) : undefined;
    return new RateLimitError(message, Number.isFinite(ra) ? ra : undefined, body);
  }
  return new TcgApiError(message, status, code ?? `HTTP_${status}`, body);
}
