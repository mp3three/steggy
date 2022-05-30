import { INestApplication } from '@nestjs/common';

import {
  AbstractConfig,
  ACTIVE_APPLICATION,
  ConfigDefinitionDTO,
} from '../contracts';
import {
  CONFIG_DEFAULTS,
  ConfigTypeDTO,
  CONSUMES_CONFIG,
} from '../contracts/config';
import { LOGGER_LIBRARY } from '../contracts/logger/constants';
import { LibraryModule, MESSY_INJECTED_CONFIGS } from '../decorators';
import { ModuleScannerService } from '../services';

export function ScanConfig(
  app: INestApplication,
  config?: AbstractConfig,
): ConfigDefinitionDTO {
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
      const metadata =
        configuration[property] ?? MESSY_INJECTED_CONFIGS.get(property);
      out.push({
        library: from ? from.description : library,
        metadata,
        property,
      });
    });
  });
  return {
    application: app.get<symbol>(ACTIVE_APPLICATION).description,
    bootstrapOverrides: config ?? app.get(CONFIG_DEFAULTS),
    config: out,
  };
}
