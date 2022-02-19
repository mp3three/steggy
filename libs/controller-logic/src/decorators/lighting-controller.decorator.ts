import { LIGHTING_CONTROLLER } from '@automagical/controller-shared';

export function LightingController(): PropertyDecorator {
  return function (target, key: string) {
    target.constructor[LIGHTING_CONTROLLER] = key;
  };
}
