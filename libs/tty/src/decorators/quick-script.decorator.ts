import { Injectable, Provider } from '@nestjs/common';
import {
  AbstractConfig,
  ApplicationModule,
  ApplicationModuleMetadata,
  AutoConfigService,
  Bootstrap,
  LibraryModule,
} from '@steggy/boilerplate';
import { is } from '@steggy/utilities';
import { ClassConstructor } from 'class-transformer';
import { show } from 'cli-cursor';

import { MainCLIModule } from '../modules';

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
  ...options
}: ApplicationModuleMetadata & {
  NX_PROJECT?: string;
  OVERRIDE_DEFAULTS?: AbstractConfig;
  WAIT_TIME?: number;
}): ClassDecorator {
  if (OVERRIDE_DEFAULTS) {
    ApplicationModule.useThisConfig(OVERRIDE_DEFAULTS);
  }
  // Add in the MainCLI module to enable TTY functionality
  options.imports ??= [];
  options.providers ??= [];
  options.imports.push(MainCLIModule);

  // Corrective measures for loading metadata
  if (!is.empty(NX_PROJECT)) {
    AutoConfigService.NX_PROJECT = NX_PROJECT;
  }

  LibraryModule.configs.set(options.application.description, {
    configuration: options.configuration ?? {},
  });
  return function (target) {
    // ? When TS is apploying the @ServiceScript annotation to the target class
    // Set up a fake application module that uses it as the only provider
    // Bootstrap that module, and call the `exec()` method on the target class to officially "start" the app
    //
    setTimeout(
      () =>
        Bootstrap(CREATE_BOOT_MODULE(options), {
          postInit: [
            app => setTimeout(() => app.get(target).exec(), WAIT_TIME),
          ],
          prettyLog: true,
        }),
      WAIT_BOOTSTRAP,
    );
    options.providers.push(target as unknown as Provider);
    return Injectable()(target);
  };
}
