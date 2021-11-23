/* eslint-disable unicorn/no-null */
import {
  AutoLogService,
  Cron,
  CronExpression,
  EmitAfter,
  InjectConfig,
  InjectLogger,
  sleep,
} from '@ccontour/utilities';
import { Injectable } from '@nestjs/common';
import EventEmitter from 'eventemitter3';
import WS from 'ws';

import {
  BASE_URL,
  CRASH_REQUESTS_PER_SEC,
  RENDER_TIMEOUT,
  TOKEN,
  WARN_REQUESTS_PER_SEC,
  WEBSOCKET_URL,
} from '../config';
import type { HassConfig, SOCKET_MESSAGES } from '../contracts';
import {
  ALL_ENTITIES_UPDATED,
  AreaDTO,
  CONNECTION_RESET,
  DeviceListItemDTO,
  EntityListItemDTO,
  HA_EVENT_STATE_CHANGE,
  HA_SOCKET_READY,
  HassStateDTO,
  SocketMessageDTO,
} from '../contracts';
import {
  HassEvents,
  HASSIO_WS_COMMAND,
  HassSocketMessageTypes,
} from '../contracts/enums';

const STARTING_COUNTER_ID = 0;
const SECOND = 1000;
let MESSAGE_TIMESTAMPS: number[] = [];

@Injectable()
export class HASocketAPIService {
  constructor(
    @InjectLogger()
    private readonly logger: AutoLogService,
    private readonly eventEmitter: EventEmitter,
    @InjectConfig(BASE_URL)
    private readonly baseUrl: string,
    @InjectConfig(TOKEN)
    private readonly token: string,
    @InjectConfig(WARN_REQUESTS_PER_SEC) private readonly WARN_REQUESTS: number,
    @InjectConfig(CRASH_REQUESTS_PER_SEC)
    private readonly CRASH_REQUESTS: number,
    @InjectConfig(WEBSOCKET_URL) private readonly websocketUrl: string,
    @InjectConfig(RENDER_TIMEOUT) private readonly renderTimeout: number,
  ) {}

  private CONNECTION_ACTIVE = false;
  private connection: WS;
  private messageCount = STARTING_COUNTER_ID;
  private waitingCallback = new Map<number, (result) => void>();

  /**
   * Request a current listing of all entities + their states
   *
   * This can be a pretty big list
   */
  @EmitAfter(ALL_ENTITIES_UPDATED, { emitData: 'result' })
  public async getAllEntitities(): Promise<HassStateDTO[]> {
    this.logger.debug('Update all entities');
    return await this.sendMsg<HassStateDTO[]>({
      type: HASSIO_WS_COMMAND.get_states,
    });
  }

  public async getAreas(): Promise<AreaDTO[]> {
    return await this.sendMsg({
      type: HASSIO_WS_COMMAND.area_list,
    });
  }

  public async getConfig(): Promise<HassConfig> {
    return await this.sendMsg({
      type: HASSIO_WS_COMMAND.get_config,
    });
  }

  public async listDevices(): Promise<DeviceListItemDTO[]> {
    return await this.sendMsg({
      type: HASSIO_WS_COMMAND.device_list,
    });
  }

  public async listEntities(): Promise<EntityListItemDTO[]> {
    return await this.sendMsg({
      type: HASSIO_WS_COMMAND.entity_list,
    });
  }

  public async renderTemplate(template: string): Promise<string> {
    const out: string = await this.sendMsg({
      template,
      timeout: this.renderTimeout,
      type: HASSIO_WS_COMMAND.render_template,
    });
    return out;
  }

  /**
   * Send a message to HomeAssistant. Optionally, wait for a reply to come back & return
   */

  public async sendMsg<T extends unknown = unknown>(
    data: SOCKET_MESSAGES,
    waitForResponse = true,
  ): Promise<T> {
    this.countMessage();
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
    const json = JSON.stringify(data);
    this.connection.send(json);
    if (!waitForResponse) {
      return;
    }
    return new Promise((done) => this.waitingCallback.set(counter, done));
  }

  public async updateEntity(
    entity: string,
    data: { name?: string; new_entity_id?: string },
  ): Promise<unknown> {
    return await this.sendMsg({
      area_id: null,
      entity_id: entity,
      icon: null,
      name: data.name,
      new_entity_id: data.new_entity_id || entity,
      type: HASSIO_WS_COMMAND.entity_update,
    });
  }

  protected async onPostInit(): Promise<void> {
    // Kick off the connection process
    // Do not wait for it to actually complete through auth though
    //
    // That causes some race conditions that screw with the state managers
    // The current flow forces the auth frames to get sent after app is started
    await this.initConnection();
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  protected async ping(): Promise<void> {
    // Race conditions where ping fires before socket finishes it's init is freakily common
    // Doesn't actually hurt anything, but it leaves an annoying boot error message
    if (!this.CONNECTION_ACTIVE) {
      return;
    }
    const now = Date.now();
    // Prune old data
    MESSAGE_TIMESTAMPS = MESSAGE_TIMESTAMPS.filter(
      (time) => time > now - SECOND,
    );
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

  private countMessage(): void | never {
    this.messageCount++;
    const now = Date.now();
    MESSAGE_TIMESTAMPS.push(now);
    const count = MESSAGE_TIMESTAMPS.filter(
      (time) => time > now - SECOND,
    ).length;
    if (count > this.CRASH_REQUESTS) {
      // TODO: Attempt to emit a notification via home assistant prior to dying
      // "HALP!"
      this.logger.fatal(
        `FATAL ERROR: Exceeded {CRASH_REQUESTS_PER_MIN} threshold.`,
      );
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit();
    }
    if (count > this.WARN_REQUESTS) {
      this.logger.warn(
        `Message traffic ${this.CRASH_REQUESTS}>${count}>${this.WARN_REQUESTS}`,
      );
    }
  }

  /**
   * Set up a new websocket connection to home assistant
   */

  private initConnection(reset = false): void {
    if (reset) {
      this.eventEmitter.emit(CONNECTION_RESET);
      this.connection = undefined;
    }
    if (this.connection) {
      return;
    }
    this.CONNECTION_ACTIVE = false;
    const url = new URL(this.baseUrl);
    try {
      this.messageCount = STARTING_COUNTER_ID;
      this.logger.debug('Creating new socket connection');
      this.connection = new WS(
        this.websocketUrl ||
          `${url.protocol === `http:` ? `ws:` : `wss:`}//${url.hostname}${
            url.port ? `:${url.port}` : ``
          }/api/websocket`,
      );
      this.connection.addEventListener('message', (message) => {
        this.onMessage(JSON.parse(message.data.toString()));
      });
      this.connection.on('error', (error) => {
        this.logger.error({ error: error.message || error }, 'Socket error');
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
        this.CONNECTION_ACTIVE = true;
        await this.sendMsg({
          type: HASSIO_WS_COMMAND.subscribe_events,
        });
        this.logger.info('🏡 Home Assistant socket ready 🏡');
        this.eventEmitter.emit(HA_SOCKET_READY);
        return;

      case HassSocketMessageTypes.event:
        return await this.onMessageEvent(id, message);

      case HassSocketMessageTypes.pong:
        // 🏓
        if (this.waitingCallback.has(id)) {
          const f = this.waitingCallback.get(id);
          this.waitingCallback.delete(id);
          f(message);
        }
        return;

      case HassSocketMessageTypes.result:
        return await this.onMessageResult(id, message);

      case HassSocketMessageTypes.auth_invalid:
        this.CONNECTION_ACTIVE = false;
        this.logger.fatal(message.message);
        return;

      default:
        // Code error probably
        this.logger.error(`Unknown websocket message type: ${message.type}`);
    }
  }

  private onMessageEvent(id: number, message: SocketMessageDTO) {
    if (message.event.event_type === HassEvents.state_changed) {
      this.eventEmitter.emit(HA_EVENT_STATE_CHANGE, message.event);
    }
    if (this.waitingCallback.has(id)) {
      // Template rendering
      const f = this.waitingCallback.get(id);
      this.waitingCallback.delete(id);
      f(message.event.result);
    }
  }

  private async onMessageResult(id: number, message: SocketMessageDTO) {
    if (this.waitingCallback.has(id)) {
      if (message.error) {
        this.logger.error({ message });
      }
      if (message.result === null || typeof message.result === 'undefined') {
        // This happens with template rendering requests
        // Home Assistant initially replies back with an invalid result
        // Then follows up with an event using the same id, which contains the real result
        //
        // See if the event will claim this callback first.
        await sleep(this.renderTimeout + SECOND);
        if (!this.waitingCallback.has(id)) {
          return;
        }
      }
      const f = this.waitingCallback.get(id);
      this.waitingCallback.delete(id);
      f(message.result);
    }
  }
}
