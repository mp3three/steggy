import { Inject, Injectable, Optional } from '@nestjs/common';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { get, set } from 'object-path';
import { join } from 'path';
import { cwd } from 'process';
import rc from 'rc';

import { LOG_LEVEL } from '../config';
import {
  AutomagicalMetadataDTO,
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

  private config: AutomagicalConfig = {};
  private metadata = new Map<string, AutomagicalMetadataDTO>();

  constructor(
    private readonly logger: AutoLogService,
    @Inject(ACTIVE_APPLICATION) private readonly APPLICATION: symbol,
    @Optional()
    @Inject(USE_THIS_CONFIG)
    private readonly overrideConfig: AutomagicalConfig,
  ) {
    this.earlyInit();
  }

  public get<T extends unknown = string>(path: string | [symbol, string]): T {
    if (Array.isArray(path)) {
      path = ['libs', path[0].description, path[1]].join('.');
    }
    const value = get(this.config, path, this.getDefault(path));
    return value as T;
  }

  public getDefault<T extends unknown = unknown>(path: string): T {
    const parts = path.split('.');
    if (parts.length === 2) {
      const metadata = this.metadata.get(this.APPLICATION.description);
      const configuration = metadata.configuration[parts[1]];
      return configuration.default as T;
    }
    const [, library, property] = parts;
    const metadata = this.metadata.get(library);
    const configuration = metadata.configuration[property];
    if (!configuration) {
      // Should appear during development time, during application bootstrap
      // Only appears if the propery is not present in the automagical.json configuration
      // Or - If the automagical.json containing the desired property is not included in build assets

      this.logger.fatal(
        { library, property },
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
    AutoLogService.logger.level = this.get([LIB_UTILS, LOG_LEVEL]);
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
