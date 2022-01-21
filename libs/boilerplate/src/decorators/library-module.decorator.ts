import { Global, ModuleMetadata } from '@nestjs/common';

import { LOGGER_LIBRARY } from '../contracts';

export interface LibraryModuleMetadata extends Partial<ModuleMetadata> {
  library: symbol;
  local?: boolean;
}

export function LibraryModule(metadata: LibraryModuleMetadata): ClassDecorator {
  const propertiesKeys = Object.keys(metadata);
  const library = metadata.library.description;
  return (target) => {
    target[LOGGER_LIBRARY] = library;
    metadata.providers ??= [];
    metadata.providers.forEach((provider) => {
      provider[LOGGER_LIBRARY] = library;
    });
    if (!metadata.local) {
      Global()(target);
    }
    delete metadata.local;
    propertiesKeys.forEach((property) => {
      Reflect.defineMetadata(property, metadata[property], target);
    });
  };
}
