import { DynamicModule, Module } from '@nestjs/common';
import * as NestConfig from '@nestjs/config';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { AutomagicalConfig } from '../typings';
import yaml from 'js-yaml';
import ini from 'ini';
import JSON from 'comment-json';
import rc from 'rc';

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
  >(appName: string, defaultConfig: Arg = null): DynamicModule {
    return NestConfig.ConfigModule.forRoot({
      isGlobal: true,
      load: [
        async () => {
          // File picking, loading, and merging handled by rc
          const config: AutomagicalConfig<T> = rc(
            appName,
            defaultConfig,
            null,
            (content: string): Record<string, unknown> => {
              // Attempt to parse as JSON
              if (/^\s*\{/.test(content)) {
                return JSON.parse(content);
              }
              // Attempt YAML next
              const config = yaml.load(content) as Record<string, unknown>;
              if (typeof config === 'object' && config !== null) {
                return config;
              }
              // Default to ini
              return ini.parse(content);
            },
          );
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
    // TODO This entire loader needs an overhaul
    // It's a barely functional disaster

    // console.info(
    //   `[WARN] config-module - Could not find environment file: ${envFilePath}`,
    // );
    return {};
  }

  // #endregion Private Static Methods
}
