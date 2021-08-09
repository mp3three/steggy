import { LOGGER_LIBRARY } from '@automagical/contracts/utilities';
import { Global, ModuleMetadata } from '@nestjs/common';

export interface LibraryModuleMetadata extends Partial<ModuleMetadata> {
  // #region Object Properties

  library: symbol;

  // #endregion Object Properties
}

export function LibraryModule(metadata: LibraryModuleMetadata): ClassDecorator {
  const propertiesKeys = Object.keys(metadata);
  return (target) => {
    target[LOGGER_LIBRARY] = metadata.library.description;
    Global()(target);
    propertiesKeys.forEach((property) => {
      Reflect.defineMetadata(property, metadata[property], target);
    });
  };
}
