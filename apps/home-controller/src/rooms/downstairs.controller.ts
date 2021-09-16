import {
  ControllerStates,
  iRoomController,
  ROOM_COMMAND,
  RoomControllerParametersDTO,
} from '@automagical/controller-logic';
import {
  KunamiCodeService,
  LightManagerService,
  RoomController,
  StateManagerService,
} from '@automagical/controller-logic';
import {
  LightDomainService,
  MediaPlayerDomainService,
  SwitchDomainService,
} from '@automagical/home-assistant';
import {
  AutoLogService,
  PEAT,
  SolarCalcService,
  Trace,
} from '@automagical/utilities';
import { EventEmitter2 } from 'eventemitter2';

import { GLOBAL_TRANSITION } from '../typings';

const TV = 'media_player.living_room';
const switches = [
  'switch.living_room_lamp',
  'switch.media_center_light',
  'switch.couch_light',
];
const lights = [
  'light.living_room_back',
  'light.living_room_front',
  'light.living_room_left',
  'light.living_room_right',
];
const tower1 = [
  `light.tower_1_1`,
  `light.tower_1_2`,
  `light.tower_1_3`,
  `light.tower_1_4`,
  `light.tower_1_5`,
  `light.tower_1_6`,
];
const tower2 = [
  `light.tower_2_1`,
  `light.tower_2_2`,
  `light.tower_2_3`,
  `light.tower_2_4`,
  `light.tower_2_5`,
  `light.tower_2_6`,
];
const AUTO_STATE = 'AUTO_STATE';

const accessories = ['switch.bar_light', 'switch.entryway_light'];
@RoomController({
  accessories,
  friendlyName: 'Downstairs',
  lights,
  name: 'downstairs',
  remote: 'sensor.living_pico',
  switches,
})
export class DownstairsController implements iRoomController {
  constructor(
    public readonly kunamiService: KunamiCodeService,
    public readonly lightManager: LightManagerService,
    private readonly stateManager: StateManagerService,
    private readonly lightDomain: LightDomainService,
    private readonly remoteService: MediaPlayerDomainService,
    private readonly solarCalc: SolarCalcService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: AutoLogService,
    private readonly switchService: SwitchDomainService,
  ) {}

  @Trace()
  private async eveningFavorite({
    count,
  }: RoomControllerParametersDTO): Promise<void> {
    if (count === 1) {
      await this.switchService.turnOn(switches);
      await this.lightDomain.turnOn([...tower1, ...tower2]);
      await this.lightManager.turnOffEntities([...lights, ...accessories]);
      return;
    }
    if (count === 2) {
      ['loft', 'games', 'master'].forEach((room) =>
        this.eventEmitter.emit(ROOM_COMMAND(room, 'areaOff'), count),
      );
      this.eventEmitter.emit(ROOM_COMMAND('dining', 'areaOff'), count);
    }
  }

  @Trace()
  public async areaOff({ count }: RoomControllerParametersDTO): Promise<void> {
    await this.stateManager.removeFlag(AUTO_STATE);
    if (count === 1) {
      await this.lightDomain.turnOff([...tower1, ...tower2]);
    }
    if (count === 2) {
      this.logger.debug(`Turn off {${TV}}`);
      await this.remoteService.turnOff(TV);
    }
  }

  @Trace()
  public async areaOn({ count }: RoomControllerParametersDTO): Promise<void> {
    await this.stateManager.removeFlag(AUTO_STATE);
    if (count === 3) {
      this.eventEmitter.emit(ROOM_COMMAND('dining', 'areaOn'), { count });
    }
  }

  @Trace()
  public async favorite(
    parameters: RoomControllerParametersDTO,
  ): Promise<void> {
    if (parameters.count === 2) {
      // Give a bit of a pause before emitting
      await this.remoteService.turnOn(TV);
      this.logger.debug(`Turn on {${TV}}`);
      setTimeout(() => this.eventEmitter.emit(GLOBAL_TRANSITION), 30 * 1000);
    }
    if (this.solarCalc.IS_EVENING) {
      return await this.eveningFavorite(parameters);
    }
    await this.dayFavorite(parameters);
  }

  @Trace()
  protected onModuleInit(): void {
    PEAT(2).forEach((count) =>
      this.kunamiService.addCommand({
        activate: {
          ignoreRelease: true,
          states: PEAT(count, ControllerStates.favorite),
        },
        callback: async () => {
          await this.favorite({ count });
        },
        name: `Favorite (${count})`,
      }),
    );
  }

  @Trace()
  private async dayFavorite({
    count,
  }: RoomControllerParametersDTO): Promise<void> {
    if (count === 1) {
      await this.switchService.turnOn([...switches, ...accessories]);
      await this.lightManager.circadianLight(lights, 100);
      return;
    }
    if (count === 2) {
      ['loft', 'games', 'master'].forEach((room) =>
        this.eventEmitter.emit(ROOM_COMMAND(room, 'areaOff'), count),
      );
      this.eventEmitter.emit(ROOM_COMMAND('dining', 'areaOn'), count);
    }
  }
}
