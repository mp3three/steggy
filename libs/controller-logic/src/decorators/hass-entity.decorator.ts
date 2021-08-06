import { HASS_ENTITY_ID } from '@automagical/contracts/controller-logic';
import { SetMetadata } from '@nestjs/common';

export function HassEntity(entity_id: string): PropertyDecorator {
  return SetMetadata(HASS_ENTITY_ID, entity_id);
}
