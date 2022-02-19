import { ApplicationModule } from '@automagical/boilerplate';
import {
  HomeControllerCustomModule,
  HomePersistenceModule,
} from '@automagical/controller-logic';
import { HomeAssistantModule } from '@automagical/home-assistant';
import { ServerModule } from '@automagical/server';

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
  ],
  providers: [ApplicationService, AvailabilityMonitorService],
})
export class HomeControllerModule {}
