import { CronExpression } from '@automagical/utilities';
import {
  AutoLogService,
  Cron,
  Debug,
  EmitAfter,
  InjectConfig,
  InjectLogger,
  Trace,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';
import WS from 'ws';

import {
  ALL_ENTITIES_UPDATED,
  AreaDTO,
  CONNECTION_RESET,
  DeviceListItemDTO,
  EntityListItemDTO,
  HA_EVENT_STATE_CHANGE,
  HA_SOCKET_READY,
  HassStateDTO,
  SendSocketMessageDTO,
  SocketMessageDTO,
} from '..';
import { BASE_URL, TOKEN } from '../config';
import {
  HassEvents,
  HASSIO_WS_COMMAND,
  HassSocketMessageTypes,
} from '../contracts/enums';

@Injectable()
export class HASocketAPIService {
  private connection: WS;
  private messageCount = 1;
  private waitingCallback = new Map<number, (result) => void>();

  constructor(
    @InjectLogger()
    private readonly logger: AutoLogService,
    private readonly eventEmitter: EventEmitter2,
    @InjectConfig(BASE_URL)
    private readonly baseUrl: string,
    @InjectConfig(TOKEN)
    private readonly token: string,
  ) {}

  @Debug('List all areas')
  public async getAreas(): Promise<AreaDTO[]> {
    return await this.sendMsg({
      type: HASSIO_WS_COMMAND.area_list,
    });
  }

  @Debug('List all devices')
  public async listDevices(): Promise<DeviceListItemDTO[]> {
    return await this.sendMsg({
      type: HASSIO_WS_COMMAND.device_list,
    });
  }

  @Debug('List all entities')
  public async listEntities(): Promise<EntityListItemDTO[]> {
    return await this.sendMsg({
      type: HASSIO_WS_COMMAND.entity_list,
    });
  }

  /**
   * Request a current listing of all entities + their states
   *
   * This can be a pretty big list
   */
  @EmitAfter(ALL_ENTITIES_UPDATED)
  @Debug('Update all entities')
  public async getAllEntitities(): Promise<HassStateDTO[]> {
    return await this.sendMsg<HassStateDTO[]>({
      type: HASSIO_WS_COMMAND.get_states,
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
    if (this.connection.readyState !== WS.OPEN) {
      this.logger.error(
        { data },
        `Cannot send message, connection is not open`,
      );
      return;
    }
    this.connection.send(JSON.stringify(data));
    if (!waitForResponse) {
      return;
    }
    return new Promise((done) => this.waitingCallback.set(counter, done));
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
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
  protected async onPostInit(): Promise<void> {
    // Kick off the connection process
    // Do not wait for it to actually complete through auth though
    //
    // That causes some race conditions that screw with the state managers
    // The current flow forces the auth frames to get sent after app is started
    await this.initConnection();
  }

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
    const url = new URL(this.baseUrl);
    try {
      this.logger.debug('Creating new socket connection');
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
        this.logger.debug(`Sending auth`);
        return await this.sendMsg({
          access_token: this.token,
          type: HASSIO_WS_COMMAND.auth,
        });

      case HassSocketMessageTypes.auth_ok:
        await this.sendMsg({
          type: HASSIO_WS_COMMAND.subscribe_events,
        });
        this.logger.info('Socket ready');
        this.eventEmitter.emit(HA_SOCKET_READY);
        return;

      case HassSocketMessageTypes.event:
        if (message.event.event_type === HassEvents.state_changed) {
          this.eventEmitter.emit(HA_EVENT_STATE_CHANGE, message.event);
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

      case HassSocketMessageTypes.auth_invalid:
        this.logger.error(message.message);
        return;

      default:
        // Code error probably
        this.logger.error(`Unknown websocket message type: ${message.type}`);
    }
  }
}
