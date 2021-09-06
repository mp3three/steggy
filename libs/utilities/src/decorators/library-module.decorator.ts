import {
  LIBRARY_CONFIG,
  LOGGER_LIBRARY,
} from '@automagical/contracts/utilities';
import { Global, ModuleMetadata } from '@nestjs/common';

export interface LibraryModuleMetadata extends Partial<ModuleMetadata> {
  // #region Object Properties

  config?: Record<string, unknown>;
  library: symbol;

  // #endregion Object Properties
}

export function LibraryModule(metadata: LibraryModuleMetadata): ClassDecorator {
  const propertiesKeys = Object.keys(metadata);
  return (target) => {
    target[LOGGER_LIBRARY] = metadata.library.description;
    metadata.providers ??= [];
    metadata.providers.forEach((provider) => {
      provider[LOGGER_LIBRARY] = metadata.library.description;
      provider[LIBRARY_CONFIG] = metadata.config;
    });
    Global()(target);
    propertiesKeys.forEach((property) => {
      Reflect.defineMetadata(property, metadata[property], target);
    });
  };
}
