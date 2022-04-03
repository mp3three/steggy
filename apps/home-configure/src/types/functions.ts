import { HASS_DOMAINS } from '@automagical/home-assistant-shared';
import {
  controlToQuery,
  FetchArguments,
  FetchParameterTypes,
  FetchWith,
  is,
  ResultControlDTO,
} from '@automagical/utilities';

import { ADMIN_KEY, BASE_URL } from './constants';

export async function sendRequest<T>({
  rawUrl,
  url,
  headers,
  process,
  body,
  method,
  ...fetchWith
}: Partial<FetchArguments>): Promise<T> {
  let endpoint = rawUrl
    ? url
    : `${(fetchWith.baseUrl ?? sendRequest.BASE_URL) || ''}${sendRequest.url(
        url,
      )}`;
  if (fetchWith.control || fetchWith.params) {
    endpoint = `${endpoint}?${buildFilterString(fetchWith)}`;
  }
  headers ??= {};
  if (sendRequest.ADMIN_KEY) {
    headers['x-admin-key'] ??= sendRequest.ADMIN_KEY;
  }
  if (is.object(body)) {
    body = JSON.stringify(body);
    headers['Content-Type'] = 'application/json; charset=utf-8';
  }
  const result = await fetch(endpoint, {
    body: body as string,
    headers: headers as Record<string, string>,
    method,
  });
  if (process === false) {
    return result as unknown as T;
  }
  const text = await result.text();
  if (process === 'text') {
    return text as unknown as T;
  }
  return JSON.parse(text) as T;
}
sendRequest.url = function (info: string): string {
  return `/api${info}`;
};
sendRequest.ADMIN_KEY = localStorage.getItem(ADMIN_KEY);
sendRequest.BASE_URL = localStorage.getItem(BASE_URL);

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

function cast(item: FetchParameterTypes): string {
  if (Array.isArray(item)) {
    return item.map(i => cast(i)).join(',');
  }
  if (item instanceof Date) {
    return item.toISOString();
  }
  if (is.number(item)) {
    return item.toString();
  }
  if (is.boolean(item)) {
    return item ? 'true' : 'false';
  }
  return item;
}

function buildFilterString(
  fetchWith: FetchWith<{
    filters?: Readonly<ResultControlDTO>;
    params?: Record<string, FetchParameterTypes>;
  }>,
): string {
  return new URLSearchParams({
    ...controlToQuery(fetchWith.control ?? {}),
    ...Object.fromEntries(
      Object.entries(fetchWith.params ?? {}).map(([label, value]) => [
        label,
        cast(value),
      ]),
    ),
  }).toString();
}
