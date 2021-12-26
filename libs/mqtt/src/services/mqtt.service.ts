import { Injectable } from '@nestjs/common';
import { AutoLogService, is, IsEmpty } from '@text-based/utilities';
import {
  Client,
  IClientPublishOptions,
  IClientSubscribeOptions,
  ISubscriptionGrant,
  Packet,
} from 'mqtt';

import { MqttSubscribeOptions } from '../contracts';
import { InjectMQTT } from '../decorators';

/* eslint-disable radar/no-identical-functions */

export type MqttCallback<T = Record<string, unknown>> = (
  payload: T,
  packet?: Packet,
) => void;

const FIRST = 0;

/**
 * DO NOT USE `@InjectMQTT()` WITH THIS!
 */
@Injectable()
export class MqttService {
  constructor(
    @InjectMQTT() private readonly client: Client,
    private readonly logger: AutoLogService,
  ) {}

  private readonly callbacks = new Map<
    string,
    [MqttCallback[], MqttSubscribeOptions]
  >();
  private readonly subscriptions = new Set<string>();

  public listen(
    topics: string | string[],
    options?: IClientSubscribeOptions,
  ): Promise<ISubscriptionGrant[]> {
    return new Promise((resolve, reject) => {
      topics = is.string(topics) ? [topics] : topics;
      topics = topics.filter((topic) => !this.subscriptions.has(topic));
      if (IsEmpty(topics)) {
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

  public publish(
    topic: string,
    message: string | Buffer | Record<string, unknown>,
    options?: IClientPublishOptions,
  ): Promise<Packet> {
    return new Promise<Packet>((resolve, reject) => {
      if (is.object(message)) {
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

  public subscribe(
    topic: string,
    callback: MqttCallback,
    options?: MqttSubscribeOptions,
  ): void {
    this.listen(topic, { ...options, qos: 1 });
    const [callbacks, options_] = this.callbacks.get(topic) ?? [
      [] as MqttCallback[],
      options,
    ];
    callbacks.push(callback);
    this.callbacks.set(topic, [callbacks, options_]);
  }

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

  protected onModuleInit(): void {
    this.client.on(
      'message',
      (topic: string, payload: Buffer, packet: Packet) => {
        const [callbacks, options] = this.callbacks.get(topic) ?? [];
        if (IsEmpty(callbacks)) {
          this.logger.warn(`Incoming MQTT {${topic}} with no callbacks`);
          return;
        }
        if (!options?.omitIncoming) {
          this.logger.debug(`Incoming MQTT {${topic}} (${callbacks.length})`);
        }
        callbacks.forEach((callback) => {
          callback(this.handlePayload(payload), packet);
        });
      },
    );
  }

  private handlePayload<T>(payload: Buffer): T {
    const text = payload.toString('utf-8');
    if (!['{', '['].includes(text.charAt(FIRST))) {
      return text as unknown as T;
    }
    return JSON.parse(text);
  }
}
