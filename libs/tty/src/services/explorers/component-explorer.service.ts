import { Injectable } from '@nestjs/common';
import { ModuleScannerService } from '@steggy/boilerplate';

import {
  COMPONENT_CONFIG,
  ComponentOptions,
  iComponent,
} from '../../decorators';

@Injectable()
export class ComponentExplorerService {
  constructor(private readonly scanner: ModuleScannerService) {}

  public readonly REGISTERED_EDITORS = new Map<ComponentOptions, iComponent>();

  public findServiceByType<CONFIG, VALUE>(
    name: string,
  ): iComponent<CONFIG, VALUE> {
    let out: iComponent<CONFIG, VALUE>;
    this.REGISTERED_EDITORS.forEach(
      (service: iComponent<CONFIG, VALUE>, settings) => {
        if (settings.type === name) {
          out = service;
        }
      },
    );
    return out;
  }

  public findSettingsByType(type: string): ComponentOptions {
    let out: ComponentOptions;
    this.REGISTERED_EDITORS.forEach((__, settings) => {
      if (settings.type === type) {
        out = settings;
      }
    });
    return out;
  }

  protected onModuleInit(): void {
    const providers = this.scanner.findWithSymbol<ComponentOptions, iComponent>(
      COMPONENT_CONFIG,
    );
    providers.forEach((key, value) => {
      this.REGISTERED_EDITORS.set(key, value);
    });
  }
}
