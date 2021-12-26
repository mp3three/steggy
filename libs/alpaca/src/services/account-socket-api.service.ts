import { AutoLogService, InjectConfig, OnEvent } from '@text-based/utilities';
import { Injectable } from '@nestjs/common';
import WS from 'ws';

import { API_KEY, API_SECRET, LIVE_TRADING } from '../config';
import { AlpacaSocketChannel, CONNECTION_ACTIVE } from '../contracts';
import { SocketAPIService } from './socket-api.service';

@Injectable()
export class AccountSocketAPI {
  constructor(
    private readonly socket: SocketAPIService,
    private readonly logger: AutoLogService,

    @InjectConfig(API_KEY) private readonly apiKey: string,
    @InjectConfig(API_SECRET) private readonly apiSecret: string,
    @InjectConfig(LIVE_TRADING) private readonly liveTrading: string,
  ) {}
  private connection: WS;

  public sendMsg(action: string, data: Record<string, unknown> = {}): void {
    this.connection.send(
      JSON.stringify({
        action,
        ...data,
      }),
    );
  }

  public subscribe(channel: AlpacaSocketChannel): void {
    this.socket.sendMsg('listen', {
      data: { streams: [channel] },
    });
  }
  public unsubscribe(channel: AlpacaSocketChannel): void {
    this.socket.sendMsg('unlisten', {
      data: { streams: [channel] },
    });
  }

  @OnEvent(CONNECTION_ACTIVE)
  protected authenticate(): void {
    // this
  }

  protected onApplicationBootstrap(): Promise<void> {
    this.logger.debug(`[CONNECTION_ACTIVE] = {false}`);
    if (this.connection) {
      return;
    }
    this.connection = new WS('');
    this.connection.addEventListener('open', () => {
      this.sendMsg('authenticate', {
        data: {
          key_id: this.apiKey,
          secret_key: this.apiSecret,
        },
      });
      this.logger.debug(`[CONNECTION_ACTIVE] = {true}`);
    });
  }

  private onMessage(): void {
    //
  }
}

// if (
//   // if not specified
//   !('paper' in params.credentials) &&
//   // and live key isn't already provided
//   !('key' in params.credentials && params.credentials.key.startsWith('A'))
// ) {
//   params.credentials['paper'] = true
// }

// // assign the host we will connect to
// switch (params.type) {
//   case 'account':
//     this.host = params.credentials.paper
//       ? urls.websocket.account.replace('api.', 'paper-api.')
//       : urls.websocket.account
//     break
//   case 'market_data':
//     this.host = urls.websocket.market_data(this.params.source)
//     break
//   default:
//     this.host = 'unknown'
// }

// this.connection = new WebSocket(this.host)
// this.connection.onopen = () => {
//   let message = {}

//   switch (this.params.type) {
//     case 'account':
//       message = {
//         action: 'authenticate',
//         data: {
//           key_id: params.credentials.key,
//           secret_key: params.credentials.secret,
//         },
//       }
//       break
//     case 'market_data':
//       // {"action":"auth","key":"PK*****","secret":"*************"}
//       message = { action: 'auth', ...params.credentials }
//       break
//   }

//   this.connection.send(JSON.stringify(message))

//   // pass through
//   this.emit('open', this)
// }

// // pass through
// this.connection.onclose = () => this.emit('close', this)

// this.connection.onmessage = async (event: any) => {
//   let data = event.data

//   if (isBlob(data)) {
//     data = await event.data.text()
//   } else if (data instanceof ArrayBuffer) {
//     data = String.fromCharCode(...new Uint8Array(event.data))
//   }

//   let parsed = JSON.parse(data),
//     messages = this.params.type == 'account' ? [parsed] : parsed

//   messages.forEach((message: any) => {
//     // pass the message
//     this.emit('message', message)

//     // pass authenticated event
//     if ('T' in message && message.msg == 'authenticated') {
//       this.authenticated = true
//       this.emit('authenticated', this)
//     } else if ('stream' in message && message.stream == 'authorization') {
//       if (message.data.status == 'authorized') {
//         this.authenticated = true
//         this.emit('authenticated', this)
//       }
//     }

//     // pass trade_updates event
//     if ('stream' in message && message.stream == 'trade_updates') {
//       this.emit('trade_updates', message.data)
//     }

//     // pass trade, quote, bar event
//     const x: { [index: string]: keyof Events } = {
//       success: 'success',
//       subscription: 'subscription',
//       error: 'error',
//       t: 'trade',
//       q: 'quote',
//       b: 'bar',
//     }

//     if ('T' in message) {
//       this.emit(x[message.T.split('.')[0]], message)
//     }
//   })
// }

// // pass the error
// this.connection.onerror = (err: WebSocket.ErrorEvent) => {
//   this.emit('error', err)
// }
