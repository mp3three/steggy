import { iRoomController } from '@automagical/contracts/controller-logic';
import {
  KunamiCodeService,
  LightManagerService,
  RoomController,
} from '@automagical/controller-logic';

@RoomController({
  accessories: ['switch.bar_light', 'switch.entryway_light'],
  friendlyName: 'Downstairs',
  lights: [
    'light.living_room_back',
    'light.living_room_front',
    'light.living_room_left',
    'light.living_room_right',
  ],
  name: 'downstairs',
  remote: 'sensor.living_pico',
  switches: [
    'switch.living_room_lamp',
    'switch.media_center_light',
    'switch.couch_light',
  ],
})
export class DownstairsController implements iRoomController {
  // #region Constructors

  constructor(
    public readonly kunamiService: KunamiCodeService,
    public readonly lightManager: LightManagerService,
  ) {}

  // #endregion Constructors
}
