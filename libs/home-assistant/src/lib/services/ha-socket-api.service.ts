import {
  HOME_ASSISTANT_BASE_URL,
  HOME_ASSISTANT_TOKEN,
} from '@automagical/contracts/config';
import {
  ALL_ENTITIES_UPDATED,
  CONNECTION_RESET,
  HA_EVENT_STATE_CHANGE,
  HA_RAW_EVENT,
  HA_SOCKET_READY,
  LIB_HOME_ASSISTANT,
} from '@automagical/contracts/constants';
import {
  AreaDTO,
  DeviceListItemDTO,
  EntityListItemDTO,
  HassEvents,
  HASSIO_WS_COMMAND,
  HassSocketMessageTypes,
  HassStateDTO,
  SendSocketMessageDTO,
  SocketMessageDTO,
} from '@automagical/contracts/home-assistant';
import { EmitAfter, InjectLogger, sleep, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
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
export class HASocketAPIService {
  // #region Object Properties

  private connection: WS;
  private isAuthenticated = false;
  private messageCount = 1;
  private waitingCallback = new Map<number, (result) => void>();

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(HASocketAPIService, LIB_HOME_ASSISTANT)
    protected readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async getAreas(): Promise<AreaDTO[]> {
    return await this.sendMsg({
      type: HASSIO_WS_COMMAND.area_list,
    });
  }

  @Trace()
  public async listDevices(): Promise<DeviceListItemDTO[]> {
    return await this.sendMsg({
      type: HASSIO_WS_COMMAND.device_list,
    });
  }

  @Trace()
  public async listEntities(): Promise<EntityListItemDTO[]> {
    return await this.sendMsg({
      type: HASSIO_WS_COMMAND.entity_list,
    });
  }

  /**
   * Send a message to HomeAssistant. Optionally, wait for a reply to come back & return
   */
  @Trace()
  public async sendMsg<T extends unknown = unknown>(
    data: SendSocketMessageDTO,
    waitForResponse = true,
  ): Promise<T> {
    this.messageCount++;
    const counter = this.messageCount;
    if (data.type !== HASSIO_WS_COMMAND.auth) {
      data.id = counter;
    }
    // eslint-disable-next-line no-loops/no-loops
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
    // eslint-disable-next-line no-loops/no-loops
    while (
      this.isAuthenticated === false &&
      data.type !== HASSIO_WS_COMMAND.auth
    ) {
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

  /**
   * Request a current listing of all entities + their states
   *
   * This can be a pretty big list
   */
  @Trace()
  @EmitAfter(ALL_ENTITIES_UPDATED)
  public async getAllEntitities(): Promise<HassStateDTO[]> {
    return await this.sendMsg<HassStateDTO[]>({
      type: HASSIO_WS_COMMAND.get_states,
    });
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Cron(CronExpression.EVERY_10_SECONDS)
  @Trace()
  protected async ping(): Promise<void> {
    try {
      const pong = await this.sendMsg({
        type: HASSIO_WS_COMMAND.ping,
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

  @Trace()
  protected async onModuleInit(): Promise<void> {
    await this.initConnection();
  }

  // #endregion Protected Methods

  // #region Private Methods

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
    const url = new URL(this.configService.get(HOME_ASSISTANT_BASE_URL));
    try {
      this.connection = new WS(`wss://${url.hostname}/api/websocket`);
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
  @Trace()
  private async onMessage(message: SocketMessageDTO) {
    this.logger.trace({ msg: message }, 'onMessage');
    const id = Number(message.id);
    // let lostInFlight: number;
    switch (message.type as HassSocketMessageTypes) {
      case HassSocketMessageTypes.auth_required:
        return await this.sendMsg({
          access_token: this.configService.get(HOME_ASSISTANT_TOKEN),
          type: HASSIO_WS_COMMAND.auth,
        });

      case HassSocketMessageTypes.auth_ok:
        this.isAuthenticated = true;
        await this.sendMsg({
          type: HASSIO_WS_COMMAND.subscribe_events,
        });
        this.eventEmitter.emit(HA_SOCKET_READY);
        return;

      case HassSocketMessageTypes.event:
        this.eventEmitter.emit(HA_RAW_EVENT, message.event);
        if (message.event.event_type === HassEvents.state_changed) {
          this.eventEmitter.emit(HA_EVENT_STATE_CHANGE, message.event);
          this.eventEmitter.emit(
            `${message.event.data.entity_id}/update`,
            message.event,
          );
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

  // #endregion Private Methods
}
