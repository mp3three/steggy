import { EntityStateDTO, SocketMessageDTO } from '@automagical/contracts';
import { Fetch, FetchWith } from '@automagical/fetch';
import { Logger } from '@automagical/logger';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import * as dayjs from 'dayjs';
import { EventEmitter } from 'events';
import * as WS from 'ws';
import { BASE_URL, HOST, TOKEN } from '../../typings/constants';
import {
  HassCommands,
  HassDomains,
  HassServices,
  HassSocketMessageTypes,
} from '../../typings/socket';
import { sleep } from '@automagical/utilities';

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

  private static RESPONSE_TIMEOUT = 1000 * 30;

  // #endregion Static Properties

  // #region Object Properties

  private readonly logger = Logger(SocketService);

  private connection: WebSocket;
  private isAuthenticated = false;
  private messageCount = 1;
  private waitingCallback: Record<number, (result) => void> = {};

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    super();
  }

  // #endregion Constructors

  // #region Public Methods

  /**
   * Convenience wrapper around sendMsg
   */
  public async call<T extends void = void>(
    domain: HassDomains,
    service: HassServices | string,
    service_data: Record<string, unknown>,
  ): Promise<T> {
    return this.sendMsg<T>({
      type: HassCommands.call_service,
      domain,
      service,
      service_data,
    });
  }

  /**
   * Wrapper to set baseUrl
   */
  public fetch<T>(args: FetchWith): Promise<T> {
    return Fetch.fetch<T>({
      baseUrl: this.configService.get(BASE_URL),
      ...args,
    });
  }

  /**
   * Request historical information about an entity
   */
  public async fetchEntityHistory<T extends unknown[] = unknown[]>(
    days: number,
    entity_id: string,
  ): Promise<T> {
    this.logger.debug(`fetchEntityHistory`, entity_id);
    try {
      return this.fetch<T>({
        url: `/api/history/period/${dayjs().subtract(days, 'd').toISOString()}`,
        params: {
          filter_entity_id: entity_id,
          end_time: dayjs().toISOString(),
          significant_changes_only: '',
        },
        headers: {
          Authorization: `Bearer ${this.configService.get(TOKEN)}`,
        },
      });
    } catch (err) {
      this.logger.error(err);
      return [] as T;
    }
  }

  public async onModuleInit(): Promise<void> {
    await this.initConnection();
  }

  /**
   * Ask Home Assistant to send a MQTT message
   */
  public sendMqtt<T = unknown>(
    topic: string,
    payload: Record<string, unknown>,
  ): Promise<T> {
    this.logger.debug(`sendMqtt`, topic);
    return this.sendMsg<T>({
      type: HassCommands.call_service,
      domain: HassDomains.mqtt,
      service: HassServices.publish,
      service_data: {
        topic,
        ...payload,
      },
    });
  }

  /**
   * Request a current listing of all entities + their states
   *
   * This can be a pretty big list
   */
  public async updateAllEntities(): Promise<EntityStateDTO[]> {
    this.logger.notice(`updateAllEntities`);
    const allEntities = await this.sendMsg<EntityStateDTO[]>({
      type: HassCommands.get_states,
    });
    // As long as the info is handy...
    process.nextTick(() => this.emit(`allEntityUpdate`, allEntities));
    return allEntities;
  }

  // #endregion Public Methods

  // #region Private Methods

  /**
   * Run ping every 15 seconds. Keep connection alive during the slow times
   */
  @Cron('*/15 * * * * *')
  private async ping(): Promise<void> {
    try {
      const pong = await this.sendMsg({
        type: HassCommands.ping,
      });
      if (pong) {
        return;
      }
      // Tends to happen when HA resets
      // Resolution is to re-connect when it's up again
      this.logger.crit(`Failed to pong!`);
    } catch (err) {
      this.logger.error(err);
    }
    this.initConnection(true);
  }

  /**
   * Set up a new websocket connection to home assistant
   */
  private initConnection(reset = false): void {
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
    } catch (err) {
      this.logger.error(err);
    }
  }

  /**
   * Called on incoming message, acts as router
   *
   * ## auth_requored
   * Hello message from server, should reply back with an auth msg
   * ## auth_ok
   * Follow up with a request to receive all events, and request a current state listing
   * ## event
   * Something updated it's state
   * ## pong
   * Reply to outgoing ping()
   * ## result
   * Response to an outgoing emit. Value should be redirected to the promise returned by said emit
   */
  private async onMessage(msg: SocketMessageDTO) {
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
        return;

      case HassSocketMessageTypes.pong:
        if (this.waitingCallback[msg.id]) {
          const f = this.waitingCallback[msg.id].done;
          delete this.waitingCallback[msg.id];
          f(msg);
        }
        return;

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

  /**
   * Send a message to HomeAssistant. Optionally, wait for a reply to come back & return
   */
  private async sendMsg<T extends unknown = unknown>(
    data: SocketMessage,
    waitForResponse = true,
  ): Promise<T> {
    if (data.type !== HassCommands.ping) {
      this.logger.debug(data);
    }
    this.messageCount++;
    const counter = this.messageCount;
    if (data.type !== HassCommands.auth) {
      data.id = counter;
    }
    while (this.connection.readyState !== this.connection.OPEN) {
      this.logger.info(`re-init connection`);
      await this.initConnection(true);
      await sleep(1000);
      return this.sendMsg(data);
    }
    while (this.isAuthenticated === false && data.type !== 'auth') {
      // Something is jumpy
      this.logger.warning(`sendMsg waiting for authentication`);
      await sleep(100);
    }
    this.connection.send(JSON.stringify(data));
    if (!waitForResponse) {
      // Mostly an optimization thing
      // TODO Add a timer to identify calls that don't receive replies
      return null;
    }
    return new Promise((done) => (this.waitingCallback[counter] = done));
  }

  // #endregion Private Methods
}
