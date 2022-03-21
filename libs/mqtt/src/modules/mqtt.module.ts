import { LibraryModule } from '@automagical/boilerplate';
import { DiscoveryModule } from '@nestjs/core';

import { LIB_MQTT, MQTT_HOST, MQTT_PORT } from '../config';
import { MQTT_CLIENT_INSTANCE } from '../contracts';
import {
  MQTTClientInstanceService,
  MQTTExplorerService,
  MqttService,
} from '../services';

@LibraryModule({
  configuration: {
    [MQTT_HOST]: {
      default: 'localhost',
      description: 'Configuration property for mqtt connection',
      type: 'string',
    },
    [MQTT_PORT]: {
      default: 1883,
      description: 'Configuration property for mqtt connection',
      type: 'number',
    },
  },
  exports: [MqttService, MQTT_CLIENT_INSTANCE],
  imports: [DiscoveryModule],
  library: LIB_MQTT,
  providers: [
    MQTTClientInstanceService,
    {
      inject: [MQTTClientInstanceService],
      provide: MQTT_CLIENT_INSTANCE,
      useFactory: (instanceService: MQTTClientInstanceService) => {
        return instanceService.createConnection();
      },
    },
    MQTTExplorerService,
    MqttService,
  ],
})
export class MQTTModule {}
