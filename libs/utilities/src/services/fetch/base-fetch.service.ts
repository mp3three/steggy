import {
  FetchArguments,
  ResultControlDTO,
} from '@automagical/contracts/utilities';
import { BodyInit, RequestInit, Response } from 'node-fetch';

import { Trace } from '../../decorators/logger.decorator';
import { controlToQuery } from '../../includes';
import { AutoLogService } from '../logger/auto-log.service';

type FetchWith<T extends Record<never, string> = Record<never, string>> =
  Partial<FetchArguments> & T;
export class BaseFetch {
  // #region Object Properties

  public BASE_URL: string;
  public TRUNCATE_LENGTH = 200;

  protected readonly logger: AutoLogService;

  // #endregion Object Properties

  // #region Protected Methods

  /**
   * Post processing function for fetch()
   */
  @Trace()
  protected async fetchHandleResponse<T extends unknown = unknown>(
    { process }: FetchWith,
    response: Response,
  ): Promise<T> {
    if (process === false) {
      return response as T;
    }
    const text = await response.text();
    if (process === 'text') {
      return text as unknown as T;
    }
    if (!['{', '['].includes(text.charAt(0))) {
      if (!['OK'].includes(text)) {
        // It's probably a coding error error, and not something a user did.
        // Will try to keep the array up to date if any other edge cases pop up
        this.logger.warn({ text }, `Unexpected API Response`);
      } else {
        this.logger.debug({ text }, 'Full response text');
      }
      return text as T;
    }
    const parsed = JSON.parse(text);
    return parsed;
  }

  /**
   * Resolve Filters and query params object into a query string.
   *
   * In case of collision, provided params take priority.
   */
  protected buildFilterString(
    fetchWith: FetchWith<{
      filters?: Readonly<ResultControlDTO>;
      params?: Record<string, string>;
    }>,
  ): string {
    return new URLSearchParams({
      ...controlToQuery(fetchWith.control ?? {}),
      ...(fetchWith.params || {}),
    }).toString();
  }

  /**
   * Pre-request logic for fetch()
   *
   * Should return: headers, body, method
   */
  protected async fetchCreateMeta({
    body,
    jwtToken,
    apiKey,
    adminKey,
    bearer,
    ...fetchWitch
  }: FetchWith): Promise<RequestInit> {
    const headers = {
      ...(fetchWitch.headers || {}),
    } as Record<string, string>;
    let method = fetchWitch.method ?? 'get';
    if (body) {
      // Override
      method = fetchWitch.method === 'get' ? 'post' : fetchWitch.method;
      headers['Content-Type'] = 'application/json';
    }

    if (jwtToken) {
      headers['x-jwt-token'] = jwtToken;
    }
    if (apiKey) {
      headers['x-token'] = apiKey;
    }
    if (adminKey) {
      headers['x-admin-key'] = adminKey;
    }
    if (bearer) {
      headers['Authorization'] = `Bearer ${bearer}`;
    }
    return {
      body: body as BodyInit,
      headers,
      method,
    };
  }

  /**
   * Resolve url provided in args into a full path w/ domain
   */
  protected fetchCreateUrl({
    rawUrl,
    url,
    tempAuthToken,
    ...fetchWith
  }: FetchWith): string {
    let out = rawUrl ? url : `${fetchWith.baseUrl ?? this.BASE_URL}${url}`;
    if (tempAuthToken) {
      fetchWith.params ??= {};
    }
    if (fetchWith.control || fetchWith.params) {
      out = `${out}?${this.buildFilterString(fetchWith)}`;
    }
    return out;
  }

  // #endregion Protected Methods
}
