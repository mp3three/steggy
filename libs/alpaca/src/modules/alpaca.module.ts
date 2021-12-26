import { LibraryModule, RegisterCache } from '@text-based/utilities';

import { LIB_ALPACA } from '../config';
import {
  AccountService,
  AlpacaFetchService,
  DataService,
  DataSocketAPIService,
  OrderService,
  SocketAPIService,
  UtilitiesService,
  WatchlistService,
} from '../services';

@LibraryModule({
  exports: [
    AccountService,
    DataService,
    OrderService,
    UtilitiesService,
    WatchlistService,
  ],
  imports: [RegisterCache()],
  library: LIB_ALPACA,
  providers: [
    AlpacaFetchService,
    AccountService,
    DataService,
    DataSocketAPIService,
    OrderService,
    SocketAPIService,
    UtilitiesService,
    WatchlistService,
  ],
})
export class AlpacaModule {}
