import { FetchWith, Filters, TempAuthToken } from '../typings/HTTP';
import { Logger } from '@automagical/logger';
import * as dayjs from 'dayjs';
import fetch, { RequestInit, BodyInit, Response } from 'node-fetch';

export class Fetch {
  // #region Static Properties

  private static readonly logger = Logger(Fetch);

  // #endregion Static Properties

  // #region Public Static Methods

  /**
   * > ⚠️⚠️ See README @ libs/formio-sdk/README.md ⚠️⚠️
   *
   * ## TL;DR
   *
   * Big wrapper around node-fetch, does a lot of magic to convert args into a format node-fetch can work with.
   * Hopefully with the side effect of making for more simpler reading end code, and keeping the complexity inside the lib.
   * The intent is to have a most layman understandable interface here.
   *
   * All requests from this code base are routed through this function so they can take advantage of the automatic url resolution.
   * The post-processing steps are optional, but will be expanded upon in the future.
   *
   * ### Feature Goals
   *
   * - Exporting all requests as curl request
   * - Exporting as postman compatible (convert a quick script into e2e tests?)
   */
  public static async fetch<T>(args: FetchWith): Promise<T> {
    const url: string = await this.fetchCreateUrl(args);
    const requestInit = await this.fetchCreateMeta(args);
    this.logger.info(`${requestInit.method} ${url}`);
    // This log will probably contain user credentials
    if (!url.includes('/login')) {
      this.logger.debug(requestInit);
    }
    try {
      const res = await fetch(url, requestInit);
      return this.fetchHandleResponse(args, res);
    } catch (err) {
      this.logger.error(err);
      return null;
    }
  }

  // #endregion Public Static Methods

  // #region Protected Static Methods

  /**
   * Resolve Filters and query params object into a query string.
   *
   * In case of collision, provided params take priority.
   */
  protected static buildFilterString(
    args: FetchWith<{
      filters?: Readonly<Filters[]>;
      params?: Record<string, string>;
    }>,
  ) {
    const out: Partial<Record<string, string>> = {};
    (args.filters || []).forEach((filter) => {
      Object.keys(filter).forEach((type: keyof Filters) => {
        let value: string | RegExp | dayjs.Dayjs = null;
        switch (type) {
          case 'select':
          case 'sort':
          case 'in':
          case 'nin':
            if (typeof (filter[type] as unknown[])?.join !== 'undefined') {
              value = (filter[type] as unknown[]).join(',');
              break;
            }
        }
        if (
          typeof filter[type] !== 'string' &&
          (filter[type] as dayjs.Dayjs).toISOString
        ) {
          value = (filter[type] as dayjs.Dayjs).toISOString();
        }
        value = filter[type].toString();
        switch (type) {
          case 'select':
          case 'skip':
          case 'limit':
          case 'sort':
            out[type] = value;
            return;
          case 'field':
            return;
          case 'equals':
            out[filter.field] = value;
            return;
          default:
            out[`${filter.field}__${type}`] = value;
        }
      });
    });
    return new URLSearchParams({ ...out, ...(args.params || {}) }).toString();
  }

  /**
   * Pre-request logic for fetch()
   *
   * Should return: headers, body, method
   */
  protected static async fetchCreateMeta(
    args: FetchWith,
  ): Promise<RequestInit> {
    const body =
      typeof args.body === 'object' || typeof args.data === 'object'
        ? JSON.stringify({
            data: args.data ? { ...args.data } : undefined,
            ...(args.data ? {} : (args.body as Record<string, unknown>)),
          })
        : args.body;
    const headers = {};
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
  protected static fetchCreateUrl(args: FetchWith) {
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
  protected static async fetchHandleResponse(args: FetchWith, res: Response) {
    if (args.process === false) {
      return res;
    }
    const text = await res.text();
    this.logger.debug(text);
    if (!['{', '['].includes(text.charAt(0))) {
      // Personally, I think all responses should always be JSON. Fight me 🤜
      // This type of "is the string really an error?" is aggravating, not convenient

      if (!['OK'].includes(text)) {
        // It's probably a coding error error, and not something a user did.
        // Will try to keep the array up to date if any other edge cases pop up
        this.logger.alert(`Invalid API Response`, text);
      }
      return text;
    }
    return JSON.parse(text);
  }

  // #endregion Protected Static Methods
}
