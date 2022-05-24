import { DynamicModule, ModuleMetadata, Provider } from '@nestjs/common';
import { is } from '@steggy/utilities';
import EventEmitter from 'eventemitter3';
import { exit } from 'process';

import {
  ACTIVE_APPLICATION,
  ConfigItem,
  CONSUMES_CONFIG,
  LOGGER_LIBRARY,
  StringConfig,
} from '../contracts';
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
    { provide: ACTIVE_APPLICATION, useValue: metadata.application },
    { provide: EventEmitter, useValue: new EventEmitter() },
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
    FindUnregisteredConfigurations(
      [...metadata.providers, ...metadata.controllers],
      metadata.application.description,
      target.name,
    );
    propertiesKeys.forEach(property => {
      Reflect.defineMetadata(property, metadata[property], target);
    });
    return target;
  };
}

/**
 * The ApplicationModule supports injecting configurations without having them actually registered against the module.
 * This step is to actually do the registration on behalf of the developer with as much information as is available now.
 *
 * At minimum, the result of running this is to announce the existence of the property so that command line switches +
 * environment variables can be properly injected
 *
 * If trying to do a cross module config injection (`@InjectConfig('PROPERTY_NAME',TARGET_MODULE)`), and the target doesn't exist,
 * then exit early with error. Library modules shouldn't be taking the lazy way out.
 */
function FindUnregisteredConfigurations(
  providers: Provider[],
  application: string,
  providerName: string,
): void {
  const metadata = LibraryModule.configs.get(application);
  providers.forEach(provider => {
    const config = provider[CONSUMES_CONFIG] as [string, symbol][];
    if (!config) {
      return;
    }
    config.forEach(([path, project]) => {
      if (project) {
        const reference = LibraryModule.configs.get(project.description);
        if (is.undefined(reference.configuration[path])) {
          // Pre-bootstrap error. Only option is to go to the console directly
          // eslint-disable-next-line no-console
          console.error(
            `[${providerName}] Cannot @InjectConfig ${path} of module ${project.description}. Metadata not provided for property`,
          );
          exit();
        }
        return;
      }
      metadata.configuration[path] ??= {
        description: 'No description provided',
        type: 'string',
      } as ConfigItem<StringConfig>;
    });
  });
}
