import { LOGGER_LIBRARY } from '@automagical/contracts/utilities';
import { ClassConstructor } from 'class-transformer';

export function getLogContext(instance: ClassConstructor<unknown>): string {
  return `${instance.constructor[LOGGER_LIBRARY]}:${instance.constructor.name}`;
}
