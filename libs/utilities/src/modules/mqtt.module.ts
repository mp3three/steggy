import { LIB_UTILS } from '@automagical/contracts/constants';
import {
  MQTT_CLIENT_INSTANCE,
  MQTT_OPTION_PROVIDER,
} from '@automagical/contracts/utilities';
import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { LoggableModule } from '../decorators';
import { createClientProvider } from '../includes';
import { MQTTExplorerService, MqttService } from '../services';

@Global()
@Module({
  exports: [MqttService, MQTT_CLIENT_INSTANCE],
  imports: [DiscoveryModule],
  providers: [
    createClientProvider(),
    {
      provide: MQTT_OPTION_PROVIDER,
      useValue: {},
    },
    MQTTExplorerService,
    MqttService,
  ],
})
@LoggableModule(LIB_UTILS)
export class MQTTModule {}
