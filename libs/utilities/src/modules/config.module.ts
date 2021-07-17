import { AutomagicalConfig } from '@automagical/contracts/config';
import { LIB_TESTING } from '@automagical/contracts/constants';
import { DynamicModule, Module } from '@nestjs/common';
import * as NestConfig from '@nestjs/config';
import rc from 'rc';

@Module({})
export class ConfigModule {
  // #region Static Properties

  public static readonly config: Promise<AutomagicalConfig> = new Promise(
    (done) => (ConfigModule.done = done),
  );

  private static done;

  // #endregion Static Properties

  // #region Public Static Methods

  public static getConfig(): Promise<AutomagicalConfig> {
    return this.config as Promise<AutomagicalConfig>;
  }

  public static register<
    T extends Record<never, unknown>,
    Argument extends AutomagicalConfig = AutomagicalConfig,
  >(appName: string | symbol, defaultConfig?: Argument): DynamicModule {
    return NestConfig.ConfigModule.forRoot({
      isGlobal: true,
      load: [
        async () => {
          // File picking, loading, and merging handled by rc
          if (typeof appName === 'symbol') {
            appName = appName.description;
          }
          const config = rc(appName, {
            ...(defaultConfig || {}),
          }) as AutomagicalConfig & { configs: string[] };
          ConfigModule.done(config);
          /**
           * Life can be unpredictable if the config isn't what you thought it was
           *
           * Print out the config at boot by default in a human readable form
           */
          if (appName !== LIB_TESTING && config.SKIP_CONFIG_PRINT !== true) {
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
