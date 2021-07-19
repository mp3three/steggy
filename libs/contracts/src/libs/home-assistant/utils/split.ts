import { HASS_DOMAINS } from '@automagical/contracts/home-assistant';

export function split(
  entity: { entity_id: string } | string,
): [HASS_DOMAINS, string] {
  if (typeof entity === 'object') {
    entity = entity.entity_id;
  }
  return entity.split('.') as [HASS_DOMAINS, string];
}

export function domain(entity: { entity_id: string } | string): HASS_DOMAINS {
  if (typeof entity === 'object') {
    entity = entity.entity_id;
  }
  return split(entity)[0];
}
