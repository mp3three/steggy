import { ApplicationModule } from '@automagical/boilerplate';
import {
  HomeControllerCustomModule,
  HomePersistenceModule,
} from '@automagical/controller-logic';
import { HomeAssistantModule } from '@automagical/home-assistant';
import { ServerModule } from '@automagical/server';
import { ServeStaticModule } from '@nestjs/serve-static';
import { existsSync } from 'fs';
import { join } from 'path';

import {
  AdminController,
  AnimationController,
  DebugController,
  DeviceController,
  EntityController,
  GroupController,
  RoomController,
  RoutineController,
} from '../controllers';
import { ApplicationService, AvailabilityMonitorService } from '../services';

const rootPath = join(__dirname, 'ui');

@ApplicationModule({
  application: Symbol('home-controller'),
  controllers: [
    AdminController,
    AnimationController,
    DebugController,
    DeviceController,
    EntityController,
    GroupController,
    RoomController,
    RoutineController,
  ],
  imports: [
    ServerModule,
    HomeAssistantModule,
    HomeControllerCustomModule,
    HomePersistenceModule.forRoot(),
    ...(existsSync(rootPath)
      ? [
          ServeStaticModule.forRoot({
            rootPath,
          }),
        ]
      : []),
  ],
  providers: [ApplicationService, AvailabilityMonitorService],
})
export class HomeControllerModule {}
