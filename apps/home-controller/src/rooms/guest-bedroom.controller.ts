import { BaseRoomService, RoomController } from '@automagical/controller-logic';

@RoomController({
  fan: 'fan.guest_ceiling_fan',
  friendlyName: 'Guest Bedroom',
  lights: ['light.guest_left', 'light.guest_right', 'light.guest_door'],
  name: 'guest',
  remote: 'sensor.guest_pico',
})
export class GuestBedroomController extends BaseRoomService {}
