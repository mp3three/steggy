import { APP_HOME_CONTROLLER } from '@automagical/contracts';
import { HomeControllerCustomModule } from '@automagical/controller-logic';
import { HomeAssistantModule } from '@automagical/home-assistant';
import { ApplicationModule, MQTTModule } from '@automagical/utilities';

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
})
export class HomeControllerModule {}

/**
 * This module also referenced in devtools for the config loader
 */
