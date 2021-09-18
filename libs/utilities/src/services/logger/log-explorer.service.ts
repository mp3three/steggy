import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { LOG_CONTEXT, LOGGER_LIBRARY } from '../../contracts/logger';
import { mappedContexts } from '../../decorators/injectors';
import { Info } from '../../decorators/logger.decorator';

const SKIP_PROVIDERS = new Set(['ModuleRef', '', 'useFactory']);
/**
 * TODO: Find a way to entirely disable trace / debug logging if the config log level is too low
 *
 * Currently, nodejs crashes if I attempt to inject the config service here
 */
@Injectable()
export class LogExplorerService {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Info({ after: '[Logger] Initialized' })
  protected onModuleInit(): void {
    const providers = [
      ...this.discoveryService.getControllers(),
      ...this.discoveryService.getProviders(),
    ].filter(({ instance }) => !!instance);
    providers.forEach((wrapper) => {
      const { instance, host } = wrapper;
      const proto = instance.constructor;
      if (!proto || !proto[LOGGER_LIBRARY]) {
        return;
      }
      const loggerContext: string = proto[LOGGER_LIBRARY];
      host.providers.forEach(({ metatype }) => {
        if (
          SKIP_PROVIDERS.has(metatype?.name ?? '') ||
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
}
