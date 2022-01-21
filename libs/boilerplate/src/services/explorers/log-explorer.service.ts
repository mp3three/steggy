import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { is } from '@text-based/utilities';

import { LOG_LEVEL } from '../../config';
import { LOG_CONTEXT, LOGGER_LIBRARY } from '../../contracts/logger';
import { InjectConfig, mappedContexts } from '../../decorators/injectors';

// Don't remove LOG_LEVEL injection
// Including it here forces it to appear in config builder
// Including it in AutoLogService makes things explode

const SKIP_PROVIDERS = new Set(['ModuleRef', '', 'useFactory']);
@Injectable()
export class LogExplorerService {
  constructor(
    private readonly discoveryService: DiscoveryService,
    @InjectConfig(LOG_LEVEL) private readonly logLevel: string,
  ) {}

  public load(): void {
    const providers = [
      ...this.discoveryService.getControllers(),
      ...this.discoveryService.getProviders(),
    ].filter(({ instance }) => !!instance);
    providers.forEach(wrapper => {
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
          !is.undefined(metatype[LOG_CONTEXT])
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
