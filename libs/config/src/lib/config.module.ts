import { DynamicModule, Module } from '@nestjs/common';
import * as NestConfig from '@nestjs/config';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { AutomagicalConfig } from '../typings';
import * as yaml from 'js-yaml';

@Module({})
export class ConfigModule {
  // #region Static Properties

  /**
   * This serves many libs, but realistically a running app will only ever have 1 config at a time.
   * It is stored here for easy access by anything that isn't using the config service.
   * Probably a bootstrapping process.
   */
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
    Arg extends AutomagicalConfig<T> = AutomagicalConfig<T>
  >(MergeConfig: Arg): DynamicModule {
    return NestConfig.ConfigModule.forRoot({
      isGlobal: true,
      load: [
        async () => {
          const config: AutomagicalConfig<T> = MergeConfig || {};
          config.NODE_ENV = process.env.NODE_ENV;
          [
            `user-env.${process.env.NODE_ENV.toLowerCase()}.yaml`,
            'user-env.yaml',
            `assets/user-env.${process.env.NODE_ENV.toLowerCase()}.yaml`,
            'assets/user-env.yaml',
          ].forEach(async (file) => {
            const data = await this.loadEnvFile(file);
            Object.keys(data).forEach((key) => {
              config[key] = config[key] || {};
              config[key] = {
                ...data[key],
                ...config[key],
              };
            });
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
    const envFilePath = resolve(process.cwd(), file);
    if (existsSync(envFilePath)) {
      return yaml.load(readFileSync(envFilePath, 'utf-8')) as AutomagicalConfig;
    }
    console.log(`Could not find environment file: ${envFilePath}`);
    return {};
  }

  // #endregion Private Static Methods
}
