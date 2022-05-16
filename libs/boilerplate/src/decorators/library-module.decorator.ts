import { Global, ModuleMetadata } from '@nestjs/common';

import { ConfigItem, LOGGER_LIBRARY, RepoMetadataDTO } from '../contracts';

export interface LibraryModuleMetadata extends Partial<ModuleMetadata> {
  configuration: Record<string, ConfigItem>;
  global?: boolean;
  library: symbol;
}

export function LibraryModule(metadata: LibraryModuleMetadata): ClassDecorator {
  const propertiesKeys = Object.keys(metadata);
  const library = metadata.library.description;
  LibraryModule.configs.set(library, { configuration: metadata.configuration });
  return target => {
    target[LOGGER_LIBRARY] = library;
    metadata.providers ??= [];
    metadata.providers.forEach(provider => {
      provider[LOGGER_LIBRARY] = library;
    });
    if (metadata.global) {
      Global()(target);
    }
    delete metadata.global;
    propertiesKeys.forEach(property => {
      Reflect.defineMetadata(property, metadata[property], target);
    });
  };
}
LibraryModule.configs = new Map<string, RepoMetadataDTO>();
