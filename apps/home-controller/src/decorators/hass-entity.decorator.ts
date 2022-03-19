import { HASS_ENTITY_ID } from '@automagical/controller-shared';

export function HassEntity(entity_id: string): PropertyDecorator {
  return function (target, key: string) {
    target.constructor[HASS_ENTITY_ID] = {
      entity_id,
      target: key,
    };
  };
}
