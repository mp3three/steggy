import { INestApplication } from '@nestjs/common';

import { ConfigTypeDTO, CONSUMES_CONFIG } from '../contracts/config';
import { LOGGER_LIBRARY } from '../contracts/logger/constants';
import { LibraryModule } from '../decorators';
import { ModuleScannerService } from '../services';

export function ScanConfig(app: INestApplication): ConfigTypeDTO[] {
  const scanner = app.get(ModuleScannerService);
  const used = new Set<string>();

  const map = scanner.findWithSymbol<[string, symbol][]>(CONSUMES_CONFIG);
  const out: ConfigTypeDTO[] = [];
  const { configs } = LibraryModule;
  map.forEach((config, instance) => {
    const ctor = instance.constructor;
    const library = ctor[LOGGER_LIBRARY] || 'application';
    config.forEach(([property, from]) => {
      const target = from ? from.description : library;
      const joined = [target, property].join('.');
      if (used.has(joined)) {
        return;
      }
      used.add(joined);

      const { configuration } = configs.get(target);
      const metadata = configuration[property];
      out.push({
        default: metadata?.default,
        library,
        metadata,
        property,
      });
    });
  });
  return out;
}
