import { LIGHTING_CONTROLLER } from '../contracts';

export function LightingController(): PropertyDecorator {
  return function (target, key: string) {
    target.constructor[LIGHTING_CONTROLLER] = key;
  };
}
