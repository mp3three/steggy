import dayjs from 'dayjs';
import { PinoLogger } from 'nestjs-pino';
import { BodyInit, RequestInit, Response } from 'node-fetch';
import { FetchWith, Filters, TempAuthToken } from '../typings';

export class BaseFetch {
  // #region Object Properties

  public TRUNCATE_LENGTH = 200;

  protected readonly logger: PinoLogger;

  // #endregion Object Properties

  // #region Protected Methods

  /**
   * Resolve Filters and query params object into a query string.
   *
   * In case of collision, provided params take priority.
   */
  protected buildFilterString(
    args: FetchWith<{
      filters?: Readonly<Filters[]>;
      params?: Record<string, string>;
    }>,
  ): string {
    const out = new Map<string, string>();
    (args.filters || []).forEach((f) => {
      const filter = new Map(Object.entries(f));
      Object.keys(filter).forEach((type: keyof Filters) => {
        let value: string | RegExp | dayjs.Dayjs = null;
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
      ...(args.params || {}),
    }).toString();
  }

  /**
   * Pre-request logic for fetch()
   *
   * Should return: headers, body, method
   */
  protected async fetchCreateMeta(args: FetchWith): Promise<RequestInit> {
    const body =
      typeof args.body === 'object' || typeof args.data === 'object'
        ? JSON.stringify({
            data: args.data ? { ...args.data } : undefined,
            ...(args.data ? {} : (args.body as Record<string, unknown>)),
          })
        : args.body;
    const headers = {
      ...(args.headers || {}),
    } as Record<string, string>;
    let method = args.method || 'GET';
    if (body) {
      // Override
      method = args.method === 'GET' ? 'POST' : args.method;
      // Header is needed
      headers['Content-Type'] = 'application/json';
    }

    if (args.token) {
      headers['x-jwt-token'] = args.token;
    }
    if (args.apiKey) {
      headers['x-token'] = args.apiKey;
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
  protected fetchCreateUrl(args: FetchWith): string {
    let url = args.rawUrl ? args.url : `${args.baseUrl}${args.url}`;
    if (args.tempAuthToken) {
      args.params = args.params || {};
      args.params.token = (args.tempAuthToken as TempAuthToken).key;
    }
    if (args.filters || args.params) {
      url = `${url}?${this.buildFilterString(args)}`;
    }
    return url;
  }

  /**
   * Post processing function for fetch()
   */
  protected async fetchHandleResponse<T extends unknown = unknown>(
    args: FetchWith,
    res: Response,
  ): Promise<T> {
    if (args.process === false) {
      return res as T;
    }
    const text = await res.text();
    if (this.TRUNCATE_LENGTH > 0 && text.length > this.TRUNCATE_LENGTH) {
      this.logger.debug(
        `${text.substr(0, this.TRUNCATE_LENGTH)}... ${
          text.length - this.TRUNCATE_LENGTH
        } more`,
      );
    } else {
      this.logger.debug({ text }, 'Full response text');
    }
    if (!['{', '['].includes(text.charAt(0))) {
      // Personally, I think all responses should always be JSON. Fight me 🤜
      // This type of "is the string really an error?" is aggravating, not convenient

      if (!['OK'].includes(text)) {
        // It's probably a coding error error, and not something a user did.
        // Will try to keep the array up to date if any other edge cases pop up
        this.logger.warn(`Invalid API Response`, text);
      }
      return text as T;
    }
    return JSON.parse(text);
  }

  // #endregion Protected Methods
}
