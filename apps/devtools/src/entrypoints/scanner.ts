import {
  CONSUMES_CONFIG,
  LOGGER_LIBRARY,
} from '@automagical/utilities';
import { NEST_NOOP_LOGGER } from '@automagical/utilities';
import { DiscoveryService, NestFactory } from '@nestjs/core';

import { CONFIGURABLE_MODULES } from '../includes/config-loader';

/**
 * Config scanner exists to provide an isolated environment to analyze an application in.
 * Attempting to scan a nest application from inside of another can introduce a lot of weird side effects from pollution.
 *
 * This entrypoint will load a requested module, identify which configuration variables are in use, and output as json
 */
async function bootstrap() {
  const application = process.argv[2];
  const module = CONFIGURABLE_MODULES.get(application);
  const app = await NestFactory.create(module, {
    logger: NEST_NOOP_LOGGER,
  });
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

  console.log(JSON.stringify(out, undefined, '  '));
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit();
}
bootstrap();
