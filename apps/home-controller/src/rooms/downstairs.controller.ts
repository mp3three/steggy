import {
  BaseRoomService,
  COMMAND_SCOPE,
  ControllerStates,
  KunamiCodeService,
  LightManagerService,
  RoomCommandDTO,
  RoomCommandScope,
  RoomController,
  SolarCalcService,
  StateManagerService,
  Steps,
} from '@automagical/controller-logic';
import {
  LightDomainService,
  MediaPlayerDomainService,
  SwitchDomainService,
} from '@automagical/home-assistant';
import { AutoLogService, PEAT, Trace } from '@automagical/utilities';
import { EventEmitter2 } from 'eventemitter2';

import { RelayCommand } from '../decorators';
import { GLOBAL_TRANSITION } from '../typings';

const TV = 'media_player.living_room';
const switches = [
  'switch.living_room_lamp',
  'switch.media_center_light',
  'switch.couch_light',
];
const fanLights = [
  'light.living_room_back',
  'light.living_room_front',
  'light.living_room_left',
  'light.living_room_right',
];
const tvRight = [
  `light.tower_1_1`,
  `light.tower_1_2`,
  `light.tower_1_3`,
  `light.tower_1_4`,
  `light.tower_1_5`,
  `light.tower_1_6`,
];
const tvLeft = [
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
  fan: 'fan.living_room_ceiling_fan',
  friendlyName: 'Downstairs',
  groups: { fanLights, tvLeft, tvRight },
  lights: fanLights,
  media: TV,
  name: 'downstairs',
  remote: 'sensor.living_pico',
  switches,
})
export class DownstairsController extends BaseRoomService {
  constructor(
    private readonly kunamiService: KunamiCodeService,
    private readonly lightManager: LightManagerService,
    private readonly stateManager: StateManagerService,
    private readonly lightDomain: LightDomainService,
    private readonly remoteService: MediaPlayerDomainService,
    private readonly solarCalc: SolarCalcService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: AutoLogService,
    private readonly switchService: SwitchDomainService,
  ) {
    super();
  }

  @Trace()
  @RelayCommand(['loft', 'games', 'master', 'dining'], 'areaOff')
  private async eveningFavorite(command: RoomCommandDTO): Promise<boolean> {
    const scope = COMMAND_SCOPE(command);
    if (scope.has(RoomCommandScope.LOCAL)) {
      await this.switchService.turnOn(switches);
      await this.lightDomain.turnOn([...tvRight, ...tvLeft]);
      await this.lightManager.turnOffEntities([...fanLights, ...accessories]);
      return false;
    }
    return scope.has(RoomCommandScope.ACCESSORIES);
  }

  @Trace()
  @RelayCommand(['dining'], 'areaOff')
  public async areaOff(command: RoomCommandDTO): Promise<boolean> {
    const scope = COMMAND_SCOPE(command);
    await this.stateManager.removeFlag(this.settings, AUTO_STATE);
    if (scope.has(RoomCommandScope.LOCAL)) {
      await this.lightDomain.turnOff([...tvRight, ...tvLeft]);
    }
    return scope.has(RoomCommandScope.ACCESSORIES);
  }

  @Trace()
  @RelayCommand(['dining'], 'areaOn')
  public async areaOn(): Promise<boolean> {
    await this.stateManager.removeFlag(this.settings, AUTO_STATE);
    return !this.solarCalc.IS_EVENING;
  }

  @Trace()
  public async favorite(parameters: RoomCommandDTO): Promise<void> {
    const scope = COMMAND_SCOPE(parameters);
    if (scope.has(RoomCommandScope.ACCESSORIES)) {
      // Give a bit of a pause before emitting
      await this.remoteService.turnOn(TV);
      this.logger.debug(`Turn on {${TV}}`);
      setTimeout(() => this.eventEmitter.emit(GLOBAL_TRANSITION), 30 * 1000);
    }
    if (this.solarCalc.IS_EVENING) {
      await this.eveningFavorite(parameters);
      return;
    }
    await this.dayFavorite(parameters);
  }

  @Trace()
  protected onModuleInit(): void {
    Steps(2).forEach((scope, count) =>
      this.kunamiService.addCommand(this, {
        activate: {
          ignoreRelease: true,
          states: PEAT(count + 1, ControllerStates.favorite),
        },
        callback: async () => {
          await this.favorite({ scope });
        },
        name: `Favorite (${count + 1})`,
      }),
    );
  }

  @Trace()
  @RelayCommand(['loft', 'games', 'master', 'dining'], 'areaOff')
  private async dayFavorite(command: RoomCommandDTO): Promise<boolean> {
    const scope = COMMAND_SCOPE(command);
    if (scope.has(RoomCommandScope.LOCAL)) {
      await this.switchService.turnOn([...switches, ...accessories]);
      await this.lightManager.circadianLight(fanLights, 255);
      return;
    }
    return scope.has(RoomCommandScope.ACCESSORIES);
  }
}
