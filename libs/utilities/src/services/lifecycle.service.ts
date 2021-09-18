import { INestApplication, Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { Express } from 'express';

import { Debug } from '../decorators/logger.decorator';

@Injectable()
export class LifecycleService {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Debug('onPostInit')
  public async postInit(app: INestApplication, server: Express): Promise<void> {
    this.discoveryService.getProviders().forEach((wrapper) => {
      if (!wrapper.instance) {
        return;
      }
      if (!wrapper.instance.onPostInit) {
        return;
      }
      wrapper.instance.onPostInit(app, server);
    });
  }

  @Debug('onPreInit')
  public async preInit(app: INestApplication, server: Express): Promise<void> {
    this.discoveryService.getProviders().forEach((wrapper) => {
      if (!wrapper.instance) {
        return;
      }
      if (!wrapper.instance.onPreInit) {
        return;
      }
      wrapper.instance.onPreInit(app, server);
    });
  }
}
