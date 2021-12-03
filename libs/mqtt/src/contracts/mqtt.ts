import { LoggerService, Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { IClientOptions, IClientSubscribeOptions } from 'mqtt';

export type MqttMessageTransformer = (payload: Buffer) => unknown;

export type LoggerConstructor = new (...parameters) => LoggerService;

export interface MqttSubscribeOptions extends Partial<IClientSubscribeOptions> {
  omitIncoming?: boolean;
  topic?: string | string[];
}

export interface MqttSubscriberParameter {
  index: number;
  transform?: 'json' | 'text' | MqttMessageTransformer;
  type: 'payload' | 'topic' | 'packet' | 'params';
}

export interface MqttSubscriber {
  handle: (...parameters) => void;
  options: MqttSubscribeOptions;
  parameters: MqttSubscriberParameter[];
  // provider: unknown;
  regexp: RegExp;
  route: string;
  topic: string;
}

export interface MqttLoggerOptions {
  useClass?: Type<LoggerService>;
  useValue?: LoggerService;
}

export interface MqttModuleOptions extends IClientOptions {
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
}

export interface MqttOptionsFactory {
  createMqttConnectOptions(): Promise<MqttModuleOptions> | MqttModuleOptions;
}

export interface MqttModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: unknown[];
  useClass?: Type<MqttOptionsFactory>;
  useExisting?: Type<MqttOptionsFactory>;
  useFactory?: (
    ...factoryParameters: unknown[]
  ) => Promise<MqttModuleOptions> | MqttModuleOptions;
}

// export const MQTT_SUBSCRIBER_PARAMS = '__mqtt_subscriber_params';
export const MQTT_CLIENT_INSTANCE = 'MQTT_CLIENT_INSTANCE';

// internal messages
/**
 * PARAMS = appName: string
 */

export const SEND_ROOM_STATE = (room: string, action: string): string =>
  ['internal', 'set_room_state', room, action].join('/');

export const MQTT_CONNECT = Symbol('MQTT_CONNECT');
export const MQTT_DISCONNECT = Symbol('MQTT_DISCONNECT');
export const MQTT_ERROR = Symbol('MQTT_ERROR');
export const MQTT_RECONNECT = Symbol('MQTT_RECONNECT');
export const MQTT_CLOSE = Symbol('MQTT_CLOSE');
export const MQTT_OFFLINE = Symbol('MQTT_OFFLINE');
