import {
  MQTT_OPTION_PROVIDER,
  MqttModuleOptions,
} from '@automagical/contracts/utilities';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { createClientProvider } from '../includes';
import { MqttExplorerService, MqttService } from '../services';

/**
 * Module based off nest-mqtt
 */
@Global()
@Module({
  exports: [MqttService],
  imports: [DiscoveryModule],
})
export class MqttModule {
  // #region Public Static Methods

  public static forRoot(options: MqttModuleOptions): DynamicModule {
    return {
      exports: [],
      module: MqttModule,
      providers: [
        {
          provide: MQTT_OPTION_PROVIDER,
          useValue: options,
        },
        createClientProvider(),
        MqttExplorerService,
        MqttService,
      ],
    };
  }

  // #endregion Public Static Methods
}
