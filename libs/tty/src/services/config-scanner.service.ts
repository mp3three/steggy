import {
  ConfigTypeDTO,
  CONSUMES_CONFIG,
  LIBRARY_CONFIG,
  LOGGER_LIBRARY,
} from '@automagical/contracts/utilities';
import { AutoLogService, Trace } from '@automagical/utilities';
import { INestApplication, Injectable } from '@nestjs/common';
import { DiscoveryService, NestFactory } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { ClassConstructor } from 'class-transformer';

import { WorkspaceService } from './workspace.service';

type defaults = Record<string, unknown>;

@Injectable()
export class ConfigScannerService {
  // #region Object Properties

  private application: INestApplication;

  // #endregion Object Properties

  constructor(
    private readonly logger: AutoLogService,
    private readonly workspace: WorkspaceService,
  ) {}

  // #region Public Methods

  @Trace()
  public async scan(
    module: ClassConstructor<unknown>,
  ): Promise<ConfigTypeDTO[]> {
    this.application = await NestFactory.create(module, {
      logger: AutoLogService.nestLogger,
    });
    const discoveryService = this.application.get(DiscoveryService);
    const providers = discoveryService.getProviders().filter((wrapper) => {
      if (!wrapper || !wrapper.instance) {
        return false;
      }
      if (wrapper.isNotMetatype) {
        return false;
      }
      const { instance } = wrapper;
      const ctor = instance.constructor;
      return typeof ctor[CONSUMES_CONFIG] !== 'undefined';
    });

    return await this.scanProviders(providers);
  }

  // #endregion Public Methods

  private async scanProviders(
    providers: InstanceWrapper[],
  ): Promise<ConfigTypeDTO[]> {
    const out: ConfigTypeDTO[] = [];
    providers.forEach((wrapper) => {
      const { instance } = wrapper;
      const ctor = instance.constructor;
      const runtimeDetaults: defaults = ctor[LIBRARY_CONFIG];
      const config: (keyof defaults)[] = ctor[CONSUMES_CONFIG];
      const library: string = ctor[LOGGER_LIBRARY];

      config.forEach((property: string) => {
        if (typeof runtimeDetaults[property] === 'undefined') {
          // eslint-disable-next-line unicorn/no-null
          runtimeDetaults[property] = null;
          this.logger.warn(
            { library, property },
            `config property lacks runtime default`,
          );
        }
        const metadata = this.workspace.METADATA.get(library);
        const metadataConfig = metadata.configuration[property];
        out.push({
          default: runtimeDetaults[property],
          library,
          metadata: metadataConfig,
          property,
        });
      });
    });

    return out;
  }
}
