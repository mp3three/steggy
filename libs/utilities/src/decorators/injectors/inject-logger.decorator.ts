import { ClassConstructor } from 'class-transformer';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

/**
 * Standardized way of injecting the logger
 *
 * Would like to have a more sane way of getting the lib in later
 */
export function InjectLogger(): ParameterDecorator {
  return function (target: ClassConstructor<unknown>, key, index) {
    // let library = ''
    // return applyDecorators()
    // if (typeof library === 'symbol') {
    //   library = library.description;
    // }
    // library ??= '';
    // library = library.length > 0 ? `${library}:` : '';
    const result = InjectPinoLogger(target.name);
    return result(target, key, index);
  };
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
