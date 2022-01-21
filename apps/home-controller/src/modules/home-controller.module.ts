import { ApplicationModule } from '@text-based/boilerplate';
import {
  HomeControllerCustomModule,
  HomePersistenceModule,
} from '@text-based/controller-logic';
import { HomeAssistantModule } from '@text-based/home-assistant';
import { ServerModule } from '@text-based/server';

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
