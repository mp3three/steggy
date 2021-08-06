import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';
import { HomeControllerCustomModule } from '@automagical/controller-logic';
import { HomeAssistantModule } from '@automagical/home-assistant';
import { ApplicationModule } from '@automagical/utilities';

import {
  ApplicationService,
  BedRemoteService,
  DownstairsService,
  GamesRoomService,
  GarageService,
  GuestBedroomService,
  LoftService,
  MasterBedroomService,
} from '../services';

@ApplicationModule({
  application: APP_HOME_CONTROLLER,
  imports: [HomeAssistantModule, HomeControllerCustomModule],
  providers: [ApplicationService, BedRemoteService, GarageService],
  rooms: [
    DownstairsService,
    GamesRoomService,
    GuestBedroomService,
    LoftService,
    MasterBedroomService,
  ],
})
export class HomeControllerModule {}
