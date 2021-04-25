import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';
import { HomeAssistantRoomConfigDTO } from '@automagical/contracts/home-assistant';
import {
  EntityService,
  HomeAssistantService,
  AreaService,
  SceneRoom,
} from '@automagical/home-assistant';
import { InjectLogger } from '@automagical/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PinoLogger } from 'nestjs-pino';
import { GAMES_CONFIG } from '../../typings';

@Injectable()
export class GamesService extends SceneRoom {
  // #region Constructors

  constructor(
    protected readonly homeAssistantService: HomeAssistantService,
    protected readonly eventEmitter: EventEmitter2,
    protected readonly entityService: EntityService,
    @InjectLogger(GamesService, APP_HOME_CONTROLLER)
    protected readonly logger: PinoLogger,
    protected readonly roomService: AreaService,
    @Inject(GAMES_CONFIG)
    protected readonly roomConfig: HomeAssistantRoomConfigDTO,
  ) {
    super();
  }

  // #endregion Constructors
}
