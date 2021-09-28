import { INestApplication, Injectable } from '@nestjs/common';
import { eachSeries } from 'async';
import { Express } from 'express';

import { iLifecycle } from '../contracts/lifecycle';
import { ModuleScannerService } from './module-scanner.service';

@Injectable()
export class LifecycleService {
  constructor(private readonly scanner: ModuleScannerService) {}

  public async postInit(app: INestApplication, server: Express): Promise<void> {
    const instances: Partial<{
      onPostInit(app: INestApplication, server: Express): Promise<void>;
    }>[] = [];
    this.scanner.applicationProviders<iLifecycle>().forEach((instance) => {
      if (instance.onPostInit) {
        instances.push(instance);
      }
    });
    await eachSeries(instances, async (instance, callback) => {
      await instance.onPostInit(app, server);
      callback();
    });
  }

  public async preInit(app: INestApplication, server: Express): Promise<void> {
    const instances: Partial<{
      onPreInit(app: INestApplication, server: Express): Promise<void>;
    }>[] = [];
    this.scanner.applicationProviders<iLifecycle>().forEach((instance) => {
      if (instance.onPreInit) {
        instances.push(instance);
      }
    });
    await eachSeries(instances, async (instance, callback) => {
      await instance.onPreInit(app, server);
      callback();
    });
  }
}
