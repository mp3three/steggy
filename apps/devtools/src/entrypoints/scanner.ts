import {
  ConfigTypeDTO,
  CONSUMES_CONFIG,
  LOGGER_LIBRARY,
} from '@automagical/contracts/utilities';
import { NEST_NOOP_LOGGER } from '@automagical/utilities';
import { DiscoveryService, NestFactory } from '@nestjs/core';

import { CONFIGURABLE_MODULES } from '../includes/config-loader';
type defaults = Record<string, unknown>;

/**
 * Config scanner exists to provide an isolated environment to analyze an application in.
 * Attempting to scan a nest application from inside of another can introduce a lot of weird side effects from pollution.
 *
 * This entrypoint will load a requested module, identify which configuration variables are in use, and output as json
 */
async function bootstrap() {
  const module = CONFIGURABLE_MODULES.get('');
  const app = await NestFactory.create(module, {
    logger: NEST_NOOP_LOGGER,
  });
  const discoveryService = app.get(DiscoveryService);
  const providers = discoveryService.getProviders().filter((wrapper) => {
    if (!wrapper || !wrapper.instance) {
      return false;
    }
    if (wrapper.isNotMetatype) {
      return false;
    }
    const { instance } = wrapper;
    const ctor = instance.constructor;
    return typeof ctor[CONSUMES_CONFIG] !== 'undefined';
  });

  const out: ConfigTypeDTO[] = [];
  const unique = new Set<string>();

  providers.forEach((wrapper) => {
    const { instance } = wrapper;
    const ctor = instance.constructor;
    const config: (keyof defaults)[] = ctor[CONSUMES_CONFIG];
    const library: string =
      ctor[LOGGER_LIBRARY] || this.activeApplication.description;

    config.forEach((property: string) => {
      const key = `${library}.${property}`;
      if (unique.has(key)) {
        return;
      }
      const metadata = this.workspace.METADATA.get(library);
      const metadataConfig = metadata?.configuration[property];
      if (!metadataConfig) {
        console.log(key);
      }
      out.push({
        default: metadataConfig?.default,
        library,
        metadata: metadataConfig,
        property,
      });
      unique.add(key);
    });
  });
  console.log(
    JSON.stringify(
      out.sort((a, b) => {
        const aRequired = a.default === null;
        const bRequired = b.default === null;
        if (aRequired && !bRequired) {
          return 1;
        }
        if (bRequired && !aRequired) {
          return -1;
        }
        if (a.library && !b.library) {
          return 1;
        }
        if (b.library && !a.library) {
          return -1;
        }
        if (a.library && a.library !== b.library) {
          return a.library > b.library ? 1 : -1;
        }
        return a.property > b.property ? 1 : -1;
      }),
      undefined,
      '  ',
    ),
  );
  //
  await app.close();
}
bootstrap();
