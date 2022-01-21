export async function sendRequest<T>(
  info: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const result = await fetch(`http://10.0.0.5:7000${info}`, {
    ...init,
    headers: {
      'x-admin-key':
        'mainline dolt orangery catchall cantor beck couscous knickers',
    },
  });
  return await result.json();
}
