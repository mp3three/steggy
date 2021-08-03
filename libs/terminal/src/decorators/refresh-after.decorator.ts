import { SCREEN_REFESH } from '@automagical/contracts/terminal';
import { EventEmitter2 } from '@nestjs/event-emitter';

let eventEmitterService: EventEmitter2;

export function RefreshAfter(): MethodDecorator {
  return function (target, key, descriptor: PropertyDescriptor) {
    const original = descriptor.value;
    descriptor.value = async function (...parameters) {
      //
      const value = await original.apply(this, parameters);
      eventEmitterService.emit(SCREEN_REFESH);
      return value;
    };
  };
}
RefreshAfter.setEmitter = function (eventEmitter: EventEmitter2) {
  eventEmitterService = eventEmitter;
};
