import { Inject } from '@nestjs/common';
import { STATE_MANAGER } from '@text-based/controller-shared';
import { ClassConstructor } from 'class-transformer';

export function StateManager(): PropertyDecorator {
  return function (target, key: string) {
    target.constructor[STATE_MANAGER] = key;
  };
}
export const StateManagerTargets = new Set<string>();
const token = 'StateManager';

export function InjectStateManager(): ParameterDecorator {
  return function (target: ClassConstructor<unknown>, key: string, index) {
    StateManagerTargets.add(target.name);
    return Inject(`${token}:${target.name}`)(target, key, index);
  };
}
