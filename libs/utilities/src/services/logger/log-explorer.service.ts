import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { LOG_CONTEXT, LOGGER_LIBRARY } from '../../contracts/logger';
import { mappedContexts } from '../../decorators/injectors';

const SKIP_PROVIDERS = new Set(['ModuleRef', '', 'useFactory']);
@Injectable()
export class LogExplorerService {
  constructor(private readonly discoveryService: DiscoveryService) {}

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
      const items = [...host.providers.values(), ...host.controllers.values()];
      items.forEach(({ metatype }) => {
        if (
          SKIP_PROVIDERS.has(metatype?.name ?? '') ||
          typeof metatype[LOG_CONTEXT] !== 'undefined'
        ) {
          return;
        }
        const context = `${loggerContext}:${metatype.name}`;
        // Update the annotation injected context if one exists
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
