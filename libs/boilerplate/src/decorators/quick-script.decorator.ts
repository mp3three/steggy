import { Injectable, Provider } from '@nestjs/common';
import { is } from '@steggy/utilities';
import { ClassConstructor } from 'class-transformer';
import minimist from 'minimist';
import { argv, exit } from 'process';

import { iSteggyProvider } from '../contracts';
import { Bootstrap, BootstrapOptions, ScanConfig } from '../includes';
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

export interface iQuickScript extends iSteggyProvider {
  exec: () => void | Promise<void>;
}

/**
 * Use as an annotation for a single NestJS provider.
 * Will bootstrap a minimal TTY app around the provider, and will use the `exec` method as the entrypoint.
 *
 * Intended for quick / minimal scripts, where it is preferable to keep all application code inside a single file
 */
// eslint-disable-next-line radar/cognitive-complexity
export function QuickScript({
  WAIT_TIME = WAIT_BOOTSTRAP * ADDITIONAL_WAIT,
  bootstrap,
  PERSISTENT,
  ...options
}: ApplicationModuleMetadata & {
  /**
   * Keep the application open after `exec` finishes
   */
  PERSISTENT?: boolean;
  WAIT_TIME?: number;
  bootstrap?: BootstrapOptions;
} = {}): ClassDecorator {
  // Add in the MainCLI module to enable TTY functionality
  options.imports ??= [];
  options.providers ??= [];

  // Corrective measures for loading metadata

  LibraryModule.configs.set(options.application.description, {
    configuration: options.configuration ?? {},
  });
  return function (target) {
    // ? When TS is applying the @QuickScript annotation to the target class
    // Set up a fake application module that uses it as the only provider
    // Bootstrap that module, and call the `exec()` method on the target class to officially "start" the app
    //
    setTimeout(() => {
      let BOOTSTRAP_OPTIONS: BootstrapOptions = {
        nestNoopLogger: true,
        noGlobalError: true,
        postInit: [
          app =>
            setTimeout(async () => {
              const provider = app.get(target);
              if (is.function(provider.exec)) {
                await provider.exec();
                if (!PERSISTENT) {
                  await app.close();
                  exit();
                }
              }
            }, WAIT_TIME),
        ],
        prettyLog: true,
        ...bootstrap,
      };
      // "Undocumented" (doesn't appear in any of the self reported config stuff) feature
      // Hopefully nobody needs this exact variable name for use as a switch. That'd be awkward
      if (!is.undefined(minimist(argv)['config-scanner'])) {
        BOOTSTRAP_OPTIONS = {
          ...BOOTSTRAP_OPTIONS,
          config: { libs: { boilerplate: { LOG_LEVEL: 'silent' } } },
          nestNoopLogger: true,
          preInit: [
            app => {
              // eslint-disable-next-line no-console
              console.log(
                JSON.stringify(ScanConfig(app, BOOTSTRAP_OPTIONS.config)),
              );
              exit();
            },
          ],
        };
      }

      Bootstrap(CREATE_BOOT_MODULE(options), BOOTSTRAP_OPTIONS);
    }, WAIT_BOOTSTRAP);
    options.providers.push(target as unknown as Provider);
    return Injectable()(target);
  };
}
