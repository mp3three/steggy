import {
  ControllerStates,
  iRoomController,
  ROOM_COMMAND,
  RoomControllerParametersDTO,
} from '@automagical/contracts/controller-logic';
import {
  KunamiCodeService,
  LightManagerService,
  RoomController,
} from '@automagical/controller-logic';
import {
  LightDomainService,
  SwitchDomainService,
} from '@automagical/home-assistant';
import { PEAT, Trace } from '@automagical/utilities';
import { EventEmitter2 } from '@nestjs/event-emitter';

@RoomController({
  friendlyName: 'Master Bedroom',
  lights: [
    'light.bedroom_fan_top_left',
    'light.bedroom_fan_top_right',
    'light.bedroom_fan_bottom_left',
    'light.bedroom_fan_bottom_right',
  ],
  name: 'master',
  remote: 'sensor.bedroom_pico',
  switches: ['switch.womp'],
})
export class MasterBedroomController implements iRoomController {
  // #region Constructors

  constructor(
    public readonly lightManager: LightManagerService,
    public readonly kunamiService: KunamiCodeService,
    private readonly switchService: SwitchDomainService,
    private readonly lightService: LightDomainService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async favorite({ count }: RoomControllerParametersDTO): Promise<void> {
    if (count === 1) {
      await this.switchService.turnOff('switch.womp');
      await this.lightService.turnOff([
        'light.bedroom_fan_top_left',
        'light.bedroom_fan_top_right',
        'light.bedroom_fan_bottom_left',
        'light.bedroom_fan_bottom_right',
      ]);
      await this.lightManager.circadianLight(['light.speaker_light'], 40);
      return;
    }
    if (count === 2) {
      ['games', 'loft', 'downstairs'].forEach((room) =>
        this.eventEmitter.emit(ROOM_COMMAND(room, 'areaOff'), { count }),
      );
    }
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected onModuleInit(): void {
    PEAT(2).forEach((count) => {
      this.kunamiService.addCommand({
        activate: {
          ignoreRelease: true,
          states: PEAT(count, ControllerStates.favorite),
        },
        callback: async () => {
          await this.favorite({ count });
        },
        name: `Favorite (${count})`,
      });
    });
  }

  // #endregion Protected Methods
}
