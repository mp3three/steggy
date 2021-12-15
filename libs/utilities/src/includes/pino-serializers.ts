// import { APIRequest, APIResponse } from '@for-science/server';

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
  req(request: Record<string, unknown>): unknown {
    return {
      id: request.id,
      method: request.method,
      url: request.url,
    };
  },
  res(response: Record<string, unknown>): unknown {
    return {
      statusCode: response.statusCode,
    };
  },
};
