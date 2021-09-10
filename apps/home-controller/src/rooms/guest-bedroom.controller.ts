import { iRoomController } from '@automagical/contracts/controller-logic';
import {
  KunamiCodeService,
  LightManagerService,
  RoomController,
} from '@automagical/controller-logic';

@RoomController({
  friendlyName: 'Guest Bedroom',
  lights: ['light.guest_left', 'light.guest_right', 'light.guest_door'],
  name: 'guest',
  remote: 'sensor.guest_pico',
})
export class GuestBedroomController implements iRoomController {
  

  constructor(
    public readonly lightManager: LightManagerService,
    public readonly kunamiService: KunamiCodeService,
  ) {}

  
}
