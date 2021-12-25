import {
  FetchArguments,
  FetchService,
  InjectConfig,
} from '@text-based/utilities';

import { API_KEY, API_SECRET, LIVE_TRADING } from '../config';

export class AlpacaFetchService {
  constructor(
    private readonly fetchService: FetchService,
    @InjectConfig(API_KEY) private readonly apiKey: string,
    @InjectConfig(API_SECRET) private readonly apiSecret: string,
    @InjectConfig(LIVE_TRADING) private readonly liveTrading: string,
  ) {}

  public async fetch<T>(fetchWith: Partial<FetchArguments>): Promise<T> {
    return this.fetchService.fetch({
      url: ``,
      ...fetchWith,
    });
  }
}

// private async request<T = any>(params: {
//   method: 'GET' | 'DELETE' | 'PUT' | 'PATCH' | 'POST'
//   url: string
//   data?: { [key: string]: any }
//   isJSON?: boolean
// }): Promise<T> {
//   let headers: any = {}

//   if ('access_token' in this.params.credentials) {
//     headers[
//       'Authorization'
//     ] = `Bearer ${this.params.credentials.access_token}`
//   } else {
//     headers['APCA-API-KEY-ID'] = this.params.credentials.key
//     headers['APCA-API-SECRET-KEY'] = this.params.credentials.secret
//   }

//   if (this.params.credentials.paper) {
//     params.url = params.url.replace('api.', 'paper-api.')
//   }

//   let query = ''

//   if (params.data) {
//     // translate dates to ISO strings
//     for (let [key, value] of Object.entries(params.data)) {
//       if (value instanceof Date) {
//         params.data[key] = (value as Date).toISOString()
//       }
//     }

//     // build query
//     if (!['POST', 'PATCH', 'PUT'].includes(params.method)) {
//       query = '?'.concat(qs.stringify(params.data))
//       params.data = undefined
//     }
//   }

//   const makeCall = () =>
//       unifetch(params.url.concat(query), {
//         method: params.method,
//         headers,
//         body: JSON.stringify(params.data),
//       }),
//     func = this.params.rate_limit
//       ? () => this.limiter.schedule(makeCall)
//       : makeCall

//   let resp,
//     result = {}

//   try {
//     resp = await func()

//     if (!(params.isJSON == undefined ? true : params.isJSON)) {
//       return resp.ok as any
//     }

//     result = await resp.json()
//   } catch (e) {
//     console.error(e)
//     throw result
//   }

//   if ('code' in result || 'message' in result) {
//     throw result
//   }

//   return result as any
// }
