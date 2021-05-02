import { Trace } from '@automagical/utilities';
import dayjs from 'dayjs';
import { PinoLogger } from 'nestjs-pino';
import { BodyInit, RequestInit, Response } from 'node-fetch';
import { FetchWith, Filters, TemporaryAuthToken } from '../typings';

export class BaseFetch {
  // #region Object Properties

  public TRUNCATE_LENGTH = 200;

  protected readonly logger: PinoLogger;

  // #endregion Object Properties

  // #region Protected Methods

  /**
   * Post processing function for fetch()
   */
  @Trace()
  protected async fetchHandleResponse<T extends unknown = unknown>(
    arguments_: FetchWith,
    response: Response,
  ): Promise<T> {
    if (arguments_.process === false) {
      return response as T;
    }
    const text = await response.text();
    if (!['{', '['].includes(text.charAt(0))) {
      // Personally, I think all responses should always be JSON. Fight me 🤜
      // This type of "is the string really an error?" is aggravating, not convenient

      if (!['OK'].includes(text)) {
        // It's probably a coding error error, and not something a user did.
        // Will try to keep the array up to date if any other edge cases pop up

        // This part specifically applies to the formio-sdk, so there may be some additional work needed for this function as other libs
        this.logger.warn({ text }, `Unexpected API Response`);
      } else {
        this.logger.debug({ text }, 'Full response text');
      }
      return text as T;
    }
    const parsed = JSON.parse(text);
    this.logger.debug({ parsed }, 'Parsed response');
    return parsed;
  }

  /**
   * Resolve Filters and query params object into a query string.
   *
   * In case of collision, provided params take priority.
   */
  protected buildFilterString(
    arguments_: FetchWith<{
      filters?: Readonly<Filters[]>;
      params?: Record<string, string>;
    }>,
  ): string {
    const out = new Map<string, string>();
    (arguments_.filters || []).forEach((f) => {
      const filter = new Map(Object.entries(f));
      Object.keys(filter).forEach((type: keyof Filters) => {
        let value: string | RegExp | dayjs.Dayjs;
        switch (type) {
          case 'select':
          case 'sort':
          case 'in':
          case 'nin':
            if (filter.has(type)) {
              value = (filter.get(type) as unknown[]).join(',');
              break;
            }
        }
        if (
          typeof filter.get(type) !== 'string' &&
          (filter.get(type) as dayjs.Dayjs).toISOString
        ) {
          value = (filter.get(type) as dayjs.Dayjs).toISOString();
        }
        value = filter.get(type).toString();
        switch (type) {
          case 'select':
          case 'skip':
          case 'limit':
          case 'sort':
            out.set(type, value);
            return;
          case 'field':
            return;
          case 'equals':
            out.set(f.field, value);
            return;
          default:
            out.set(`${f.field}__${type}`, value);
        }
      });
    });
    return new URLSearchParams({
      ...Object.fromEntries(out),
      ...(arguments_.params || {}),
    }).toString();
  }

  /**
   * Pre-request logic for fetch()
   *
   * Should return: headers, body, method
   */
  protected async fetchCreateMeta(arguments_: FetchWith): Promise<RequestInit> {
    const body =
      typeof arguments_.body === 'object' || typeof arguments_.data === 'object'
        ? JSON.stringify({
            data: arguments_.data ? { ...arguments_.data } : undefined,
            ...(arguments_.data
              ? {}
              : (arguments_.body as Record<string, unknown>)),
          })
        : arguments_.body;
    const headers = {
      ...(arguments_.headers || {}),
    } as Record<string, string>;
    let method = arguments_.method || 'GET';
    if (body) {
      // Override
      method = arguments_.method === 'GET' ? 'POST' : arguments_.method;
      // Header is needed
      headers['Content-Type'] = 'application/json';
    }

    if (arguments_.token) {
      headers['x-jwt-token'] = arguments_.token;
    }
    if (arguments_.apiKey) {
      headers['x-token'] = arguments_.apiKey;
    }
    return {
      headers,
      body: body as BodyInit,
      method,
    };
  }

  /**
   * Resolve url provided in args into a full path w/ domain
   */
  protected fetchCreateUrl(arguments_: FetchWith): string {
    let url = arguments_.rawUrl
      ? arguments_.url
      : `${arguments_.baseUrl}${arguments_.url}`;
    if (arguments_.tempAuthToken) {
      arguments_.params = arguments_.params || {};
      arguments_.params.token = (arguments_.tempAuthToken as TemporaryAuthToken).key;
    }
    if (arguments_.filters || arguments_.params) {
      url = `${url}?${this.buildFilterString(arguments_)}`;
    }
    return url;
  }

  // #endregion Protected Methods
}
