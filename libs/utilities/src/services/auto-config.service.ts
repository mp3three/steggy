import { LoadConfigDefinition } from '@automagical/contracts';
import {
  ACTIVE_APPLICATION,
  AutomagicalConfig,
  CommonConfig,
  CONFIGURABLE_APPS,
  CONFIGURABLE_LIBS,
  LOG_LEVEL,
} from '@automagical/contracts/config';
import { Inject, Injectable } from '@nestjs/common';
import { ClassConstructor } from 'class-transformer';
import { get, set } from 'object-path';
import rc from 'rc';

import { AutoLogService } from './logger';

@Injectable()
export class AutoConfigService {
  // #region Object Properties

  private config: AutomagicalConfig = {};
  private defaults = new Map<string, unknown>();

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(ACTIVE_APPLICATION) private readonly APPLICATION: symbol,
  ) {
    this.config = rc(this.APPLICATION.description);
    AutoLogService.logger.level = this.get(LOG_LEVEL);
  }

  // #endregion Constructors

  // #region Public Methods

  public get<T extends unknown = string>(path: string): T {
    const value = get(this.config, path, this.getDefault(path));
    return value as T;
  }

  public getDefault<T extends unknown = unknown>(path: string): T {
    if (this.defaults.has(path)) {
      return this.defaults.get(path) as T;
    }
    const baseObject = this.getBaseObject(path);
    const result = LoadConfigDefinition(baseObject.name);
    const suffix = path.split('.').slice(2);
    const item = result?.get(suffix.join('.'));
    this.defaults.set(path, item?.default);
    return item?.default as T;
  }

  public set(path: string, value: unknown): void {
    set(this.config, path, value);
  }

  // #endregion Public Methods

  // #region Private Methods

  private getBaseObject(path: string): ClassConstructor<unknown> {
    const [group, name] = path.split('.');
    switch (group) {
      case 'libs':
        return CONFIGURABLE_LIBS.get(name);
      case 'application':
        return CONFIGURABLE_APPS.get(this.APPLICATION.description);
      case 'common':
        return CommonConfig;
    }
  }

  // #endregion Private Methods
}
