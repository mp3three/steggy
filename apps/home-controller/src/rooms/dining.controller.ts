import {
  iRoomController,
  RoomControllerFlags,
} from '@automagical/controller-logic';
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
  flags: new Set([
    RoomControllerFlags.SECONDARY,
    RoomControllerFlags.RELAY_RECEIVE,
  ]),
  friendlyName: 'Dining Room',
  name: 'dining',
  switches: ['switch.dining_room_light', 'switch.bar_light'],
})
export class DiningController implements iRoomController {
  constructor(
    public readonly kunamiService: KunamiCodeService,
    public readonly lightManager: LightManagerService,
  ) {}
}
