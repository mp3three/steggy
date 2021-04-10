import { HomeAssistantRoomConfigDTO } from '@automagical/contracts/home-assistant';
import {
  EntityService,
  HomeAssistantService,
  RoomService,
  SceneRoom,
} from '@automagical/home-assistant';
import { Logger } from '@automagical/logger';
import { Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as dayjs from 'dayjs';
import { GARAGE_CONFIG } from '../../typings';

/**
 * There isn't any pico remote
 */
@Injectable()
export class GarageService extends SceneRoom {
  // #region Object Properties

  protected readonly logger = Logger(GarageService);

  // #endregion Object Properties

  // #region Constructors

  constructor(
    protected readonly homeAssistantService: HomeAssistantService,
    protected readonly entityService: EntityService,
    protected readonly roomService: RoomService,
    @Inject(GARAGE_CONFIG)
    protected readonly roomConfig: HomeAssistantRoomConfigDTO,
  ) {
    super();
    // roomService.ROOM_REGISTRY.garage = roomConfig;
  }

  // #endregion Constructors

  // #region Public Methods

  public async toggleTransferPump(): Promise<void> {
    this.logger.debug('toggleTransferPump');
    this.entityService.toggle('switch.transfer_pump');
  }

  // #endregion Public Methods

  // #region Protected Methods

  // @Cron('0 */5 * * * *')
  @Cron('0 0 * * * *')
  protected async Schedule12_12(): Promise<void> {
    this.logger.debug('Schedule12_12');
    const now = dayjs();
    const hour = 5;
    const lightOff = now.startOf('d').add(hour, 'h');
    const lightOn = now.startOf('d').add(hour + 12, 'h');
    if (now.isAfter(lightOff) && now.isBefore(lightOn)) {
      return this.entityService.turnOff('switch.quantum_boards');
    }
    return this.entityService.turnOn('switch.quantum_boards');
  }

  // @Cron('0 */5 * * * *')
  @Cron('0 0 * * * *')
  protected async Schedule18_6(): Promise<void> {
    this.logger.debug('Schedule18_6');
    const now = dayjs();
    const lightOn = now.startOf('d').add(6, 'h');
    if (now.isBefore(lightOn)) {
      return this.entityService.turnOff('switch.vipar_lights');
    }
    return this.entityService.turnOn('switch.vipar_lights');
  }

  // #endregion Protected Methods
}