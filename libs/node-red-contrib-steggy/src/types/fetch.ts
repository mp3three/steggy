import {
  controlToQuery,
  FetchArguments,
  FetchParameterTypes,
  FetchWith,
  is,
  ResultControlDTO,
} from '@steggy/utilities';
import fetch from 'node-fetch';

export async function sendRequest<T>({
  rawUrl,
  url,
  headers,
  process,
  adminKey,
  baseUrl,
  body,
  method,
  ...fetchWith
}: Partial<FetchArguments>): Promise<T> {
  let endpoint = rawUrl ? url : `${baseUrl || ''}/api${url}`;
  if (fetchWith.control || fetchWith.params) {
    endpoint = `${endpoint}?${buildFilterString(fetchWith)}`;
  }
  headers ??= {};
  headers['x-admin-key'] ??= adminKey;
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
