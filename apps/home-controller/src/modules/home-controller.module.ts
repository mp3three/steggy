import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ApplicationModule, RegisterCache } from '@steggy/boilerplate';
import { ControllerSDKModule } from '@steggy/controller-sdk';
import { HomeAssistantModule } from '@steggy/home-assistant';
import { ConnectService, MongoPersistenceModule } from '@steggy/persistence';
import { ServerModule } from '@steggy/server';
import { existsSync } from 'fs';
import { join } from 'path';

import { NODE_RED_URL, NOTIFY_CONNECTION_RESET } from '../config';
import {
  AdminController,
  AnimationController,
  DebugController,
  DeviceController,
  EntityController,
  GroupController,
  MetadataController,
  PersonController,
  RoomController,
  RoutineController,
} from '../controllers';
import {
  ApplicationService,
  AttributeChangeActivateService,
  CaptureCommandService,
  DeviceTriggerActivateService,
  InternalEventChangeService,
  LightFlashCommandService,
  MetadataChangeService,
  NodeRedCommand,
  RoutineEnabledService,
  RoutineTriggerService,
  ScheduleActivateService,
  SendNotificationService,
  SequenceActivateService,
  SetMetadataService,
  SleepCommandService,
  SolarActivateService,
  StateChangeActivateService,
  StopProcessingCommandService,
  UpdateLoggerService,
  WebhookService,
} from '../services';

const rootPath = join(__dirname, 'ui');

@ApplicationModule({
  application: Symbol('home-controller'),
  configuration: {
    [NODE_RED_URL]: {
      description: 'API target for outgoing node red hooks.',
      type: 'string',
    },
    [NOTIFY_CONNECTION_RESET]: {
      default: true,
      description:
        'Send a notification when home assistant connection is reset',
      type: 'boolean',
    },
  },
  controllers: [
    AdminController,
    AnimationController,
    DebugController,
    DeviceController,
    EntityController,
    GroupController,
    MetadataController,
    PersonController,
    RoomController,
    RoutineController,
  ],
  imports: [
    ControllerSDKModule,
    HomeAssistantModule,
    RegisterCache(),
    MongooseModule.forRootAsync({
      imports: [MongoPersistenceModule],
      inject: [ConnectService],
      useFactory: async (connect: ConnectService) => await connect.build(),
    }),
    ...(existsSync(rootPath) ? [ServeStaticModule.forRoot({ rootPath })] : []),
    ServerModule,
  ],
  providers: [
    ApplicationService,
    AttributeChangeActivateService,
    CaptureCommandService,
    DeviceTriggerActivateService,
    InternalEventChangeService,
    LightFlashCommandService,
    MetadataChangeService,
    NodeRedCommand,
    RoutineEnabledService,
    RoutineTriggerService,
    ScheduleActivateService,
    SendNotificationService,
    SequenceActivateService,
    SetMetadataService,
    SleepCommandService,
    SolarActivateService,
    StateChangeActivateService,
    StopProcessingCommandService,
    UpdateLoggerService,
    WebhookService,
  ],
})
export class HomeControllerModule {}
