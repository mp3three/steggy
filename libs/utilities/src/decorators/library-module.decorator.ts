import {
  LIBRARY_CONFIG,
  LOGGER_LIBRARY,
} from '@automagical/contracts/utilities';
import { Global, ModuleMetadata } from '@nestjs/common';

import { AutoConfigService } from '../services/auto-config.service';

export interface LibraryModuleMetadata extends Partial<ModuleMetadata> {
  config?: Record<string, unknown>;
  library: symbol;
}

export function LibraryModule(metadata: LibraryModuleMetadata): ClassDecorator {
  const propertiesKeys = Object.keys(metadata);
  const library = metadata.library.description;
  return (target) => {
    target[LOGGER_LIBRARY] = library;
    metadata.providers ??= [];
    metadata.providers.forEach((provider) => {
      provider[LOGGER_LIBRARY] = library;
      provider[LIBRARY_CONFIG] = metadata.config;
    });
    AutoConfigService.DEFAULTS.set(library, metadata.config);
    Global()(target);
    propertiesKeys.forEach((property) => {
      Reflect.defineMetadata(property, metadata[property], target);
    });
  };
}
