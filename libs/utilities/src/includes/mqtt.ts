import { MQTT_HOST, MQTT_PORT } from '@automagical/contracts/config';
import { LIB_UTILS } from '@automagical/contracts/constants';
import {
  MQTT_CLIENT_INSTANCE,
  MqttMessageTransformer,
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

const logger = new PinoLogger({
  pinoHttp: {
    level: 'debug',
  },
});

export function getTransform(
  transform: 'json' | 'text' | MqttMessageTransformer,
): typeof TextTransform {
  if (typeof transform === 'function') {
    return transform;
  } else {
    return transform === 'text' ? TextTransform : JsonTransform;
  }
}
const context = `${LIB_UTILS.description}:includes/mqtt`;
export function createClientProvider(): Provider {
  return {
    inject: [ConfigService],
    provide: MQTT_CLIENT_INSTANCE,
    useFactory: (configService: ConfigService) => {
      const client = connect({
        host: configService.get(MQTT_HOST),
        port: configService.get(MQTT_PORT),
      });

      client.on('connect', () => {
        logger.debug({ context }, 'MQTT connected');
      });

      client.on('disconnect', (packet) => {
        logger.warn({ context, packet }, 'MQTT disconnected');
      });

      client.on('error', (error) => {
        logger.error({ context, error }, 'MQTT error');
      });

      client.on('reconnect', () => {
        logger.debug({ context }, 'MQTT reconnecting');
      });

      client.on('close', () => {
        logger.debug({ context }, 'MQTT closed');
      });

      client.on('offline', () => {
        logger.warn({ context }, 'MQTT offline');
      });

      return client;
    },
  };
}
