import { DiscoveryModule } from '@nestjs/core';

import { LIB_UTILS, MQTT_CLIENT_INSTANCE } from '../contracts';
import { LibraryModule } from '../decorators/library-module.decorator';
import {
  MQTTClientInstanceService,
  MQTTExplorerService,
  MqttService,
} from '../services';

@LibraryModule({
  exports: [MqttService, MQTT_CLIENT_INSTANCE],
  imports: [DiscoveryModule],
  library: LIB_UTILS,
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
