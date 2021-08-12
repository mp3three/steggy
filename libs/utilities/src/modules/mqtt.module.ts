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
import { DiscoveryModule } from '@nestjs/core';
import { connect } from 'mqtt';

import { LibraryModule } from '../decorators/library-module.decorator';
import {
  AutoConfigService,
  MQTTExplorerService,
  MqttService,
} from '../services';

@LibraryModule({
  exports: [MqttService, MQTT_CLIENT_INSTANCE],
  imports: [DiscoveryModule],
  library: LIB_UTILS,
  providers: [
    {
      inject: [AutoConfigService, ACTIVE_APPLICATION],
      provide: MQTT_CLIENT_INSTANCE,
      useFactory: (configService: AutoConfigService, application: symbol) => {
        const client = connect({
          host: configService.get(MQTT_HOST),
          port: Number(configService.get(MQTT_PORT)),
        });
        setInterval(() => {
          if (!client.connected) {
            return;
          }
          client.publish(MQTT_HEALTH_CHECK, application.description);
        }, 1000);
        return client;
      },
    },
    MQTTExplorerService,
    MqttService,
  ],
})
export class MQTTModule {}
