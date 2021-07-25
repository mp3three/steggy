import { ControllerSettings, RoomController } from '@automagical/contracts';
import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';
import { LightingControllerService } from '@automagical/custom';
import {
  FanDomainService,
  SwitchDomainService,
} from '@automagical/home-assistant';
import { InjectLogger, Trace } from '@automagical/utilities';
import { PinoLogger } from 'nestjs-pino';

import { ROOM_NAMES } from '../typings';
import { MasterBedroomService } from './master-bedroom.service';

export class BedRemoteService implements RoomController {
  // #region Object Properties

  public readonly _CONTROLLER_SETTINGS: ControllerSettings = {
    devices: [],
  };
  public readonly name = ROOM_NAMES.bed;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(BedRemoteService, APP_HOME_CONTROLLER)
    private readonly logger: PinoLogger,
    private readonly switchService: SwitchDomainService,
    private readonly fanService: FanDomainService,
    private readonly lightingController: LightingControllerService,
    private readonly masterBedroom: MasterBedroomService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async areaOff(): Promise<boolean> {
    await this.lightingController.areaOff(1, this.masterBedroom);
    return false;
  }

  @Trace()
  public async areaOn(count: number): Promise<boolean> {
    await this.lightingController.areaOn(count, this.masterBedroom);
    return false;
  }

  @Trace()
  public async combo(): Promise<boolean> {
    return true;
  }

  @Trace()
  public async dimDown(): Promise<boolean> {
    await this.fanService.fanSpeedDown('fan.master_bedroom_ceiling_fan');
    return false;
  }

  @Trace()
  public async dimUp(): Promise<boolean> {
    await this.fanService.fanSpeedUp('fan.master_bedroom_ceiling_fan');
    return false;
  }

  @Trace()
  public async favorite(): Promise<boolean> {
    await this.switchService.toggle('switch.womp');
    return false;
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Trace()
  protected onModuleInit(): void {
    this.lightingController.setRoomController('sensor.bed_pico', this);
  }

  // #endregion Protected Methods
}
