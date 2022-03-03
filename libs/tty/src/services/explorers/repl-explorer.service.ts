import { AutoLogService, ModuleScannerService } from '@automagical/boilerplate';
import { Injectable } from '@nestjs/common';

import { iRepl, REPL_CONFIG, ReplOptions } from '../../contracts';

@Injectable()
export class ReplExplorerService {
  constructor(
    private readonly scanner: ModuleScannerService,
    private readonly logger: AutoLogService,
  ) {}

  public readonly REGISTERED_APPS = new Map<ReplOptions, iRepl>();

  public findServiceByName(name: string): iRepl {
    let out: iRepl;
    this.REGISTERED_APPS.forEach((service, settings) => {
      if (settings.name === name) {
        out = service;
      }
    });
    return out;
  }

  public findSettingsByName(name: string): ReplOptions {
    let out: ReplOptions;
    this.REGISTERED_APPS.forEach((service, settings) => {
      if (settings.name === name) {
        out = settings;
      }
    });
    return out;
  }

  protected onModuleInit(): void {
    const providers = this.scanner.findWithSymbol<ReplOptions, iRepl>(
      REPL_CONFIG,
    );
    providers.forEach((key, value) => {
      this.REGISTERED_APPS.set(key, value);
    });
    this.logger.info(`[Repl] Initialized`);
  }
}
