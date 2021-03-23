import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EntityService } from '../../entity/entity.service';
import { RemoteEntity } from '../../entity/types/remote.entity';
import { RoomCode } from '../../enums/room-codes.enum';
import { HomeAssistantService } from '../../home-assistant/home-assistant.service';
import logger from '../../log';
import { HueEvent } from '../../types/hue';
import { RoomService } from '../room.service';
import { TVRoom } from '../tv.room';
import cron = require('node-cron');

const { log, warn, debug, error, startup } = logger('LoftService');

enum RokuInputs {
  off = 'off',
  windows = 'hdmi2',
  personal = 'hdmi3',
  work = 'hdmi1',
}

@Injectable()
export class LoftService extends TVRoom {
  constructor(
    @Inject(forwardRef(() => HomeAssistantService))
    homeAssistantService: HomeAssistantService,
    @Inject(forwardRef(() => RoomService))
    roomService: RoomService,
    @Inject(forwardRef(() => EntityService))
    entityService: EntityService,
  ) {
    super(RoomCode.loft, {
      homeAssistantService,
      roomService,
      entityService,
    });
  }

  protected async init() {
    await super.init();
    const backDeskLight = await this.entityService.byId(
      'switch.back_desk_light',
    );
    cron.schedule('0 0 7 * * *', () => {
      log(`Turn off back desk light`);
      backDeskLight.turnOn();
    });

    cron.schedule('0 0 22 * * *', () => {
      log(`Turn on back desk light`);
      backDeskLight.turnOff();
    });

    cron.schedule('0 0 5 * * Mon,Tue,Wed,Thu,Fri', () => {
      log(`Changing default screen into to work`);
      this.roomConfig.config.roku.defaultChannel = RokuInputs.work;
    });
    cron.schedule('0 0 17 * * Mon,Tue,Wed,Thu,Fri', () => {
      log(`Changing default screen into to personal`);
      this.roomConfig.config.roku.defaultChannel = RokuInputs.personal;
    });

    startup('Configure: Hue Remote');
    const entity = await this.entityService.byId<RemoteEntity>(
      'remote.bedroom_switch',
    );
    entity.on(`hueButtonClick`, (args: HueEvent) => {
      const event = args.buttonEvent.charAt(0);
      const map: { [key: string]: RokuInputs } = {
        '1': RokuInputs.windows,
        '2': RokuInputs.personal,
        '3': RokuInputs.work,
        '4': RokuInputs.off,
      };
      if (!map[event]) {
        warn(`Could not figure hue event: ${args.buttonEvent}`);
        return;
      }
      this.setRoku(map[event]);
    });
  }
}
