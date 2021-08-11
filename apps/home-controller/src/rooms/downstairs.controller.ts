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
import { SwitchDomainService } from '@automagical/home-assistant';
import { PEAT, SolarCalcService, Trace } from '@automagical/utilities';
import { EventEmitter2 } from 'eventemitter2';

import { GLOBAL_TRANSITION } from '../typings';

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
  // #region Constructors

  constructor(
    public readonly kunamiService: KunamiCodeService,
    public readonly lightManager: LightManagerService,
    private readonly solarCalc: SolarCalcService,
    private readonly eventEmitter: EventEmitter2,
    private readonly switchService: SwitchDomainService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async favorite(
    parameters: RoomControllerParametersDTO,
  ): Promise<void> {
    if (parameters.count === 2) {
      // Give a bit of a pause before emitting
      setTimeout(() => this.eventEmitter.emit(GLOBAL_TRANSITION), 30 * 1000);
    }
    if (this.solarCalc.IS_EVENING) {
      return await this.eveningFavorite(parameters);
    }
    await this.dayFavorite(parameters);
  }

  // #endregion Public Methods

  // #region Protected Methods

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

  // #endregion Protected Methods

  // #region Private Methods

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

  @Trace()
  private async eveningFavorite({
    count,
  }: RoomControllerParametersDTO): Promise<void> {
    if (count === 1) {
      await this.switchService.turnOn(switches);
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

  // #endregion Private Methods
}
