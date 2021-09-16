import { iRepl, REPL_CONFIG, ReplOptions } from '@automagical/tty';
import { AutoLogService, Info, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

@Injectable()
export class ReplExplorerService {
  public readonly REGISTERED_APPS = new Map<ReplOptions, iRepl>();

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly logger: AutoLogService,
  ) {}

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
    const providers: InstanceWrapper<iRepl>[] = this.discoveryService
      .getProviders()
      .filter(({ instance }) => !!instance);
    providers.forEach((wrapper) => {
      const { instance } = wrapper;
      const proto = instance.constructor;
      if (!proto || !proto[REPL_CONFIG]) {
        return;
      }
      const settings: ReplOptions = proto[REPL_CONFIG];
      this.logger.debug(`Found repl [${settings.name}]`);
      this.REGISTERED_APPS.set(proto[REPL_CONFIG], instance);
    });
  }
}
