import { ModuleMetadata, Provider } from '@nestjs/common';
import EventEmitter from 'eventemitter3';

import { USE_THIS_CONFIG } from '../contracts';
import { LOGGER_LIBRARY } from '../contracts/logger/constants';
import { AbstractConfig,ACTIVE_APPLICATION } from '../contracts/meta/config';
import { RegisterCache } from '../includes';
import { UtilitiesModule } from '../modules';

export interface ApplicationModuleMetadata extends Partial<ModuleMetadata> {
  application: symbol;
  /**
   * If omitted, will default to all
   */
  globals?: Provider[];
}
let useThisConfig: AbstractConfig;

/**
 * Intended to extend on the logic of nest's `@Controller` annotation.
 * This annotation will replace that one, and is intended for modules living in the apps folder.
 */
export function ApplicationModule(
  metadata: ApplicationModuleMetadata,
): ClassDecorator {
  const propertiesKeys = Object.keys(metadata);
  metadata.imports ??= [];
  metadata.providers ??= [];
  metadata.globals ??= [];
  metadata.controllers ??= [];
  [...metadata.providers, ...metadata.controllers].forEach((provider) => {
    provider[LOGGER_LIBRARY] = metadata.application.description;
  });
  const GLOBAL_SYMBOLS: Provider[] = [
    {
      provide: ACTIVE_APPLICATION,
      useValue: metadata.application,
    },
    {
      provide: EventEmitter,
      useFactory() {
        return new EventEmitter();
      },
    },
    ...metadata.globals,
  ];
  if (useThisConfig) {
    GLOBAL_SYMBOLS.push({
      provide: USE_THIS_CONFIG,
      useValue: useThisConfig,
    });
  }
  metadata.imports = [
    UtilitiesModule.forRoot(),
    {
      exports: GLOBAL_SYMBOLS,
      global: true,
      module: class {},
      providers: GLOBAL_SYMBOLS,
    },
    RegisterCache(),
    ...metadata.imports,
  ];
  return (target) => {
    target[LOGGER_LIBRARY] = metadata.application.description;
    propertiesKeys.forEach((property) => {
      Reflect.defineMetadata(property, metadata[property], target);
    });
  };
}
ApplicationModule.useThisConfig = function (config: AbstractConfig) {
  useThisConfig = config;
};
