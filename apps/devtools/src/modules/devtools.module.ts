import { APP_DEVTOOLS } from '@automagical/contracts/constants';
import { MinimalSdkModule } from '@automagical/formio-sdk';
import { MainCLIModule } from '@automagical/terminal';
import { LoggableModule, UtilitiesModule } from '@automagical/utilities';
import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { YoinkService } from '../services';

@Module({
  imports: [
    MinimalSdkModule,
    UtilitiesModule,
    EventEmitterModule.forRoot(),
    MainCLIModule,
  ],
  providers: [YoinkService],
})
@LoggableModule(APP_DEVTOOLS)
export class DevtoolsModule {}
