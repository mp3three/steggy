import {
  MQTT_CLIENT_INSTANCE,
  MqttMessageTransformer,
  MqttModuleOptions,
} from '@automagical/contracts/utilities';
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect } from 'mqtt';
import { PinoLogger } from 'nestjs-pino';

export const JsonTransform: MqttMessageTransformer = (payload) => {
  return JSON.parse(payload.toString('utf-8'));
};

export const TextTransform: MqttMessageTransformer = (payload) => {
  return payload.toString('utf-8');
};

export function getTransform(
  transform: 'json' | 'text' | MqttMessageTransformer,
): typeof TextTransform {
  if (typeof transform === 'function') {
    return transform;
  } else {
    return transform === 'text' ? TextTransform : JsonTransform;
  }
}
export function createClientProvider(): Provider {
  return {
    inject: [ConfigService, PinoLogger],
    provide: MQTT_CLIENT_INSTANCE,
    useFactory: (configService: ConfigService, logger: PinoLogger) => {
      const options: MqttModuleOptions = {
        host: '10.0.0.33',
        port: 1883,
      };
      const client = connect(options);

      client.on('connect', () => {
        logger.info('MQTT connected');
      });

      client.on('disconnect', (packet) => {
        logger.info({ packet }, 'MQTT disconnected');
      });

      client.on('error', (error) => {
        logger.error({ error }, 'MQTT error');
      });

      client.on('reconnect', () => {
        logger.info('MQTT reconnecting');
      });

      client.on('close', () => {
        logger.info('MQTT closed');
      });

      client.on('offline', () => {
        logger.info('MQTT offline');
      });

      return client;
    },
  };
}
