import { AutoLogService, InjectConfig } from '@text-based/utilities';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import EventEmitter from 'eventemitter3';
import WS from 'ws';

import { API_KEY, API_SECRET, LIVE_TRADING } from '../config';
import {
  AlpacaSocketChannel,
  CONNECTION_ACTIVE,
  CONNECTION_RESET,
} from '../contracts';

@Injectable()
export class SocketAPIService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly eventEmitter: EventEmitter,
    @InjectConfig(API_KEY) private readonly apiKey: string,
    @InjectConfig(API_SECRET) private readonly apiSecret: string,
    @InjectConfig(LIVE_TRADING) private readonly liveTrading: string,
  ) {}
  private authenticated = false;
  private connection: WS;

  public initConnection(
    action: string,
    auth: Record<string, unknown>,
  ): Promise<void> {
    this.logger.debug(`[CONNECTION_ACTIVE] = {false}`);
    if (this.connection) {
      return;
    }
    this.connection = new WS('');
    this.connection.addEventListener('open', () => {
      this.sendMsg(action, auth);
      this.logger.debug(`[CONNECTION_ACTIVE] = {true}`);
    });
  }

  public sendMsg(action: string, data: Record<string, unknown> = {}): void {
    if (!this.authenticated) {
      throw new InternalServerErrorException(`Socket not connected`);
    }
    const message = JSON.stringify({
      action,
      ...data,
    });
    this.connection.send(message);
  }
}
