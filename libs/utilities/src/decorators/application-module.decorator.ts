import {
  ACTIVE_APPLICATION,
  AutomagicalConfig,
} from '@automagical/contracts/config';
import type { iRoomController } from '@automagical/contracts/controller-logic';
import { LOGGER_LIBRARY } from '@automagical/contracts/utilities';
import { ModuleMetadata, Provider } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

import { RegisterCache } from '../includes/';
import { MQTTModule, UtilitiesModule } from '../modules';

export interface ApplicationModuleMetadata extends Partial<ModuleMetadata> {
  // #region Object Properties

  application: symbol;
  /**
   * If omitted, will default to all
   */
  dashboards?: Provider[];
  default_config?: Partial<AutomagicalConfig>;
  globals?: Provider[];
  rooms?: Provider<iRoomController>[];

  // #endregion Object Properties
}

/**
 * Intended to extend on the logic of nest's `@Controller` annotation.
 * This annotation will replace that one, and is intended for modules living in the apps folder.
 *
 * It takes in this additional information:
 *
 *  - `rooms`: Rooms allow for loading of home assistant entity observables, and custom logic binding (`custom-logic`, `home-assistant`)
 *  - `application`: The symbol that represents the application. Used for config loading, logging, and related
 *  - `dashboard`: Dashboards interact with the terminal using `blessed` components. (`terminal`)
 */
export function ApplicationModule(
  metadata: ApplicationModuleMetadata,
): ClassDecorator {
  const propertiesKeys = Object.keys(metadata);
  metadata.imports ??= [];
  metadata.providers ??= [];
  metadata.globals ??= [];
  metadata.rooms ??= [];
  metadata.dashboards ??= [];
  metadata.providers = [
    ...metadata.providers,
    ...metadata.rooms,
    ...metadata.dashboards,
  ];
  const GLOBAL_SYMBOLS: Provider[] = [
    {
      provide: ACTIVE_APPLICATION,
      useValue: metadata.application,
    },
    {
      provide: EventEmitter2,
      useValue: new EventEmitter2({
        delimiter: '/',
        maxListeners: 20,
        newListener: false,
        removeListener: false,
        wildcard: true,
      }),
    },
    ...metadata.globals,
  ];
  metadata.imports.push(
    {
      exports: GLOBAL_SYMBOLS,
      global: true,
      module: class {},
      providers: GLOBAL_SYMBOLS,
    },
    MQTTModule,
    UtilitiesModule.forRoot(),
    RegisterCache(),
  );

  return (target) => {
    target[LOGGER_LIBRARY] = metadata.application.description;

    propertiesKeys.forEach((property) => {
      Reflect.defineMetadata(property, metadata[property], target);
    });
  };
}
