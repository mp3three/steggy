import {
  ALL_ENTITIES_UPDATED,
  BASE_URL,
  CONNECTION_RESET,
  HA_EVENT_STATE_CHANGE,
  HA_RAW_EVENT,
  HA_SOCKET_READY,
  HOST,
  LIB_HOME_ASSISTANT,
  TOKEN,
} from '@automagical/contracts/constants';
import {
  AreaDTO,
  DeviceListItemDTO,
  EntityListItemDTO,
  HassCommands,
  HassDomains,
  HassEvents,
  HassServices,
  HassSocketMessageTypes,
  HassStateDTO,
  SendSocketMessageDTO,
  SocketMessageDTO,
} from '@automagical/contracts/home-assistant';
import { FetchArguments, FetchService } from '@automagical/fetch';
import { InjectLogger, sleep, Trace } from '@automagical/utilities';
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
 * Some requests (such as reports) must go through HTTP calls.
 * This service still handles those requests to keep a unified interface
 */
@Injectable()
export class SocketService {
  // #region Object Properties

  private connection: WS;
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
   *
   * Does not wait for a response, meant for issuing commands
   */
  @Trace()
  public async call<T extends void = void>(
    service: HassServices | string,
    service_data: Record<string, unknown> = {},
    domain: HassDomains = HassDomains.homeassistant,
  ): Promise<T> {
    return await this.sendMsg<T>(
      {
        type: HassCommands.call_service,
        domain,
        service,
        service_data,
      },
      false,
    );
  }

  /**
   * Wrapper to set baseUrl
   */
  @Trace()
  public fetch<T>(arguments_: Partial<FetchArguments>): Promise<T> {
    return this.fetchService.fetch<T>({
      baseUrl: this.configService.get(BASE_URL),
      headers: {
        Authorization: `Bearer ${this.configService.get(TOKEN)}`,
      },
      ...arguments_,
    });
  }

  @Trace()
  public async fetchEntityCustomizations<
    T extends Record<never, unknown> = Record<
      'global' | 'local',
      Record<string, string>
    >
  >(entityId: string): Promise<T> {
    return await this.fetch<T>({
      url: `/api/config/customize/config/${entityId}`,
    });
  }

  /**
   * Request historical information about an entity
   */
  @Trace()
  public async fetchEntityHistory<T extends unknown[] = unknown[]>(
    days: number,
    entity_id: string,
  ): Promise<T> {
    return await this.fetch<T>({
      url: `/api/history/period/${dayjs().subtract(days, 'd').toISOString()}`,
      params: {
        filter_entity_id: entity_id,
        end_time: dayjs().toISOString(),
        significant_changes_only: '',
      },
    });
  }

  /**
   * Request a current listing of all entities + their states
   *
   * This can be a pretty big list
   */
  @Trace()
  public async getAllEntitities(): Promise<HassStateDTO[]> {
    if (this.updateAllPromise) {
      return await this.updateAllPromise;
    }
    this.updateAllPromise = new Promise<HassStateDTO[]>(async (done) => {
      const allEntities = await this.sendMsg<HassStateDTO[]>({
        type: HassCommands.get_states,
      });
      // As long as the info is handy...
      this.eventEmitter.emit(ALL_ENTITIES_UPDATED, allEntities);
      done(allEntities);
      this.updateAllPromise = undefined;
    });
    return await this.updateAllPromise;
  }

  @Trace()
  public async getAreas(): Promise<AreaDTO[]> {
    return await this.sendMsg({
      type: HassCommands.area_list,
    });
  }

  @Trace()
  public async listDevices(): Promise<DeviceListItemDTO[]> {
    return await this.sendMsg({
      type: HassCommands.device_list,
    });
  }

  @Trace()
  public async listEntities(): Promise<EntityListItemDTO[]> {
    return await this.sendMsg({
      type: HassCommands.entity_list,
    });
  }

  /**
   * Ask Home Assistant to send a MQTT message
   */
  @Trace()
  public async sendMqtt<T = unknown>(
    topic: string,
    payload: Record<string, unknown>,
  ): Promise<T> {
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

  @Trace()
  public async updateEntity(entityId: string): Promise<HassDomains> {
    return await this.sendMsg({
      type: HassCommands.call_service,
      service: HassServices.update_entity,
      domain: HassDomains.homeassistant,
      service_data: {
        entity_id: entityId,
      },
    });
    // return null;
  }

  // #endregion Public Methods

  // #region Private Methods

  /**
   * Run ping every 15 seconds. Keep connection alive during the slow times
   */
  @Cron('*/15 * * * * *')
  @Trace()
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
      this.logger.error(`Failed to pong!`);
    } catch (error) {
      this.logger.error(error);
    }
    this.initConnection(true);
  }

  /**
   * Set up a new websocket connection to home assistant
   *
   * TODO: Make this blocking until HA_SOCKET_READY
   */
  @Trace()
  private initConnection(reset = false): void {
    if (reset) {
      this.eventEmitter.emit(CONNECTION_RESET);
      this.isAuthenticated = false;
      this.connection = undefined;
    }
    if (this.connection) {
      return;
    }
    try {
      this.connection = new WS(
        `wss://${this.configService.get(HOST)}/api/websocket`,
      );
      this.connection.addEventListener('message', (message) => {
        this.onMessage(JSON.parse(message.data));
      });
    } catch (error) {
      this.logger.error(error);
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
   * Response to an outgoing emit
   */
  @Trace({ omitArgs: true })
  private async onMessage(message: SocketMessageDTO) {
    this.logger.trace({ msg: message }, 'onMessage');
    const id = Number(message.id);
    // let lostInFlight: number;
    switch (message.type as HassSocketMessageTypes) {
      case HassSocketMessageTypes.auth_required:
        return await this.sendMsg({
          type: HassCommands.auth,
          access_token: this.configService.get(TOKEN),
        });

      case HassSocketMessageTypes.auth_ok:
        this.isAuthenticated = true;
        await this.sendMsg({
          type: HassCommands.subscribe_events,
        });
        await this.getAllEntitities();
        // Theoretially, all entities are present, and we have an authorized connection
        this.eventEmitter.emit(HA_SOCKET_READY);
        return;

      case HassSocketMessageTypes.event:
        this.eventEmitter.emit(HA_RAW_EVENT, message.event);
        if (message.event.event_type === HassEvents.state_changed) {
          this.eventEmitter.emit(HA_EVENT_STATE_CHANGE, message.event);
          this.eventEmitter.emit([
            HA_EVENT_STATE_CHANGE,
            message.event.data.entity_id,
          ]);
        }
        return;

      case HassSocketMessageTypes.pong:
        // 🏓
        if (this.waitingCallback.has(id)) {
          const f = this.waitingCallback.get(id);
          this.waitingCallback.delete(id);
          f(message);
        }
        return;

      case HassSocketMessageTypes.result:
        if (this.waitingCallback.has(id)) {
          const f = this.waitingCallback.get(id);
          this.waitingCallback.delete(id);
          f(message.result);
        }
        return;
      default:
        this.logger.warn(`Unknown websocket message type: ${message.type}`);
    }
  }

  /**
   * Send a message to HomeAssistant. Optionally, wait for a reply to come back & return
   */
  @Trace()
  private async sendMsg<T extends unknown = unknown>(
    data: SendSocketMessageDTO,
    waitForResponse = true,
  ): Promise<T> {
    this.messageCount++;
    const counter = this.messageCount;
    if (data.type !== HassCommands.auth) {
      data.id = counter;
    }
    while (this.connection.readyState !== this.connection.OPEN) {
      this.logger.info(`re-init connection`);
      try {
        await this.initConnection(true);
      } catch (error) {
        this.logger.error(error);
        await sleep(5000);
        continue;
      }
      await sleep(1000);
      return await this.sendMsg(data);
    }
    while (this.isAuthenticated === false && data.type !== HassCommands.auth) {
      // Something is jumpy
      // Request went in post-connect but pre-auth
      // HA_SOCKET_READY is the event to watch for
      this.logger.warn(`sendMsg waiting for authentication`);
      await sleep(100);
    }
    this.connection.send(JSON.stringify(data));
    if (!waitForResponse) {
      return;
    }
    // TODO Add a timer to identify calls that don't receive replies
    return new Promise((done) => this.waitingCallback.set(counter, done));
  }

  private async onModuleInit(): Promise<void> {
    await this.initConnection();
  }

  // #endregion Private Methods
}
