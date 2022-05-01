import { is } from '@steggy/utilities';

import { HASS_DOMAINS } from './socket';

export function split(
  entity: { entity_id: string } | string,
): [HASS_DOMAINS, string] {
  if (is.object(entity)) {
    entity = entity.entity_id;
  }
  return entity.split('.') as [HASS_DOMAINS, string];
}

export function domain(entity: { entity_id: string } | string): HASS_DOMAINS {
  if (is.object(entity)) {
    entity = entity.entity_id;
  }
  return split(entity).shift() as HASS_DOMAINS;
}
