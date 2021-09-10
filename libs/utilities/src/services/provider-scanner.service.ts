import { Injectable, Provider } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { Trace } from '../decorators/logger.decorator';

@Injectable()
export class ProviderScannerService {
  constructor(private readonly disoveryService: DiscoveryService) {}

  @Trace()
  public scan<T>(target: symbol): Map<T, Provider> {
    const out = new Map<T, Provider>();
    this.disoveryService.getProviders().forEach((wrapper) => {
      if (!wrapper.isNotMetatype) {
        return;
      }
      const { instance } = wrapper;
      const ctor = instance.constructor;
      if (ctor[target]) {
        out.set(ctor[target], instance);
      }
    });
    return out;
  }
}
