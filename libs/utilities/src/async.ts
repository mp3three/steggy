import { is } from './is';
import { ARRAY_OFFSET, SINGLE, START } from './utilities';

// ? Functions written to be similar to the offerings from the async library
// That library gave me oddly inconsistent results,
//     so these exist to replace those doing exactly what I expect
//

export async function each<T = unknown, V = unknown>(
  item: T[],
  callback: (item: T) => Promise<void | unknown>,
): Promise<void> {
  await Promise.all(item.map(async i => await callback(i)));
}

export async function eachSeries<T = unknown>(
  item: T[],
  callback: (item: T) => Promise<void>,
): Promise<void> {
  for (let i = START; i <= item.length - ARRAY_OFFSET; i++) {
    await callback(item[i]);
  }
}

/**
 * If making network calls, make sure Bottleneck isn't a better fit for the situation
 */
export async function eachLimit<T = unknown>(
  items: T[],
  callback: (item: T) => Promise<void>,
  limit: number = Number.POSITIVE_INFINITY,
): Promise<void> {
  if (is.empty(items)) {
    return;
  }
  await new Promise<void>(async done => {
    let processing = START;
    const pending = new Set(items);
    limit = Math.max(SINGLE, Math.min(limit, items.length));
    const run = async () => {
      if (is.empty(pending)) {
        processing--;
        if (processing === START) {
          done();
        }
        return;
      }
      const item = [...pending.values()].pop();
      pending.delete(item);
      await callback(item);
    };
    for (let i = START; i < limit; i++) {
      processing++;
      await run();
    }
  });
}
