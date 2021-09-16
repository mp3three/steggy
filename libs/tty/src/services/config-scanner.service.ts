import { ACTIVE_APPLICATION } from '@automagical/contracts/config';
import {
  ConfigTypeDTO,
  CONSUMES_CONFIG,
  LOGGER_LIBRARY,
} from '@automagical/utilities';
import {
  AutoLogService,
  NEST_NOOP_LOGGER,
  Trace,
} from '@automagical/utilities';
import { INestApplication, Inject, Injectable } from '@nestjs/common';
import { DiscoveryService, NestFactory } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { ClassConstructor } from 'class-transformer';

import { WorkspaceService } from './workspace.service';

type defaults = Record<string, unknown>;

@Injectable()
export class ConfigScannerService {
  private application: INestApplication;

  constructor(
    @Inject(ACTIVE_APPLICATION)
    private readonly activeApplication: symbol,
    private readonly logger: AutoLogService,
    private readonly workspace: WorkspaceService,
    private readonly discoveryService: DiscoveryService,
  ) {}

  @Trace()
  public async scan(
    module: ClassConstructor<unknown>,
  ): Promise<Set<ConfigTypeDTO>> {
    let discoveryService: DiscoveryService;
    if (module) {
      this.application = await NestFactory.create(module, {
        logger: AutoLogService.nestLogger,
      });
      discoveryService = this.application.get(DiscoveryService);
    } else {
      discoveryService = this.discoveryService;
    }
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

  private async scanProviders(
    providers: InstanceWrapper[],
  ): Promise<Set<ConfigTypeDTO>> {
    const out: ConfigTypeDTO[] = [];
    const unique = new Set<string>();

    providers.forEach((wrapper) => {
      const { instance } = wrapper;
      const ctor = instance.constructor;
      const config: (keyof defaults)[] = ctor[CONSUMES_CONFIG];
      const library: string =
        ctor[LOGGER_LIBRARY] || this.activeApplication.description;

      config.forEach((property: string) => {
        const key = `${library}.${property}`;
        if (unique.has(key)) {
          return;
        }
        const metadata = this.workspace.METADATA.get(library);
        const metadataConfig = metadata?.configuration[property];
        if (!metadataConfig) {
          console.log(key);
        }
        out.push({
          default: metadataConfig?.default,
          library,
          metadata: metadataConfig,
          property,
        });
        unique.add(key);
      });
    });

    return this.sortConfigs(out);
  }

  /**
   * - required first
   * - app > libs in alphabetical order
   * - properties in alphabetical order
   */
  private sortConfigs(configs: ConfigTypeDTO[]): Set<ConfigTypeDTO> {
    return new Set(
      configs.sort((a, b) => {
        const aRequired = a.default === null;
        const bRequired = b.default === null;
        if (aRequired && !bRequired) {
          return 1;
        }
        if (bRequired && !aRequired) {
          return -1;
        }
        if (a.library && !b.library) {
          return 1;
        }
        if (b.library && !a.library) {
          return -1;
        }
        if (a.library && a.library !== b.library) {
          return a.library > b.library ? 1 : -1;
        }
        return a.property > b.property ? 1 : -1;
      }),
    );
  }
}
