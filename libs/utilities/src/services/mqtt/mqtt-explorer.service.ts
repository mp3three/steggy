import { LOG_LEVEL } from '@automagical/contracts/config';
import type {
  MqttSubscribeOptions,
  MqttSubscriber,
} from '@automagical/contracts/utilities';
import {
  LOG_CONTEXT,
  MQTT_SUBSCRIBE_OPTIONS,
  MQTT_SUBSCRIBER_PARAMS,
  MqttSubscriberParameter,
} from '@automagical/contracts/utilities';
import { Injectable } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Client } from 'mqtt';
import { Packet } from 'mqtt-packet';

import { InjectMQTT } from '../../decorators/injectors/inject-mqtt.decorator';
import { Trace } from '../../decorators/logger/trace.decorator';
import { SAFE_CALLBACK } from '../../includes';
import { AutoConfigService } from '../auto-config.service';
import { AutoLogService } from '../logger';

/* eslint-disable no-loops/no-loops, security/detect-object-injection, security/detect-non-literal-regexp */

@Injectable()
export class MQTTExplorerService {
  // #region Private Static Methods

  private static matchGroups(string: string, regex: RegExp) {
    regex.lastIndex = 0;
    let m = regex.exec(string);
    const matches: string[] = [];

    while (m !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      // The result can be accessed through the `m`-variable.
      m.forEach((match, groupIndex) => {
        if (groupIndex !== 0) {
          matches.push(match);
        }
      });
      m = regex.exec(string);
    }
    return matches;
  }

  private static topicToRegexp(topic: string) {
    // compatible with emqtt
    return new RegExp(
      '^' +
        topic
          .replace('$queue/', '')
          .replace(/^\$share\/([\dA-Za-z]+)\//, '')
          .replace(/([$()*.?[\\\]^|])/g, '\\$1')
          .replace(/\+/g, '([^/]+)')
          .replace(/\/#$/, '(/.*)?') +
        '$',
      'y',
    );
  }

  // #endregion Private Static Methods

  // #region Object Properties

  public subscribers: MqttSubscriber[] = [];

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly logger: AutoLogService,
    @InjectMQTT() private readonly client: Client,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
    private readonly configService: AutoConfigService,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  @Trace()
  protected onApplicationBootstrap(): void {
    this.scanForSubscribers();
    this.listenForMessages();
    this.logger.info(`MQTT initialized`);
  }

  @Trace()
  protected onModuleInit(): void {
    const client = this.client;

    client.on('connect', () => {
      this.logger.info('MQTT connected');
    });

    client.on('disconnect', (packet) => {
      this.logger.warn({ packet }, 'MQTT disconnected');
    });

    client.on('error', (error) => {
      this.logger.error({ error }, 'MQTT error');
    });

    client.on('reconnect', () => {
      this.logger.debug('MQTT reconnecting');
    });

    client.on('close', () => {
      this.logger.debug('MQTT closed');
    });

    client.on('offline', () => {
      this.logger.warn('MQTT offline');
    });
  }

  // #endregion Protected Methods

  // #region Private Methods

  @Trace()
  private getSubscriber(topic: string): MqttSubscriber {
    for (const subscriber of this.subscribers) {
      subscriber.regexp.lastIndex = 0;
      if (subscriber.regexp.test(topic)) {
        return subscriber;
      }
    }
  }

  @Trace()
  private listenForMessages() {
    this.client.on(
      'message',
      (topic: string, payload: Buffer, packet: Packet) => {
        const subscriber = this.getSubscriber(topic);
        if (subscriber) {
          const parameters = subscriber.parameters || [];
          const scatterParameters: MqttSubscriberParameter[] = [];
          for (const parameter of parameters) {
            scatterParameters[parameter.index] = parameter;
          }
          try {
            // add a option to do something before handle message.
            if (this.configService.get(LOG_LEVEL) !== 'silent') {
              this.logger.info(`>>> MQTT Message ${topic}`);
            }
            subscriber.handle(
              ...this.mapParameters({
                packet,
                payload,
                scatterParameters,
                subscriber,
                topic,
              }),
            );
          } catch (error) {
            this.logger.error({ error }, 'message failed');
          }
        }
      },
    );
  }

  @Trace()
  private mapParameters({
    scatterParameters,
    topic,
    subscriber,
    packet,
    payload,
  }: {
    scatterParameters: MqttSubscriberParameter[];
    topic: string;
    payload: Buffer;
    packet: Packet;
    subscriber: MqttSubscriber;
  }) {
    return scatterParameters.map((parameter) => {
      switch (parameter?.type) {
        case 'payload':
          const out = this.handlePayload(payload);
          if (this.configService.get(LOG_LEVEL) !== 'silent') {
            this.logger.debug({
              payload: out,
            });
          }
          return out;
        case 'topic':
          return topic;
        case 'packet':
          return packet;
        case 'params':
          return MQTTExplorerService.matchGroups(topic, subscriber.regexp);
      }
    });
  }

  @Trace()
  private preprocess(options: MqttSubscribeOptions): string | string[] {
    const processTopic = (topic) => {
      const { queue, share } = options;
      topic = topic
        .replace('$queue/', '')
        .replace(/^\$share\/([\dA-Za-z]+)\//, '');
      if (queue) {
        return `$queue/${topic}`;
      }

      if (share) {
        return `$share/${share}/${topic}`;
      }

      return topic;
    };
    return Array.isArray(options.topic)
      ? options.topic.map((topic) => processTopic(topic))
      : processTopic(options.topic);
  }

  @Trace()
  private scanForSubscribers() {
    const providers: InstanceWrapper[] = this.discoveryService
      .getProviders()
      .filter((wrapper) => wrapper.isDependencyTreeStatic());
    providers.forEach((wrapper: InstanceWrapper) => {
      const { instance } = wrapper;
      if (!instance) {
        return;
      }
      this.metadataScanner.scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        (key) => {
          const subscribeOptions: MqttSubscribeOptions = this.reflector.get(
            MQTT_SUBSCRIBE_OPTIONS,
            instance[key],
          );
          const parameters = this.reflector.get(
            MQTT_SUBSCRIBER_PARAMS,
            instance[key],
          );
          if (subscribeOptions) {
            this.logger.debug(
              `${instance.constructor[LOG_CONTEXT]}#${key} subscribe {${subscribeOptions.topic}}`,
            );
            this.subscribe(
              subscribeOptions,
              parameters,
              SAFE_CALLBACK(instance, key),
            );
          }
        },
      );
    });
  }

  @Trace()
  private subscribe(
    options: MqttSubscribeOptions,
    parameters: MqttSubscriberParameter[],
    handle: (...parameters) => void,
  ): void {
    this.client.subscribe(this.preprocess(options), (error) => {
      if (!error) {
        (Array.isArray(options.topic)
          ? options.topic
          : [options.topic]
        ).forEach((topic) => {
          this.subscribers.push({
            handle,
            options,
            parameters,
            regexp: MQTTExplorerService.topicToRegexp(topic),
            route: topic
              .replace('$queue/', '')
              .replace(/^\$share\/([\dA-Za-z]+)\//, ''),
            topic,
          });
        });
      } else {
        this.logger.error(`Subscribe failed {${options.topic}}`);
      }
    });
  }

  private handlePayload(payload: Buffer): unknown {
    const text = payload.toString('utf-8');
    if (!['{', '['].includes(text.charAt(0))) {
      return text;
    }
    return JSON.parse(text);
  }

  // #endregion Private Methods
}
