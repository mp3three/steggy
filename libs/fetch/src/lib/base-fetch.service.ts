import {
  FetchArguments,
  HTTP_METHODS,
  ResultControlDTO,
  TemporaryAuthToken,
} from '@automagical/contracts/fetch';
import { controlToQuery, Trace } from '@automagical/utilities';
import { PinoLogger } from 'nestjs-pino';
import { BodyInit, RequestInit, Response } from 'node-fetch';

type FetchWith<T extends Record<never, string> = Record<never, string>> =
  Partial<FetchArguments> & T;
export class BaseFetch {
  // #region Object Properties

  public BASE_URL: string;
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
      if (!['OK'].includes(text)) {
        // It's probably a coding error error, and not something a user did.
        // Will try to keep the array up to date if any other edge cases pop up

        // This part specifically applies to the formio-sdk, so there may be some work needed for this function as other libs
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
    arguments_: FetchWith<{
      filters?: Readonly<ResultControlDTO>;
      params?: Record<string, string>;
    }>,
  ): string {
    return new URLSearchParams({
      ...controlToQuery(arguments_.control),
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
      method =
        arguments_.method === HTTP_METHODS.get
          ? HTTP_METHODS.post
          : arguments_.method;
      // Required header
      headers['Content-Type'] = 'application/json';
    }

    if (arguments_.jwtToken) {
      headers['x-jwt-token'] = arguments_.jwtToken;
    }
    if (arguments_.apiKey) {
      headers['x-token'] = arguments_.apiKey;
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
  protected fetchCreateUrl(arguments_: FetchWith): string {
    let url = arguments_.rawUrl
      ? arguments_.url
      : `${arguments_.baseUrl ?? this.BASE_URL}${arguments_.url}`;
    if (arguments_.tempAuthToken) {
      arguments_.params ??= {};
      arguments_.params.token = (
        arguments_.tempAuthToken as TemporaryAuthToken
      ).key;
    }
    if (arguments_.control || arguments_.params) {
      url = `${url}?${this.buildFilterString(arguments_)}`;
    }
    return url;
  }

  // #endregion Protected Methods
}
