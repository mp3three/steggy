import { INestApplication } from '@nestjs/common';

import { ACTIVE_APPLICATION } from '../contracts';
import { ConfigTypeDTO, CONSUMES_CONFIG } from '../contracts/config';
import { LOGGER_LIBRARY } from '../contracts/logger/constants';
import { AutoConfigService, ModuleScannerService } from '../services';

export function ScanConfig(app: INestApplication): void {
  const configService = app.get(AutoConfigService);
  const scanner = app.get(ModuleScannerService);
  const application = app.get<symbol>(ACTIVE_APPLICATION);
  const used = new Set<string>();

  const map = scanner.findWithSymbol<string[]>(CONSUMES_CONFIG);
  const out: ConfigTypeDTO[] = [];
  map.forEach((config, instance) => {
    const ctor = instance.constructor;
    const library = ctor[LOGGER_LIBRARY] || 'application';
    config.forEach((property) => {
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
