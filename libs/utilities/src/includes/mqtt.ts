import {
  ACTIVE_APPLICATION,
  MQTT_HOST,
  MQTT_PORT,
} from '@automagical/contracts/config';
import { LIB_UTILS } from '@automagical/contracts/constants';
import {
  MQTT_CLIENT_INSTANCE,
  MQTT_HEALTH_CHECK,
} from '@automagical/contracts/utilities';
import { Provider } from '@nestjs/common';
import { connect } from 'mqtt';

import { AutoLogService } from '../services';
import { AutoConfigService } from '../services/auto-config.service';

const context = `${LIB_UTILS.description}:includes/mqtt`;
export function createClientProvider(): Provider {
  return {
    inject: [AutoConfigService, ACTIVE_APPLICATION],
    provide: MQTT_CLIENT_INSTANCE,
    useFactory: (configService: AutoConfigService, application: symbol) => {
      const client = connect({
        host: configService.get(MQTT_HOST),
        port: configService.get(MQTT_PORT),
      });

      setInterval(() => {
        if (!client.connected) {
          return;
        }
        client.publish(MQTT_HEALTH_CHECK, application.description);
      }, 1000);

      client.on('connect', () => {
        AutoLogService.call('info', context, 'MQTT connected');
      });

      client.on('disconnect', (packet) => {
        AutoLogService.call('warn', context, { packet }, 'MQTT disconnected');
      });

      client.on('error', (error) => {
        AutoLogService.call('error', context, { error }, 'MQTT error');
      });

      client.on('reconnect', () => {
        AutoLogService.call('debug', context, 'MQTT reconnecting');
      });

      client.on('close', () => {
        AutoLogService.call('debug', context, 'MQTT closed');
      });

      client.on('offline', () => {
        AutoLogService.call('warn', context, 'MQTT offline');
      });

      return client;
    },
  };
}
