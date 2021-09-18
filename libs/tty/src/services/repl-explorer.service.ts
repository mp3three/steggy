import { Info, ModuleScannerService, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { iRepl, REPL_CONFIG, ReplOptions } from '..';

@Injectable()
export class ReplExplorerService {
  public readonly REGISTERED_APPS = new Map<ReplOptions, iRepl>();

  constructor(private readonly scanner: ModuleScannerService) {}

  @Trace()
  public findServiceByName(name: string): iRepl {
    let out: iRepl;
    this.REGISTERED_APPS.forEach((service, settings) => {
      if (settings.name === name) {
        out = service;
      }
    });
    return out;
  }

  @Trace()
  public findSettingsByName(name: string): ReplOptions {
    let out: ReplOptions;
    this.REGISTERED_APPS.forEach((service, settings) => {
      if (settings.name === name) {
        out = settings;
      }
    });
    return out;
  }

  @Info({ after: '[Repl] Initialized' })
  protected onModuleInit(): void {
    const providers = this.scanner.findWithSymbol<ReplOptions, iRepl>(
      REPL_CONFIG,
    );
    providers.forEach((key, value) => {
      this.REGISTERED_APPS.set(key, value);
    });
  }
}
