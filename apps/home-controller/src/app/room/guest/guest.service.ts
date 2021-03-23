import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EntityService } from '../../entity/entity.service';
import { RoomCode } from '../../enums/room-codes.enum';
import { HomeAssistantService } from '../../home-assistant/home-assistant.service';
import logger from '../../log';
import { RoomService } from '../room.service';
import { SceneRoom } from '../scene.room';

const { log, warn, debug, error } = logger('GuestService');

@Injectable()
export class GuestService extends SceneRoom {
  protected circadian = {
    low: 'switch.circadian_lighting_guest_low_brightness_circadian_light',
    high: 'switch.circadian_lighting_guest_circadian_light',
  };

  constructor(
    @Inject(forwardRef(() => HomeAssistantService))
    homeAssistantService: HomeAssistantService,
    @Inject(forwardRef(() => RoomService))
    roomService: RoomService,
    @Inject(forwardRef(() => EntityService))
    entityService: EntityService,
  ) {
    super(RoomCode.guest, {
      homeAssistantService,
      roomService,
      entityService,
    });
  }
}
