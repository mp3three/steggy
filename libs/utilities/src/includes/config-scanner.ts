import { INestApplication } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { CONSUMES_CONFIG } from '../contracts/config';
import { LOGGER_LIBRARY } from '../contracts/logger/constants';

export async function ScanConfig(app: INestApplication): Promise<void> {
  const discoveryService = app.get(DiscoveryService);
  const config: Record<string, Record<string, boolean>> = {};
  discoveryService.getProviders().forEach((wrapper) => {
    if (!wrapper || !wrapper.instance) {
      return false;
    }
    if (wrapper.isNotMetatype) {
      return false;
    }
    const { instance } = wrapper;
    const ctor = instance.constructor;
    if (typeof ctor[CONSUMES_CONFIG] === 'undefined') {
      return;
    }
    const library = ctor[LOGGER_LIBRARY] || 'application';
    config[library] ??= {};
    ctor[CONSUMES_CONFIG].forEach((item) => (config[library][item] = true));
  });

  const out: Record<string, string[]> = {};
  Object.keys(config).forEach((key) => {
    out[key] = Object.keys(config[key]);
  });

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(out, undefined, '  '));
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit();
}
