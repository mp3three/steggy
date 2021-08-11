import { iRoomController } from '@automagical/contracts/controller-logic';
import {
  KunamiCodeService,
  LightManagerService,
  RoomController,
} from '@automagical/controller-logic';

@RoomController({
  accessories: [
    'switch.kitchen_light',
    'switch.back_yard_light',
    'switch.stair_lights',
  ],
  friendlyName: 'Dining Room',
  name: 'dining',
  switches: ['switch.dining_room_light', 'switch.bar_light'],
})
export class DiningController implements iRoomController {
  // #region Constructors

  constructor(
    public readonly kunamiService: KunamiCodeService,
    public readonly lightManager: LightManagerService,
  ) {}

  // #endregion Constructors
}
