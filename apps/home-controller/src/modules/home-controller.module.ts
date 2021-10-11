import {
  HomeControllerCustomModule,
  HomePersistenceModule,
} from '@automagical/controller-logic';
import { HomeAssistantModule } from '@automagical/home-assistant';
import { ServerModule } from '@automagical/server';
import {
  APP_HOME_CONTROLLER,
  ApplicationModule,
  MQTTModule,
} from '@automagical/utilities';

import {
  DebugController,
  DeviceController,
  EntityController,
  GroupController,
  HAHooksController,
  RoomController,
} from '../controllers';
import { ApplicationService, GarageService } from '../services';

@ApplicationModule({
  application: APP_HOME_CONTROLLER,
  controllers: [
    DebugController,
    DeviceController,
    EntityController,
    GroupController,
    HAHooksController,
    RoomController,
  ],
  imports: [
    MQTTModule,
    ServerModule,
    HomeAssistantModule,
    HomeControllerCustomModule.forRoot(),
    HomePersistenceModule.forRoot(),
  ],
  providers: [ApplicationService, GarageService],
})
export class HomeControllerModule {}
