import { DynamicModule, Module } from '@nestjs/common';
import * as NestConfig from '@nestjs/config';
import { existsSync, readFileSync } from 'fs';
import yaml from 'js-yaml';
import { resolve } from 'path';
import rc from 'rc';

import { AutomagicalConfig } from '../typings';
import { GlobalDefaults } from './defaults';

@Module({})
export class ConfigModule {
  // #region Static Properties

  public static readonly config: Promise<AutomagicalConfig> = new Promise(
    (done) => (ConfigModule.done = done),
  );

  private static done;

  // #endregion Static Properties

  // #region Public Static Methods

  public static getConfig<T>(): Promise<AutomagicalConfig<T>> {
    return this.config as Promise<AutomagicalConfig<T>>;
  }

  public static register<
    T extends Record<never, unknown>,
    Argument extends AutomagicalConfig<T> = AutomagicalConfig<T>
  >(appName: string | symbol, defaultConfig?: Argument): DynamicModule {
    return NestConfig.ConfigModule.forRoot({
      isGlobal: true,
      load: [
        async () => {
          // File picking, loading, and merging handled by rc
          if (typeof appName === 'symbol') {
            appName = appName.description;
          }
          const config: AutomagicalConfig<T> = rc(appName, {
            ...GlobalDefaults,
            ...(defaultConfig || {}),
          });
          ConfigModule.done(config);
          return config;
        },
      ],
    });
  }

  // #endregion Public Static Methods

  // #region Private Static Methods

  private static async loadEnvFile(file: string): Promise<AutomagicalConfig> {
    const environmentFilePath = resolve(process.cwd(), file);
    if (existsSync(environmentFilePath)) {
      return yaml.load(
        readFileSync(environmentFilePath, 'utf-8'),
      ) as AutomagicalConfig;
    }
    return {};
  }

  // #endregion Private Static Methods
}
