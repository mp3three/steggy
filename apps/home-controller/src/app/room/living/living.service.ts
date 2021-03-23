import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EntityService } from '../../entity/entity.service';
import { RoomCode } from '../../enums/room-codes.enum';
import { HomeAssistantService } from '../../home-assistant/home-assistant.service';
import logger from '../../log';
import { RoomService } from '../room.service';
import { TVRoom } from '../tv.room';

const { log, warn, debug, error } = logger('LivingService');

// enum RokuInputs {
//   off = 'off',
//   chromecast = 'hdmi1',
// }

@Injectable()
export class LivingService extends TVRoom {
  constructor(
    @Inject(forwardRef(() => HomeAssistantService))
    homeAssistantService: HomeAssistantService,
    @Inject(forwardRef(() => RoomService))
    roomService: RoomService,
    @Inject(forwardRef(() => EntityService))
    entityService: EntityService,
  ) {
    super(RoomCode.living, {
      homeAssistantService,
      roomService,
      entityService,
    });
  }
}
