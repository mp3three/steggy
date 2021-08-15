import type { MqttSubscriber } from '@automagical/contracts/utilities';
import {
  LOG_CONTEXT,
  MQTT_SUBSCRIBER_PARAMS,
} from '@automagical/contracts/utilities';
import { Injectable } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { Client } from 'mqtt';

import { MQTT_SUBSCRIBE_OPTIONS } from '../../decorators';
import { InjectMQTT } from '../../decorators/injectors/inject-mqtt.decorator';
import { Trace } from '../../decorators/logger/trace.decorator';
import { AutoLogService } from '../logger';
import { MqttService } from './mqtt.service';

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
    private readonly mqttService: MqttService,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  @Trace()
  protected onApplicationBootstrap(): void {
    this.scanForSubscribers();
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
          const subscribeOptions =
            instance.__proto__[key][MQTT_SUBSCRIBE_OPTIONS];
          const parameters = this.reflector.get(
            MQTT_SUBSCRIBER_PARAMS,
            instance[key],
          );
          if (subscribeOptions) {
            const topics =
              typeof subscribeOptions.topic === 'string'
                ? [subscribeOptions.topic]
                : subscribeOptions.topic;
            topics.forEach((topic) => {
              this.logger.debug(
                `${instance.constructor[LOG_CONTEXT]}#${key} subscribe {${topic}}`,
              );
              this.mqttService.subscribe(
                topic,
                async (value, packet) => {
                  await instance[key](value, { packet, topic });
                },
                parameters,
              );
            });
          }
        },
      );
    });
  }

  // #endregion Private Methods
}
