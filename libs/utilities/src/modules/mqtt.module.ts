import { LIB_UTILS } from '@automagical/contracts/constants';
import { MQTT_CLIENT_INSTANCE } from '@automagical/contracts/utilities';
import { DiscoveryModule } from '@nestjs/core';

import { LibraryModule } from '../decorators/library-module.decorator';
import { createClientProvider } from '../includes';
import { MQTTExplorerService, MqttService } from '../services';

@LibraryModule({
  exports: [MqttService, MQTT_CLIENT_INSTANCE],
  imports: [DiscoveryModule],
  library: LIB_UTILS,
  providers: [createClientProvider(), MQTTExplorerService, MqttService],
})
export class MQTTModule {}
