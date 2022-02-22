import { HASS_DOMAINS } from '@automagical/home-assistant-shared';
import { is } from '@automagical/utilities';

// EVERYTHING IN THIS FILE NEEDS TO BE REFACTORED
/**
 * Straight up hard coding stuff here
 */
export async function sendRequest<T>(
  info: RequestInfo,
  init?: RequestInit,
  text = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'x-admin-key':
      'mainline dolt orangery catchall cantor beck couscous knickers',
  };
  if (!is.undefined(init?.body)) {
    headers['Content-Type'] = 'application/json; charset=utf-8';
  }
  const result = await fetch(`http://10.0.0.5:7000${info}`, {
    ...init,
    headers,
  });
  if (text) {
    return (await result.text()) as unknown as T;
  }
  return await result.json();
}
sendRequest.url = function (info: string): string {
  return `http://10.0.0.5:7000${info}`;
};

/**
 * This should come from home-assistant-shared, but doing so makes webpack shit a brick for no reason
 */
export function split(
  entity: { entity_id: string } | string,
): [HASS_DOMAINS, string] {
  if (is.object(entity)) {
    entity = entity.entity_id;
  }
  return entity.split('.') as [HASS_DOMAINS, string];
}
/**
 * This should come from home-assistant-shared, but doing so makes webpack shit a brick for no reason
 */
export function domain(entity: { entity_id: string } | string): HASS_DOMAINS {
  if (is.object(entity)) {
    entity = entity.entity_id;
  }
  return split(entity).shift() as HASS_DOMAINS;
}
