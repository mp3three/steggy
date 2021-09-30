import { ModuleMetadata, Provider } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

import { LOGGER_LIBRARY } from '../contracts/logger/constants';
import { ACTIVE_APPLICATION } from '../contracts/meta/config';
import { RegisterCache } from '../includes/';
import { UtilitiesModule } from '../modules';
import { EventEmitterService } from '../services/event-emitter.service';

export interface ApplicationModuleMetadata extends Partial<ModuleMetadata> {
  application: symbol;
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
      inject: [EventEmitterService],
      provide: EventEmitter2,
      useFactory(service: EventEmitterService) {
        return new EventEmitter2({
          delimiter: '/',
          maxListeners: service.maxListeners,
          newListener: false,
          removeListener: false,
          wildcard: true,
        });
      },
    },
    ...metadata.globals,
  ];
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
