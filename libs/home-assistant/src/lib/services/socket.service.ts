import {
  ALL_ENTITIES_UPDATED,
  BASE_URL,
  CONNECTION_RESET,
  HA_RAW_EVENT,
  HOST,
  LIB_HOME_ASSISTANT,
  TOKEN,
} from '@automagical/contracts/constants';
import {
  HassCommands,
  HassDomains,
  HassServices,
  HassSocketMessageTypes,
  HassStateDTO,
  SendSocketMessageDTO,
  SocketMessageDTO,
} from '@automagical/contracts/home-assistant';
import { FetchService, FetchWith } from '@automagical/fetch';
import { InjectLogger, sleep } from '@automagical/utilities';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import dayjs from 'dayjs';
import { PinoLogger } from 'nestjs-pino';
import WS from 'ws';

/**
 * SocketService deals with all communicationsto the HomeAssistant service
 *
 * This is primarily accomplished through the websocket API.
 * However, some requests (such as reports) can only be done through HTTP calls.
 * This service still handles those requests to keep things in one spot.
 */
@Injectable()
export class SocketService {
  // #region Object Properties

  private connection: WebSocket;
  private isAuthenticated = false;
  private messageCount = 1;
  private updateAllPromise: Promise<HassStateDTO[]>;
  private waitingCallback = new Map<number, (result) => void>();

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly fetchService: FetchService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
    @InjectLogger(SocketService, LIB_HOME_ASSISTANT)
    protected readonly logger: PinoLogger,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  /**
   * Convenience wrapper around sendMsg
   */
  public async call<T extends void = void>(
    domain: HassDomains,
    service: HassServices | string,
    service_data: Record<string, unknown> = {},
  ): Promise<T> {
    return await this.sendMsg<T>({
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
    return this.fetchService.fetch<T>({
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
    this.logger.trace(`fetchEntityHistory ${entity_id}`);
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
  public async sendMqtt<T = unknown>(
    topic: string,
    payload: Record<string, unknown>,
  ): Promise<T> {
    this.logger.trace(`sendMqtt: ${topic}`);
    return await this.sendMsg<T>({
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
  public async updateAllEntities(): Promise<HassStateDTO[]> {
    if (this.updateAllPromise) {
      return await this.updateAllPromise;
    }
    this.logger.debug(`updateAllEntities`);
    this.updateAllPromise = new Promise<HassStateDTO[]>(async (done) => {
      const allEntities = await this.sendMsg<HassStateDTO[]>({
        type: HassCommands.get_states,
      });
      // As long as the info is handy...
      this.eventEmitter.emit(ALL_ENTITIES_UPDATED, allEntities);
      done(allEntities);
      this.updateAllPromise = null;
    });
    return await this.updateAllPromise;
  }

  // #endregion Public Methods

  // #region Private Methods

  /**
   * Run ping every 15 seconds. Keep connection alive during the slow times
   */
  @Cron('*/15 * * * * *')
  private async ping(): Promise<void> {
    this.logger.trace('ping');
    try {
      const pong = await this.sendMsg({
        type: HassCommands.ping,
      });
      if (pong) {
        return;
      }
      // Tends to happen when HA resets
      // Resolution is to re-connect when it's up again
      this.logger.error(`Failed to pong!`);
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
      this.eventEmitter.emit(CONNECTION_RESET);
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
    const id = Number(msg.id);
    // let lostInFlight: number;
    switch (msg.type as HassSocketMessageTypes) {
      case HassSocketMessageTypes.auth_required:
        // lostInFlight = Object.values(this.waitingCallback).length;
        // if (lostInFlight !== 0) {
        //   // ? Can the promises be rejected?
        //   // ? Does the memory get reclaimed if I don't?
        //   this.logger.warn(
        //     `${lostInFlight} responses lost during connection reset`,
        //   );
        // }
        // this.waitingCallback = {};
        return await this.sendMsg({
          type: HassCommands.auth,
          access_token: this.configService.get(TOKEN),
        });

      case HassSocketMessageTypes.auth_ok:
        this.isAuthenticated = true;
        await this.sendMsg({
          type: HassCommands.subscribe_events,
        });
        return await this.updateAllEntities();

      case HassSocketMessageTypes.event:
        this.eventEmitter.emit(HA_RAW_EVENT, msg.event);
        return;

      // 🏓
      case HassSocketMessageTypes.pong:
        if (this.waitingCallback.has(id)) {
          const f = this.waitingCallback.get(id);
          this.waitingCallback.delete(id);
          f(msg);
        }
        return;

      case HassSocketMessageTypes.result:
        if (this.waitingCallback.has(id)) {
          const f = this.waitingCallback.get(id);
          this.waitingCallback.delete(id);
          f(msg.result);
        }
        return;
      default:
        this.logger.warn(`Unknown websocket message type: ${msg.type}`);
        this.logger.debug(msg);
    }
  }

  /**
   * Send a message to HomeAssistant. Optionally, wait for a reply to come back & return
   */
  private async sendMsg<T extends unknown = unknown>(
    data: SendSocketMessageDTO,
    waitForResponse = true,
  ): Promise<T> {
    if (data.type !== HassCommands.ping) {
      this.logger.debug(data, 'sendMsg');
    }
    this.messageCount++;
    const counter = this.messageCount;
    if (data.type !== HassCommands.auth) {
      data.id = counter;
    }
    while (this.connection.readyState !== this.connection.OPEN) {
      this.logger.info(`re-init connection`);
      try {
        await this.initConnection(true);
      } catch (err) {
        this.logger.error(err);
        await sleep(5000);
        continue;
      }
      await sleep(1000);
      return await this.sendMsg(data);
    }
    while (this.isAuthenticated === false && data.type !== HassCommands.auth) {
      // Something is jumpy
      // Request went in post-connect but pre-auth (which is supposed to be quick)
      // Maybe check a different lifecycle event
      this.logger.warn(`sendMsg waiting for authentication`);
      await sleep(100);
    }
    this.connection.send(JSON.stringify(data));
    if (!waitForResponse) {
      // Mostly an optimization thing
      return null;
    }
    // TODO Add a timer to identify calls that don't receive replies
    return new Promise((done) => this.waitingCallback.set(counter, done));
  }

  // #endregion Private Methods
}
