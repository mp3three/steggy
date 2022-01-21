/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
  ConflictException,
  GoneException,
  Injectable,
  InternalServerErrorException,
  RequestTimeoutException,
} from '@nestjs/common';
import { AutoLogService, InjectConfig } from '@text-based/boilerplate';
import { createConnection, Socket } from 'net';

import { HOST, PASSWORD, PORT, TIMEOUT } from '../config';
import { PacketType } from '../contracts';

type Callback = (data: string, error?: Error) => void;

@Injectable()
export class RCONConnectionService {
  constructor(
    private readonly logger: AutoLogService,
    @InjectConfig(HOST) private readonly host: string,
    @InjectConfig(PORT) private readonly port: number,
    @InjectConfig(PASSWORD) private readonly password: string,
    @InjectConfig(TIMEOUT) private readonly timeout: number,
  ) {}

  private authPacket: number;
  private callbacks: Map<number, Callback> = new Map();
  // Does this NEED to start at 1M? Or is 0 better?
  // Does it need a roll over?
  private requestId = 1_000_000;
  private socket: Socket;

  public async send(data: string, type = PacketType.COMMAND): Promise<string> {
    const length = Buffer.byteLength(data);
    this.requestId++;
    const id = this.requestId;
    if (type === PacketType.AUTH) {
      this.authPacket = id;
    }
    const buffer = Buffer.allocUnsafe(length + 14);
    buffer.writeInt32LE(length + 10, 0);
    buffer.writeInt32LE(id, 4);
    buffer.writeInt32LE(type, 8);
    buffer.write(data, 12);
    buffer.fill(0x00, length + 12);
    await this.socket.write(buffer, 'binary');
    return await new Promise<string>((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timeout);
        this.socket.removeListener('end', onEnded);
        this.callbacks.delete(id);
        if (type === PacketType.AUTH) {
          this.authPacket = Number.NaN;
        }
      };
      const timeout = setTimeout(() => {
        cleanup();
        reject(new RequestTimeoutException('Request timed out'));
      }, this.timeout);

      const onEnded = () => {
        cleanup();
        reject(new GoneException('Disconnected before response'));
      };

      this.socket.once('end', onEnded);
      this.callbacks.set(id, (data, error) => {
        cleanup();
        if (error) {
          reject(error);
          return;
        }
        if (data == undefined) {
          reject(new ConflictException('No data returned'));
          return;
        }
        resolve(data);
      });
    });
  }

  private initConnection(): void {
    this.socket = createConnection(this.port, this.host);
    this.socket.on('error', error => this.onError(error));
    this.socket.once('connect', () => this.onConnect());
    this.socket.on('data', data => this.onData(data));
    this.socket.once('end', () => this.onEnd());
  }

  private async onConnect(): Promise<void> {
    this.logger.info(`Connected`);
    await this.sendAuth();
  }

  private onData(buffer: Buffer): void {
    const length = buffer.readInt32LE(0);
    let id = buffer.readInt32LE(4);
    const type = buffer.readInt32LE(8);
    const authId = this.authPacket;
    const callback = this.callbacks.get(authId);
    if (
      id === -1 &&
      !Number.isNaN(authId) &&
      type === PacketType.RESPONSE_AUTH
    ) {
      if (callback) {
        id = authId;
        this.authPacket = Number.NaN;
        callback(
          undefined,
          new InternalServerErrorException('Authentication failed'),
        );
      }
    } else if (callback) {
      let text = buffer.toString('utf8', 12, length + 2);
      if (text.charAt(text.length - 1) === '\n') {
        text = text.slice(0, Math.max(0, text.length - 1));
      }
      callback(text);
    }
    this.callbacks.delete(id);
  }

  private onEnd(): void {
    this.logger.info(`Disconnect`);
  }

  private onError(error: Error): void {
    this.logger.error({ error }, error.message);
  }

  private async sendAuth(): Promise<void> {
    try {
      await this.send(this.password, PacketType.AUTH);
    } catch (error) {
      this.logger.error({ error });
      return;
    }
  }
}
