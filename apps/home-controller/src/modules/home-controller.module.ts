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
  EntityController,
  GroupController,
  HAHooksController,
  RoomController,
} from '../controllers';
import { LoftController } from '../rooms';
import { ApplicationService, GarageService } from '../services';

const rooms = [LoftController];

@ApplicationModule({
  application: APP_HOME_CONTROLLER,
  controllers: [
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
  providers: [ApplicationService, GarageService, ...rooms],
})
export class HomeControllerModule {}
