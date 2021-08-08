import {
  HOME_ASSISTANT_BASE_URL,
  HOME_ASSISTANT_TOKEN,
} from '@automagical/contracts/config';
import {
  ALL_ENTITIES_UPDATED,
  CONNECTION_RESET,
  HA_EVENT_STATE_CHANGE,
  HA_SOCKET_READY,
} from '@automagical/contracts/constants';
import {
  AreaDTO,
  DeviceListItemDTO,
  EntityListItemDTO,
  HassEventDTO,
  HassEvents,
  HASSIO_WS_COMMAND,
  HassSocketMessageTypes,
  HassStateDTO,
  SendSocketMessageDTO,
  SocketMessageDTO,
} from '@automagical/contracts/home-assistant';
import {
  AutoConfigService,
  AutoLogService,
  EmitAfter,
  InjectLogger,
  Trace,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Observable, Subscriber } from 'rxjs';
import WS from 'ws';

@Injectable()
export class HASocketAPIService {
  // #region Object Properties

  public EVENT_STREAM: Observable<HassEventDTO>;

  private connection: WS;
  private messageCount = 1;
  private subscriber: Subscriber<HassEventDTO>;
  private waitingCallback = new Map<number, (result) => void>();

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger()
    protected readonly logger: AutoLogService,
    private readonly configService: AutoConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.EVENT_STREAM = new Observable(
      (subscriber) => (this.subscriber = subscriber),
    );
  }

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
      // You want know how annoying this one was to debug?!
      data.id = counter;
    }
    this.connection.send(JSON.stringify(data));
    if (!waitForResponse) {
      return;
    }
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
      this.logger.error({ error }, `ping error`);
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
   */
  @Trace()
  private initConnection(reset = false): void {
    if (reset) {
      this.eventEmitter.emit(CONNECTION_RESET);
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
      this.logger.error({ error }, `initConnection error`);
    }
  }

  /**
   * Called on incoming message.
   * Intended to interpret the basic concept of the message,
   * and route it to the correct callback / global channel / etc
   *
   * ## auth_required
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
    const id = Number(message.id);
    switch (message.type as HassSocketMessageTypes) {
      case HassSocketMessageTypes.auth_required:
        return await this.sendMsg({
          access_token: this.configService.get(HOME_ASSISTANT_TOKEN),
          type: HASSIO_WS_COMMAND.auth,
        });

      case HassSocketMessageTypes.auth_ok:
        await this.sendMsg({
          type: HASSIO_WS_COMMAND.subscribe_events,
        });
        this.eventEmitter.emit(HA_SOCKET_READY);
        return;

      case HassSocketMessageTypes.event:
        if (message.event.event_type === HassEvents.state_changed) {
          this.eventEmitter.emit(HA_EVENT_STATE_CHANGE, message.event);
          this.subscriber.next(message.event);
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
