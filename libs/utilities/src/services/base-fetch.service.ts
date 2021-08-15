import {
  FetchArguments,
  HTTP_METHODS,
  ResultControlDTO,
} from '@automagical/contracts/utilities';
import { BodyInit, RequestInit, Response } from 'node-fetch';

import { Trace } from '../decorators/logger/trace.decorator';
import { controlToQuery } from '../includes';
import { AutoLogService } from './logger';

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
    fetchWith: FetchWith,
    response: Response,
  ): Promise<T> {
    if (fetchWith.process === false) {
      return response as T;
    }
    const text = await response.text();
    if (fetchWith.process === 'text') {
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
  protected async fetchCreateMeta(fetchWitch: FetchWith): Promise<RequestInit> {
    const body =
      typeof fetchWitch.body === 'object' || typeof fetchWitch.data === 'object'
        ? JSON.stringify({
            data: fetchWitch.data ? { ...fetchWitch.data } : undefined,
            ...(fetchWitch.data
              ? {}
              : (fetchWitch.body as Record<string, unknown>)),
          })
        : fetchWitch.body;
    const headers = {
      ...(fetchWitch.headers || {}),
    } as Record<string, string>;
    let method = fetchWitch.method || 'GET';
    if (body) {
      // Override
      method =
        fetchWitch.method === HTTP_METHODS.get
          ? HTTP_METHODS.post
          : fetchWitch.method;
      headers['Content-Type'] = 'application/json';
    }

    if (fetchWitch.jwtToken) {
      headers['x-jwt-token'] = fetchWitch.jwtToken;
    }
    if (fetchWitch.apiKey) {
      headers['x-token'] = fetchWitch.apiKey;
    }
    if (fetchWitch.adminKey) {
      headers['x-admin-key'] = fetchWitch.adminKey;
    }
    if (fetchWitch.bearer) {
      headers['Authorization'] = `Bearer ${fetchWitch.bearer}`;
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
  protected fetchCreateUrl(fetchWith: FetchWith): string {
    let url = fetchWith.rawUrl
      ? fetchWith.url
      : `${fetchWith.baseUrl ?? this.BASE_URL}${fetchWith.url}`;
    if (fetchWith.tempAuthToken) {
      fetchWith.params ??= {};
    }
    if (fetchWith.control || fetchWith.params) {
      url = `${url}?${this.buildFilterString(fetchWith)}`;
    }
    return url;
  }

  // #endregion Protected Methods
}
