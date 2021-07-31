import type {
  MqttModuleOptions,
  MqttSubscribeOptions,
  MqttSubscriber,
} from '@automagical/contracts/utilities';
import {
  MQTT_CLIENT_INSTANCE,
  MQTT_OPTION_PROVIDER,
  MQTT_SUBSCRIBE_OPTIONS,
  MQTT_SUBSCRIBER_PARAMS,
  MqttSubscriberParameter,
} from '@automagical/contracts/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Client } from 'mqtt';
import { Packet } from 'mqtt-packet';
import { PinoLogger } from 'nestjs-pino';

import { InjectLogger, Trace } from '../../decorators';

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
    @InjectLogger()
    private readonly logger: PinoLogger,
    @Inject(MQTT_CLIENT_INSTANCE) private readonly client: Client,
    @Inject(MQTT_OPTION_PROVIDER) private readonly options: MqttModuleOptions,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  @Trace()
  protected onApplicationBootstrap(): void {
    this.listenForMessages();
  }

  @Trace()
  protected onModuleInit(): void {
    this.scanForSubscribers();
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
            if (this.options.beforeHandle) {
              this.options.beforeHandle(topic, payload, packet);
            }

            subscriber.handle.bind(subscriber.provider)(
              ...scatterParameters.map((parameter) => {
                switch (parameter?.type) {
                  case 'payload':
                    return this.handlePayload(payload);
                  case 'topic':
                    return topic;
                  case 'packet':
                    return packet;
                  case 'params':
                    return MQTTExplorerService.matchGroups(
                      topic,
                      subscriber.regexp,
                    );
                }
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
  private preprocess(options: MqttSubscribeOptions): string | string[] {
    const processTopic = (topic) => {
      const queue =
        typeof options.queue === 'boolean' ? options.queue : this.options.queue;
      const share =
        typeof options.share === 'string' ? options.share : this.options.share;
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
    const providers: InstanceWrapper[] = this.discoveryService.getProviders();
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
            this.logger.info(
              `MQTT Subscribe ${instance.constructor.name}#${key} (${subscribeOptions.topic})`,
            );
            this.subscribe(
              subscribeOptions,
              parameters,
              instance[key],
              instance,
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
    provider: unknown,
  ): void {
    this.client.subscribe(this.preprocess(options), (error) => {
      if (!error) {
        // put it into this.subscribers;
        (Array.isArray(options.topic)
          ? options.topic
          : [options.topic]
        ).forEach((topic) => {
          this.subscribers.push({
            handle,
            options,
            parameters,
            provider,
            regexp: MQTTExplorerService.topicToRegexp(topic),
            route: topic
              .replace('$queue/', '')
              .replace(/^\$share\/([\dA-Za-z]+)\//, ''),
            topic,
          });
        });
      } else {
        this.logger.error(`subscribe topic [${options.topic} failed]`);
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
