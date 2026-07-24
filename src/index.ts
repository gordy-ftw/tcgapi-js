export { TCGApi, type TCGApiOptions } from './client';
export {
  TcgApiError,
  AuthError,
  RateLimitError,
  TierError,
  NotFoundError,
  type ApiErrorBody,
} from './errors';
export type {
  Game,
  Set,
  Card,
  Price,
  CardWithPrice,
  PriceMover,
  BulkPriceRow,
  BulkCard,
  ConditionPrice,
  BulkConditionRow,
  ConditionMeta,
  PriceHistoryPoint,
  Meta,
  RateLimit,
  ApiKeySummary,
  ApiKeyCreated,
  UsageResponse,
  Response,
} from './types';
export type { ListSetsParams, ListSetCardsParams } from './resources/sets';
export type { SearchParams } from './resources/search';
export type { TopMoversParams } from './resources/prices';
export type { PriceHistoryParams } from './resources/cards';
