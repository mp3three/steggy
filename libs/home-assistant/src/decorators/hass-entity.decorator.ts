import { SetMetadata } from '@nestjs/common';
import {
  HASS_ENTITY,
  HASS_ENTITY_GROUP,
} from '@steggy/home-assistant-shared';

export function HassEntity(entity_id: string): PropertyDecorator {
  return SetMetadata(HASS_ENTITY, entity_id);
}
export function HassEntityGroup(entity_id: string[]): PropertyDecorator {
  return SetMetadata(HASS_ENTITY_GROUP, entity_id);
}
