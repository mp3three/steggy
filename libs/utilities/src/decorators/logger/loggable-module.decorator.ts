import { LOGGER_LIBRARY } from '@automagical/contracts/utilities';

export function LoggableModule(prefix: symbol): ClassDecorator {
  return function (reference) {
    // eslint-disable-next-line security/detect-object-injection
    reference[LOGGER_LIBRARY] = prefix.description;
  };
}
