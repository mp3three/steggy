import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

/**
 * Standardized way of injecting the logger
 *
 * Would like to have a more sane way of getting the lib in later
 */
export function InjectLogger(
  cls: { name: string },
  library?: string | symbol,
): ReturnType<typeof InjectPinoLogger> {
  if (typeof library === 'symbol') {
    library = library.description;
  }
  library ??= '';
  library = library.length > 0 ? `${library}:` : '';
  return InjectPinoLogger(`${library}${cls.name}`);
}
export function setLoggerContext(
  logger: PinoLogger,
  cls: { name: string },
  library?: string | symbol,
): void {
  if (typeof library === 'symbol') {
    library = library.description;
  }
  library ??= '';
  library = library.length > 0 ? `${library}:` : '';
  logger.setContext(`${library}${cls.name}`);
}
