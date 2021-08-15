import { Injectable } from '@nestjs/common';
import {
  Client,
  IClientPublishOptions,
  IClientSubscribeOptions,
  ISubscriptionGrant,
  Packet,
} from 'mqtt';

import { InjectMQTT } from '../../decorators/injectors/inject-mqtt.decorator';
import { Trace } from '../../decorators/logger/trace.decorator';
import { AutoLogService } from '../logger';

/* eslint-disable radar/no-identical-functions */

export type MqttCallback<T = Record<string, unknown>> = (
  payload: T,
  packet?: Packet,
) => void;

/**
 * DO NOT USE `@InjectMQTT()` WITH THIS!
 */
@Injectable()
export class MqttService {
  // #region Object Properties

  private readonly callbacks = new Map<string, MqttCallback[]>();
  private readonly subscriptions = new Set<string>();

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectMQTT() private readonly client: Client,
    private readonly logger: AutoLogService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public listen(
    topics: string | string[],
    options?: IClientSubscribeOptions,
  ): Promise<ISubscriptionGrant[]> {
    return new Promise((resolve, reject) => {
      topics = typeof topics === 'string' ? [topics] : topics;
      topics = topics.filter((topic) => !this.subscriptions.has(topic));
      if (topics.length === 0) {
        return;
      }
      (topics as string[]).forEach((topic) => {
        this.logger.debug(`Subscribe {${topic}}`);
        this.subscriptions.add(topic);
      });
      this.client.subscribe(topics, options, (error, granted) => {
        if (error) {
          return reject(error);
        }
        resolve(granted);
      });
    });
  }

  @Trace()
  public publish(
    topic: string,
    message: string | Buffer | Record<string, unknown>,
    options?: IClientPublishOptions,
  ): Promise<Packet> {
    return new Promise<Packet>((resolve, reject) => {
      if (typeof message === 'object') {
        message = JSON.stringify(message);
      }
      this.logger.debug(`Publish {${topic}}`);
      this.client.publish(topic, message, options, (error, packet) => {
        if (error) {
          return reject(error);
        }
        resolve(packet);
      });
    });
  }

  @Trace()
  public subscribe(
    topic: string,
    callback: MqttCallback,
    options?: IClientSubscribeOptions,
  ): void {
    this.listen(topic, options);
    const callbacks = this.callbacks.get(topic) ?? [];
    callbacks.push(callback);
    this.callbacks.set(topic, callbacks);
  }

  @Trace()
  public unlisten(
    topic: string,
    options?: Record<string, unknown>,
  ): Promise<Packet> {
    return new Promise<Packet>((resolve, reject) => {
      this.client.unsubscribe(topic, options, (error, packet) => {
        if (error) {
          return reject(error);
        }
        resolve(packet);
      });
    });
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Trace()
  protected onModuleInit(): void {
    this.client.on(
      'message',
      (topic: string, payload: Buffer, packet: Packet) => {
        const callbacks = this.callbacks.get(topic) ?? [];
        if (callbacks.length === 0) {
          this.logger.warn(`Incoming MQTT {${topic}} with no callbacks`);
          return;
        }
        this.logger.debug(`Incoming MQTT {${topic}} (${callbacks.length})`);
        callbacks.forEach((callback) => {
          callback(this.handlePayload(payload), packet);
        });
      },
    );
  }

  // #endregion Protected Methods

  // #region Private Methods

  @Trace()
  private handlePayload<T>(payload: Buffer): T {
    const text = payload.toString('utf-8');
    if (!['{', '['].includes(text.charAt(0))) {
      return text as unknown as T;
    }
    return JSON.parse(text);
  }

  // #endregion Private Methods
}
