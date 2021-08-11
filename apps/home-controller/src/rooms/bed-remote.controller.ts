import {
  CONTROLLER_STATE_EVENT,
  ControllerStates,
  iRoomController,
  ROOM_COMMAND,
} from '@automagical/contracts/controller-logic';
import {
  KunamiCodeService,
  LightManagerService,
  RoomController,
} from '@automagical/controller-logic';
import {
  FanDomainService,
  SwitchDomainService,
} from '@automagical/home-assistant';
import { EventEmitter2 } from '@nestjs/event-emitter';

const remote = 'sensor.bed_pico';
@RoomController({
  friendlyName: 'Bed Remote',
  name: 'bed',
  omitRoomEvents: true,
  remote,
})
export class BedRemoteController implements iRoomController {
  // #region Constructors

  constructor(
    public readonly lightManager: LightManagerService,
    public readonly kunamiService: KunamiCodeService,
    private readonly switchService: SwitchDomainService,
    private readonly fanService: FanDomainService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  protected onModuleInit(): void {
    this.eventEmitter.on(
      CONTROLLER_STATE_EVENT(remote, '*'),
      async (state: ControllerStates) => {
        switch (state) {
          case ControllerStates.favorite:
            await this.switchService.toggle('switch.womp');
            return;
          case ControllerStates.on:
            this.eventEmitter.emit(ROOM_COMMAND('master', 'areaOn'), {
              count: 2,
            });
            return;
          case ControllerStates.off:
            this.eventEmitter.emit(ROOM_COMMAND('master', 'areaOff'), {
              count: 2,
            });
            return;
          case ControllerStates.up:
            await this.fanService.fanSpeedUp('fan.master_bedroom_ceiling_fan');

            return;
          case ControllerStates.down:
            await this.fanService.fanSpeedDown(
              'fan.master_bedroom_ceiling_fan',
            );
            return;
        }
      },
    );
  }

  // #endregion Protected Methods
}