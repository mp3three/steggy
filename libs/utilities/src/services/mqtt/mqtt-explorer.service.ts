import { Injectable } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { EventEmitter2 } from 'eventemitter2';
import { Client } from 'mqtt';

import {
  LOG_CONTEXT,
  MQTT_CLOSE,
  MQTT_CONNECT,
  MQTT_DISCONNECT,
  MQTT_ERROR,
  MQTT_OFFLINE,
  MQTT_RECONNECT,
  MqttSubscribeOptions,
  MqttSubscriber,
} from '../../contracts';
import { MQTT_SUBSCRIBE_OPTIONS } from '../../decorators';
import { InjectMQTT } from '../../decorators/injectors/inject-mqtt.decorator';
import { Info, Trace } from '../../decorators/logger.decorator';
import { AutoLogService } from '../logger';
import { MqttService } from './mqtt.service';

/* eslint-disable no-loops/no-loops, security/detect-object-injection, security/detect-non-literal-regexp */

@Injectable()
export class MQTTExplorerService {
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

  public subscribers: MqttSubscriber[] = [];

  constructor(
    private readonly logger: AutoLogService,
    @InjectMQTT() private readonly client: Client,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly mqttService: MqttService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Info('[MQTT] initialized')
  protected onApplicationBootstrap(): void {
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
          const subscribeOptions: MqttSubscribeOptions =
            instance.__proto__[key][MQTT_SUBSCRIBE_OPTIONS];

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
                subscribeOptions,
              );
            });
          }
        },
      );
    });
  }

  @Trace()
  protected onModuleInit(): void {
    const client = this.client;

    client.on('connect', () => {
      this.logger.info('MQTT connected');
      this.eventEmitter.emit(MQTT_CONNECT);
    });

    client.on('disconnect', (packet) => {
      this.logger.warn({ packet }, 'MQTT disconnected');
      this.eventEmitter.emit(MQTT_DISCONNECT);
    });

    client.on('error', (error) => {
      this.logger.error({ error }, 'MQTT error');
      this.eventEmitter.emit(MQTT_ERROR);
    });

    client.on('reconnect', () => {
      this.logger.debug('MQTT reconnecting');
      this.eventEmitter.emit(MQTT_RECONNECT);
    });

    client.on('close', () => {
      this.logger.debug('MQTT closed');
      this.eventEmitter.emit(MQTT_CLOSE);
    });

    client.on('offline', () => {
      this.logger.warn('MQTT offline');
      this.eventEmitter.emit(MQTT_OFFLINE);
    });
  }
}
