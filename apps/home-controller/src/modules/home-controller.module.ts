import { HomeControllerCustomModule } from '@automagical/controller-logic';
import { HomeAssistantModule } from '@automagical/home-assistant';
import { ServerModule } from '@automagical/server';
import {
  APP_HOME_CONTROLLER,
  ApplicationModule,
  MQTTModule,
  SolarCalcService,
} from '@automagical/utilities';

import { RoomAPIController } from '../controllers';
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

@ApplicationModule({
  application: APP_HOME_CONTROLLER,
  controllers: [
    RoomAPIController,
    BedRemoteController,
    DiningController,
    DownstairsController,
    GamesRoomController,
    GuestBedroomController,
    LoftController,
    MasterBedroomController,
  ],
  imports: [
    HomeAssistantModule,
    HomeControllerCustomModule.forRoot(),
    MQTTModule,
    ServerModule,
  ],
  providers: [ApplicationService, GarageService],
  utils: [SolarCalcService],
})
export class HomeControllerModule {}
