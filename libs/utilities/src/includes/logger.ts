import { ClassConstructor } from 'class-transformer';

import { LOGGER_LIBRARY } from '../contracts';

export function getLogContext(instance: ClassConstructor<unknown>): string {
  return `${instance.constructor[LOGGER_LIBRARY]}:${instance.constructor.name}`;
}
