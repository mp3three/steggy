import { MQTT_OPTION_PROVIDER } from '@automagical/contracts/utilities';
import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { createClientProvider } from '../includes';
import { MqttExplorerService, MqttService } from '../services';

@Global()
@Module({
  exports: [MqttService],
  imports: [DiscoveryModule],
  providers: [
    createClientProvider(),
    {
      provide: MQTT_OPTION_PROVIDER,
      useValue: {},
    },
    MqttExplorerService,
    MqttService,
  ],
})
export class MQTTModule {}
