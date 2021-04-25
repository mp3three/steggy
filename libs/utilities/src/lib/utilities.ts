import { InjectPinoLogger } from 'nestjs-pino';
/**
 * @example await sleep(5000);
 */
export const sleep = (ms: number): Promise<void> =>
  new Promise((done) => setTimeout(() => done(), ms));

/**
 * Standardized way of injecting the logger
 *
 * Would like to have a more sane way of getting the lib in later
 */
export function InjectLogger(
  cls: { name: string },
  lib?: string | symbol,
): ReturnType<typeof InjectPinoLogger> {
  if (typeof lib === 'symbol') {
    lib = lib.description;
  }
  lib = lib || '';
  lib = lib.length ? `${lib}:` : '';
  return InjectPinoLogger(`${lib}${cls.name}`);
}
