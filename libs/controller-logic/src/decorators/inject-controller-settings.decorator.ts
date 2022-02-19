import { Inject, Provider } from '@nestjs/common';
import { ROOM_CONTROLLER_SETTINGS } from '@automagical/controller-shared';
import { ClassConstructor } from 'class-transformer';
import { v4 } from 'uuid';

export const InjectedSettings = new Set<Provider>();
export function InjectControllerSettings(
  controller: ClassConstructor<unknown>,
): ParameterDecorator {
  return function (target, key, index) {
    const id = v4().toString();
    InjectedSettings.add({
      provide: id,
      useFactory() {
        return controller[ROOM_CONTROLLER_SETTINGS];
      },
    });
    return Inject(id)(target, key, index);
  };
}
