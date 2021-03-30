import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { AutomagicalConfig } from '../typings';
import * as yaml from 'js-yaml';
import { readFileSync } from 'node:fs';

@Module({})
export class ConfigModules {
  // #region Public Static Methods

  public static register(MergeConfig: AutomagicalConfig = {}) {
    return ConfigModule.forRoot({
      isGlobal: true,
      load: [
        async () => {
          return {
            ...(await this.loadEnvFile()),
            ...MergeConfig,
          };
        },
      ],
    });
  }

  // #endregion Public Static Methods

  // #region Private Static Methods

  private static async loadEnvFile(): Promise<AutomagicalConfig> {
    const envFilePath = resolve(process.cwd(), '.env');
    if (existsSync(envFilePath)) {
      return yaml.load(readFileSync(envFilePath, 'utf-8')) as AutomagicalConfig;
    }
    return {};
  }

  // #endregion Private Static Methods
}
