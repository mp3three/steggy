import { DiscoveryModule } from '@nestjs/core';
import { LibraryModule } from '@text-based/utilities';

import { LIB_MQTT } from '../config';
import { MQTT_CLIENT_INSTANCE } from '../contracts';
import {
  MQTTClientInstanceService,
  MQTTExplorerService,
  MqttService,
} from '../services';

@LibraryModule({
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
