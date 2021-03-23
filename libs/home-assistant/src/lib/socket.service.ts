import { Logger } from '@automagical/logger';
import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import { EventEmitter } from 'events';
import fetch from 'node-fetch';
import * as WS from 'ws';
import {
  HassCommands,
  HassDomains,
  HassServices,
  HassSocketMessageTypes,
} from '../typings';
import { EntityStateDTO } from './dto';
import { BaseEntity } from './entities';

export type hassioConfig = {
  base: string;
  token: string;
};
type SocketMessage = {
  type: HassCommands;
  id?: number;
  domain?: HassDomains;
  service?: HassServices | string;
  service_data?: any;
  access_token?: string;
};

@Injectable()
export class SocketService extends EventEmitter {
  // #region Static Properties

  private static PING_INTERVAL = 1000 * 15;
  private static RESPONSE_TIMEOUT = 1000 * 30;

  // #endregion Static Properties

  // #region Object Properties

  private readonly config: hassioConfig = {
    base: process.env.HOMEASSISTANT_HOST,
    token: process.env.HOMEASSISTANT_TOKEN,
  };

  private connection: WebSocket;
  private isAuthenticated = false;
  private logger = Logger(SocketService);
  private messageCount = 1;
  private waitingCallback: {
    [key: number]: {
      data: any;
      done: (result) => void;
    };
  } = {};

  // #endregion Object Properties

  // #region Constructors

  constructor() {
    super();
    this.initConnection();
  }

  // #endregion Constructors

  // #region Public Methods

  public call(
    domain: HassDomains,
    service: HassServices | string,
    service_data: any,
  ) {
    if (BaseEntity.DISABLE_INTERACTIONS) {
      this.logger.warning(
        `${domain}.${service} bocked: ${service_data.entity_id}`,
      );
      return;
    }
    return this.sendMsg({
      type: HassCommands.call_service,
      domain,
      service,
      service_data,
    });
  }

  public async fetchEntityHistory(days: number, entity_id: string) {
    const historyStart = dayjs().subtract(days, 'd');
    const url = `https://${
      this.config.base
    }/api/history/period/${historyStart.toISOString()}?filter_entity_id=${entity_id}&end_time=${dayjs().toISOString()}&significant_changes_only`;
    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.config.token}`,
        },
      });
      return response.json();
    } catch (err) {
      this.logger.error(err);
      return [];
    }
  }

  public sendMqtt(topic: string, payload: Record<string, unknown>) {
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

  public async updateAllEntities() {
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
    if (!!this.connection) {
      return;
    }
    try {
      this.connection = new WS(`wss://${this.config.base}/api/websocket`);
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
          access_token: this.config.token,
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
      case HassSocketMessageTypes.pong:
        if (this.waitingCallback[msg.id]) {
          const f = this.waitingCallback[msg.id].done;
          delete this.waitingCallback[msg.id];
          f(msg);
        }
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

  private sendMsg(data: SocketMessage) {
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
          done(res);
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
