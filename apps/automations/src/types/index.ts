import { is } from '@text-based/utilities';

export async function sendRequest<T>(
  info: RequestInfo,
  init?: RequestInit,
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
  return await result.json();
}
