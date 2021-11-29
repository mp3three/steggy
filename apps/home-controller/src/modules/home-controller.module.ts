import {
  HomeControllerCustomModule,
  HomePersistenceModule,
} from '@ccontour/controller-logic';
import { HomeAssistantModule } from '@ccontour/home-assistant';
import { ServerModule } from '@ccontour/server';
import { APP_HOME_CONTROLLER, ApplicationModule } from '@ccontour/utilities';

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
  application: APP_HOME_CONTROLLER,
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
