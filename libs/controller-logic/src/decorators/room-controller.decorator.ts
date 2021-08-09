import {
  ROOM_CONTROLLER_SETTINGS,
  RoomControllerSettingsDTO,
} from '@automagical/contracts/controller-logic';
import { Injectable, Provider } from '@nestjs/common';

import {
  ComplexLogicService,
  KunamiCodeService,
  LightingControllerService,
  StateManagerService,
} from '../services';

export const DynamicRoomProviders = new Set<Provider>();

export function RoomController(
  settings: RoomControllerSettingsDTO,
): ClassDecorator {
  return function (target) {
    target[ROOM_CONTROLLER_SETTINGS] = settings;
    [
      StateManagerService,
      LightingControllerService,
      ComplexLogicService,
      KunamiCodeService,
    ].forEach((ctor) => {
      DynamicRoomProviders.add({
        inject: [ctor],
        provide: `${target.name}:${ctor.name}`,
        useClass: ctor,
      });
    });
    return Injectable()(target);
  };
}
