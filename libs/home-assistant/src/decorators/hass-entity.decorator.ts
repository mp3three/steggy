import {
  HASS_ENTITY,
  HASS_ENTITY_GROUP,
} from '@automagical/home-assistant';
import { SetMetadata } from '@nestjs/common';

export function HassEntity(entity_id: string): PropertyDecorator {
  return SetMetadata(HASS_ENTITY, entity_id);
}
export function HassEntityGroup(entity_id: string[]): PropertyDecorator {
  return SetMetadata(HASS_ENTITY_GROUP, entity_id);
}
