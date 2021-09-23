import {
  CONTROLLER_STATE_EVENT,
  ControllerStates,
  InjectControllerSettings,
  ROOM_COMMAND,
  RoomCommandDTO,
  RoomCommandScope,
  RoomController,
  RoomControllerFlags,
  RoomControllerSettingsDTO,
} from '@automagical/controller-logic';
import {
  FanDomainService,
  SwitchDomainService,
} from '@automagical/home-assistant';
import { EventEmitter2 } from 'eventemitter2';

import { MasterBedroomController } from './master-bedroom.controller';

const remote = 'sensor.bed_pico';
@RoomController({
  flags: [RoomControllerFlags.SECONDARY, RoomControllerFlags.RELAY_EMIT],
  friendlyName: 'Bed Remote',
  name: 'bed',
  remote,
})
export class BedRemoteController {
  constructor(
    private readonly switchService: SwitchDomainService,
    private readonly fanService: FanDomainService,
    private readonly eventEmitter: EventEmitter2,
    @InjectControllerSettings(MasterBedroomController)
    private readonly settings: RoomControllerSettingsDTO,
  ) {}

  protected onModuleInit(): void {
    this.eventEmitter.on(
      CONTROLLER_STATE_EVENT(remote, '*'),
      async (state: ControllerStates) => {
        await this.process(state);
      },
    );
  }

  private async process(state: ControllerStates): Promise<void> {
    switch (state) {
      case ControllerStates.favorite:
        await this.switchService.toggle('switch.womp');
        return;
      case ControllerStates.on:
        this.eventEmitter.emit(ROOM_COMMAND(this.settings.name, 'areaOn'), {
          scope: [RoomCommandScope.ACCESSORIES, RoomCommandScope.LOCAL],
        } as RoomCommandDTO);
        return;
      case ControllerStates.off:
        this.eventEmitter.emit(ROOM_COMMAND(this.settings.name, 'areaOff'), {
          scope: [RoomCommandScope.ACCESSORIES, RoomCommandScope.LOCAL],
        } as RoomCommandDTO);
        return;
      case ControllerStates.up:
        await this.fanService.fanSpeedUp(this.settings.fan);
        return;
      case ControllerStates.down:
        await this.fanService.fanSpeedDown(this.settings.fan);
        return;
    }
  }
}
