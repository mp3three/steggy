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
import { GUEST_CONFIG } from '../../typings';

@Injectable()
export class GuestService extends SceneRoom {
  // #region Constructors

  constructor(
    @Inject(GUEST_CONFIG)
    protected readonly roomConfig: HomeAssistantRoomConfigDTO,
    @InjectLogger(GuestService, APP_HOME_CONTROLLER)
    protected readonly logger: PinoLogger,
    protected readonly homeAssistantService: HomeAssistantService,
    protected readonly eventEmitter: EventEmitter2,
    protected readonly entityService: EntityService,
    protected readonly roomService: AreaService,
  ) {
    super();
  }

  // #endregion Constructors
}
