import { iRoomController } from '@automagical/contracts';
import {
  LightManagerService,
  RoomController,
} from '@automagical/controller-logic';

@RoomController({
  friendlyName: 'Guest Bedroom',
  lights: ['light.guest_left', 'light.guest_right', 'light.guest_door'],
  name: 'Guest',
  remote: 'sensor.guest_pico',
})
export class GuestBedroomController implements iRoomController {
  // #region Constructors

  constructor(public readonly lightManager: LightManagerService) {}

  // #endregion Constructors
}
