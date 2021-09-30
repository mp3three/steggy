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
  RoomAPIController,
  StateController,
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
import { ApplicationService, CommandRouter, GarageService } from '../services';

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
  controllers: [
    EntityController,
    GroupController,
    RoomAPIController,
    StateController,
  ],
  imports: [
    MQTTModule,
    ServerModule,
    HomeAssistantModule,
    HomeControllerCustomModule.forRoot(),
    HomePersistenceModule.forRoot(),
  ],
  providers: [ApplicationService, CommandRouter, GarageService, ...rooms],
})
export class HomeControllerModule {}
