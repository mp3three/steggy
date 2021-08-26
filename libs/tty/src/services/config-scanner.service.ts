import { CONSUMES_CONFIG } from '@automagical/contracts/utilities';
import { AutoLogService, Trace } from '@automagical/utilities';
import { INestApplication, Injectable } from '@nestjs/common';
import { DiscoveryService, NestFactory } from '@nestjs/core';
import { ClassConstructor } from 'class-transformer';

@Injectable()
export class ConfigScannerService {
  // #region Object Properties

  private application: INestApplication;

  // #endregion Object Properties

  // #region Public Methods

  @Trace()
  public async scan(module: ClassConstructor<unknown>): Promise<string[]> {
    this.application = await NestFactory.create(module, {
      logger: AutoLogService.nestLogger,
    });
    const discoveryService = this.application.get(DiscoveryService);
    const providers = discoveryService.getProviders();
    const configs: string[] = [];
    providers.forEach((wrapper) => {
      if (!wrapper || !wrapper.instance) {
        return;
      }
      if (wrapper.isNotMetatype) {
        return;
      }
      const { instance } = wrapper;
      const ctor = instance.constructor;
      ctor[CONSUMES_CONFIG] ??= [];
      if (typeof ctor[CONSUMES_CONFIG] === 'string') {
        ctor[CONSUMES_CONFIG] = [ctor[CONSUMES_CONFIG]];
      }
      ctor[CONSUMES_CONFIG].forEach((config: string) => {
        if (!configs.includes(config)) {
          configs.push(config);
        }
      });
    });
    return configs;
  }

  // #endregion Public Methods
}
