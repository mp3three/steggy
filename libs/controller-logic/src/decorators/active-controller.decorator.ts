import { iRoomController } from '@automagical/contracts';
import { ClassConstructor } from 'class-transformer';

import { RoomCoordinatorService } from '../services/room-coordinator.service';

type Controller = {
  coordinator: RoomCoordinatorService;
};

export function ActiveController({
  name,
}: ClassConstructor<unknown>): MethodDecorator {
  return function (
    { coordinator }: Controller,
    key: keyof Omit<iRoomController, 'name'>,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...parameters) {
      const state = await coordinator.getState();
      if (state.ACTIVE_CONTROLLERS.includes(coordinator.name) === true) {
        return true;
      }
      return originalMethod.apply(this, parameters);
    };
    return descriptor;
  };
}
