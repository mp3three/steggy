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
} from '../controllers';
import {
  BedRemoteController,
  DiningController,
  DownstairsController,
  GamesRoomController,
  GuestBedroomController,
  LoftController,
  MasterBedroomController,
} from '../rooms';
import { ApplicationService, GarageService } from '../services';

const rooms = [
  BedRemoteController,
  DiningController,
  DownstairsController,
  GamesRoomController,
  GuestBedroomController,
  LoftController,
  MasterBedroomController,
];

@ApplicationModule({
  application: APP_HOME_CONTROLLER,
  controllers: [EntityController, GroupController, HAHooksController],
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
