import { APIRequest, APIResponse } from '@formio/contracts/server';

export const PINO_SERIALIZERS = {
  parameters(parameters: unknown[]): unknown[] {
    return parameters.map((item) => {
      if (typeof item === 'object') {
        if (
          typeof (item as Record<string, unknown>)._parsedUrl !== 'undefined'
        ) {
          return 'APIRequest';
        }
        return item;
      }
      return item;
    });
  },
  req(request: APIRequest): unknown {
    return {
      id: request.id,
      method: request.method,
      url: request.url,
    };
  },
  res(response: APIResponse): unknown {
    return {
      statusCode: response.statusCode,
    };
  },
};
