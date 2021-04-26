import { HassDomains } from '@automagical/contracts/home-assistant';

export function split(
  entity: { entity_id: string } | string,
): [HassDomains, string] {
  if (typeof entity === 'object') {
    entity = entity.entity_id;
  }
  return entity.split('.') as [HassDomains, string];
}

export function domain(entity: { entity_id: string } | string): HassDomains {
  if (typeof entity === 'object') {
    entity = entity.entity_id;
  }
  return split(entity)[0];
}
