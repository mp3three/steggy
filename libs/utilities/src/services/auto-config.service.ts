import { LIB_UTILS } from '@automagical/contracts';
import {
  ACTIVE_APPLICATION,
  AutomagicalConfig,
} from '@automagical/contracts/config';
import { USE_THIS_CONFIG } from '@automagical/contracts/utilities';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { get, set } from 'object-path';
import rc from 'rc';

import { LOG_LEVEL } from '../config';
import { AutoLogService } from './logger';

@Injectable()
export class AutoConfigService {
  public static DEFAULTS = new Map<string, Record<string, unknown>>();

  private config: AutomagicalConfig = {};

  constructor(
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
      const [, property] = parts;
      return '' as T;
    }
    const [, library, property] = parts;
    return AutoConfigService.DEFAULTS.get(library)[property] as T;
  }

  public set(path: string, value: unknown): void {
    set(this.config, path, value);
  }

  private earlyInit(): void {
    this.config = this.overrideConfig || rc(this.APPLICATION.description);
    AutoLogService.logger.level = this.get([LIB_UTILS, LOG_LEVEL]);
  }
}
