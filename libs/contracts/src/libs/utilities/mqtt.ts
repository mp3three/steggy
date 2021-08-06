import { LoggerService, Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { IClientOptions, Packet } from 'mqtt';

import { iRoomController } from '../../interfaces';

export type MqttMessageTransformer = (payload: Buffer) => unknown;

export type LoggerConstructor = new (...parameters) => LoggerService;

export interface MqttSubscribeOptions {
  // #region Object Properties

  queue?: boolean;
  share?: string;
  topic: string | string[];
  transform?: 'json' | 'text' | MqttMessageTransformer;

  // #endregion Object Properties
}

export interface MqttSubscriberParameter {
  // #region Object Properties

  index: number;
  transform?: 'json' | 'text' | MqttMessageTransformer;
  type: 'payload' | 'topic' | 'packet' | 'params';

  // #endregion Object Properties
}

export interface MqttSubscriber {
  // #region Object Properties

  handle: (...parameters) => void;
  options: MqttSubscribeOptions;
  parameters: MqttSubscriberParameter[];
  provider: unknown;
  regexp: RegExp;
  route: string;
  topic: string;

  // #endregion Object Properties
}

export interface MqttLoggerOptions {
  // #region Object Properties

  useClass?: Type<LoggerService>;
  useValue?: LoggerService;

  // #endregion Object Properties
}

export interface MqttModuleOptions extends IClientOptions {
  // #region Object Properties

  beforeHandle?: (topic: string, payload: Buffer, packet: Packet) => unknown;
  logger?: MqttLoggerOptions;
  /**
   * Global queue subscribe.
   * All topic will be prepend '$queue/' prefix automatically.
   * More information is here:
   * https://docs.emqx.io/broker/latest/cn/advanced/shared-subscriptions.html
   */
  queue?: boolean;
  /**
   * Global shared subscribe.
   * All topic will be prepend '$share/group/' prefix automatically.
   * More information is here:
   * https://docs.emqx.io/broker/latest/cn/advanced/shared-subscriptions.html
   */
  share?: string;

  // #endregion Object Properties
}

export interface MqttOptionsFactory {
  // #region Public Methods

  createMqttConnectOptions(): Promise<MqttModuleOptions> | MqttModuleOptions;

  // #endregion Public Methods
}

export interface MqttModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  // #region Object Properties

  inject?: unknown[];
  useClass?: Type<MqttOptionsFactory>;
  useExisting?: Type<MqttOptionsFactory>;
  useFactory?: (
    ...factoryParameters: unknown[]
  ) => Promise<MqttModuleOptions> | MqttModuleOptions;

  // #endregion Object Properties
}

export const MQTT_SUBSCRIBE_OPTIONS = '__mqtt_subscribe_options';
export const MQTT_SUBSCRIBER_PARAMS = '__mqtt_subscriber_params';
export const MQTT_CLIENT_INSTANCE = 'MQTT_CLIENT_INSTANCE';
export const MQTT_OPTION_PROVIDER = 'MQTT_OPTION_PROVIDER';

// internal messages
/**
 * PARAMS = appName: string
 */
export const MQTT_HEALTH_CHECK = 'MQTT_HEALTH_CHECK';
/**
 * PARAMS = roomName: string, state: keyof RoomController
 */
export const SET_ROOM_STATE = 'internal/set_room_state';
export const SEND_ROOM_STATE = (
  room: string,
  action: keyof iRoomController,
): [string, string] => [SET_ROOM_STATE, JSON.stringify([room, action])];
