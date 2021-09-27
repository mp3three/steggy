import { INestApplication, Injectable } from '@nestjs/common';
import { Express } from 'express';

import { iLifecycle } from '../contracts/lifecycle';
import { ModuleScannerService } from './module-scanner.service';

@Injectable()
export class LifecycleService {
  constructor(private readonly scanner: ModuleScannerService) {}

  public async postInit(app: INestApplication, server: Express): Promise<void> {
    this.scanner.applicationProviders<iLifecycle>().forEach((instance) => {
      if (instance.onPostInit) {
        instance.onPostInit(app, server);
      }
    });
  }

  public async preInit(app: INestApplication, server: Express): Promise<void> {
    this.scanner.applicationProviders<iLifecycle>().forEach((instance) => {
      if (instance.onPreInit) {
        instance.onPreInit(app, server);
      }
    });
  }
}
