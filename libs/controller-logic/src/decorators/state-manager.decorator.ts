import { STATE_MANAGER } from '@automagical/contracts/controller-logic';

export function StateManager(): PropertyDecorator {
  return function (target, key: string) {
    target.constructor[STATE_MANAGER] = key;
  };
}
