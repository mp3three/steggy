import { LOGGER_LIBRARY } from '@automagical/contracts/utilities';

export function LoggableModule(prefix: symbol): ClassDecorator {
  return function (reference) {
    reference[LOGGER_LIBRARY] = prefix.description;
  };
}
