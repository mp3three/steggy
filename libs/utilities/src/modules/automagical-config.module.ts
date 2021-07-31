import { AutomagicalConfig } from '@automagical/contracts/config';
import { LIB_UTILS } from '@automagical/contracts/constants';
import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import rc from 'rc';

import { LoggableModule } from '../decorators';

@Module({})
@LoggableModule(LIB_UTILS)
export class AutomagicalConfigModule {
  // #region Static Properties

  public static readonly config: Promise<AutomagicalConfig> = new Promise(
    (done) => (AutomagicalConfigModule.done = done),
  );

  private static done;

  // #endregion Static Properties

  // #region Public Static Methods

  public static getConfig(): Promise<AutomagicalConfig> {
    return this.config as Promise<AutomagicalConfig>;
  }

  public static register(
    appName: symbol,
    defaultConfig?: Partial<AutomagicalConfig>,
  ): DynamicModule {
    return ConfigModule.forRoot({
      isGlobal: true,
      load: [
        async () => {
          const config = rc(appName.description, {
            ...(defaultConfig || {}),
          }) as AutomagicalConfig & { configs: string[] };
          AutomagicalConfigModule.done(config);
          /**
           * Life can be unpredictable if the config isn't what you thought it was
           *
           * Print out the config at boot by default in a human readable form
           */
          if (config.PRINT_CONFIG_AT_STARTUP === true) {
            /* eslint-disable no-console */
            console.log(`<LOADED CONFIGURATION>`);
            console.log(JSON.stringify(config, undefined, '  '));
            console.log(`</LOADED CONFIGURATION>`);
            /* eslint-enable no-console */
          }
          return config;
        },
      ],
    });
  }

  // #endregion Public Static Methods
}
