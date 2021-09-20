import { HomeControllerCustomModule } from '@automagical/controller-logic';
import { HomeAssistantModule } from '@automagical/home-assistant';
import { ServerModule } from '@automagical/server';
import { APP_HOME_CONTROLLER } from '@automagical/utilities';
import {
  ApplicationModule,
  MQTTModule,
  SolarCalcService,
} from '@automagical/utilities';

import { ApplicationController } from '../controllers';
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
  controllers: [ApplicationController],
  imports: [
    HomeAssistantModule,
    HomeControllerCustomModule.forRoot(),
    MQTTModule,
    ServerModule,
  ],
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
