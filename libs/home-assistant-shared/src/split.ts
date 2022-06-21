import { is } from '@steggy/utilities';

export function split(
  entity: { entity_id: string } | string,
): [string, string] {
  if (is.object(entity)) {
    entity = entity.entity_id;
  }
  return entity.split('.') as [string, string];
}

export function domain(entity: { entity_id: string } | string): string {
  if (is.object(entity)) {
    entity = entity.entity_id;
  }
  return split(entity).shift();
}
