import { INestApplication, Injectable } from '@nestjs/common';
import { eachSeries } from '@text-based/utilities';
import { Express } from 'express';

import { iLifecycle } from '../contracts/lifecycle';
import { BootstrapOptions } from '../includes';
import { ModuleScannerService } from './explorers/module-scanner.service';

@Injectable()
export class LifecycleService {
  constructor(private readonly scanner: ModuleScannerService) {}

  public async postInit(
    app: INestApplication,
    { server, options }: { options: BootstrapOptions; server?: Express },
  ): Promise<void> {
    const instances: Partial<{
      onPostInit(
        app: INestApplication,
        server: Express,
        options: BootstrapOptions,
      ): Promise<void>;
    }>[] = [];
    this.scanner.applicationProviders<iLifecycle>().forEach(instance => {
      if (instance.onPostInit) {
        instances.push(instance);
      }
    });
    await eachSeries(instances, async instance => {
      await instance.onPostInit(app, server, options);
    });
  }

  public async preInit(
    app: INestApplication,
    { server, options }: { options: BootstrapOptions; server?: Express },
  ): Promise<void> {
    const instances: Partial<{
      onPreInit(
        app: INestApplication,
        server: Express,
        options: BootstrapOptions,
      ): Promise<void>;
    }>[] = [];
    this.scanner.applicationProviders<iLifecycle>().forEach(instance => {
      if (instance.onPreInit) {
        instances.push(instance);
      }
    });
    await eachSeries(instances, async instance => {
      await instance.onPreInit(app, server, options);
    });
  }
}
