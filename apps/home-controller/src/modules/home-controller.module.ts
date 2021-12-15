import {
  HomeControllerCustomModule,
  HomePersistenceModule,
} from '@for-science/controller-logic';
import { HomeAssistantModule } from '@for-science/home-assistant';
import { ServerModule } from '@for-science/server';
import { ApplicationModule } from '@for-science/utilities';

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
import { ApplicationService } from '../services';

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
  providers: [ApplicationService],
})
export class HomeControllerModule {}
