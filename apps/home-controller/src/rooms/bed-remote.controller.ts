import { iRoomController } from '@automagical/contracts';
import {
  LightingController,
  LightingControllerService,
  RelayService,
  RoomController,
} from '@automagical/controller-logic';
import {
  FanDomainService,
  SwitchDomainService,
} from '@automagical/home-assistant';
import { Trace } from '@automagical/utilities';

@RoomController({
  friendlyName: 'Bed Remote',
  name: 'bed',
  remote: 'sensor.bed_pico',
})
export class BedRemoteController implements Partial<iRoomController> {
  // #region Object Properties

  @LightingController()
  public readonly controller: LightingControllerService;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly switchService: SwitchDomainService,
    private readonly fanService: FanDomainService,
    private readonly relayService: RelayService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async areaOff(): Promise<void> {
    await this.relayService.turnOff(['master']);
  }

  @Trace()
  public async areaOn(): Promise<void> {
    await this.relayService.turnOn(['master']);
  }

  @Trace()
  public async dimDown(): Promise<void> {
    await this.fanService.fanSpeedDown('fan.master_bedroom_ceiling_fan');
  }

  @Trace()
  public async dimUp(): Promise<void> {
    await this.fanService.fanSpeedUp('fan.master_bedroom_ceiling_fan');
  }

  @Trace()
  public async favorite(): Promise<void> {
    await this.switchService.toggle('switch.womp');
  }

  // #endregion Public Methods
}
