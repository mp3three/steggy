/* Something about bootstrapping completely breaks things with a normal reference */
/* eslint-disable @nrwl/nx/enforce-module-boundaries, radar/no-identical-functions */
import {
  AutoLogService,
  GlobalErrorInit,
  LIB_UTILS,
  LifecycleService,
  NEST_NOOP_LOGGER,
  UsePrettyLogger,
} from '@steggy/boilerplate';
import { eachSeries, is } from '@steggy/utilities';
import {
  DynamicModule,
  INestApplication,
  ModuleMetadata,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import chalk from 'chalk';
import { ClassConstructor } from 'class-transformer';
import express, { Express } from 'express';

export interface BootstrapOptions extends Pick<ModuleMetadata, 'imports'> {
  extraModules?: DynamicModule[];
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
  if (!is.empty(bootOptions.imports)) {
    const current = Reflect.getMetadata('imports', module) ?? [];
    current.push(...bootOptions.imports);
    Reflect.defineMetadata('imports', current, module);
  }
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
  logger.info(`🎓 Bootstrap control released! 🎓`);
}
