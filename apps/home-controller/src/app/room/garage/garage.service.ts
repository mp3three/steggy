import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { BaseRoom } from '../base.room';
import { RoomService } from '../room.service';
import cron = require('node-cron');
import dayjs = require('dayjs');
import { EntityService } from '../../entity/entity.service';
import { SwitchEntity } from '../../entity/types/switch.entity';
import { RoomCode } from '../../enums/room-codes.enum';
import { HomeAssistantService } from '../../home-assistant/home-assistant.service';
import logger from '../../log';

const { log, debug, error, warn, startup } = logger('GarageService');

type LightingSchedule = '12/12' | '18/6';
type Tents = 'vipar' | 'qb';
enum TentEntities {
  vipar = 'switch.vipar_lights',
  qb = 'switch.quantum_boards',
}

export type GarageDoArgs = {
  foo: 'bar';
};

@Injectable()
export class GarageService extends BaseRoom {
  private qb: SwitchEntity;
  private qbLighting: LightingSchedule = '18/6';
  private vipar: SwitchEntity;
  private viparLighting: LightingSchedule = '18/6';

  protected roomConfig;

  constructor(
    @Inject(forwardRef(() => HomeAssistantService))
    homeAssistantService: HomeAssistantService,
    @Inject(forwardRef(() => RoomService))
    roomService: RoomService,
    @Inject(forwardRef(() => EntityService))
    entityService: EntityService,
  ) {
    super(RoomCode.garage, {
      homeAssistantService,
      roomService,
      entityService,
    });
    startup(`QB Tent Schedule: ${this.qbLighting}`);
    startup(`Vipar Tent Schedule: ${this.viparLighting}`);
  }

  public async exec(args: GarageDoArgs) {
    error(`Garage exec is not implemented!`, args);
    return;
  }

  protected async flowerLight(tent: Tents) {
    const now = dayjs();
    const hour = 5;
    const lightOff = now.startOf('d').add(hour, 'h');
    const lightOn = now.startOf('d').add(hour + 12, 'h');
    if (now.isAfter(lightOff) && now.isBefore(lightOn)) {
      return this[tent].turnOff();
    }
    return this[tent].turnOn();
  }

  protected async init() {
    await super.init();
    this.vipar = await this.entityService.byId(TentEntities.vipar);
    this.qb = await this.entityService.byId(TentEntities.qb);
    cron.schedule('0 */5 * * * *', () => {
      this[this.viparLighting === '12/12' ? 'flowerLight' : 'vegLight'](
        'vipar',
      );
      this[this.qbLighting === '12/12' ? 'flowerLight' : 'vegLight']('qb');
    });
  }

  protected async vegLight(tent: Tents) {
    const now = dayjs();
    const lightOn = now.startOf('d').add(6, 'h');
    if (now.isBefore(lightOn)) {
      return this[tent].turnOff();
    }
    return this[tent].turnOn();
  }
}
