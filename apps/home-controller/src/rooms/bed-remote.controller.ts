import { iRoomController } from '@automagical/contracts';
import {
  LightingController,
  LightingControllerService,
  RoomController,
} from '@automagical/controller-logic';
import {
  FanDomainService,
  SwitchDomainService,
} from '@automagical/home-assistant';
import { Trace } from '@automagical/utilities';

import { MasterBedroomService } from './master-bedroom.service';

@RoomController({
  friendlyName: 'Bed Remote',
  name: 'bed',
  remote: 'sensor.bed_pico',
})
export class BedRemoteController implements Partial<iRoomController> {
  // #region Object Properties

  @LightingController()
  protected readonly controller: LightingControllerService;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly switchService: SwitchDomainService,
    private readonly fanService: FanDomainService,
    private readonly masterBedroom: MasterBedroomService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async areaOff(): Promise<boolean> {
    await this.controller.areaOff(1, this.masterBedroom);
    return false;
  }

  @Trace()
  public async areaOn(count: number): Promise<boolean> {
    await this.controller.areaOn(count, this.masterBedroom);
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
}
