/* Something about bootstrapping completely breaks things with a normal reference */
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
  GlobalErrorInit,
  LIB_UTILS,
  LifecycleService,
  NEST_NOOP_LOGGER,
  USE_THIS_CONFIG,
  UsePrettyLogger,
} from '@steggy/boilerplate';
import { eachSeries, is } from '@steggy/utilities';
import chalk from 'chalk';
import { ClassConstructor } from 'class-transformer';
import express, { Express } from 'express';

export interface BootstrapOptions extends Pick<ModuleMetadata, 'imports'> {
  config?: AbstractConfig;
  extraModules?: DynamicModule[];
  globals?: Provider[];
  http?: boolean;
  nestNoopLogger?: boolean;
  noGlobalError?: boolean;
  postInit?: ((
    app: INestApplication,
    expressServer: Express,
    bootOptions: BootstrapOptions,
  ) => Promise<void> | void | unknown | Promise<unknown>)[];
  preInit?: ((
    app: INestApplication,
    expressServer: Express,
    bootOptions: BootstrapOptions,
  ) => Promise<void> | void)[];
  prettyLog?: boolean;
}

/**
 * Standardized init process
 */
export async function Bootstrap(
  module: ClassConstructor<unknown>,
  bootOptions: BootstrapOptions,
): Promise<void> {
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
  const append = [...(bootOptions.globals ?? [])];
  if (bootOptions.globals) {
    append.push({
      provide: USE_THIS_CONFIG,
      useValue: bootOptions.globals,
    });
  }
  globals.exports.push(...append);
  globals.providers.push(...append);

  let { preInit, postInit } = bootOptions;
  const { prettyLog, nestNoopLogger, http, noGlobalError } = bootOptions;

  if (prettyLog && chalk.supportsColor) {
    UsePrettyLogger();
  }
  let server: Express;
  const options = {
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
  const lifecycle = app.get(LifecycleService);
  const logger = await app.resolve(AutoLogService);
  logger.setContext(LIB_UTILS, { name: 'Bootstrap' });
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
