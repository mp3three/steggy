import {
  AutoLogService,
  FetchArguments,
  FetchService,
  InjectConfig,
  is,
  MINUTE,
} from '@text-based/utilities';

import { API_KEY, API_SECRET, API_TARGET } from '../config';
import { ALPACA_API_KEY_HEADER, ALPACA_SECRET_KEY_HEADER } from '../contracts';

export class AlpacaFetchService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: FetchService,
    @InjectConfig(API_KEY) private readonly apiKey: string,
    @InjectConfig(API_SECRET) private readonly apiSecret: string,
    @InjectConfig(API_TARGET) private readonly apiTaget: string,
  ) {}

  public async fetch<T>(fetchWith: Partial<FetchArguments>): Promise<T> {
    fetchWith.headers ??= {};
    fetchWith.headers[ALPACA_API_KEY_HEADER] = this.apiKey;
    fetchWith.headers[ALPACA_SECRET_KEY_HEADER] = this.apiSecret;
    const out = await this.fetchService.fetch<
      { code: number; message: string } | T
    >({
      ...fetchWith,
    });
    if (is.object(out) && !is.undefined(out.code)) {
      this.logger.error(
        { code: out.code },
        `Alpaca api request failed {${out.message}}`,
      );
      return;
    }
    return out as T;
  }

  protected onApplicationBootstrap(): void {
    this.fetchService.BASE_URL = this.apiTaget;
    this.fetchService.bottleneck({
      maxConcurrent: 1,
      minTime: 200,
      reservoir: 200,
      reservoirRefreshAmount: 200,
      reservoirRefreshInterval: MINUTE,
    });
  }
}

// import { DataSource } from './entities'

// export default {
//   rest: {
//     account: 'https://api.alpaca.markets/v2',
//     market_data_v2: 'https://data.alpaca.markets/v2',
//     market_data_v1: 'https://data.alpaca.markets/v1',
//   },
//   websocket: {
//     account: 'wss://api.alpaca.markets/stream',
//     market_data: (source: DataSource = 'iex') =>
//       `wss://stream.data.alpaca.markets/v2/${source}`,
//   },
// }

// private async request<T = any>(params: {
//   method: 'GET' | 'DELETE' | 'PUT' | 'PATCH' | 'POST'
//   url: string
//   data?: { [key: string]: any }
//   isJSON?: boolean
// }): Promise<T> {
//   let headers: any = {}

//   const makeCall = () =>
//       unifetch(params.url.concat(query), {
//         method: params.method,
//         headers,
//         body: JSON.stringify(params.data),
//       }),
//     func = this.params.rate_limit
//       ? () => this.limiter.schedule(makeCall)
//       : makeCall
//   return result as any
// }
