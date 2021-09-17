import { HomeControllerCustomModule } from '@automagical/controller-logic';
import { HomeAssistantModule } from '@automagical/home-assistant';
import { APP_HOME_CONTROLLER } from '@automagical/utilities';
import {
  ApplicationModule,
  MQTTModule,
  SolarCalcService,
} from '@automagical/utilities';

import {
  DiningController,
  DownstairsController,
  GamesRoomController,
  GuestBedroomController,
  LoftController,
  MasterBedroomController,
} from '../rooms';
import { BedRemoteController } from '../rooms/bed-remote.controller';
import { ApplicationService, GarageService } from '../services';

@ApplicationModule({
  application: APP_HOME_CONTROLLER,
  imports: [HomeAssistantModule, HomeControllerCustomModule, MQTTModule],
  providers: [ApplicationService, GarageService],
  rooms: [
    BedRemoteController,
    DiningController,
    DownstairsController,
    GamesRoomController,
    GuestBedroomController,
    LoftController,
    MasterBedroomController,
  ],
  utils: [SolarCalcService],
})
export class HomeControllerModule {}