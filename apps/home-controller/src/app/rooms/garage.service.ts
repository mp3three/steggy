import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { schedule } from 'node-cron';
import * as dayjs from 'dayjs';
import {
  BaseRoom,
  EntityService,
  HomeAssistantService,
  RoomCode,
  RoomService,
  SwitchEntity,
} from '@automagical/home-assistant';
import { Logger } from '@automagical/logger';
import { ConfigService } from '@nestjs/config';

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
  // #region Object Properties

  protected roomConfig;

  private readonly _logger = Logger(GarageService);

  private qb: SwitchEntity;
  private qbLighting: LightingSchedule = '18/6';
  private vipar: SwitchEntity;
  private viparLighting: LightingSchedule = '18/6';

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(forwardRef(() => HomeAssistantService))
    homeAssistantService: HomeAssistantService,
    @Inject(forwardRef(() => RoomService))
    roomService: RoomService,
    @Inject(forwardRef(() => EntityService))
    entityService: EntityService,
    protected readonly configService: ConfigService,
  ) {
    super(RoomCode.garage, {
      homeAssistantService,
      roomService,
      entityService,
      configService,
    });
  }

  // #endregion Constructors

  // #region Public Methods

  public async exec(args: GarageDoArgs): Promise<void> {
    this._logger.alert(`Garage exec is not implemented!`, args);
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected async flowerLight(tent: Tents): Promise<void> {
    const now = dayjs();
    const hour = 5;
    const lightOff = now.startOf('d').add(hour, 'h');
    const lightOn = now.startOf('d').add(hour + 12, 'h');
    if (now.isAfter(lightOff) && now.isBefore(lightOn)) {
      return this[tent].turnOff();
    }
    return this[tent].turnOn();
  }

  protected async onModuleInit(): Promise<void> {
    await super.onModuleInit();
    this.vipar = await this.entityService.byId(TentEntities.vipar);
    this.qb = await this.entityService.byId(TentEntities.qb);
    schedule('0 */5 * * * *', () => {
      this[this.viparLighting === '12/12' ? 'flowerLight' : 'vegLight'](
        'vipar',
      );
      this[this.qbLighting === '12/12' ? 'flowerLight' : 'vegLight']('qb');
    });
  }

  protected async vegLight(tent: Tents): Promise<void> {
    const now = dayjs();
    const lightOn = now.startOf('d').add(6, 'h');
    if (now.isBefore(lightOn)) {
      return this[tent].turnOff();
    }
    return this[tent].turnOn();
  }

  // #endregion Protected Methods
}
