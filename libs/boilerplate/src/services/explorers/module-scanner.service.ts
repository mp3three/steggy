import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { is } from '@automagical/utilities';

import { LOGGER_LIBRARY } from '../../contracts/logger';
import { OnceIsEnough } from '../../decorators/once-is-enough.decorator';

@Injectable()
export class ModuleScannerService {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @OnceIsEnough()
  public applicationProviders<T extends unknown = unknown>(): T[] {
    return this.getProviders<T>().filter(instance => {
      const ctor = instance.constructor;
      return !is.undefined(ctor[LOGGER_LIBRARY]);
    });
  }

  public findWithSymbol<
    VALUE extends unknown = unknown,
    PROVIDER_TYPE extends unknown = unknown,
  >(find: symbol): Map<PROVIDER_TYPE, VALUE> {
    const out = new Map();
    this.applicationProviders<PROVIDER_TYPE>().forEach(instance => {
      const ctor = instance.constructor;
      if (!is.undefined(ctor[find])) {
        out.set(instance, ctor[find]);
      }
    });
    return out;
  }

  @OnceIsEnough()
  public getProviders<T extends unknown = unknown>(): T[] {
    return [
      ...this.discoveryService.getControllers(),
      ...this.discoveryService.getProviders(),
    ]
      .filter(wrapper => {
        if (!wrapper.instance) {
          return false;
        }
        return true;
      })
      .map(wrapper => wrapper.instance);
  }
}
