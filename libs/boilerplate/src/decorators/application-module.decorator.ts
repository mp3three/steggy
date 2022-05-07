import { DynamicModule, ModuleMetadata, Provider } from '@nestjs/common';
import EventEmitter from 'eventemitter3';

import { ConfigItem } from '../contracts';
import { LOGGER_LIBRARY } from '../contracts/logger/constants';
import { ACTIVE_APPLICATION } from '../contracts/meta/config';
import { RegisterCache } from '../includes';
import { BoilerplateModule } from '../modules';
import { LibraryModule } from './library-module.decorator';

export interface ApplicationModuleMetadata extends Partial<ModuleMetadata> {
  application?: symbol;
  configuration?: Record<string, ConfigItem>;
  /**
   * If omitted, will default to all
   */
  globals?: Provider[];
}

/**
 * Intended to extend on the logic of nest's `@Controller` annotation.
 * This annotation will replace that one, and is intended for modules living in the apps folder.
 */
export function ApplicationModule(
  metadata: ApplicationModuleMetadata,
): ClassDecorator {
  const propertiesKeys = Object.keys(metadata);
  // No symbol applications, for when you really just don't care
  // Doesn't meaningfully need imports I guess
  metadata.application ??= Symbol('steggy');
  metadata.imports ??= [];
  metadata.providers ??= [];
  metadata.globals ??= [];
  metadata.controllers ??= [];
  [...metadata.providers, ...metadata.controllers].forEach(provider => {
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
  metadata.imports = [
    BoilerplateModule.forRoot(),
    {
      exports: GLOBAL_SYMBOLS,
      global: true,
      module: class {},
      providers: GLOBAL_SYMBOLS,
      // Adding in 'type' for this one
      // Bootstrap will search it out, and maybe add even more symbols
      type: 'GLOBAL_SYMBOLS',
    } as DynamicModule,
    RegisterCache(),
    ...metadata.imports,
  ];
  LibraryModule.configs.set(metadata.application.description, {
    configuration: metadata.configuration ?? {},
  });
  return target => {
    target[LOGGER_LIBRARY] = metadata.application.description;
    propertiesKeys.forEach(property => {
      Reflect.defineMetadata(property, metadata[property], target);
    });
    return target;
  };
}
