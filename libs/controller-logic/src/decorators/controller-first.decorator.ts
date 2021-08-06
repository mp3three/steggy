import { iRoomController } from '@automagical/contracts';

type Controller = {
  controller: iRoomController;
};

export function ControllerFirst(): MethodDecorator {
  return function (
    { controller }: Controller,
    key: keyof Omit<iRoomController, 'name'>,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...parameters) {
      // eslint-disable-next-line security/detect-object-injection
      const controllerResult = await controller[key](...parameters);
      if (controllerResult === true) {
        return true;
      }
      return originalMethod.apply(this, parameters);
    };
    return descriptor;
  };
}
