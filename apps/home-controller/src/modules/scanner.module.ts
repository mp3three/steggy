import {
  HomeControllerCustomModule,
  HomePersistenceModule,
} from '@ccontour/controller-logic';
import { HomeAssistantModule } from '@ccontour/home-assistant';
import { ServerModule } from '@ccontour/server';
import { MainCLIModule } from '@ccontour/tty';
import { APP_HOME_CONTROLLER, ApplicationModule } from '@ccontour/utilities';

import {
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
    HomeControllerCustomModule.forRoot(),
    HomePersistenceModule.forRoot(),
    MainCLIModule,
  ],
  providers: [ApplicationService],
})
export class ScannerControllerModule {}
