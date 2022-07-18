import { Controller, Injectable, Provider } from '@nestjs/common';
import { DEFAULT_LIMIT, is } from '@steggy/utilities';
import { ClassConstructor } from 'class-transformer';
import { exit } from 'process';

import { iSteggyProvider } from '../contracts';
import { Bootstrap, BootstrapOptions } from '../includes';
import {
  ApplicationModule,
  ApplicationModuleMetadata,
} from './application-module.decorator';
import { LibraryModule } from './library-module.decorator';

/**
 * Magic timeout makes things work. Don't know why process.nextTick() isn't sufficient
 */
const WAIT_BOOTSTRAP = 10;

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
export function QuickScript({
  WAIT_TIME = WAIT_BOOTSTRAP * DEFAULT_LIMIT,
  bootstrap,
  controller,
  PERSISTENT,
  ...options
}: ApplicationModuleMetadata & {
  /**
   * Keep the application open after `exec` finishes
   */
  PERSISTENT?: boolean;
  WAIT_TIME?: number;
  bootstrap?: BootstrapOptions;
  /**
   * If passed, the class will be set up as a NestJS controller.
   * Allows usage of annotations like `@Get`, `@Post`, `@Put`, ... etc.
   * ServerModule and enabling http still must be performed
   */
  controller?: string;
} = {}): ClassDecorator {
  // Add in the MainCLI module to enable TTY functionality
  options.imports ??= [];
  options.providers ??= [];
  options.application ??= Symbol('steggy-quick-script');

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
      Bootstrap(CREATE_BOOT_MODULE(options), {
        nestNoopLogger: true,
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
      });
    }, WAIT_BOOTSTRAP);
    options.providers.push(target as unknown as Provider);
    if (is.string(controller)) {
      return Controller(controller)(target);
    }
    return Injectable()(target);
  };
}
