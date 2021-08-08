import { iRoomController } from '@automagical/contracts';
import {
  ACTIVE_APPLICATION,
  AutomagicalConfig,
  CACHE_PROVIDER,
  LOG_LEVEL,
  REDIS_HOST,
  REDIS_PORT,
} from '@automagical/contracts/config';
import { LOGGER_LIBRARY } from '@automagical/contracts/utilities';
import {
  CacheModule,
  INestApplicationContext,
  ModuleMetadata,
  Provider,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import RedisStore from 'cache-manager-redis-store';
import { encode } from 'ini';
import { LoggerModule } from 'nestjs-pino';
import rc from 'rc';

import { AutoConfigService } from '..';
import { MQTTModule, UtilitiesModule } from '../modules';

enum AutoImport {
  schedule = 'schedule',
  logger = 'logger',
  cache = 'cache',
  events = 'events',
  config = 'config',
}
export interface ApplicationModuleMetadata extends Partial<ModuleMetadata> {
  // #region Object Properties

  application: symbol;
  /**
   * If omitted, will default to all
   */
  auto_import?: (keyof AutoImport)[];
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
  );
  (metadata.auto_import ?? Object.keys(AutoImport)).forEach((name) => {
    switch (name as AutoImport) {
      case AutoImport.schedule:
        return metadata.imports.push(ScheduleModule.forRoot());
      case AutoImport.logger:
        return metadata.imports.push(
          LoggerModule.forRootAsync({
            inject: [AutoConfigService],
            useFactory(configService: AutoConfigService) {
              return {
                pinoHttp: {
                  level: configService.get(LOG_LEVEL),
                },
              };
            },
          }),
        );
      case AutoImport.cache:
        return metadata.imports.push(
          CacheModule.registerAsync({
            inject: [AutoConfigService],
            useFactory(configService: AutoConfigService) {
              if (configService.get(CACHE_PROVIDER) === 'memory') {
                return {};
              }
              return {
                host: configService.get(REDIS_HOST),
                max: Number.POSITIVE_INFINITY,
                port: configService.get(REDIS_PORT),
                store: RedisStore,
                ttl: 60 * 60 * 24,
              };
            },
          }),
        );
      case AutoImport.events:
        return metadata.imports.push(
          EventEmitterModule.forRoot({
            delimiter: '/',
            global: true,
            maxListeners: 20,
            newListener: false,
            removeListener: false,
            wildcard: true,
          }),
        );
      case AutoImport.config:
        return metadata.imports.push(
          ConfigModule.forRoot({
            isGlobal: true,
            load: [
              async () => {
                const config = rc(metadata.application.description, {
                  ...(metadata.default_config ?? {}),
                }) as AutomagicalConfig & { configs: string[] };
                /**
                 * Life can be unpredictable if the config isn't what you thought it was
                 *
                 * Print out the config at boot by default in a human readable form
                 */
                if (config.PRINT_CONFIG_AT_STARTUP === true) {
                  // eslint-disable-next-line no-console
                  console.log([
                    `<LOADED CONFIGURATION>`,
                    encode(config),
                    `</LOADED CONFIGURATION>`,
                  ]);
                }
                return config;
              },
            ],
          }),
        );
    }
  });

  return (target) => {
    target[LOGGER_LIBRARY] = metadata.application.description;

    propertiesKeys.forEach((property) => {
      Reflect.defineMetadata(property, metadata[property], target);
    });
  };
}
