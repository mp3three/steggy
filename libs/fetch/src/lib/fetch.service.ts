import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import fetch, { BodyInit, RequestInit, Response } from 'node-fetch';
import { FetchWith, Filters, TempAuthToken } from '../typings/HTTP';

@Injectable()
export class FetchService {
  // #region Object Properties

  public TRUNCATE_LENGTH = 200;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectPinoLogger(FetchService.name) protected readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Public Methods

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
  public async fetch<T>(args: FetchWith): Promise<T> {
    const url: string = await this.fetchCreateUrl(args);
    const requestInit = await this.fetchCreateMeta(args);
    // this.logger.info(`${requestInit.method} ${url}`);
    // This log will probably contain user credentials
    if (!url.includes('/login')) {
      // this.logger.debug(requestInit);
    }
    try {
      const res = await fetch(url, requestInit);
      return this.fetchHandleResponse(args, res);
    } catch (err) {
      // this.logger.error(err);
      return null;
    }
  }

  // #endregion Public Methods

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
      this.logger.debug(text);
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
