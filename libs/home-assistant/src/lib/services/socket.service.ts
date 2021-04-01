import { Logger } from '@automagical/logger';
import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { EventEmitter } from 'events';
import { Fetch } from '@automagical/fetch';
import * as WS from 'ws';
import { ConfigService } from '@nestjs/config';
import {
  HassCommands,
  HassDomains,
  HassServices,
  HassSocketMessageTypes,
} from '../../typings/socket';
import { BaseEntity } from '@automagical/home-assistant';
import { BASE_URL, HOST, TOKEN } from '../../typings/constants';
import { EntityStateDTO } from '@automagical/contracts';

type SocketMessage = {
  type: HassCommands;
  id?: number;
  domain?: HassDomains;
  service?: HassServices | string;
  service_data?: unknown;
  access_token?: string;
};

@Injectable()
export class SocketService extends EventEmitter {
  // #region Static Properties

  private static PING_INTERVAL = 1000 * 15;
  private static RESPONSE_TIMEOUT = 1000 * 30;

  // #endregion Static Properties

  // #region Object Properties

  public asnyc;

  private readonly logger = Logger(SocketService);

  private connection: WebSocket;
  private isAuthenticated = false;
  private messageCount = 1;
  private waitingCallback: Record<
    number,
    {
      data: Record<string, unknown>;
      done: (result) => void;
    }
  > = {};

  // #endregion Object Properties

  // #region Constructors

  constructor(private readonly configService: ConfigService) {
    super();
  }

  // #endregion Constructors

  // #region Public Methods

  public async call(
    domain: HassDomains,
    service: HassServices | string,
    service_data: Record<string, unknown>,
  ): Promise<void> {
    if (BaseEntity.DISABLE_INTERACTIONS) {
      this.logger.warning(
        `${domain}.${service} bocked: ${service_data.entity_id}`,
      );
      return;
    }
    await this.sendMsg({
      type: HassCommands.call_service,
      domain,
      service,
      service_data,
    });
  }

  public async fetchEntityHistory<T extends Array<unknown>>(
    days: number,
    entity_id: string,
  ): Promise<T> {
    try {
      const headers = {
        Authorization: `Bearer ${this.configService.get(TOKEN)}`,
      };
      return Fetch.fetch<T>({
        url: `/api/history/period/${dayjs().subtract(days, 'd').toISOString()}`,
        params: {
          filter_entity_id: entity_id,
          end_time: dayjs().toISOString(),
          significant_changes_only: '',
        },
        baseUrl: this.configService.get(BASE_URL),
        headers,
      });
    } catch (err) {
      this.logger.error(err);
      return [] as T;
    }
  }

  public async onModuleInit(): Promise<void> {
    await this.initConnection();
  }

  public sendMqtt<T>(
    topic: string,
    payload: Record<string, unknown>,
  ): Promise<T> {
    return this.sendMsg({
      type: HassCommands.call_service,
      domain: HassDomains.mqtt,
      service: HassServices.publish,
      service_data: {
        topic,
        ...payload,
      },
    });
  }

  public async updateAllEntities(): Promise<void> {
    const allEntities = (await this.sendMsg({
      type: HassCommands.get_states,
    })) as EntityStateDTO[];
    this.emit(`allEntityUpdate`, allEntities);
  }

  // #endregion Public Methods

  // #region Private Methods

  private initConnection(reset = false) {
    this.logger.info('initConnection');
    if (reset) {
      this.emit('connection-reset');
      this.isAuthenticated = false;
      this.connection = null;
    }
    if (this.connection) {
      return;
    }
    try {
      this.connection = new WS(
        `wss://${this.configService.get(HOST)}/api/websocket`,
      );
      this.connection.onmessage = (msg) => {
        this.onMessage(JSON.parse(msg.data));
      };
      setTimeout(() => this.monitorConnection(), SocketService.PING_INTERVAL);
    } catch (err) {
      this.logger.error(err);
    }
  }

  private async monitorConnection() {
    try {
      const pong = await this.sendMsg({
        type: HassCommands.ping,
      });
      if (pong) {
        setTimeout(() => this.monitorConnection(), SocketService.PING_INTERVAL);
        return;
      }
      this.logger.crit(`Failed to pong!`);
    } catch (err) {
      this.logger.error(err);
    }
    this.initConnection(true);
  }

  private async onMessage(msg) {
    switch (msg.type as HassSocketMessageTypes) {
      case HassSocketMessageTypes.auth_required:
        this.sendMsg({
          type: HassCommands.auth,
          access_token: this.configService.get(TOKEN),
        });
        return;
      case HassSocketMessageTypes.auth_ok:
        this.isAuthenticated = true;
        this.waitingCallback = {};
        await this.sendMsg({
          type: HassCommands.subscribe_events,
        });
        this.updateAllEntities();
        return;
      case HassSocketMessageTypes.event:
        this.emit('onEvent', msg.event);

      // fall through
      case HassSocketMessageTypes.pong:
        if (this.waitingCallback[msg.id]) {
          const f = this.waitingCallback[msg.id].done;
          delete this.waitingCallback[msg.id];
          f(msg);
        }
      // fall through

      case HassSocketMessageTypes.result:
        if (this.waitingCallback[msg.id]) {
          const f = this.waitingCallback[msg.id].done;
          delete this.waitingCallback[msg.id];
          f(msg.result);
        }
        return;
      default:
        // Unhandled case, probably should know about it
        this.logger.alert(JSON.stringify(msg, null, '  '));
    }
  }

  private sendMsg<T extends unknown = unknown>(
    data: SocketMessage,
  ): Promise<T> {
    if (data.type !== HassCommands.ping) {
      this.logger.debug(data);
    }
    this.messageCount++;
    const counter = this.messageCount;
    if (data.type !== HassCommands.auth) {
      data.id = counter;
    }
    if (this.isAuthenticated === false && data.type !== 'auth') {
      return new Promise((done) => {
        this.logger.warning(
          `Connection not authenticated yet, ignoring message`,
        );
        done(null);
      });
    }
    /**
     * FIXME: need to fix this flow
     */
    // eslint-disable-next-line
    return new Promise(async (done) => {
      if (this.connection.readyState !== this.connection.OPEN) {
        this.logger.info(`re-init connection`);
        await this.initConnection(true);
        setTimeout(async () => {
          const res = await this.sendMsg(data);
          this.logger.info(
            `Deferring message by 1s for connection reset`,
            data,
          );
          done(res as T);
        }, 1000);
        return;
      }
      this.connection.send(JSON.stringify(data));

      this.waitingCallback[counter] = {
        data,
        done,
      };
      setTimeout(() => {
        if (this.waitingCallback[counter]) {
          delete this.waitingCallback[counter];
          this.logger.warning(`Socket message reply timed out`, data);
          done(null);
        }
      }, SocketService.RESPONSE_TIMEOUT);
    });
  }

  // #endregion Private Methods
}
