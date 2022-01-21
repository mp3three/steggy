// public subscribeData(channel: AlpacaSocketChannel, symbols: string[]): void {
//   this.sendMsg('subscribe', {
//     [channel]: symbols,
//   });
// }

import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@text-based/boilerplate';

// public unsubscribeData(
//   channel: AlpacaSocketChannel,
//   symbols: string[],
// ): void {
//   this.sendMsg('unsubscribe', {
//     [channel]: symbols,
//   });
// }

@Injectable()
export class DataSocketAPIService {
  constructor(private readonly logger: AutoLogService) {}
}
