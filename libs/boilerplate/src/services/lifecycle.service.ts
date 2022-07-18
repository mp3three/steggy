import { INestApplication, Injectable } from '@nestjs/common';
import { eachSeries } from '@steggy/utilities';
import { Express } from 'express';

import { iSteggyProvider } from '../contracts';
import { BootstrapOptions } from '../includes';
import { ModuleScannerService } from './explorers/module-scanner.service';

/**
 * Part of bootstrap process. Internal use
 */
@Injectable()
export class LifecycleService {
  constructor(private readonly scanner: ModuleScannerService) {}

  public async postInit(
    app: INestApplication,
    { server, options }: { options: BootstrapOptions; server?: Express },
  ): Promise<void> {
    const instances: Partial<iSteggyProvider>[] = [];
    this.scanner.applicationProviders<iSteggyProvider>().forEach(instance => {
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
    const instances: Partial<iSteggyProvider>[] = [];
    this.scanner.applicationProviders<iSteggyProvider>().forEach(instance => {
      if (instance.onPreInit || instance.rewire) {
        instances.push(instance);
      }
    });
    await eachSeries(instances, async instance => {
      if (instance.rewire) {
        await instance.rewire(app, options);
      }
    });
    await eachSeries(instances, async instance => {
      if (instance.onPostInit) {
        await instance.onPreInit(app, server, options);
      }
    });
  }
}
