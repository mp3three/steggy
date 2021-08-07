import { LIGHTING_CONTROLLER } from '@automagical/contracts/controller-logic';

export function LightingController(): PropertyDecorator {
  return function (target, key: string) {
    target.constructor[LIGHTING_CONTROLLER] = key;
  };
}
