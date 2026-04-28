export interface ApiErrorBody {
  error?: {
    message?: string;
    code?: string;
  };
}

export class TcgApiError extends Error {
  status: number;
  code: string;
  body: ApiErrorBody | undefined;

  constructor(message: string, status: number, code = `HTTP_${status}`, body?: ApiErrorBody) {
    super(message);
    this.name = 'TcgApiError';
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

export class AuthError extends TcgApiError {
  constructor(message = 'Invalid or missing API key', body?: ApiErrorBody) {
    super(message, 401, 'UNAUTHORIZED', body);
    this.name = 'AuthError';
  }
}

export class RateLimitError extends TcgApiError {
  retryAfter: number | undefined;

  constructor(message = 'Daily request limit reached', retryAfter?: number, body?: ApiErrorBody) {
    super(message, 429, 'RATE_LIMITED', body);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class TierError extends TcgApiError {
  constructor(message = 'Tier upgrade required for this endpoint', body?: ApiErrorBody) {
    super(message, 403, 'TIER_REQUIRED', body);
    this.name = 'TierError';
  }
}

export class NotFoundError extends TcgApiError {
  constructor(message = 'Resource not found', body?: ApiErrorBody) {
    super(message, 404, 'NOT_FOUND', body);
    this.name = 'NotFoundError';
  }
}
