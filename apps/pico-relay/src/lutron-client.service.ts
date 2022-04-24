import { Injectable } from '@nestjs/common';
import {
  AutoConfigService,
  AutoLogService,
  InjectConfig,
} from '@steggy/boilerplate';
import { is, START } from '@steggy/utilities';
import EventEmitter from 'eventemitter3';
import { Socket } from 'net';

import {
  LUTRON_HOST,
  LUTRON_PASSWORD,
  LUTRON_PORT,
  LUTRON_USERNAME,
  RECONNECT_INTERVAL,
} from './config';
import { LUTRON_EVENT } from './constants';

@Injectable()
export class LutronClientService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly config: AutoConfigService,
    @InjectConfig(LUTRON_HOST) private readonly host: string,
    @InjectConfig(LUTRON_PORT) private readonly port: number,
    @InjectConfig(LUTRON_USERNAME) private readonly username: string,
    @InjectConfig(LUTRON_PASSWORD) private readonly password: string,
    @InjectConfig(RECONNECT_INTERVAL)
    private readonly reconnectInterval: number,
    private readonly eventEmitter: EventEmitter,
  ) {}
  private authenticated: boolean;
  private connected: boolean;
  private socket: Socket;

  protected onModuleInit(): void {
    if (is.empty(this.host)) {
      this.logger.error(`No host provided`);
      return;
    }
    this.socket = new Socket();
    this.socket.on('close', () => this.onClose());
    this.socket.on('connect', () => this.onConnect());
    this.socket.on('data', data => this.onData(data));
    this.socket.on('error', error => this.onError(error));
    this.logger.info(`Connecting`);
    this.connect();
  }

  private authenticate(line: string): void {
    if (line.startsWith('login')) {
      this.logger.debug(`Sending login`);
      this.socket.write(`${this.username}\r\n`);
    }
    if (line.startsWith('password')) {
      this.logger.debug(`Sending password`);
      this.socket.write(`${this.password}\r\n`);
    }
    if (line.startsWith('GNET')) {
      this.logger.info('Authenticated');
      this.authenticated = true;
    }
  }

  private connect(): void {
    this.connected = false;
    this.logger.debug(`Attempting to connect to {${this.host}}`);
    this.socket.connect({
      host: this.host,
      port: this.port,
    });
    setTimeout(() => {
      if (this.connected) {
        return;
      }
      this.logger.info(`Reconnecting`);
      this.connect();
    }, this.reconnectInterval);
  }

  private onClose(): void {
    this.connect();
  }

  private onConnect(): void {
    this.logger.info(`Connected`);
    this.connected = true;
    this.authenticated = false;
  }

  private onData(data: Buffer) {
    data
      .toString()
      .split('\r\n')
      .forEach(line => {
        if (is.empty(line)) {
          return;
        }
        if (!this.authenticated) {
          this.authenticate(line);
          return;
        }
        if (line[START] === `~`) {
          this.eventEmitter.emit(LUTRON_EVENT, line);
        }
      });
  }

  private onError(error: Error) {
    this.logger.error({ error }, `Connection error`);
    this.connect();
  }
}
