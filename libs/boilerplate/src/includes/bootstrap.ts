/**
 * Something about bootstrapping completely breaks things with a normal reference.
 * Imports from @steggy/boilerplate are on purpose here
 * */
/* eslint-disable @nrwl/nx/enforce-module-boundaries, radar/no-identical-functions */
import {
  DynamicModule,
  INestApplication,
  ModuleMetadata,
  Provider,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import {
  AbstractConfig,
  AutoLogService,
  CONFIG_DEFAULTS,
  GlobalErrorInit,
  LIB_BOILERPLATE,
  LifecycleService,
  NEST_NOOP_LOGGER,
  NO_USER_CONFIG,
  UsePrettyLogger,
} from '@steggy/boilerplate';
import { eachSeries, is } from '@steggy/utilities';
import chalk from 'chalk';
import { ClassConstructor } from 'class-transformer';
import express, { Express } from 'express';

export interface BootstrapOptions extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Provide alternate default values for configurations.
   * Takes priority over definitions from `@InjectConfig` and modules.
   * Overridden by all user values.
   */
  config?: AbstractConfig;
  /**
   * Insert additional modules.
   * Used for environment specific modules, 99% of the time these should be placed in the application module instead
   */
  extraModules?: DynamicModule[];
  /**
   * Insert additional providers with a global scope.
   */
  globals?: Provider[];
  /**
   * Attach express to the nestjs app.
   * `ServerModule` from `@steggy/server` needs to be imported to actually listen for requests
   */
  http?: boolean;
  /**
   * Disable nestjs log messages
   */
  nestNoopLogger?: boolean;
  noGlobalError?: boolean;
  /**
   * Additional functions to run postInit.
   * Run before those in providers
   */
  postInit?: ((
    app: INestApplication,
    expressServer: Express,
    bootOptions: BootstrapOptions,
  ) => Promise<void> | void | unknown | Promise<unknown>)[];
  /**
   * Additional functions to run preInit.
   * Run before those in providers
   */
  preInit?: ((
    app: INestApplication,
    expressServer: Express,
    bootOptions: BootstrapOptions,
  ) => Promise<void> | void)[];
  /**
   * Output logs using the pretty logger formatter instead of standard json logs.
   * Use with development environments only
   */
  prettyLog?: boolean;
  /**
   * Ignore user provided configuration values.
   * Only use defaults / bootstrap provided config
   */
  skipConfigLoad?: boolean;
}

/**
 * Standardized init process
 */
export async function Bootstrap(
  module: ClassConstructor<unknown>,
  bootOptions: BootstrapOptions,
): Promise<void> {
  bootOptions.globals ??= [];
  // Environment files can append extra modules
  const current = Reflect.getMetadata('imports', module) ?? [];
  if (!is.empty(bootOptions.imports)) {
    current.push(...bootOptions.imports);
    Reflect.defineMetadata('imports', current, module);
  }
  const globals = current.find(item => item.type === 'GLOBAL_SYMBOLS');
  if (!globals) {
    // Just not far enough along to have a real logger yet
    // eslint-disable-next-line no-console
    console.log(
      `Bootstrap requires modules be annotated with @ApplicationModule`,
    );
    return;
  }
  if (bootOptions.skipConfigLoad) {
    bootOptions.globals.push({
      provide: NO_USER_CONFIG,
      useValue: true,
    });
  }
  const append = [...bootOptions.globals];
  append.push({
    provide: CONFIG_DEFAULTS,
    useValue: bootOptions.config ?? {},
  });

  globals.exports.push(...append);
  globals.providers.push(...append);

  let { preInit, postInit } = bootOptions;
  const { prettyLog, nestNoopLogger, http, noGlobalError } = bootOptions;

  if (prettyLog && chalk.supportsColor) {
    UsePrettyLogger();
  }
  let server: Express;
  const options = {
    // Shh... no talky
    logger: nestNoopLogger ? NEST_NOOP_LOGGER : AutoLogService.nestLogger,
  };
  let app: INestApplication;
  if (http) {
    server = express();
    app = await NestFactory.create(module, new ExpressAdapter(server), {
      ...options,
      cors: true,
    });
  } else {
    app = await NestFactory.create(module, options);
  }
  app.enableShutdownHooks();
  const lifecycle = app.get(LifecycleService);
  const logger = await app.resolve(AutoLogService);
  logger.setContext(LIB_BOILERPLATE, { name: 'Bootstrap' });
  // onPreInit
  preInit ??= [];
  if (noGlobalError !== true) {
    preInit.push(GlobalErrorInit);
  }
  await eachSeries(preInit, async item => {
    await item(app, server, bootOptions);
  });
  await lifecycle.preInit(app, { options: bootOptions, server });
  // ...init
  // onModuleCreate
  // onApplicationBootstrap
  await app.init();
  // onPostInit
  postInit ??= [];
  await eachSeries(postInit, async item => {
    await item(app, server, bootOptions);
  });
  await lifecycle.postInit(app, { options: bootOptions, server });
}
