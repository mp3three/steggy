import { Injectable, Provider } from '@nestjs/common';
import { is } from '@steggy/utilities';
import { ClassConstructor } from 'class-transformer';

import { AbstractConfig } from '../contracts';
import { Bootstrap, BootstrapOptions } from '../includes';
import { AutoConfigService } from '../services';
import {
  ApplicationModule,
  ApplicationModuleMetadata,
} from './application-module.decorator';
import { LibraryModule } from './library-module.decorator';

/**
 * Magic timeout makes things work. Don't know why process.nextTick() isn't sufficient
 */
const WAIT_BOOTSTRAP = 10;
const ADDITIONAL_WAIT = 5;

const CREATE_BOOT_MODULE = (metadata: ApplicationModuleMetadata) =>
  ApplicationModule(metadata)(class {}) as unknown as ClassConstructor<unknown>;

/**
 * Use as an annotation for a single NestJS provider.
 * Will bootstrap a minimal TTY app around the provider, and will use the `exec` method as the entrypoint.
 *
 * Intended for quick / minimal scripts, where it is preferable to keep all application code inside a single file
 */
export function QuickScript({
  NX_PROJECT,
  OVERRIDE_DEFAULTS,
  WAIT_TIME = WAIT_BOOTSTRAP * ADDITIONAL_WAIT,
  bootstrap,
  ...options
}: ApplicationModuleMetadata & {
  NX_PROJECT?: string;
  OVERRIDE_DEFAULTS?: AbstractConfig;
  WAIT_TIME?: number;
  bootstrap?: BootstrapOptions;
} = {}): ClassDecorator {
  // Add in the MainCLI module to enable TTY functionality
  options.imports ??= [];
  options.providers ??= [];

  // Corrective measures for loading metadata
  if (!is.empty(NX_PROJECT)) {
    AutoConfigService.NX_PROJECT = NX_PROJECT;
  }

  LibraryModule.configs.set(options.application.description, {
    configuration: options.configuration ?? {},
  });
  return function (target) {
    // ? When TS is applying the @QuickScript annotation to the target class
    // Set up a fake application module that uses it as the only provider
    // Bootstrap that module, and call the `exec()` method on the target class to officially "start" the app
    //
    setTimeout(
      () =>
        Bootstrap(CREATE_BOOT_MODULE(options), {
          config: OVERRIDE_DEFAULTS,
          nestNoopLogger: true,
          noGlobalError: true,
          postInit: [
            app =>
              setTimeout(() => {
                const provider = app.get(target);
                if (is.function(provider.exec)) {
                  provider.exec();
                }
              }, WAIT_TIME),
          ],
          prettyLog: true,
          ...bootstrap,
        }),
      WAIT_BOOTSTRAP,
    );
    options.providers.push(target as unknown as Provider);
    return Injectable()(target);
  };
}
