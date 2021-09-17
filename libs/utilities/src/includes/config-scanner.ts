import { INestApplication } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { ACTIVE_APPLICATION, AutoConfigService } from '..';
import { ConfigTypeDTO, CONSUMES_CONFIG } from '../contracts/config';
import { LOGGER_LIBRARY } from '../contracts/logger/constants';

export async function ScanConfig(app: INestApplication): Promise<void> {
  const discoveryService = app.get(DiscoveryService);
  const configService = app.get(AutoConfigService);
  const application = app.get<symbol>(ACTIVE_APPLICATION);
  const used = new Set<string>();

  const out: ConfigTypeDTO[] = [];
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
    ctor[CONSUMES_CONFIG].forEach((property) => {
      const joined = [library, property].join('.');
      if (used.has(joined)) {
        return;
      }
      used.add(joined);
      const metadata = configService['metadata'].get(
        library === 'application' ? application.description : library,
      ).configuration[property];
      out.push({
        default: metadata.default,
        library,
        metadata,
        property,
      });
    });
  });

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(out, undefined, '  '));
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit();
}
