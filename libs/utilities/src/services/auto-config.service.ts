/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Inject, Injectable, Optional } from '@nestjs/common';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { get, set } from 'object-path';
import { join } from 'path';
import { cwd } from 'process';
import rc from 'rc';

import { LOG_LEVEL } from '../config';
import {
  AutomagicalMetadataDTO,
  ConfigItem,
  LIB_UTILS,
  METADATA_FILE,
  USE_THIS_CONFIG,
} from '../contracts';
import {
  ACTIVE_APPLICATION,
  AutomagicalConfig,
} from '../contracts/meta/config';
import { AutoLogService } from './logger/auto-log.service';

@Injectable()
export class AutoConfigService {
  public static DEFAULTS = new Map<string, Record<string, unknown>>();

  constructor(
    private readonly logger: AutoLogService,
    @Inject(ACTIVE_APPLICATION) private readonly APPLICATION: symbol,
    @Optional()
    @Inject(USE_THIS_CONFIG)
    private readonly overrideConfig: AutomagicalConfig,
  ) {
    this.earlyInit();
  }

  private config: AutomagicalConfig = {};
  private metadata = new Map<string, AutomagicalMetadataDTO>();

  public get<T extends unknown = string>(path: string | [symbol, string]): T {
    if (Array.isArray(path)) {
      path = ['libs', path[0].description, path[1]].join('.');
    }
    const value = get(this.config, path, this.getDefault(path));
    const config = this.getConfiguration(path);
    if (config.warnDefault && value === config.default) {
      this.logger.warn(
        `Configuration property {${path}} is using default value`,
      );
    }
    return value as T;
  }

  public getDefault<T extends unknown = unknown>(path: string): T {
    const configuration = this.getConfiguration(path);
    if (!configuration) {
      this.logger.fatal(
        { path },
        `Unknown configuration. Double check project.json assets + make sure property is included in metadata`,
      );
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit();
    }
    return configuration.default as T;
  }

  public set(path: string, value: unknown): void {
    set(this.config, path, value);
  }

  private earlyInit(): void {
    this.loadMetadata();
    this.config =
      this.overrideConfig ||
      rc<AutoConfigService>(this.APPLICATION.description);
    this.logger.setContext(LIB_UTILS, AutoConfigService);
    this.logger[
      'context'
    ] = `${LIB_UTILS.description}:${AutoConfigService.name}`;
    AutoLogService.logger.level = this.get([LIB_UTILS, LOG_LEVEL]);
  }

  private getConfiguration(path: string): ConfigItem {
    const parts = path.split('.');
    if (parts.length === 2) {
      const metadata = this.metadata.get(this.APPLICATION.description);
      return metadata.configuration[parts[1]];
    }
    const [, library, property] = parts;
    const metadata = this.metadata.get(library);
    return metadata.configuration[property];
  }

  private loadMetadata() {
    const isDeployed = existsSync(join(cwd(), 'assets'));
    if (isDeployed) {
      return;
    }
    const path = join(
      cwd(),
      'dist',
      'apps',
      this.APPLICATION.description,
      'assets',
    );
    const contents = readdirSync(path);
    contents.forEach((folder) => {
      this.metadata.set(
        folder,
        JSON.parse(readFileSync(join(path, folder, METADATA_FILE), 'utf-8')),
      );
    });
  }
}
