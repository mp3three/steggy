import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { get, set } from 'object-path';

@Injectable()
export class UpdatableConfigService extends ConfigService {
  // #region Object Properties

  private modifications = new Map<string, unknown>();

  // #endregion Object Properties

  // #region Private Accessors

  private get config() {
    this['internalConfig']._PROCESS_ENV_VALIDATED ??= {};
    return this['internalConfig']._PROCESS_ENV_VALIDATED;
  }

  // #endregion Private Accessors

  // #region Public Methods

  public restore(): void {
    this.modifications.forEach((value, key) => {
      set(this.config, key, value);
    });
    this.modifications = new Map();
  }

  public set(path: string, value: unknown): void {
    this.modifications.set(path, get(this.config, path));
    set(this.config, path, value);
  }

  // #endregion Public Methods
}
