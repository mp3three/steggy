import {
  ACTIVE_APPLICATION,
  MQTT_HOST,
  MQTT_PORT,
} from '@automagical/contracts/config';
import {
  MQTT_CLIENT_INSTANCE,
  MQTT_HEALTH_CHECK,
} from '@automagical/contracts/utilities';
import { Provider } from '@nestjs/common';
import { connect } from 'mqtt';

import { AutoConfigService } from '../services/auto-config.service';

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

      return client;
    },
  };
}
