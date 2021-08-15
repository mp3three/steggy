import { LOG_CONTEXT, LOGGER_LIBRARY } from '@automagical/contracts/utilities';
import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { ClassConstructor } from 'class-transformer';

import { mappedContexts } from '../../decorators/injectors';
import { AutoLogService } from './auto-log.service';

/**
 * TODO: Find a way to entirely disable trace / debug logging if the config log level is too low
 *
 * Currently, nodejs crashes if I attempt to inject the config service here
 */
@Injectable()
export class LogExplorerService {
  // #region Constructors

  constructor(
    private readonly logger: AutoLogService,
    private readonly discoveryService: DiscoveryService,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  protected onModuleInit(): void {
    const providers = this.discoveryService
      .getProviders()
      .filter(({ instance }) => !!instance);
    this.mergeLoggerLibraries(providers);
    this.logger.info(`Logger initialized`);
  }

  // #endregion Protected Methods

  // #region Private Methods

  private mergeLoggerLibraries(
    providers: InstanceWrapper<ClassConstructor<unknown>>[],
  ): void {
    providers.forEach((wrapper) => {
      const { instance, host } = wrapper;
      const proto = instance.constructor;
      if (!proto || !proto[LOGGER_LIBRARY]) {
        return;
      }
      const loggerContext: string = proto[LOGGER_LIBRARY];
      host.providers.forEach(({ metatype }) => {
        if (
          !metatype ||
          ['ModuleRef', '', 'useFactory'].includes(metatype.name ?? '') ||
          typeof metatype[LOG_CONTEXT] !== 'undefined'
        ) {
          return;
        }
        const context = `${loggerContext}:${metatype.name}`;
        mappedContexts.forEach((value, key) => {
          if (value === metatype.name) {
            mappedContexts.set(key, context);
          }
        });
        metatype[LOG_CONTEXT] ??= context;
        metatype[LOGGER_LIBRARY] ??= loggerContext;
      });
    });
  }

  // #endregion Private Methods
}
